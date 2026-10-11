# National Labour Market Intelligence System (LMIS)
### AI-Enabled Skill Demand-Supply Forecasting and Planning Engine

An evidence-based decision-support portal for national, state, and district training planners (Ministry of Skill Development & Entrepreneurship / NCVET ecosystem). LMIS bridges the structural divergence between training supply capacity and evolving labour-market employment demands.

---

## Key Features

1. **National-to-District Drilldown:** Analytical hierarchy spanning National, State, and District granularities with dependent filter cascades.
2. **Labour Demand Index (LDI):** Multi-signal recruitment intensity score (0–100) combining deduplicated active postings, growth velocity, unique employer diversity, and vacancy signals.
3. **Training Supply Funnel:** Multi-stage capacity tracking across Sanctioned Seats, Enrolments, Completions, NSQF Certifications, and Placements.
4. **Estimated Effective Supply:** Methodological calculation factoring in real graduation and placement absorption rates rather than assuming 100% seat conversion.
5. **Demand-Supply Gap Matrix:** Formulates headcounts and relative gap rates, categorizing into *Critical Shortage*, *High Shortage*, *Balanced*, *High Oversupply*, and *Critical Oversupply*.
6. **Chronological Forecast Engine:** Scikit-learn Ridge Lag Regression and Seasonal Baselines generating 3-, 6-, and 12-month projections with 80% prediction intervals and chronological held-out validation (MAE, WAPE).
7. **Early Warning Incident Monitor:** Early detection of emerging shortages, posting surges, and surplus capacity risks with persistent acknowledgement and resolution workflows.
8. **Actionable Intervention Recommendations:** Deterministic, explainable policy recommendations (e.g., seat expansions, curriculum reviews, demand validation) with status lifecycle persistence.
9. **Interactive Scenario Planner ("What If?"):** Capacity simulation enabling planners to adjust proposed seat allocations and observe real-time simulated gap reduction and comparative charts.
10. **Data Ingestion & CSV Exports:** Built-in CSV observation validation with error previews, data import execution, provenance catalogue, and formula-injection-safe CSV exports.

---

## Tech Stack

- **Backend:** Python 3.11+ / 3.13, FastAPI, SQLAlchemy 2.0, Pydantic v2, Pandas, NumPy, Scikit-learn.
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons.
- **Database:** SQLite (zero-configuration portable local DB) or PostgreSQL.
- **Design System:** Navy Blue (`#0B1528`) with Gold (`#F5A623` / `#D4AF37`) metallic accents and semantic risk badges.

---

## Quickstart & Local Setup

### 1. Backend Setup

```bash
# From repository root
cd backend

# (Optional) Activate Python virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend test suite
python -m backend.tests.run_tests

# Launch FastAPI backend server (Runs on http://localhost:8000)
python -m backend.app.main
```

API Documentation will be accessible at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 2. Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server (Runs on http://localhost:5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Service health status and timestamp |
| `GET` | `/api/v1/filters` | Geographical hierarchy and occupational taxonomies |
| `GET` | `/api/v1/overview` | Core KPIs, gap distribution, trends, and top priority trades |
| `GET` | `/api/v1/demand/trends` | Time-series recruitment postings and LDI scores |
| `GET` | `/api/v1/demand/by-sector` | Sector recruitment intensity breakdown |
| `GET` | `/api/v1/demand/occupations` | Trade-level recruitment counts and growth rates |
| `GET` | `/api/v1/occupations/{id}` | Detailed occupational competency audit and top districts |
| `GET` | `/api/v1/supply/summary` | Sanctioned seats, enrolments, completions, and placements |
| `GET` | `/api/v1/gaps/rankings` | Demand-supply gaps, gap rates, and risk severities |
| `GET` | `/api/v1/forecasts` | 3-, 6-, and 12-month projections with prediction intervals |
| `GET` | `/api/v1/forecasts/evaluation` | Chronological backtest evaluation metrics (MAE, WAPE) |
| `GET` | `/api/v1/alerts` | Filterable early warning incident list |
| `PATCH` | `/api/v1/alerts/{id}` | Update alert status (`open`, `acknowledged`, `resolved`) |
| `GET` | `/api/v1/recommendations` | Interventions with reasoning and evidence metrics |
| `PATCH` | `/api/v1/recommendations/{id}` | Update recommendation status (`proposed`, `accepted`, etc.) |
| `POST` | `/api/v1/scenarios/simulate` | Interactive what-if seat capacity simulation |
| `POST` | `/api/v1/scenarios` | Save scenario parameters |
| `GET` | `/api/v1/scenarios` | List saved planning scenarios |
| `POST` | `/api/v1/imports/validate` | Pre-commit validation of uploaded CSV observations |
| `POST` | `/api/v1/imports` | Ingest validated CSV records into canonical database |
| `POST` | `/api/v1/imports/reset-demo` | Reseed synthetic pilot benchmark dataset |
| `GET` | `/api/v1/exports/gaps.csv` | Stream filtered gap matrix to CSV |
| `GET` | `/api/v1/exports/forecasts.csv` | Stream multi-horizon forecasts to CSV |

---

## Methodology & Documentation

Detailed documentation is available in the `docs/` folder:
- [Methodology & Formulas](docs/methodology.md): Full breakdown of LDI weights, gap sign convention, and Ridge forecasting.
- [Data Dictionary](docs/data_dictionary.md): Canonical database schemas, data types, constraints, and source integration status.
- [User Guide](docs/user_guide.md): Step-by-step walkthrough for planners and evaluators.
