// server.js (CommonJS)
const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const express = require("express");
const MySysLibServerOptions = require("./MySysLibServerOptions");

const cfg = MySysLibServerOptions.options;
const app = express();

// -------------------- helpers --------------------
const requireOptional = (name) => {
    try { return require(name); } catch { return null; }
};

const normalizeIp = (ip) => (ip || "").replace(/^::ffff:/, "");

const applyPreset = (security) => {
    const s = JSON.parse(JSON.stringify(security)); // shallow clone
    switch (s.preset) {
        case "off":
            s.cors.enabled = false;
            s.helmet.enabled = false;
            s.rateLimit.enabled = false;
            s.ipAllowlist.enabled = false;
            s.https.enabled = false;
            break;

        case "secure":
            s.trustProxy = true;
            s.cors.enabled = true;
            s.cors.allowAllInDev = false; // no wildcard even in dev
            s.rateLimit.enabled = true;
            s.rateLimit.windowMs = Math.max(s.rateLimit.windowMs, 10 * 60 * 1000);
            s.rateLimit.max = Math.min(s.rateLimit.max, 200);
            s.ipAllowlist.enabled = s.ipAllowlist.enabled || false; // enable if you set ranges
            s.helmet.enabled = true;
            // keep https settings as provided
            break;

        case "dev":
        default:
            // keep defaults; allow all CORS in dev if flag enabled
            break;
    }
    return s;
};

// -------------------- security middleware --------------------
const applySecurity = (app, env, security) => {
    const s = applyPreset(security);

    if (s.trustProxy) app.set("trust proxy", true);

    // CORS
    if (s.cors.enabled) {
        const cors = requireOptional("cors");
        if (cors) {
            const useWildcard = env === "development" && s.cors.allowAllInDev;
            if (useWildcard) {
                app.use(cors()); // Access-Control-Allow-Origin: *
            } else {
                const allowed = new Set(s.cors.allowlist.map(String));
                app.use(cors({
                    origin: (origin, cb) => {
                        // allow same-origin / non-browser requests (no origin)
                        if (!origin || allowed.has(origin)) return cb(null, true);
                        return cb(new Error("CORS: origin not allowed"), false);
                    },
                    credentials: true
                }));
            }
        } else {
            console.warn("[warn] 'cors' not installed. Run: npm i cors");
        }
    }

    // Helmet
    if (s.helmet.enabled) {
        const helmet = requireOptional("helmet");
        if (helmet) {
            app.use(helmet());
        } else {
            console.warn("[warn] 'helmet' not installed. Run: npm i helmet");
        }
    }

    // Rate limiting
    if (s.rateLimit.enabled) {
        const rateLimit = requireOptional("express-rate-limit");
        if (rateLimit) {
            app.use(rateLimit({
                windowMs: s.rateLimit.windowMs,
                max: s.rateLimit.max,
                standardHeaders: true,
                legacyHeaders: false
            }));
        } else {
            console.warn("[warn] 'express-rate-limit' not installed. Run: npm i express-rate-limit");
        }
    }

    // IP allowlist (simple exact-match)
    if (s.ipAllowlist.enabled && Array.isArray(s.ipAllowlist.ranges) && s.ipAllowlist.ranges.length > 0) {
        const allowed = new Set(s.ipAllowlist.ranges.map(normalizeIp));
        app.use((req, res, next) => {
            const ip = normalizeIp(req.ip);
            if (allowed.has(ip)) return next();
            res.status(403).send("Forbidden (IP allowlist)");
        });
    }

    // Optional HTTP→HTTPS redirect when behind a proxy
    if (s.https.redirectHttpToHttps) {
        app.use((req, res, next) => {
            if (req.secure) return next();
            const host = req.headers.host;
            return res.redirect(`https://${host}${req.originalUrl}`);
        });
    }

    return s; // return the resolved security for logging/https
};

// -------------------- logging & static --------------------
if (cfg.logging.req) {
    // lightweight request log
    app.use((req, _res, next) => {
        console.log(`[req] ${req.method} ${req.originalUrl} ip=${req.ip}`);
        next();
    });
}

if (cfg.staticDir) {
    const staticPath = path.join(__dirname, cfg.staticDir);
    if (fs.existsSync(staticPath)) {
        app.use(express.static(staticPath));
    } else {
        console.warn(`[warn] Static dir not found: ${staticPath}`);
    }
}

// -------------------- routes --------------------
app.get("/health", (_req, res) => res.send("OK"));
app.get("/api/info", (_req, res) => {
    res.json({
        pid: process.pid,
        node: process.version,
        env: cfg.env,
        uptime_s: Math.round(process.uptime())
    });
});

// -------------------- start server (http/https branch) --------------------
const effectiveSec = applySecurity(app, cfg.env, cfg.security);

const start = () => {
    const { host, port } = cfg.server;

    if (effectiveSec.https.enabled) {
        try {
            const key = fs.readFileSync(path.resolve(effectiveSec.https.keyPath));
            const cert = fs.readFileSync(path.resolve(effectiveSec.https.certPath));
            const httpsServer = https.createServer({ key, cert }, app);
            httpsServer.listen(port, host, () => {
                console.log(`[up] HTTPS server listening on https://${host}:${port}  (preset=${effectiveSec.preset || cfg.security.preset})`);
            });

            // Optionally also open HTTP for redirects when redirectHttpToHttps=true
            if (effectiveSec.https.redirectHttpToHttps) {
                const httpServer = http.createServer(app);
                httpServer.listen(80, host, () => console.log(`[up] HTTP (redirect) on http://${host}:80`));
            }
            return;
        } catch (e) {
            console.error("[err] HTTPS startup failed, falling back to HTTP:", e.message);
        }
    }

    const httpServer = http.createServer(app);
    httpServer.listen(port, host, () => {
        console.log(`[up] HTTP server listening on http://${host}:${port}  (preset=${effectiveSec.preset || cfg.security.preset})`);
    });
};

start();

// -------------------- graceful shutdown --------------------
process.on("SIGINT", () => {
    console.log("\n[down] Shutting down…");
    process.exit(0);
});
