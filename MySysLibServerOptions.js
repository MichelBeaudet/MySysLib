// MySysLibServerOptions.js (CommonJS)
const MySysLibServerOptions = {
    options: {
        env: process.env.NODE_ENV || "development",

        server: {
            host: process.env.HOST || "127.0.0.1",  // "0.0.0.0" to listen on all
            port: parseInt(process.env.PORT || "3000", 10)
        },

        security: {
            // Presets: "dev" | "secure" | "off"
            preset: process.env.SEC_PRESET || "dev",

            trustProxy: true, // if behind nginx/Cloudflare, keep true

            cors: {
                enabled: true,
                allowAllInDev: true,
                allowlist: [
                    "http://localhost:3000",
                    "http://localhost:5173"
                ]
            },

            helmet: { enabled: true },

            rateLimit: {
                enabled: true,
                windowMs: 15 * 60 * 1000,
                max: 300
            },

            ipAllowlist: {
                enabled: false,
                // Exact IPs only (simple mode). For CIDR, use a lib like "ip-range-check".
                ranges: ["127.0.0.1", "::1", "::ffff:127.0.0.1"]
            },

            https: {
                enabled: false,
                keyPath: "./certs/key.pem",
                certPath: "./certs/cert.pem",
                redirectHttpToHttps: false
            }
        },

        staticDir: "public",
        logging: {
            req: true,   // request logs
            level: "info"
        }
    }
};

module.exports = MySysLibServerOptions;
