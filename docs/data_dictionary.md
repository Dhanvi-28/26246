# Labour Market Intelligence System (LMIS) --- Data Dictionary

This document details canonical database entities, field types, semantics, constraints, and public data source mappings.

---

## 1. Geographical Hierarchy

### `states`
| Field | Type | Constraints | Description |
|---|---|---|---|
| `code` | `VARCHAR(10)` | Primary Key | 2-letter postal state code (e.g., `KA`, `MH`, `TN`) |
| `name` | `VARCHAR(100)` | Not Null | Official State Name |

### `districts`
| Field | Type | Constraints | Description |
|---|---|---|---|
| `code` | `VARCHAR(20)` | Primary Key | Canonical district identifier (e.g., `KA_BLRU`) |
| `name` | `VARCHAR(100)` | Not Null | Census / LGD District Name |
| `state_code` | `VARCHAR(10)` | Foreign Key -> `states.code` | Parent State code |

---

## 2. Occupational Taxonomy & Sectors

### `sectors`
| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(50)` | Primary Key | Sector Identifier (e.g., `SEC_RENEWABLE`) |
| `name` | `VARCHAR(150)` | Not Null | Sector Name |
| `description` | `TEXT` | Nullable | Sector analytical scope |

### `occupations`
| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(50)` | Primary Key | Canonical occupation key (e.g., `OCC_SOLAR_TECH`) |
| `name` | `VARCHAR(200)` | Not Null | Occupation or Job Role title |
| `nco_code` | `VARCHAR(20)` | Nullable | NCO 2015 8-digit occupational classification |
| `sector_id` | `VARCHAR(50)` | Foreign Key -> `sectors.id` | Sector affiliation |
| `nsqf_level` | `INTEGER` | Nullable | National Skills Qualifications Framework level (1–10) |
| `skills_list` | `TEXT` | Nullable | Comma-delimited list of primary skills |

---

## 3. Observational Data

### `demand_observations`
| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | Primary Key, Auto | Internal identifier |
| `period` | `VARCHAR(7)` | Not Null, Index | Observation month (`YYYY-MM`) |
| `state_code` | `VARCHAR(10)` | Foreign Key | State code |
| `district_code` | `VARCHAR(20)` | Foreign Key | District code |
| `sector_id` | `VARCHAR(50)` | Foreign Key | Sector identifier |
| `occupation_id` | `VARCHAR(50)` | Foreign Key | Occupation identifier |
| `job_postings_count` | `INTEGER` | Not Null, $\ge 0$ | Deduplicated active recruitment postings |
| `unique_employer_count`| `INTEGER`| Not Null, $\ge 0$ | Distinct employer organizations posting |
| `estimated_vacancies`| `INTEGER` | Not Null, $\ge 0$ | Vacancies estimated from multi-hire postings |
| `source_id` | `VARCHAR(50)` | Not Null | Data origin source |
| `data_status` | `VARCHAR(50)` | Not Null | `Official`, `Uploaded`, or `Synthetic Sample` |

### `supply_observations`
| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | Primary Key, Auto | Internal identifier |
| `period` | `VARCHAR(7)` | Not Null, Index | Observation month (`YYYY-MM`) |
| `state_code` | `VARCHAR(10)` | Foreign Key | State code |
| `district_code` | `VARCHAR(20)` | Foreign Key | District code |
| `sector_id` | `VARCHAR(50)` | Foreign Key | Sector identifier |
| `occupation_id` | `VARCHAR(50)` | Foreign Key | Occupation identifier |
| `sanctioned_seats` | `INTEGER` | Not Null, $\ge 0$ | Government-approved training intake seats |
| `enrolments` | `INTEGER` | Not Null, $\ge 0$ | Candidates admitted and registered |
| `completions` | `INTEGER` | Not Null, $\ge 0$ | Candidates completing training courses |
| `certified_candidates`| `INTEGER`| Not Null, $\ge 0$ | Candidates assessed and certified under NSQF |
| `placed_candidates` | `INTEGER` | Not Null, $\ge 0$ | Candidates confirmed in wage/apprenticeship employment |
| `active_centres` | `INTEGER` | Not Null, $\ge 0$ | Operational training centres running the trade |

---

## 4. Analytical Outputs & Decisions

### `forecast_records`
| Field | Type | Description |
|---|---|---|
| `forecast_origin_period`| `VARCHAR(7)` | Cutoff period for training history (`YYYY-MM`) |
| `target_period` | `VARCHAR(7)` | Forecast target horizon (`YYYY-MM`) |
| `horizon_months` | `INTEGER` | Horizon span in months (`3`, `6`, `12`) |
| `predicted_demand` | `FLOAT` | Statistically projected demand headcount |
| `lower_bound` | `FLOAT` | 80% empirical prediction interval lower bound |
| `upper_bound` | `FLOAT` | 80% empirical prediction interval upper bound |
| `mae` | `FLOAT` | Mean Absolute Error from held-out chronological backtest |
| `wape` | `FLOAT` | Weighted Absolute Percentage Error |
| `confidence_score` | `VARCHAR(20)` | Qualitative confidence (`High`, `Moderate`, `Low`) |

### `alerts`
| Field | Type | Description |
|---|---|---|
| `alert_type` | `VARCHAR(50)` | `shortage`, `oversupply`, `rising_demand`, `data_quality` |
| `severity` | `VARCHAR(20)` | `critical`, `high`, `medium`, `low` |
| `observed_value` | `FLOAT` | Measured gap rate percentage or trend velocity |
| `threshold` | `FLOAT` | Alert threshold triggering the warning |
| `reason` | `TEXT` | Concise natural language summary |
| `evidence` | `TEXT` | Detailed metric comparison supporting the alert |
| `status` | `VARCHAR(20)` | Operational status: `open`, `acknowledged`, `resolved` |

### `recommendations`
| Field | Type | Description |
|---|---|---|
| `title` | `VARCHAR(250)`| Intervention action title |
| `action_type` | `VARCHAR(50)` | `expand_seats`, `review_intake`, `update_curriculum`, `validate_demand`, `improve_placement`, `regional_mobility` |
| `proposed_action` | `TEXT` | Specific operational recommendation for planners |
| `reasoning` | `TEXT` | Underlying labour-market rationale |
| `evidence_metrics` | `TEXT` (JSON) | Computed metrics backing the recommendation |
| `status` | `VARCHAR(20)` | `proposed`, `under_review`, `accepted`, `rejected`, `completed` |
