# FullStack URL Auditor (React + Node + Python)

This project provides:
- **Admin & Login** (JWT) with server-side config
- **Analyzer UI** to input a URL or upload an HTML file
- **Components detection** (frameworks, libraries) with evidence & references
- **Security audit** (headers, CSP, HSTS, mixed content, forms)
- **User stats** (IP, system via User-Agent). Email/name only when logged-in.

## Quickstart (Visual Studio 2022)
1. **Open Folder**: In VS2022, use *File → Open → Folder...* and select this root folder.
2. **Server setup**  
Show file content MS-DOS   ```bash
   cd server
   npm install
   cp .env.example .env   # set values
   npm run dev            # starts http://localhost:3001
   ```
3. **Python setup**  
   ```bash
   cd py
   python -m venv .venv
   .venv/Scripts/activate  # Windows
   pip install -r requirements.txt
   ```
   (Ensure `PY_PATH` in `server/.env` points to your Python exe, e.g. `PY_PATH=C:\\Users\\<you>\\.venv\\Scripts\\python.exe` if you use a dedicated venv.)
4. **Client setup**  
   ```bash
   cd client
   npm install
   npm run dev            # starts http://localhost:5173
   ```

The client expects the API at `http://localhost:3001`. You can set `VITE_API_BASE` in `client/.env` if needed.

## Admin credentials
- Default: `ADMIN_EMAIL=admin@example.com` and `ADMIN_PASSWORD=admin123` (in `.env.example`). **Change these** before real use.

## Notes
- Python analyzers are executed by the Node server via a safe runner with timeouts.
- Only **email/name** from the admin JWT are returned in `/api/user/stats` (privacy by design).
- Respect `robots.txt` and legal constraints if you enable crawling depth > 0.

## Scripts
- **Server**: TypeScript, Express (`npm run dev` with tsx, or `npm run build && npm start`)
- **Client**: React + Vite (`npm run dev`)

## Folder structure
See `README` of each submodule or browse folders:
- `client/` React app
- `server/` Node/Express (TypeScript)
- `py/` Python analyzers
- `shared/` shared schemas & types

