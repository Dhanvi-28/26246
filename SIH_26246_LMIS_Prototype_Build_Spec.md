# SIH 2026 --- Build Specification for AI-Enabled Labour Market Intelligence and Skill Demand-Supply Forecasting Engine

**Problem Statement ID:** 26246\
**Organisation:** Ministry of Skill Development and Entrepreneurship
(MSDE)\
**Product type:** Decision-support web application / Labour Market
Intelligence System (LMIS)\
**Purpose of this file:** Treat this document as the implementation
brief for Antigravity or another coding agent. Build the application
from scratch into a working, locally runnable, demo-ready prototype. Do
not stop at a static UI or a plan.

------------------------------------------------------------------------

## 0. Instructions to the coding agent

You are the lead full-stack engineer, data engineer, applied ML
engineer, and product designer for this project.

Build a credible prototype that helps MSDE, NCVET, and Sector Skill
Council planners understand labour demand, compare it with training
capacity, forecast future demand-supply gaps, and prioritise
interventions by sector, trade, state, and district.

### Non-negotiable delivery rules

1.  **Inspect the repository first.** Preserve useful existing work if
    present. If empty, scaffold the project cleanly.
2.  **Implement the whole vertical slice.** Data ingestion/sample data →
    normalisation → analytics/forecasting → API → UI →
    filters/drill-down/export. All primary controls must work.
3.  **Do not deliver a static mockup.** Charts, filters, tables,
    navigation, detail pages, date ranges, and exports must use actual
    application state and API data.
4.  **No fake claims about real data.** The hackathon may provide dummy
    data. If sample/synthetic records are used, label them clearly as
    "Demo data" or "Synthetic sample". Never imply that they are
    official current government statistics.
5.  **Build a real-data-ready architecture.** Keep source adapters and
    data provenance fields so public datasets can replace the demo
    dataset later without redesigning the application.
6.  **Explain the numbers.** Show definitions, time periods, source
    coverage, assumptions, model type, forecast horizon, and
    uncertainty/limitations.
7.  **No fabricated model accuracy.** Calculate evaluation metrics from
    held-out historical data where enough data exists. Otherwise show
    "Not enough historical data to validate" instead of an invented
    score.
8.  **Make every main action work.** No dead buttons, fake loading
    spinners, empty links, or decorative filters that do nothing.
9.  **Prioritise reliability over unnecessary complexity.** A smaller,
    functioning prototype with defensible methodology is better than a
    large collection of nonfunctional features.
10. **Finish with a README**, setup instructions, environment example,
    data dictionary, API documentation, tests, and a short list of known
    limitations.

Do not ask the user to make routine implementation decisions. Choose
sensible defaults, document them, and continue. Ask only if a genuine
blocker prevents progress.

------------------------------------------------------------------------

## 1. Product vision

### 1.1 The core problem

India's skilling ecosystem trains candidates across many occupations,
but training supply can diverge from labour-market demand. Some
districts may train too many candidates for a trade with limited
opportunities; other districts may lack workers in growing occupations.
Labour-market signals are fragmented across job postings, workforce
statistics, training capacity records, and public employment datasets.

The application must bring these signals into a consistent analytical
view and help planners answer:

-   Which occupations and sectors are growing or declining?
-   Where is training supply likely to exceed demand?
-   Where is demand likely to exceed available trained supply?
-   Which gaps are severe, persistent, or emerging?
-   How might the gap change over the next 3, 6, and 12 months?
-   Which districts and trades should receive more or fewer training
    seats?
-   How reliable is the evidence behind a recommendation?
-   Which data sources, assumptions, and model outputs produced the
    result?

### 1.2 Product objective

Build a Labour Market Intelligence System (LMIS) with a
national-to-district analytical hierarchy, explainable demand-supply gap
forecasting, early warnings, and an actionable training-planning
workflow.

### 1.3 Primary users

1.  **National planner / MSDE administrator:** compare states and
    sectors; set broad training priorities.
2.  **State planning officer:** identify district-level shortages and
    oversupply; propose changes to training targets.
3.  **Sector Skill Council analyst:** inspect occupation-level demand,
    required skills, and employer signals.
4.  **Training-capacity planner:** compare available seats, course
    capacity, completions, and placement outcomes.
5.  **Read-only reviewer / evaluator:** explore the prototype, see
    methodology, and export results.

For the hackathon, role-based login may be omitted unless time permits.
The interface should still clearly distinguish national, state, and
district views.

------------------------------------------------------------------------

## 2. Scope and MVP priorities

### 2.1 Must-have features

-   Overview dashboard with meaningful KPIs.
-   Filters for time period, state, district, sector, and
    occupation/trade.
-   National → state → district drill-down.
-   Labour-demand index and trend.
-   Training supply/capacity comparison.
-   Demand-supply gap calculation and severity classification.
-   Forecasts for future periods with a baseline and uncertainty
    interval where supportable.
-   Early-warning list for severe or worsening shortages/oversupply.
-   Prioritised trade/district intervention recommendations with
    explanations.
-   Occupation/skill detail page.
-   Data source and methodology page.
-   Data import for CSV files with validation and a sample template.
-   CSV export of filtered results and forecasts.
-   API documentation via FastAPI OpenAPI/Swagger.
-   Responsive and accessible UI.
-   Clearly marked demo dataset and a repeatable seed/reset command.

### 2.2 Important if time permits

-   District choropleth map using actual district boundaries and
    validated geographic identifiers.
-   English plus one Indian language (prefer Kannada as a demonstrable
    pilot language if translation quality can be maintained).
-   Scenario planner to adjust training seats and see how the projected
    gap changes.
-   Saved planning scenarios.
-   Downloadable PDF summary.
-   Forecast model comparison and backtesting page.

### 2.3 Explicitly out of scope for the first prototype

-   Claiming official live access to government portals without
    credentials or a working data feed.
-   Scraping sources in ways that violate their terms.
-   Automatic government scheme approvals or automatic seat allocation.
-   Individual worker profiling or exposing personal identifiable
    information.
-   A chatbot as the main product experience.
-   Complex multi-agent AI that does not improve forecast quality or
    planner decisions.

------------------------------------------------------------------------

## 3. Technology stack and architecture

Use a modern, maintainable stack. Keep all components runnable locally.

### Frontend

-   React with TypeScript and Vite.
-   Tailwind CSS for a controlled design system.
-   shadcn/ui or Radix primitives for accessible components; customise
    them so the result does not look like a generic template.
-   Recharts for charts.
-   React Router for page navigation.
-   TanStack Query for API data fetching and caching.
-   React Hook Form plus Zod for validated forms.
-   Lucide icons.
-   Leaflet with a suitable GeoJSON layer only if real district boundary
    data is available and properly attributed.

### Backend

-   Python 3.11 or newer.
-   FastAPI.
-   Pydantic v2 for validation.
-   SQLAlchemy 2.x.
-   Pandas and NumPy for data processing.
-   scikit-learn for baseline models and evaluation.
-   Statsmodels may be used for a time-series baseline if available and
    justified.
-   pytest and HTTPX for testing.

### Database

Prefer PostgreSQL for the target architecture. For a hackathon
environment where PostgreSQL setup would block local execution, SQLite
may be used as a documented local-development fallback. Keep the
SQLAlchemy models portable. Do not create separate business logic for
each database.

### Suggested repository structure

``` text
labour-market-intelligence/
├── README.md
├── .env.example
├── docker-compose.yml                 # Optional but recommended
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── charts/
│   │   │   ├── filters/
│   │   │   ├── tables/
│   │   │   └── ui/
│   │   ├── features/
│   │   │   ├── overview/
│   │   │   ├── demand/
│   │   │   ├── supply/
│   │   │   ├── forecasts/
│   │   │   ├── alerts/
│   │   │   ├── recommendations/
│   │   │   ├── scenarios/
│   │   │   └── data-sources/
│   │   ├── lib/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── main.tsx
│   └── public/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── ingestion/
│   │   │   ├── normalisation/
│   │   │   ├── demand_index.py
│   │   │   ├── gap_analysis.py
│   │   │   ├── forecasting.py
│   │   │   ├── alerts.py
│   │   │   └── recommendations.py
│   │   └── seed/
│   ├── tests/
│   └── requirements.txt
├── data/
│   ├── demo/
│   ├── templates/
│   └── README.md
└── docs/
    ├── methodology.md
    ├── data_dictionary.md
    └── demo_script.md
```

Adapt the structure if an existing repository has a sound convention.
Avoid putting the entire app in one giant component or one giant Python
file.

### Architecture flow

``` text
CSV / permitted public datasets / future source connectors
                      |
                      v
          Ingestion and validation
                      |
                      v
    Normalise geography, occupations, skills,
          dates, units, and source metadata
                      |
                      v
       Store canonical records in database
                      |
                      v
    Demand index + supply metrics + gap engine
                      |
                      v
         Forecasts + uncertainty + alerts
                      |
                      v
          Recommendation / scenario API
                      |
                      v
 React + TypeScript dashboard and exports
```

------------------------------------------------------------------------

## 4. Data strategy

### 4.1 Data sources to support

Design source adapters and metadata for these source categories:

-   **NCS (National Career Service):** job and employment-related
    signals, subject to availability and permitted access.
-   **NCO (National Classification of Occupations):** standard
    occupation codes and labels for occupation normalisation.
-   **NSQF:** qualification levels and qualification/course mapping
    where available.
-   **PLFS:** workforce and employment indicators from published
    reports/datasets; observe publication frequency and geographic
    granularity.
-   **e-Shram:** relevant aggregate workforce information only where
    accessible and permitted. Do not assume a public live API exists.
-   **Training ecosystem data:** sanctioned seats, enrolled candidates,
    completions, certified candidates, centres, courses, and placement
    outcomes.
-   **Employer/job-posting signals:** licensed, permitted, public, or
    user-supplied data with source and collection date.
-   **Industry/sector signals:** use only when the data source, unit,
    and interpretation can be documented.

Do not claim that every source is integrated live. The first prototype
may use user-uploaded CSVs and a synthetic demo dataset. Display the
status of each source as one of: `Connected`, `Uploaded`, `Demo data`,
`Unavailable`, or `Planned`, according to the actual implementation.

### 4.2 Canonical data entities

Create a consistent schema that supports these core entities:

**Geography** - `state_code`, `state_name` - `district_code`,
`district_name` - Optional `latitude`, `longitude` or a geometry
reference - Geographic code system and effective date, where known

**Occupation / trade** - `occupation_id` - `occupation_name` -
`nco_code` (nullable) - `sector_id`, `sector_name` - `nsqf_level`
(nullable) - `course_id` / `qualification_id` (nullable) - `skills`
(normalised list or linked skill table)

**Demand observation** - `observation_id` - `period_start`, `period_end`
or a standard `period` field - `state_code`, `district_code` -
`occupation_id`, `sector_id` - `job_postings_count` -
`unique_employer_count` (nullable) - `estimated_vacancies` (nullable) -
`source_id` - `source_type` - `collected_at` - `data_status`
(`official`, `uploaded`, `demo_synthetic`, etc.) - `quality_score` or
validation status - Optional raw-source reference and deduplication key

**Training supply observation** - `period` - `state_code`,
`district_code` - `occupation_id` or mapped course identifier -
`sanctioned_seats` - `enrolments` - `completions` -
`certified_candidates` - `placed_candidates` - `active_centres` -
`source_id` - `data_status`

**Forecast** - `forecast_id` - geography and occupation identifiers -
`forecast_origin_period` - `target_period` - `predicted_demand` -
`lower_bound`, `upper_bound` (nullable if unavailable) - `model_name`,
`model_version` - `training_window` - `evaluation_metric` and value
(nullable) - `data_coverage` - `generated_at` - `data_status`

**Alert** - `alert_id` - geography and occupation identifiers -
`alert_type` (`shortage`, `oversupply`, `rising_demand`,
`data_quality`) - `severity` (`critical`, `high`, `medium`, `low`) -
`observed_value` - `threshold` - `reason` - `created_at` - `status`
(`open`, `acknowledged`, `resolved`)

**Source metadata** - `source_id`, `source_name`, `source_type` -
`publisher` - `source_url` (nullable) - `access_method` - `frequency` -
`last_updated_at` - `coverage_description` - `licence_or_usage_notes` -
`status` - `limitations`

### 4.3 Occupation and geography normalisation

Implement a transparent mapping layer:

-   Normalise case, whitespace, punctuation, spelling variants, and
    known aliases.
-   Map occupation/trade labels to canonical IDs and NCO codes where a
    reliable mapping exists.
-   Map training courses to occupations using a mapping table; do not
    assume a course title and occupation are automatically equivalent.
-   Keep unmapped records, mark them as unmapped, and expose an
    unmapped-record count.
-   Never silently guess an NCO code. If mapping is uncertain, record
    the candidate mapping and confidence for human review.
-   Validate state and district pairs; district names alone may be
    ambiguous.
-   Keep raw source labels alongside normalised values for auditability.
-   Record mapping version and timestamp.

### 4.4 Data quality checks

At ingestion time, check:

-   Required columns and valid types.
-   Negative counts and impossible values.
-   Duplicate records based on source-specific keys.
-   Invalid dates or future observations where not allowed.
-   Missing district, occupation, period, or source fields.
-   Inconsistent district-state relationships.
-   Extreme outliers; flag for review rather than deleting
    automatically.
-   Mixed units and incompatible time frequencies.
-   Coverage by state, district, occupation, and period.

Return actionable CSV import errors including row number, column,
problem, and expected format. Allow the user to download a validation
report.

### 4.5 Demo dataset

Seed enough clearly labelled synthetic data to demonstrate the complete
workflow without internet access. Suggested pilot coverage:

-   Karnataka, Maharashtra, and Tamil Nadu.
-   A handful of districts in each state, with Bengaluru Urban included.
-   Three to five sectors, for example renewable energy, healthcare,
    logistics, and IT/digital services, plus manufacturing.
-   Six to ten occupations across those sectors.
-   At least 24 monthly periods for demand observations where feasible.
-   Training seats, completions, certifications, and placements for
    multiple periods.
-   Both oversupply and shortage examples, including at least one
    emerging demand trend.
-   Source metadata explicitly identifying all synthetic records.

The dataset should be internally consistent and generated from a fixed
random seed. Add deterministic patterns plus modest noise so the
forecasts are demonstrable. Do not present the generated numbers as
actual district labour-market facts. Every relevant page must retain a
visible demo-data label when showing synthetic records.

------------------------------------------------------------------------

## 5. Analytical methodology

Document all calculations in `docs/methodology.md` and show concise
explanations in the UI. Keep formulas in backend services, not
duplicated in frontend components.

### 5.1 Demand signals

A raw job-posting count is not the same as total vacancies or actual
employment. Avoid mixing them as though they were interchangeable.

Create a normalised **Labour Demand Index (LDI)** on a 0--100 scale. A
simple, documented starting methodology:

1.  Aggregate job-posting counts by occupation, geography, and period
    after deduplication.
2.  Calculate trend features, such as percentage change and a rolling
    average.
3.  Where reliable, add unique-employer counts and verified vacancy
    estimates as independent signals.
4.  Normalise each feature within an appropriate comparison group and
    over a defined baseline window.
5.  Combine only available and sufficiently reliable features using
    configurable weights.
6.  Re-normalise the final score to 0--100 and store its component
    values and weights.

Example configurable weights for the initial prototype: - 50%
deduplicated posting activity - 25% recent demand growth - 15%
unique-employer activity - 10% verified vacancy signal

These are **initial prototype assumptions, not official MSDE weights**.
If a signal is unavailable, redistribute the weights among valid signals
and show the coverage change. Never treat missing data as zero demand.
Include a methodology tooltip and let a planner inspect component
contributions.

### 5.2 Training supply

Do not treat sanctioned seats as equivalent to available skilled
workers. Display supply indicators separately:

-   Sanctioned training seats.
-   Enrolments.
-   Completions.
-   Certified candidates.
-   Placed candidates.
-   Active training capacity.
-   Placement rate, where denominators are valid.

For a simple planning comparison, derive **estimated effective supply**
from recent relevant completions and certification/placement evidence.
Document the selected definition, lag, time window, and any conversion
factor. Make these parameters configurable and visible. If only seats
are available, label the measure "training capacity" rather than
"available skilled workforce".

### 5.3 Demand-supply gap

Define the gap explicitly. If `forecast_demand` and
`estimated_effective_supply` represent comparable candidate/opportunity
units over the same geography, occupation, and time window:

`gap = forecast_demand - estimated_effective_supply`

-   Positive gap: estimated shortage of workers relative to demand.
-   Negative gap: estimated oversupply relative to demand.
-   Near zero: approximate balance.

Use a relative gap rate for cross-trade comparison:

`gap_rate = gap / max(forecast_demand, small_epsilon) * 100`

Guard against zero/near-zero demand. Do not divide by zero. For a
negative gap, clearly state the sign convention and display "oversupply"
rather than making users interpret a negative number.

A posting index is not directly comparable with people trained. If
reliable vacancy and effective-supply counts are not available, show an
**indicative demand-pressure gap** or **index gap**, not a precise
worker shortage. The UI must distinguish: - `Count-based gap` ---
compatible units and adequate evidence. - `Index-based pressure` ---
relative signals, not a headcount. - `Insufficient data` --- no
defensible comparison.

### 5.4 Risk severity

Create configurable, documented rules based on gap rate, persistence,
trend, and coverage. Example initial thresholds:

-   **Critical shortage:** demand exceeds effective supply by at least
    30%, with adequate coverage.
-   **High shortage:** 15--29.9% shortage.
-   **Balanced / watch:** within ±15%.
-   **High oversupply:** supply exceeds demand by 15--29.9%.
-   **Critical oversupply:** supply exceeds demand by at least 30%.

These thresholds are prototype defaults, not government policy. For low
data coverage, lower the confidence and avoid presenting a high-severity
alert as definitive. Persistence can require the condition to appear in
multiple periods. Include a separate `rising demand` early-warning rule
when demand grows quickly over consecutive periods.

### 5.5 Forecasting engine

Implement a genuine baseline forecasting pipeline in Python.

Recommended implementation:

1.  Aggregate time-series observations by occupation × geography ×
    period.
2.  Use a seasonal-naive baseline when sufficient seasonality history
    exists; otherwise use a moving-average or naive baseline.
3.  Add a scikit-learn model such as Ridge regression with lagged
    demand, rolling means, and trend features if the history supports
    it.
4.  Evaluate candidate models using chronological time-series splits,
    not random train/test splits.
5.  Prevent leakage: features at forecast origin may only use
    information available at that time.
6.  Compare MAE and WAPE where valid. Handle zero denominators in WAPE
    and report when the metric is undefined.
7.  Select a model based on held-out performance and baseline
    comparison; retain a baseline if the complex model does not improve
    results.
8.  Produce 3-, 6-, and 12-month forecasts where history supports the
    horizon.
9.  Create prediction intervals using a defensible method such as
    backtest residual quantiles or a documented statistical interval. If
    the interval is not reliable, do not fabricate it.
10. Store forecast origin, target period, model/version, training
    window, validation results, coverage, and limitations.

For small or sparse district-level datasets, fall back to a simple
baseline and clearly show low confidence. The app must remain useful if
the forecasting model has insufficient data.

### 5.6 Forecast uncertainty and confidence

Display a confidence label (`High`, `Moderate`, `Low`, or
`Insufficient history`) based on transparent factors such as: - Number
of usable historical periods. - Missing-data proportion. - Stability of
the time series. - Backtest performance relative to the baseline. - Data
source coverage and reliability.

This is a qualitative confidence assessment, not a statistical
probability unless formally calibrated. Keep confidence separate from
the prediction interval.

### 5.7 Recommendations

Generate deterministic, explainable recommendations from the computed
metrics. ML may support the evidence, but the first prototype should not
require a generative AI API.

Example rules: - Persistent shortage + rising demand + low training
capacity → consider increasing seats, expanding centres, or adding a
relevant course. - Persistent oversupply + weak demand + high
completions → consider reducing future intake, reviewing course mix, or
redirecting training capacity. - Rising demand + low data coverage →
collect employer validation and monitor before making a major
seat-allocation change. - High demand in neighbouring districts but low
local supply → investigate regional training or mobility options. - Low
placement despite high training output → review curriculum relevance,
employer partnerships, and course outcomes rather than automatically
increasing seats.

Each recommendation must include: - Proposed action. - Geography,
sector, and occupation. - Supporting evidence and the exact computed
metrics. - Reasoning in plain language. - Confidence/data coverage. -
Suggested review period. - Caveat where evidence is incomplete.

Do not present recommendations as binding policy decisions. A human
planner must approve them.

### 5.8 Scenario planner

Provide a basic "What if?" tool. Let the user adjust proposed training
seats or effective supply by a percentage or count for a selected
trade/district. Recalculate the indicative future gap using the same
definitions and assumptions. Display baseline vs scenario side-by-side.

Do not claim the scenario causes real-world hiring changes. Label it
"planning simulation"; demand should remain unchanged unless the user
explicitly changes a demand assumption.

------------------------------------------------------------------------

## 6. User interface and design direction

### 6.1 Overall design intent

Create a **minimalist, calm, premium public-sector analytics product**.
It should look designed by a thoughtful product team---not like a
generic AI-generated dashboard.

Visual references: restrained editorial layouts, contemporary civic-tech
tools, premium data products, and well-designed enterprise software.

### 6.2 Colour palette

Use a restrained warm-neutral base with deep forest/teal accents and
controlled semantic colours.

Suggested tokens: - App background: warm off-white `#F5F5F0` - Main
surface: white `#FFFFFF` - Primary text: ink/navy `#172B2A` - Secondary
text: slate `#65716F` - Primary accent: deep teal `#176B63` - Secondary
accent: muted sage `#A8C5B5` - Borders: soft grey-green `#E0E6E1` -
Critical: muted red `#B54747` - Warning: amber `#B7791F` - Positive:
forest green `#32765B` - Focus ring: accessible teal with sufficient
contrast

Use semantic colours consistently. Do not use bright red/green as large
decorative surfaces. Verify text contrast.

### 6.3 Glass effects

Use glass effects sparingly: - Slightly translucent filter bar or
floating utility panel. - Subtle backdrop blur on a small number of
overlays. - Thin, low-contrast borders. - Restrained shadows and soft
corner radii.

Main data tables, forms, charts, and KPI cards should remain crisp,
legible, and mostly opaque. Avoid applying glass to every card. Do not
use excessive blur, neon gradients, glowing borders, oversized rounded
cards, or decorative 3D elements.

### 6.4 Typography and spacing

-   Use a polished sans-serif such as Inter or Manrope, with a reliable
    fallback.
-   Establish a clear hierarchy: page title, short context line, section
    title, metric, supporting label.
-   Use consistent 4/8-point spacing increments.
-   Keep headings concise and body copy readable.
-   Use tabular numerals for metrics.
-   Avoid huge hero headings that waste dashboard space.
-   Use restrained transitions, roughly 150--220 ms, and respect
    reduced-motion preferences.

### 6.5 Layout

-   Desktop-first for government planning workflows, fully responsive on
    tablet and mobile.
-   Persistent left sidebar on desktop, collapsible on smaller screens.
-   Compact top bar with breadcrumb, selected period, source/data
    status, and profile placeholder only if needed.
-   Main content area with a sensible maximum width.
-   Use whitespace to group content; avoid a dense wall of cards.
-   Tables should support sorting, search, pagination, and clear empty
    states.
-   Show "last updated" and "demo data" status where applicable.
-   Every chart needs a meaningful title, units, legend where needed,
    and a short interpretation or tooltip.

### 6.6 Avoid these "AI-generated dashboard" clichés

-   Purple/blue gradients everywhere.
-   Every section inside a giant rounded rectangle.
-   Excessive glowing glass cards.
-   Random decorative icons on every heading.
-   Arbitrary percentages with no definitions.
-   Generic text such as "Unlock insights with AI".
-   Chatbot-first design.
-   Charts without units, source notes, or context.
-   Fake live indicators, fake user avatars, fake notification counts,
    and fake accuracy scores.
-   Repeated lorem ipsum or identical-looking cards.
-   Map graphics with invented boundaries or district values.

The visual quality must come from typography, spacing, precise
alignment, restrained colour, meaningful chart selection, and thoughtful
microcopy.

------------------------------------------------------------------------

## 7. Pages and functional requirements

### 7.1 Global application shell

Sidebar items: 1. Overview 2. Demand Intelligence 3. Supply & Training
4. Forecasts & Gaps 5. Early Warnings 6. Recommendations 7. Scenario
Planner 8. Data Sources & Imports 9. Methodology

The selected page must be visually distinct. Sidebar navigation must
work. Preserve active filters where reasonable when navigating between
related views.

Global filters: - Time period / date range. - State. - District. -
Sector. - Occupation/trade. - Data status/source type.

Filters must update the actual query/API results and all dependent
visualisations. Provide "Clear filters". Do not show impossible filter
combinations. District options must update when a state is selected.

### 7.2 Overview dashboard

Purpose: let a planner understand the current situation at a glance.

Include: - Page title: "Labour Market Overview". - Short subtitle
explaining the current filter scope. - Data status banner when
demo/synthetic data is active. - KPI strip: - Labour Demand Index. -
Training capacity / seats. - Estimated effective supply, when
available. - Occupations with shortage risk. - Occupations with
oversupply risk. - Demand trend chart with observed history and forecast
visually distinguished. - Gap severity distribution. - Top shortage and
oversupply trades table. - District/sector priority panel. - Recent
early warnings. - "Why this matters" insight summary generated from
computed metrics. - Data coverage indicator and last refresh time.

KPI cards must include units, definitions via tooltips, and comparison
period if a valid comparison exists. Never display an unexplained single
number.

### 7.3 Demand Intelligence

Include: - Demand index trend by period. - Demand by sector and
occupation. - Top growing/declining occupations. - Employer/posting
signal table. - Filters by geography, sector, occupation, and period. -
Occupation detail drawer or page showing demand trend, source
composition, NCO mapping status, and coverage.

Explain that job-posting data can be biased by platform coverage and
duplicate postings.

### 7.4 Supply & Training

Include: - Sanctioned seats, enrolments, completions, certifications,
placements, and active centres as separate metrics. - Training pipeline
chart across periods. - Course/occupation capacity table. - Completion
and placement rates with valid denominators. - District × occupation
matrix. - Missing mappings and data-quality warnings.

Never combine seats, completions, certifications, and placements into
one unlabeled "supply" number.

### 7.5 Forecasts & Gaps

Include: - Forecast horizon selector: 3, 6, 12 months. - Demand history
and forecast line chart with separate styling and interval band if
available. - Demand-supply gap chart. - Gap status badge and
plain-language explanation. - Model name, forecast origin, history
length, validation metrics, confidence, and source coverage. -
District/trade ranking table with sorting. - Download filtered forecast
data. - Clear distinction between count-based gap and index-based
pressure.

If historical data is insufficient, render a useful empty/limited state
explaining what is missing and how to add data. Do not invent a forecast
just to fill the chart.

### 7.6 Early Warnings

Include: - Severity filters. - Alert type filters. -
State/district/sector/occupation filters. - Alert cards or a table with
severity, trade, geography, metric, reason, timestamp, and data
confidence. - Acknowledge/resolve actions that persist to the
database. - Detail view with historical evidence and threshold. - CSV
export.

Alerts should be reproducibly generated from the analytics pipeline and
refreshed after data import or forecast regeneration.

### 7.7 Recommendations

Include: - Ranked intervention list. - Suggested action type: expand
seats, reduce/review intake, update curriculum, validate demand, improve
placement, or investigate regional mismatch. - Supporting metrics and
plain-language reasoning. - Data quality/confidence label. - "View
evidence" link to the corresponding trade/district details. - Status
field: proposed, under review, accepted, rejected, completed. - Status
changes persisted in the database.

### 7.8 Scenario Planner

User flow: 1. Choose state, district, occupation, and forecast horizon.
2. See baseline demand, supply, and gap. 3. Adjust training
capacity/seats using a number input or slider. 4. See the simulated gap
and change from baseline. 5. Compare baseline and scenario charts. 6.
Save or export the scenario with assumptions and timestamp.

Validate values and clearly label the output as a simulation, not a
prediction of policy impact.

### 7.9 Data Sources & Imports

Include: - Source catalogue with source name, publisher, coverage,
frequency, access method, last update, status, and limitations. - Upload
CSV flow with a template download. - Column mapping if uploaded headers
differ from canonical headers. - Validation preview before import. -
Row-level errors with download option. - Import summary: accepted rows,
rejected rows, duplicates, unmapped occupations, and affected
geographies. - Import history and ability to rerun/review a previous
import. - A safe demo-data reset/seed action restricted to
development/demo mode.

Use a clear disclaimer that public-source availability, update
frequency, and licensing differ. Do not imply a portal is connected when
it is not.

### 7.10 Methodology

Explain in plain language: - What the Labour Demand Index means. - Which
demand signals are used and their weights. - How training supply metrics
differ. - The gap sign convention and compatible units. - Forecasting
method and backtesting. - Confidence calculation. - Alert thresholds. -
Data limitations and known biases. - Data provenance and last refresh. -
What is official, uploaded, derived, or synthetic.

Include a technical section for evaluators with formulas and model
details.

------------------------------------------------------------------------

## 8. API contract

Use `/api/v1` versioned endpoints. Provide clear Pydantic
request/response schemas, validation, error messages, and OpenAPI docs.

Suggested endpoints:

### Health and metadata

-   `GET /api/v1/health`
-   `GET /api/v1/metadata`
-   `GET /api/v1/filters`
-   `GET /api/v1/sources`

### Overview and demand

-   `GET /api/v1/overview`
-   `GET /api/v1/demand/trends`
-   `GET /api/v1/demand/by-sector`
-   `GET /api/v1/demand/occupations`
-   `GET /api/v1/occupations/{occupation_id}`

### Supply and gap

-   `GET /api/v1/supply/summary`
-   `GET /api/v1/supply/trends`
-   `GET /api/v1/gaps`
-   `GET /api/v1/gaps/rankings`

### Forecasting

-   `GET /api/v1/forecasts`
-   `GET /api/v1/forecasts/{forecast_id}`
-   `POST /api/v1/forecasts/generate`
-   `GET /api/v1/forecasts/evaluation`

### Alerts and recommendations

-   `GET /api/v1/alerts`
-   `PATCH /api/v1/alerts/{alert_id}`
-   `GET /api/v1/recommendations`
-   `PATCH /api/v1/recommendations/{recommendation_id}`

### Scenario planning

-   `POST /api/v1/scenarios/simulate`
-   `POST /api/v1/scenarios`
-   `GET /api/v1/scenarios`
-   `GET /api/v1/scenarios/{scenario_id}`

### Data management

-   `POST /api/v1/imports/validate`
-   `POST /api/v1/imports`
-   `GET /api/v1/imports`
-   `GET /api/v1/imports/{import_id}`
-   `GET /api/v1/exports/gaps.csv`
-   `GET /api/v1/exports/forecasts.csv`

Support query parameters consistently: `start_period`, `end_period`,
`state_code`, `district_code`, `sector_id`, `occupation_id`,
`source_type`, `data_status`, `horizon_months`, `page`, `page_size`,
`sort_by`, and `sort_order`, where relevant.

Do not implement every endpoint as a hardcoded response. Each endpoint
must query the database or call a documented service. For exports,
stream a valid CSV with headers and UTF-8 encoding. Return sensible HTTP
status codes and structured error responses.

------------------------------------------------------------------------

## 9. Frontend implementation requirements

-   Define TypeScript types matching backend schemas.
-   Centralise API calls in a typed API client.
-   Use TanStack Query or equivalent for loading, caching, invalidation,
    and errors.
-   Keep filters in a shared, predictable state (URL query parameters
    are preferred for shareable views).
-   Build reusable components for KPI cards, chart panels, filter bars,
    severity badges, data-source labels, tables, empty states, and
    loading skeletons.
-   Use real loading/error/empty states.
-   Display dates and numbers consistently.
-   Do not embed demo metrics directly inside React components. All
    dashboard data should come from the backend.
-   Avoid hardcoded district lists where the backend can supply filter
    metadata.
-   Implement CSV download from a real API response.
-   Forms must validate inputs and display server-side validation
    errors.
-   Keep keyboard navigation, focus indicators, accessible names, chart
    descriptions, and reduced-motion support.
-   Use responsive table behaviour; on mobile, allow horizontal
    scrolling or switch to a legible card layout.
-   Use a consistent toast/feedback pattern for success and failure.
-   Use route-level code organisation; avoid a monolithic `App.tsx`.

------------------------------------------------------------------------

## 10. Backend implementation requirements

-   Use environment variables for database URL, CORS origins, demo mode,
    and other configuration.
-   Create database tables through migrations or a repeatable
    initialisation routine.
-   Use dependency injection for DB sessions.
-   Separate API routers, schemas, models, and business services.
-   Use transactions for imports and state changes.
-   Add pagination for potentially large result sets.
-   Validate filter combinations and reject invalid ranges.
-   Use structured logging without logging sensitive row contents.
-   Handle missing and sparse time series gracefully.
-   Cache expensive aggregate results only if invalidation is correct.
-   Store forecast runs and metadata so outputs can be reproduced.
-   Generate alerts/recommendations from the same computed gap values
    exposed in the UI.
-   Configure CORS narrowly for local development.
-   No secrets or API keys committed to the repository.
-   No dependency on a paid external AI API for core functionality.
-   If any optional external service is added, the core application must
    still run without it.

------------------------------------------------------------------------

## 11. Security, privacy, accessibility, and reliability

-   Accept only allowed CSV types and impose a reasonable upload size
    limit.
-   Validate column names, row counts, and field types.
-   Prevent formula injection in CSV exports by safely escaping values
    that begin with spreadsheet formula characters.
-   Do not accept or expose personal worker data in the demo workflow.
-   Keep all analytics aggregate-level.
-   Restrict destructive reset functionality to demo/development mode.
-   Do not expose arbitrary file paths or execute uploaded content.
-   Add clear error messages without stack traces in normal API
    responses.
-   Meet WCAG-informed basics: contrast, keyboard navigation, focus
    states, labels, and non-colour-only severity indicators.
-   Provide a useful no-data state rather than crashing when a filter
    returns zero records.
-   Make the app work without an internet connection after dependencies
    and demo assets are installed.

------------------------------------------------------------------------

## 12. Testing and acceptance criteria

The prototype is complete only when these checks pass.

### Backend tests

-   Health endpoint returns success.
-   Demo seed is deterministic and repeatable.
-   Required filters change returned data.
-   Invalid filter values are rejected.
-   Gap sign convention is correct for shortage, balance, and oversupply
    examples.
-   Zero-demand and missing-supply cases do not crash or generate
    misleading percentages.
-   Time-series splits respect chronology.
-   Forecast generation does not use future observations in past
    predictions.
-   Metrics are computed from held-out data where possible.
-   CSV validation reports malformed rows.
-   Import transaction handles errors safely.
-   CSV exports have correct headers and filtered content.
-   Alert acknowledgement/resolution persists.
-   Recommendation status changes persist.
-   Scenario simulation recalculates the gap correctly.

### Frontend checks

-   Every sidebar route loads.
-   Global filters affect all relevant widgets.
-   Dependent district filter updates after state selection.
-   Loading, empty, and error states render correctly.
-   Forecast horizon selector updates the view/API request.
-   Tables sort and paginate correctly.
-   CSV export downloads the filtered data.
-   Import validation and confirmation flow works.
-   Scenario planner updates output after input changes.
-   Alerts and recommendation statuses update and persist.
-   No primary button is decorative or dead.
-   Layout works at desktop, tablet, and mobile widths.

### End-to-end demo acceptance test

1.  Start the backend and frontend using the README instructions.
2.  Open the overview and verify the demo-data banner.
3.  Filter to Karnataka and then Bengaluru Urban.
4.  Select an occupation and inspect demand and training supply.
5.  Open a forecast and inspect horizon, model, confidence, and data
    coverage.
6.  Open an early warning and inspect its evidence and threshold.
7.  Open a recommendation and view its supporting metrics.
8.  Change training capacity in the scenario planner and verify the gap
    changes.
9.  Upload a valid CSV and then an invalid CSV; inspect both outcomes.
10. Export filtered forecasts/gaps to CSV.
11. Refresh the page and verify persisted statuses/imported records
    where applicable.
12. Open methodology and explain the calculation in under one minute.

Do not mark a test as passed unless it was actually executed.

------------------------------------------------------------------------

## 13. Performance and engineering quality

-   Avoid unnecessary re-rendering and repeated API calls.
-   Add database indexes for commonly filtered fields: period,
    geography, sector, occupation, and source.
-   Keep dashboard queries aggregated server-side.
-   Use pagination for long tables.
-   Use a sensible default time window.
-   Ensure the demo seed is small enough for quick startup but rich
    enough for meaningful charts.
-   Use clear naming, type hints, docstrings for non-obvious formulas,
    and consistent formatting.
-   Pin or constrain dependency versions.
-   Provide `.env.example`; do not commit `.env`.
-   Ensure a fresh clone can be started from documented commands.

------------------------------------------------------------------------

## 14. Implementation sequence

Work in these phases, running the application and tests after each
phase.

### Phase 1 --- Repository and skeleton

-   Inspect repository.
-   Create frontend/backend structure.
-   Add dependency files and configuration.
-   Add README with intended commands.
-   Confirm frontend and FastAPI health endpoint start.

### Phase 2 --- Data model and demo seed

-   Create SQLAlchemy models and database setup.
-   Create canonical demo dataset and source metadata.
-   Add deterministic seed script.
-   Add basic validation and data dictionary.
-   Confirm records exist through API/database.

### Phase 3 --- Core analytics

-   Implement normalisation, demand index, supply metrics, gap
    calculation, risk rules, forecasts, and recommendation rules.
-   Add unit tests for formulas and edge cases.
-   Document assumptions in `docs/methodology.md`.

### Phase 4 --- API

-   Implement filter metadata, overview, demand, supply, gap, forecast,
    alerts, recommendations, scenarios, imports, and exports.
-   Verify query parameters and response schemas.
-   Inspect `/docs` and test endpoints.

### Phase 5 --- UI foundation

-   Implement design tokens, app shell, sidebar, top bar, global
    filters, responsive layout, and reusable components.
-   Match the restrained visual design in Section 6.
-   Add routes and typed API client.

### Phase 6 --- Dashboard and detail views

-   Connect overview, demand, supply, forecasts, alerts,
    recommendations, and occupation details to actual API responses.
-   Add empty/loading/error states and evidence/tooltips.
-   Confirm every filter works.

### Phase 7 --- Import, export, and scenarios

-   Implement upload validation, import confirmation, error report, and
    import history.
-   Implement CSV exports.
-   Implement scenario simulation and persistence.

### Phase 8 --- QA and polish

-   Run backend tests, frontend type-check/build, and available
    end-to-end checks.
-   Fix all critical errors.
-   Verify responsive layouts and accessibility basics.
-   Remove dead controls, placeholder metrics, console errors, and
    misleading live-data labels.
-   Improve spacing, chart labelling, empty states, and microcopy.

### Phase 9 --- Delivery

-   Complete README and `.env.example`.
-   Add `docs/data_dictionary.md`, `docs/methodology.md`, and
    `docs/demo_script.md`.
-   List actual integrations, unavailable integrations, and known
    limitations.
-   Provide exact start/test/seed commands.
-   Report what was implemented and what was genuinely tested.

Do not stop after producing a plan or completing only the UI. Continue
until the vertical slice works.

------------------------------------------------------------------------

## 15. Definition of done

The prototype is ready to demonstrate when:

-   The app runs locally from a fresh setup using documented
    instructions.
-   The dashboard loads from the backend and seeded database.
-   All main navigation and filters work.
-   Demand, supply, gaps, forecasts, alerts, and recommendations are
    connected through consistent calculations.
-   Forecasts use chronological validation and disclose limitations.
-   Synthetic data is clearly labelled throughout.
-   CSV validation/import/export works.
-   The scenario planner recalculates results.
-   Core API and analytics tests pass.
-   The UI is responsive, accessible at a basic level, and visually
    consistent.
-   The methodology and data dictionary are documented.
-   The demo can be delivered without relying on unavailable external
    APIs.

------------------------------------------------------------------------

## 16. Recommended demo narrative for SIH evaluators

1.  **Start with the mismatch:** "Training capacity alone does not tell
    us whether trained candidates will find relevant work."
2.  **Show fragmented signals brought together:** demonstrate demand
    postings, occupation mappings, and training capacity with source
    status.
3.  **Drill down:** choose a state, district, sector, and occupation.
4.  **Show the forecast:** distinguish observed history from future
    projections and explain confidence.
5.  **Show the warning:** demonstrate a shortage or oversupply alert
    with its threshold and evidence.
6.  **Show an action:** present an intervention recommendation tied to
    computed metrics.
7.  **Demonstrate planning:** change training capacity in the scenario
    planner and show the revised indicative gap.
8.  **Establish trust:** open methodology, data coverage, and source
    metadata.
9.  **Close with the impact:** planners can identify mismatches earlier,
    compare districts consistently, and make evidence-informed training
    decisions.

The central message is: **"From fragmented labour-market signals to
explainable, district-level training decisions."**

------------------------------------------------------------------------

## 17. Final instruction to the coding agent

Build this as a cohesive government decision-support product, not a
collection of disconnected pages. The analytical definitions must be
consistent across the backend, charts, tables, alerts, recommendations,
and exports. Every displayed metric must have a source, definition, time
period, and data-status label. Prefer explainability and honest
uncertainty over exaggerated AI claims. The finished application must be
visually polished, restrained, credible, and genuinely functional.
