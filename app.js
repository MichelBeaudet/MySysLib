// app.js
const path = require('path');
const fs = require('fs');
const express = require('express');
const { spawn } = require('child_process');
const { execFile } = require('child_process');
const { collect_system_props } = require('./public/api/collect_system_props');

const app = express();

console.log(`***In ${__filename}`);

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// API: log message from client to server console
app.get("/log", (req, res) => {
    const msg = req.query.msg || "(vide)";
    console.log("[CLIENT LOG]", msg);
    res.sendStatus(200);
});

const exePath = 'C:/Users/miche/OneDrive/My Projects/VS Studio Projects/MyRainMatrix/dist/Matrix_Rain/Matrix_Rain.exe';
const exeDir = path.dirname(exePath);

//RUN EXE
app.post('/run_exe', (req, res) => {
    console.log("\n*** EXE launch requested");
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
        console.log("*** EXE launch done!");
    } catch (e) {
        console.error(e);
        res.status(500).send(e.message);
    }
});

// API: fresh system params each call
app.get('/api/collect_system_props', (req, res) => {
    console.log("***/api/collect_system_props called by app.js");                                     
    try {
        const data = collect_system_props();
        res.json(data);
    } catch (err) {
        console.error('Error collecting params:', err);
        res.status(500).json({ error: 'Failed to collect system parameters' });
    }
});
module.exports = app;

// Optional: write a snapshot at startup 
const publicDir = path.join(__dirname, 'public');
const snapshotFile = path.join(publicDir, 'system_props.json');
(function writeStartupSnapshot() {
    try {
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
        fs.writeFileSync(snapshotFile, JSON.stringify(collect_system_props(), null, 2), 'utf-8');
        console.log(`\n***Startup snapshot written to ${snapshotFile}`);
    } catch (e) {
        console.warn('Could not write startup snapshot:', e.message);
    }
})();
console.log(`***End of ${__filename}\n`);
