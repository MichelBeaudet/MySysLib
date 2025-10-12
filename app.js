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
    log.ok("[CLIENT LOG]:" + msg);
    res.sendStatus(200);
});

// Handle admin
app.get('/admin', function (req, res) {
    log.ok('/admin');
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Running python script to get next code snippet
app.post('/run_python', (req, res) => {
    log.ok('/run_python');
    const PYTHON_CMD = process.env.PYTHON_CMD || 'python';
    const scriptPath = path.join(__dirname, './public/api/test1.py');
    log.ok(`Executing Python script: ${scriptPath} with ${PYTHON_CMD}`);
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
    log.ok('Python script execution initiated');
    //log.ok("Status:" + res.json);
    //log.ok(`Payload: ${ res.json }`);

});

// Running python script test1.py
app.post('/run_python_hacker_snippet', (req, res) => {
    log.ok('/run_python_hacker_snippet');
    const PYTHON_CMD = process.env.PYTHON_CMD || 'python';
    const scriptPath = path.join(__dirname, './public/api/hacker_terminal_snippet.py');
    log.ok(`Executing Python script: ${scriptPath} with ${PYTHON_CMD}`);
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
    log.ok('Python script execution initiated');
    //log.ok("Status:" + res.json);
    //log.ok(`Payload: ${ res.json }`);

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
    log.ok('/api/collect_system_props');
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

// (Optional) GET alias if you insist on GET (not recommended for side-effects)
function clearConsole() {
    // ANSI clear + home cursor
    console.log('[server] Trying to clear console');
    process.stdout.write('\x1B[2J\x1B[0;0H');
    if (typeof console.clear === 'function') console.clear();
    console.log('[server] Console cleared at', new Date().toISOString());
}
app.get('/admin/console/clear', (req, res) => {
    // 🔒 (Optional but wise) a super-simple “secret” to avoid random clears
    console.log("/admin/console/clear");
    clearConsole();
    res.json({ ok: true });
});

log.ok(`${path.basename(__filename)} terminated`);
