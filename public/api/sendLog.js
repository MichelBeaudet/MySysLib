// sendLog.js
console.log("***Hello from sendLog.js");

// Utility to send logs to server
function sendLog(msg) {
    fetch("/log?msg=" + encodeURIComponent(msg))
        .catch(err => {
            console.error("Impossible d'envoyer le log au serveur:", err);
        });
}
window.sendLog = sendLog;

// Get HTML page name
const pageName = window.location.pathname.split("/").pop() || "index.html";
sendLog("+++Loaded from HTML page:" + pageName);

// Get current script name
if (document.currentScript) {
    const parts = document.currentScript.src.split("/");
    sendLog("+++Running script:" + parts.pop());
}

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
