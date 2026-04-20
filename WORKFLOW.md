# PRISM - Development Workflow

## What is PRISM?

**Predictive Risk Intelligence and Scoring Model** — a web application that replaces a FAIR (Factor Analysis of Information Risk) spreadsheet-based risk register with an interactive, quantitative risk management tool.

## Origin

The application was built from a reference Excel workbook (`FAIR Risk Register.xlsx`) that contained:
- A controlled taxonomy for scenario classification (Scenario Family, Threat Community, Threat Action, Loss Event Family, Loss Form, Control Type)
- A schema defining 37+ fields per risk scenario across identity, classification, governance, and quantification groups
- A risk scenario register with capacity for 1,000 scenarios
- A Monte Carlo simulation sheet (1,000 iterations, triangular distributions)
- A treated-state comparison worksheet for evaluating control investments
- A decision summary sheet for leadership reporting

## Development Process

### 1. Spreadsheet Analysis
- Parsed the Excel workbook programmatically to extract structure, formulas, seed data, and design principles
- Identified the FAIR model flow: TEF × Vulnerability = LEF, LEF × Loss Magnitude = Annual Loss
- Mapped the triangular distribution sampling approach used for Monte Carlo
- Documented the treatment comparison methodology (proportional reductions to frequency and magnitude inputs)

### 2. Architecture Decisions
- **Next.js** (App Router, TypeScript) — full-stack framework with API routes and React UI
- **SQLite** (via better-sqlite3) — simple single-file database for development, easy to migrate to Postgres for team deployment
- **Client-side Monte Carlo** — 1,000-iteration simulation runs instantly in the browser with no server round-trip
- **Recharts** — charting library for loss distribution histograms and portfolio comparisons
- **Tailwind CSS** — utility-first styling

### 3. Database & Data Layer
- Created schema with three tables: `scenarios`, `taxonomy`, `treatments`
- Seeded all 69 taxonomy entries from the updated spreadsheet
- Seeded SCN-0001 (Workforce IdP admin account takeover) as example scenario
- Auto-generates scenario IDs (SCN-0001, SCN-0002, etc.)
- Auto-calculates deterministic ALE bounds on save

### 4. Monte Carlo Engine
- Implemented triangular distribution sampling (inverse CDF method)
- Matches spreadsheet formula: `Annual_Loss = (TEF_sample × Vuln_sample) × (Primary_Loss_sample + Secondary_Loss_sample)`
- Secondary loss uses a Bernoulli gate (secondary_event_prob) before sampling magnitude
- Summary statistics: mean, median, P90, P95, threshold exceedance probabilities
- Treatment comparison applies proportional reductions to all three distribution points (low/ML/high)

### 5. UI Development
- **Dashboard** — portfolio overview with summary cards, ranked bar chart, scenario table with risk signals
- **Scenarios** — filterable list, create/edit forms with taxonomy dropdowns, detail pages with tabbed interface
- **Monte Carlo tab** — run simulation, view area chart distribution, expandable metrics, data quality caveats
- **Treatment Comparison tab** — define treatments, run side-by-side simulation, comprehensive decision framing
- **Taxonomy** — full CRUD (create, edit, delete) for all taxonomy entries

### 6. Decision Framing
- Uses Monte Carlo P95 and threshold probabilities to classify risk posture (critical/elevated/moderate/low)
- Generates plain-English narrative explaining what the numbers mean
- Treatment assessment evaluates: mean reduction, tail risk impact, threshold probability changes, payback period, residual risk classification
- Flags when treatment helps average case but not worst-case, or when cost recovery exceeds 5 years

### 7. Taxonomy Update
- Updated Threat Community (8 → 13 entries), Threat Action (8 → 18 entries), Loss Event Family (5 → 7), Loss Form (7 → 12)
- Added definitions, usage notes, and examples for all new entries
- Entries are now specific to lending/fintech operational context

### 8. UX Polish
- Tooltips across all forms explaining each field's purpose and how it's used in the FAIR model
- Treatment form organized into Identity, Frequency Reduction, and Magnitude Reduction sections
- Live percentage readouts on reduction inputs
- Collapsible detailed metrics to reduce information density
- Progress bars for threshold exceedance visualization

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | SQLite (better-sqlite3) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Monte Carlo | Client-side JavaScript |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── scenarios/       # CRUD for risk scenarios
│   │   ├── taxonomy/        # CRUD for taxonomy entries
│   │   └── treatments/      # CRUD for treatments
│   ├── scenarios/
│   │   ├── [id]/            # Detail, edit pages
│   │   └── new/             # Create scenario
│   ├── taxonomy/            # Taxonomy management
│   ├── layout.tsx           # App shell
│   ├── page.tsx             # Dashboard
│   └── globals.css          # Styles
├── components/
│   ├── DecisionFraming.tsx  # Risk posture + treatment assessment
│   ├── MonteCarloChart.tsx  # Distribution area chart
│   ├── Navbar.tsx           # Navigation
│   ├── ScenarioForm.tsx     # Create/edit scenario
│   ├── SimulationSummary.tsx# Metrics + thresholds
│   ├── Tooltip.tsx          # Reusable tooltip
│   └── TreatmentForm.tsx    # Treatment input form
└── lib/
    ├── db.ts                # Database connection + schema
    ├── monte-carlo.ts       # Simulation engine
    ├── seed.ts              # Initial data
    └── types.ts             # TypeScript interfaces
```

## Running Locally

```bash
cd /Users/adamduman/Projects/fair-risk-app
npm install
npm run dev
# Open http://localhost:3000
```

## Future Considerations

- **Multi-user deployment**: Add authentication (NextAuth), migrate SQLite → Postgres
- **Scenario templates**: Clone scenarios as starting points for new assessments
- **Export/reporting**: PDF generation for leadership summaries
- **Audit trail**: Track changes to scenarios and quantification inputs over time
- **API integration**: Import threat intelligence or control assessment data
