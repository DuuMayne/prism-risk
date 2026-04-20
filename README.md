# PRISM

**Predictive Risk Intelligence and Scoring Model**

A quantitative risk management application. PRISM replaces spreadsheet-based risk registers with an interactive tool for scenario modeling, Monte Carlo simulation, and treatment comparison.

## Features

- **Scenario Register** — Create and manage risk scenarios with structured taxonomy classification
- **Monte Carlo Simulation** — Run 1,000-iteration triangular distribution simulations in-browser
- **Treatment Comparison** — Model control investments and see how they shift the loss distribution
- **Decision Framing** — Auto-generated risk posture assessment with leadership-ready narrative
- **Portfolio Analysis** — Compare risk across dimensions, visualize treatment coverage gaps
- **Taxonomy Management** — Full CRUD for controlled vocabulary (Threat Community, Actions, Loss Forms, etc.)
- **Portfolio Dashboard** — Ranked risk overview with ALE comparisons and risk signals

## Getting Started

### Option 1: Mac Setup (recommended for Mac users)

1. Install [Node.js](https://nodejs.org) (LTS version) if you don't have it
2. Right-click **`setup-mac.command`** > **Open**

   > **Gatekeeper warning:** macOS will show _"setup-mac.command cannot be opened because it is from an unidentified developer"_ or _"Apple cannot check it for malicious software."_
   >
   > **Workaround:** Go to **System Settings > Privacy & Security**, scroll down to the Security section, and click **"Open Anyway"** next to the blocked file. Then run it again.
   >
   > **Terminal access:** macOS will also ask _"Terminal wants to access files in your Downloads folder"_ (or wherever you saved the repo). Click **Allow** — Terminal needs this to install dependencies and create the app.

3. Follow the prompts — it installs dependencies and creates a **PRISM.app** you can double-click
4. From then on, just double-click **PRISM.app** (or the Desktop shortcut) to launch

### Option 2: Double-click (Windows)

1. Install [Node.js](https://nodejs.org) (LTS version) if you don't have it
2. Double-click **`start.bat`**
3. PRISM opens in your browser at http://localhost:3000

### Option 3: Docker (any platform)

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Run:
   ```bash
   docker compose up
   ```
3. Open http://localhost:3000

Your data persists in a Docker volume between restarts.

### Option 4: Command line

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Updating

After pulling new code, refresh your database to get the latest taxonomy and system updates:

- **From the app:** Go to Settings > click "Refresh Database"
- **From the command line:** `npm run migrate`

Your scenarios and treatments are always preserved.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **SQLite** (better-sqlite3) — zero-config, file-based
- **Tailwind CSS** — styling
- **Recharts** — data visualization
- **Client-side Monte Carlo** — instant simulation, no server dependency

## Documentation

See [WORKFLOW.md](./WORKFLOW.md) for the full development process and architecture decisions.

## License

[AGPL-3.0](./LICENSE) — open source, copyleft. You may use, modify, and distribute this software freely. If you run a modified version as a network service, you must make your source code available under the same license.
