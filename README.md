# PRISM — Predictive Risk Intelligence and Scoring Model

A quantitative risk management tool that replaces spreadsheet-based risk registers with something you can actually use. Describe a risk scenario, answer a few plain-language questions about likelihood and impact, and PRISM runs 1,000 simulations to give you a realistic dollar range — so you can prioritize based on data, not gut feeling.

No actuarial science degree required. No consultants. Just open a browser, build your risk register, and get numbers your leadership team can act on.

**What it does:**
- Build a structured risk register with scenarios organized by category (access control, ransomware, vendor risk, etc.)
- Quantify each risk by answering simple questions — PRISM handles the math
- Run Monte Carlo simulations (1,000 iterations per scenario) to model realistic outcome ranges
- Compare treatment options side-by-side: what does this risk cost untreated vs. after controls?
- View your full portfolio to see where your biggest exposures sit
- 25 pre-built risk templates across 11 categories to get started immediately

---

## Table of Contents

1. [What you need before starting](#1-what-you-need-before-starting)
2. [Setup: Docker (recommended)](#2-setup-docker-recommended)
3. [Setup: Local development](#3-setup-local-development)
4. [Creating your first risk scenario](#4-creating-your-first-risk-scenario)
5. [Understanding simulation results](#5-understanding-simulation-results)
6. [Comparing treatment options](#6-comparing-treatment-options)
7. [Troubleshooting](#7-troubleshooting)
8. [For developers](#8-for-developers)

---

## 1. What you need before starting

**For Docker setup (recommended):**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

**For local development:**
- Node.js 18 or later — check with `node --version`
- npm (comes with Node.js)

No API keys, no accounts, no configuration files required. PRISM is fully self-contained.

---

## 2. Setup: Docker (recommended)

### Step 1 — Install Docker Desktop

Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/). Open it and wait for the whale icon in your menu bar (macOS) or system tray (Windows).

### Step 2 — Clone or download PRISM

If you have Git:
```bash
git clone https://github.com/DuuMayne/PRISM.git
cd PRISM
```

Or download the ZIP from GitHub and unzip it, then open a terminal in that folder.

### Step 3 — Start PRISM

```bash
docker compose up -d --build
```

- **`--build`** — builds the image on first run (takes 2–3 minutes)
- **`-d`** — runs in the background so you can close the terminal

### Step 4 — Open PRISM

Go to **[http://localhost:3000](http://localhost:3000)** in any browser.

Your risk data is stored in a Docker volume and persists between restarts.

**To stop PRISM:**
```bash
docker compose down
```

**To start it again later:**
```bash
docker compose up -d
```

**To update to the latest version:**
```bash
git pull
docker compose up -d --build
npm run migrate
```

---

## 3. Setup: Local development

### Step 1 — Install Node.js

Download from [nodejs.org](https://nodejs.org). After installing, run `node --version` to confirm.

### Step 2 — Install and start

```bash
cd PRISM
npm install
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)**.

**After pulling updates that include database changes:**
```bash
npm run migrate
```

---

## 4. Creating your first risk scenario

### Start from a template

Click **New Scenario** and choose from 25 pre-built templates organized by category:

| Category | Example templates |
|---|---|
| Identity & Access | Admin Account Takeover via Phishing, Privilege Escalation via Over-Provisioned Access |
| Cyber Attack | Ransomware Attack, Software Supply Chain Compromise |
| Data Protection | Sensitive Data Sent to Wrong Recipient, Data Retention Violation |
| Third Party | Critical Vendor Service Outage, Third-Party Data Breach |
| Cloud & Infrastructure | Cloud Storage Misconfiguration Exposes Data, Infrastructure Drift from Secure Baseline |
| Fraud | Synthetic Identity Fraud, Business Email Compromise |
| Compliance | Missed Regulatory Filing or Notice, Privacy Consent or Notice Violation |
| AI & Model Risk | AI/ML Model Drift Causes Biased Outcomes, Generative AI Data Leakage |

Starting from a template pre-fills the description and suggested impact ranges — edit them to match your organization.

### Quantifying the risk

PRISM uses guided quantification to walk you through estimating frequency, vulnerability, and impact — answering plain-language questions that map to the underlying FAIR model:

1. **Threat Event Frequency (TEF):** How often could this threat be attempted? (low, most likely, high)
2. **Vulnerability:** If the threat occurs, how likely is it to succeed given your controls? (low, most likely, high)
3. **Primary Loss:** What's the direct financial impact if the event succeeds? (low, most likely, high)
4. **Secondary Event Probability:** How likely is a secondary event (e.g., regulatory action, lawsuit)?
5. **Secondary Loss:** What's the financial impact of that secondary event? (low, most likely, high)

PRISM uses these ranges — not single point estimates — to run simulations. This captures uncertainty honestly rather than pretending you know the exact number.

### Running the simulation

Click **Run Simulation**. PRISM runs 1,000 scenarios in your browser using your input ranges and displays:
- The distribution curve of outcomes
- Median, 90th percentile, and 95th percentile loss values, plus mean annual loss
- Annualized Loss Expectancy (ALE)

---

## 5. Understanding simulation results

After running a simulation you'll see four key numbers:

**Mean annual loss:** The statistical average across all simulated years. Useful for comparing scenarios against each other and for budgeting.

**Median (50th percentile):** The midpoint — half the simulations produced more than this, half produced less. A good "expected" number for planning.

**90th percentile (worst case planning):** In 10% of simulated years, losses could reach this level or higher. Use this for insurance and budget conversations.

**95th percentile (tail risk):** Only 5% of simulated years exceed this level. Use this for stress testing and catastrophic risk planning.

The curve shape tells you how uncertain the scenario is — a wide, flat curve means high uncertainty; a narrow, peaked curve means your estimates are tight.

---

## 6. Comparing treatment options

For any scenario, click **Add Treatment** to model what a control would do to the risk:

1. Name the treatment (e.g. "Deploy MFA on all admin accounts")
2. Enter the annual cost of the treatment
3. Estimate how much it reduces the frequency or the impact range
4. Run the simulation again

PRISM shows you the treated vs. untreated distributions side by side, the reduction in ALE, and the Return on Security Investment (ROSI) — the dollar benefit divided by the cost.

This gives you a defensible answer to "why are we spending money on this?"

---

## 7. Troubleshooting

### "This site can't be reached" at localhost:3000

The container isn't running:
```bash
docker compose ps
```
If `prism` isn't listed as `Up`:
```bash
docker compose up -d
```

### Port 3000 is already in use

Change the port in `docker-compose.yml`: replace `"3000:3000"` with `"3001:3000"`, then restart.

### Data disappeared after updating

Volumes persist unless you use `docker compose down -v`. For regular updates, use `docker compose up -d --build` only. To check your volumes:
```bash
docker volume ls
```

### Migration error after `git pull`

Run:
```bash
npm run migrate
```
This applies any database schema changes included in the update.

### Simulation results seem wrong

Check your input ranges — PRISM requires that your minimum frequency is less than your maximum, and minimum impact is less than maximum. Very wide ranges (e.g. $100 to $10,000,000) will produce wide, uncertain distributions by design.

---

## 8. For developers

### Tech stack
- **Next.js 16** (App Router, TypeScript)
- **SQLite** via better-sqlite3
- **Tailwind CSS**
- **Recharts** for simulation visualizations
- Monte Carlo runs client-side in the browser (no server compute needed)

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `DB_PATH` | `./data/prism.db` | SQLite database file path |

### Database migrations

Migrations live in `scripts/`. When adding a new table or column:
```bash
npm run migrate
```

### Project structure
```
src/app/           — Next.js App Router pages and API routes
src/components/    — React components including simulation charts
src/lib/           — Monte Carlo engine, database access
scripts/           — Migration scripts
data/              — SQLite database file
```

---

## License

Apache 2.0 with Commons Clause. Free to use and modify for internal purposes; selling as a product requires permission. See [LICENSE](LICENSE) for full terms.
