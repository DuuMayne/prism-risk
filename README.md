# PRISM

**Predictive Risk Intelligence and Scoring Model**

A quantitative risk management application. PRISM replaces spreadsheet-based risk registers with an interactive tool for scenario modeling, Monte Carlo simulation, and treatment comparison.

## Features

- **Scenario Register** — Create and manage risk scenarios with structured taxonomy classification
- **Scenario Templates** — Start from pre-built patterns and customize, no blank-page problem
- **Monte Carlo Simulation** — Run 1,000-iteration simulations in-browser with visual results
- **Treatment Comparison** — Model control investments and see how they shift the loss distribution
- **Decision Framing** — Auto-generated risk posture assessment with leadership-ready narrative
- **Portfolio Analysis** — Compare risk across dimensions, visualize treatment coverage gaps
- **Taxonomy Management** — Editable controlled vocabulary for consistent classification

## Getting Started

### Prerequisites

Install [Node.js](https://nodejs.org) (LTS version — click the big green button on the homepage).

To verify it installed correctly, open your terminal and run:
```
node -v
```
You should see a version number like `v20.x.x` or higher.

### Setup (one time)

1. Download or clone this repository
2. Open your terminal (Mac: Terminal.app or iTerm; Windows: PowerShell or Command Prompt)
3. Navigate to the project folder:
   ```
   cd path/to/prism-risk
   ```
4. Install dependencies:
   ```
   npm install
   ```

### Running PRISM

From the project folder, run:
```
npm run dev
```

Then open your browser to **http://localhost:3000**

To stop the server, press `Ctrl + C` in the terminal.

### Docker (alternative)

If you prefer Docker:
```
docker compose up
```
Open http://localhost:3000. Data persists between restarts.

## Updating

After pulling new code:
```
npm run migrate
```
Or go to **Settings > Refresh Database** in the app.

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
