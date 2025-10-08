# FullStack Minimal – Auditor Style (No Launcher)

This mirrors the **fullstack-url-auditor** pattern: two separate processes (server + client),
no ASP.NET launcher. Use scripts or the root npm orchestrator.

## Quick start (Windows)

### Option A — run helper scripts
- Double-click: `scripts\start-dev.cmd`
  - Opens two terminals: SERVER (http://localhost:3001) and CLIENT (http://localhost:5173).
- To stop: `scripts\stop-dev.cmd` (best-effort) or close the two windows.

### Option B — Visual Studio 2022 with npm scripts
1. Open **FullStackMinimal_AuditorStyle.sln**.
2. In Solution Explorer, expand the **root package.json** → **npm**.
3. Right-click **dev** → **Run**.
   - VS runs `npm run dev` at the root, which starts both server and client via **concurrently**.
   - First run may take longer due to `npm install` prompts.

## Endpoints
- UI: http://localhost:5173
- API: http://localhost:3001/api/...

## Notes
- Python must be on PATH or set `PY_PATH` in the environment (server uses it when spawning Python).
- If ports are busy, change the port in `client/vite.config.js` or `server/server.js` accordingly.
