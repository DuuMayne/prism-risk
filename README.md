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

### Option 1: Double-click (Mac)

1. Install [Node.js](https://nodejs.org) (LTS version) if you don't have it
2. Double-click **`start.command`**
3. PRISM opens in your browser at http://localhost:3000

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
