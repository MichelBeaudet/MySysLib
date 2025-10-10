// sendLog.js
console.log("***sendLog.js called");

// Utility to send logs to server
window.sendLog = function sendLog(msg) {
    try {
        // Example: send to your server (adjust the route as needed)
        fetch(`/log?msg=${encodeURIComponent(msg)}`).catch(() => { });
    } catch (e) {
        console.log('[sendLog fallback]', msg);
    }
};

// Get HTML page name
const pageName = window.location.pathname.split("/").pop() || "index.html";

// Get current script name
if (document.currentScript) {
    const parts = document.currentScript.src.split("/");
    sendLog(`page ${pageName}: running script ${parts.pop()}`);
    }
else {
    sendLog(`page ${pageName}: running no script`);
    };

// Hidden error log container
const hiddenLog = document.createElement("div");
hiddenLog.id = "hiddenErrorLog";
hiddenLog.style.display = "none";
document.body.appendChild(hiddenLog);

// Global error handler
window.onerror = function (message, source, lineno, colno, error) {
    const isExtension =
        source && (source.startsWith("chrome-extension://") ||
            source.startsWith("edge-extension://"));

    if (isExtension) {
        const entry = document.createElement("pre");
        entry.textContent = `[EXT ERROR] ${message} at ${source}:${lineno}:${colno}`;
        hiddenLog.appendChild(entry);
        return true; // suppress in console
    }

    console.error("App Error:", message, "at", source, ":", lineno, colno);

    const errBox = document.createElement("pre");
    errBox.style.color = "red";
    errBox.textContent = `Error: ${message}\nSource: ${source}\nLine: ${lineno}, Col: ${colno}`;
    document.body.appendChild(errBox);
};
