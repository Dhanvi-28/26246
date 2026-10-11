# Labour Market Intelligence System (LMIS) --- Analytical Methodology

## 1. Overview and Core Philosophy

The National Labour Market Intelligence System (LMIS) provides decision-support capabilities for national, state, and district training planners. It addresses systemic misalignment between candidate training intake and real industrial employment opportunities.

Rather than treating aggregated job postings or sanctioned seats as direct counts of employment or trained workforce, LMIS applies transparent, evidence-based normalisation and statistical modelling.

---

## 2. Labour Demand Index (LDI) Methodology

Job postings represent hiring intentions and recruitment velocity rather than absolute vacancy counts. Postings are affected by aggregator duplication and industry internet penetration.

To provide a comparable signal across occupations and districts, the **Labour Demand Index (LDI)** aggregates multiple signals on a 0–100 scale:

$$\text{LDI} = 0.50 \cdot V_{\text{norm}} + 0.25 \cdot G_{\text{norm}} + 0.15 \cdot E_{\text{norm}} + 0.10 \cdot R_{\text{norm}}$$

Where:
1. **$V_{\text{norm}}$ (Posting Volume):** Deduplicated job postings normalized against peer district volume baseline.
2. **$G_{\text{norm}}$ (Growth Velocity):** 3-month rolling growth rate mapped from $[-20\%, +20\%]$ to $[0, 100]$.
3. **$E_{\text{norm}}$ (Employer Breadth):** Ratio of unique hiring enterprises to total postings, preventing single-firm hiring surges from skewing the market indicator.
4. **$R_{\text{norm}}$ (Vacancy Signal):** Ratio of verified open vacancies to active postings.

*Note: In the event of missing secondary signals, weights are proportionally redistributed across valid features.*

---

## 3. Training Supply & Effective Supply Derivation

Sanctioned training seats represent theoretical capacity, not actual graduating candidates entering the labor market. The LMIS tracks 5 distinct pipeline stages:
1. **Sanctioned Seats:** Approved institutional intake capacity.
2. **Enrolments:** Enrolled trainees at session commencement.
3. **Completions:** Candidates passing end-of-course evaluations.
4. **Certified Candidates:** Candidates passing NCVET/NSQF certification assessments.
5. **Placed / Apprenticeship Candidates:** Candidates verified in wage employment or registered apprenticeships within 90 days.

### Effective Supply Calculation
To compare supply with forecasted labour demand, the system derives **Estimated Effective Supply ($S_{\text{eff}}$)**:

$$S_{\text{eff}} = 0.85 \cdot \text{Completions} + 0.15 \cdot \text{Placed Candidates}$$

This reflects candidates available for immediate employment while avoiding the false assumption that 100% of seats convert to work-ready talent.

---

## 4. Demand-Supply Gap Formulation & Sign Convention

The demand-supply gap is defined explicitly:

$$\text{Gap} = \text{Forecast Demand} - \text{Estimated Effective Supply}$$

$$\text{Gap Rate (\%)} = \frac{\text{Gap}}{\max(\text{Forecast Demand}, 1.0)} \times 100\%$$

### Sign Convention & Severity Classification
- **$\text{Gap} > 0$ (Shortage):** Projected labour demand outstrips available trained supply.
  - **Critical Shortage:** $\text{Gap Rate} \ge +30\%$
  - **High Shortage:** $+15\% \le \text{Gap Rate} < +30\%$
- **$\text{Gap} \approx 0$ (Balanced / Watch):** Training pipeline matches demand within $\pm 15\%$.
- **$\text{Gap} < 0$ (Oversupply):** Training supply exceeds absorbed labour demand.
  - **High Oversupply:** $-30\% < \text{Gap Rate} \le -15\%$
  - **Critical Oversupply:** $\text{Gap Rate} \le -30\%$

---

## 5. Forecasting Engine & Chronological Validation

The forecasting engine implements chronological time-series modelling using scikit-learn Ridge Lag Regression and Seasonal Baselines:
- **Feature Extraction:** Lagged values ($t-1, t-2, t-3$), 3-month rolling moving averages, and local district growth trends.
- **Chronological Split:** Chronological backtest evaluation trains strictly on historical observations (months 0–17) and evaluates on held-out test periods (months 18–23), preventing data leakage.
- **Error Metrics:**
  $$\text{MAE} = \frac{1}{n}\sum_{i=1}^n |y_i - \hat{y}_i|$$
  $$\text{WAPE} = \frac{\sum_{i=1}^n |y_i - \hat{y}_i|}{\sum_{i=1}^n y_i}$$
- **Prediction Intervals:** Calculated via backtest empirical residual distributions scaled across 3-, 6-, and 12-month horizons.

---

## 6. Actionable Recommendations & Early Warnings

Early warning alerts and intervention recommendations are deterministically generated from computed gap rates and persistence:
- **Expand Seats:** Persistent critical shortage with high completion absorption rates.
- **Review Intake / Diversify Curriculum:** Persistent oversupply with low placement absorption.
- **Validate Demand:** Rising postings with low employer breadth or unmapped occupational classifications.
