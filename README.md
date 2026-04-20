# PRISM

**Predictive Risk Intelligence and Scoring Model**

A quantitative risk management application. PRISM replaces spreadsheet-based risk registers with an interactive tool for scenario modeling, Monte Carlo simulation, and treatment comparison.

## Features

- **Scenario Register** — Create and manage risk scenarios with structured taxonomy classification
- **Monte Carlo Simulation** — Run 1,000-iteration triangular distribution simulations in-browser
- **Treatment Comparison** — Model control investments and see how they shift the loss distribution
- **Decision Framing** — Auto-generated risk posture assessment with leadership-ready narrative
- **Taxonomy Management** — Full CRUD for controlled vocabulary (Threat Community, Actions, Loss Forms, etc.)
- **Portfolio Dashboard** — Ranked risk overview with ALE comparisons and risk signals

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The database seeds automatically on first request with example taxonomy and a sample scenario.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **SQLite** (better-sqlite3) — zero-config, file-based
- **Tailwind CSS** — styling
- **Recharts** — data visualization
- **Client-side Monte Carlo** — instant simulation, no server dependency

## Documentation

See [WORKFLOW.md](./WORKFLOW.md) for the full development process and architecture decisions.

## License

Private — not licensed for redistribution.
