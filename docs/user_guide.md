# National Labour Market Intelligence System (LMIS) --- Evaluator & Planner User Guide

This walkthrough guides decision-makers and evaluators through the core capabilities of the prototype.

---

## 1. Overview Dashboard Walkthrough
1. **Pilot Banner & Emblems:** Notice the top navigation bar highlighting the "Pilot Dataset Active" badge and government portal branding.
2. **KPI Strip:** 
   - Inspect the **Labour Demand Index (LDI)** card. Hover over the info icon to see its multi-signal formula weights.
   - Contrast **Sanctioned Seats** against **Effective Supply** to observe how real graduation and placement attrition is accounted for.
3. **Demand & Forecast Trajectory Chart:**
   - Observe historical observed postings (2024–2025) in sky blue.
   - Note the dashed 2026 forecast projection in gold with 80% empirical prediction intervals.
   - Compare the demand trajectory against the green effective supply line.
4. **Severity Distribution & Priority Tables:**
   - View top critical workforce shortages (e.g., EV Diagnostics, Solar PV Technicians) and oversupplied trades (e.g., traditional CNC operation with soft local placement absorption).

---

## 2. Granular Drilldown via Global Filters
1. In the **Scope Filter Bar**, choose **State:** "Karnataka".
2. Notice the **District** dropdown automatically updates to only show Karnataka districts: *Bengaluru Urban*, *Mysuru*, and *Dakshina Kannada*.
3. Select **District:** "Bengaluru Urban".
4. Choose **Sector:** "Advanced Manufacturing & Automotive".
5. Notice all KPI cards, trends, and top trade tables instantly update to reflect Bengaluru Urban's automotive manufacturing signals.
6. Click **Reset All Filters** to return to the national baseline view.

---

## 3. Forecasting & Gap Matrix
1. Click **Forecasts & Gaps** in the left sidebar.
2. Toggle between **3M**, **6M**, and **12M** forecast horizons:
   - Notice the predictions, intervals, and gap classifications update dynamically.
3. Review the **Ridge Lag Regression** model validation card showing held-out chronological test MAE, WAPE, and improvement over naive baselines.
4. Click **Export Gaps CSV** to verify that a sanitized, UTF-8 CSV file downloads immediately.

---

## 4. Early Warnings & Operational Lifecycle
1. Navigate to **Early Warnings**.
2. Notice critical shortage alerts flagged for rapid hiring surges.
3. Click the **Acknowledge** button on an open alert. Notice the status badge immediately updates to "Acknowledged" and is persisted in the database.
4. Click **Mark Resolved** to resolve the incident.

---

## 5. Intervention Recommendations
1. Navigate to **Recommendations**.
2. Review explainable intervention plans generated deterministically from computed gap rates.
3. For an intervention (e.g., "Expand Sanctioned Capacity for Electric Vehicle Specialist"), change its status from `Proposed` to `Accepted`.
4. Refresh or navigate away and return; verify the status remains persisted.

---

## 6. "What If?" Scenario Planner
1. Navigate to **Scenario Planner**.
2. Select **State:** "Karnataka", **District:** "Bengaluru Urban", **Trade:** "Electric Vehicle Diagnostics Specialist".
3. Observe the current baseline: e.g., 320 seats resulting in a severe workforce deficit.
4. Drag the **Proposed Sanctioned Seats** slider to **480 Seats**.
5. Click **Recalculate Gap Simulation**:
   - Notice the revised gap deficit drops significantly.
   - Observe the side-by-side comparative bar chart contrasting Baseline vs Simulated capacity and deficit.
6. Enter notes in the **Save Scenario** box and click **Save Scenario**. Notice the scenario appears in the saved list.

---

## 7. CSV Data Ingestion & Provenance
1. Navigate to **Data Sources & Imports**.
2. Click **Download CSV Template** to obtain a pre-formatted structure.
3. In the upload box, select `data/templates/demand_sample_template.csv`.
4. Inspect the validation preview confirming 6 rows validated cleanly.
5. Click **Confirm & Ingest CSV** and see the ingestion logged in the audit history.
6. Click **Reseed Pilot Dataset** anytime to reset the system to its clean benchmark state.
