// app.js
const path = require('path');
const fs = require('fs');
const express = require('express');
const { spawn } = require('child_process');
const { execFile } = require('child_process');

const app = express();

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Simple logger
const { mkLogger } = require("./logger");
const log = mkLogger(__filename);

log.banner("MySysLib", "App bootstrap");
log.step("Context", {
    "Current file": path.basename(__filename),
    "Current dir": path.basename(__dirname),
    "Version": "2.0.0",
    "Author" : "Mike Beaudet",
});

// Initial log
log.ok(`${path.basename(__filename)} initialized`);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    log.ok(`Server listening on http://localhost:${PORT}`);
});

// API: log message from client to server console
app.get("/log", (req, res) => {
    const msg = req.query.msg || "(vide)";
    log.ok('/log');
    log.ok("[CLIENT LOG]:" + msg);
    res.sendStatus(200);
});

// Handle admin
app.get('/admin', function (req, res) {
    log.ok('/admin');
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Running python script to get next code snippet
app.get('/run_python', (req, res) => {
    log.ok('/next');
    const PYTHON_CMD = process.env.PYTHON_CMD || 'python';
    const scriptPath = path.join(__dirname, './public/api/hacker_terminal_snippet.py');

    execFile(PYTHON_CMD, [scriptPath], { windowsHide: true, cwd: __dirname, maxBuffer: 1024 * 1024 },
        (err, stdout, stderr) => {
            if (err) {
                console.error('Python error:', err, stderr);
                return res.status(500).json({ error: 'python_exec_failed', detail: String(err) });
            }
            try {
                // Le script Python imprime déjà un JSON { "code": "..." }
                const payload = JSON.parse(stdout.trim());
                // Sécurité minimale: force la présence de "code"
                if (typeof payload !== 'object' || typeof payload.code !== 'string') {
                    throw new Error('Invalid JSON from Python');
                }
                res.json(payload);
            } catch (parseErr) {
                console.error('JSON parse error:', parseErr, 'stdout=', stdout);
                res.status(500).json({ error: 'invalid_json_from_python' });
            }
        }
    );
});

//RUN EXE
app.post('/run_exe', (req, res) => {
    const exePath = 'C:/Users/miche/OneDrive/My Projects/VS Studio Projects/MyRainMatrix/dist/Matrix_Rain/Matrix_Rain.exe';
    const exeDir = path.dirname(exePath);
    log.ok(`POST /run_exe: called EXE launch requested for ${exePath}`);

    try {
        if (!fs.existsSync(exePath)) {
            return res.status(404).send(`Not found: ${exePath}`);
        }

        const child = spawn('cmd.exe', ['/c', 'start', '', exePath], {
            cwd: exeDir,
            windowsHide: true,
            detached: true,
            stdio: 'ignore'
        });

        child.on('error', (err) => {
            console.error('Spawn error:', err);
            if (!res.headersSent) res.status(500).send(`Failed: ${err.message}`);
        });

        child.unref(); // let process live on its own
        res.send({ Result: "EXE launch done!" });
        log.ok("*** EXE launch done!");
    } catch (e) {
        console.error(e);
        res.status(500).send(e.message);
    }
});

// API: system params each call
app.get('/api/collect_system_props', (req, res) => {
    log.ok('*** GET /api/collect_system_props');
    const { collect_system_props } = require('./public/api/collect_system_props');
    try {
        const data = collect_system_props();
        res.json(data);
    } catch (err) {
        console.error('Error collecting params:', err);
        res.status(500).json({ error: 'Failed to collect system parameters' });
    }
});
module.exports = app;

log.ok(`${path.basename(__filename)} terminated`);
