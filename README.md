# PRISM

**Predictive Risk Intelligence and Scoring Model**

> **Branch: `feature/remediation-v1`** — On hold. This branch adds standalone remediation tracking to PRISM (Phases 1-4 below). The approach works but feels too disconnected from the risk scenarios — remediation items exist as their own entities rather than being generated from Treatment plans. The next iteration (`feature/remediation`) will explore tighter Treatment-to-Remediation linkage. This branch is preserved as a reference for the workflow engine, SLA, and evidence patterns.

A quantitative risk management application. PRISM replaces spreadsheet-based risk registers with an interactive tool for scenario modeling, Monte Carlo simulation, and treatment comparison.

## Features

- **Scenario Register** — Create and manage risk scenarios with structured taxonomy classification
- **Scenario Templates** — 25 pre-built risk patterns across 11 categories to start from
- **Guided Quantification** — Plain-language questions help you estimate frequency and impact without guessing raw numbers
- **Monte Carlo Simulation** — Run 1,000-iteration simulations in-browser with visual results
- **Treatment Comparison** — Model control investments and see how they shift the loss distribution
- **Decision Framing** — Auto-generated risk posture assessment with leadership-ready narrative
- **Portfolio Analysis** — Compare risk across dimensions, visualize treatment coverage gaps
- **Taxonomy Management** — Editable controlled vocabulary for consistent classification

### Remediation Tracking (this branch only)

- **Remediation Items** — Track findings with severity, finding type, owner, and due dates (`/remediation`)
- **Workflow State Machine** — open → in_progress → blocked → resolved → verified → closed, with enforced rules (blocked requires comment, resolved requires resolution type)
- **Evidence Management** — Attach evidence records (screenshots, logs, attestations) before resolving
- **SLA Policies** — Auto-calculated due dates based on finding type + severity, configurable in Settings
- **Immutable Audit Trail** — Every status change recorded with actor, comment, and timestamp
- **Dashboard** — Summary metrics, status/severity/aging charts, CSV export (`/remediation/dashboard`)
- **Scenario Integration** — Bidirectional links between scenarios and remediation items; remediation coverage section on Portfolio Analysis page

### What changed vs. `main`

| Area | Files | Summary |
|------|-------|---------|
| Database | `src/lib/db.ts` | 4 new tables: `remediation_items`, `status_history`, `evidence`, `sla_policies` |
| Types | `src/lib/remediation-types.ts` | Interfaces, constants, badge maps, formatters |
| Workflow | `src/lib/workflow.ts` | State machine with transition validation |
| SLA | `src/lib/sla.ts` | Due date calculation from policies with severity defaults |
| API | `src/app/api/remediation/**` | CRUD, status transitions, evidence, dashboard, export |
| API | `src/app/api/sla/` | SLA policy management |
| Pages | `src/app/remediation/**` | List, detail (3 tabs), create, edit, dashboard |
| Components | `src/components/EvidenceForm.tsx` | Evidence entry form |
| Modified | `Navbar`, scenario detail, settings, portfolio, seed | Nav link, remediation panel, SLA config, coverage section, default SLAs |

## Getting Started

### Step 1: Install Node.js

Download and install [Node.js](https://nodejs.org) (click the **LTS** button — the big green one).

**Verify it works:** Open your terminal and type:
```
node -v
```
You should see something like `v20.x.x` or higher. If you get "command not found," restart your terminal after installing.

> **How to open a terminal:**
> - **Mac:** Press `Cmd + Space`, type "Terminal", press Enter
> - **Windows:** Press `Win + R`, type "cmd", press Enter (or search for "PowerShell")

### Step 2: Download PRISM

**Option A — Git clone (if you have git):**
```
git clone https://github.com/DuuMayne/prism-risk.git
cd prism-risk
```

**Option B — Download ZIP:**
1. Go to https://github.com/DuuMayne/prism-risk
2. Click the green **Code** button > **Download ZIP**
3. Extract the ZIP file
4. In your terminal, navigate to the extracted folder:
   ```
   cd ~/Downloads/prism-risk-main
   ```

### Step 3: Install dependencies (one time)

```
npm install
```

This takes 1-2 minutes the first time. You only need to do this once (or after pulling updates).

### Step 4: Run PRISM

```
npm run dev
```

Then open your browser to: **http://localhost:3000**

You should see the PRISM dashboard. The database is created automatically on first launch.

**To stop:** Press `Ctrl + C` in the terminal window.

**To restart later:** Just repeat Step 4 — open terminal, `cd` to the folder, `npm run dev`.

### Docker (alternative)

If you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed:
```
docker compose up
```
Open http://localhost:3000. Your data persists between restarts.

## Updating

When new versions are available:

```
git pull
npm install
npm run migrate
```

Or after pulling new code, go to **Settings > Refresh Database** in the app.

Your scenarios and treatments are always preserved during updates.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **SQLite** (better-sqlite3) — zero-config, file-based
- **Tailwind CSS** — styling
- **Recharts** — data visualization
- **Client-side Monte Carlo** — instant simulation, no server dependency

## License

[Apache 2.0 with Commons Clause](./LICENSE)

You may freely use, modify, and share PRISM — including for business purposes. You may **not** sell it, host it as a paid service, or otherwise monetize it without written permission from the author.
