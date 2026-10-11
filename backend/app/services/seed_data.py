import json
import random
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.models.entities import (
    State, District, Sector, Occupation, DemandObservation,
    SupplyObservation, ForecastRecord, Alert, Recommendation,
    SourceMetadata, Scenario, DataImportLog
)
from backend.app.core.config import settings

def seed_database(db: Session, force: bool = False):
    # Check if already seeded
    existing_states = db.query(State).count()
    if existing_states > 0 and not force:
        return {"status": "already_seeded", "message": "Database already contains seed data."}

    # Clear existing tables if force
    if force:
        db.query(Alert).delete()
        db.query(Recommendation).delete()
        db.query(ForecastRecord).delete()
        db.query(SupplyObservation).delete()
        db.query(DemandObservation).delete()
        db.query(Occupation).delete()
        db.query(Sector).delete()
        db.query(District).delete()
        db.query(State).delete()
        db.query(SourceMetadata).delete()
        db.query(Scenario).delete()
        db.query(DataImportLog).delete()
        db.commit()

    random.seed(settings.RANDOM_SEED)

    # 1. Source Metadata
    sources = [
        SourceMetadata(
            source_id="NCS",
            name="National Career Service Portal",
            publisher="Ministry of Labour and Employment",
            source_type="Job Aggregator & Employment Exchange",
            access_method="Permitted Export / Canonical Adapter",
            frequency="Monthly",
            last_updated_at="2025-12-31",
            status="Connected",
            coverage_description="Covers verified public employment notifications and job postings across 700+ districts.",
            limitations="Internet-reliant posting bias towards formal sector and urban districts."
        ),
        SourceMetadata(
            source_id="TRAINING_ECOSYSTEM",
            name="National Skilling & Apprenticeship Database",
            publisher="Directorate General of Training / NCVET",
            source_type="Training Capacity Registry",
            access_method="Administrative Data Feed",
            frequency="Monthly / Quarterly",
            last_updated_at="2025-12-31",
            status="Connected",
            coverage_description="Sanctioned seats, admissions, completions, and certified candidates from ITIs, NSTIs, and PMKVY centres.",
            limitations="Placement tracking relies on 90-day post-completion employer reporting."
        ),
        SourceMetadata(
            source_id="PLFS",
            name="Periodic Labour Force Survey",
            publisher="National Sample Survey Office (MoSPI)",
            source_type="Household Labour Survey",
            access_method="Annual Report Normalisation",
            frequency="Annual / Quarterly",
            last_updated_at="2025-09-30",
            status="Uploaded",
            coverage_description="Broad employment-unemployment ratios, LFPR, and principal activity statuses by state.",
            limitations="State-level sample weights; not representative at single-district occupation level."
        ),
        SourceMetadata(
            source_id="ESHRAM",
            name="e-Shram National Database of Unorganised Workers",
            publisher="Ministry of Labour and Employment",
            source_type="Worker Self-Registration Registry",
            access_method="Permitted Aggregate Statistics",
            frequency="Quarterly",
            last_updated_at="2025-11-30",
            status="Uploaded",
            coverage_description="Primary occupation declarations of unorganised and informal workers.",
            limitations="Self-reported primary trade; lacks longitudinal employment history."
        ),
        SourceMetadata(
            source_id="JOB_AGGREGATOR",
            name="Enterprise Hiring & Job Aggregation Engine",
            publisher="Consolidated Private Industry Feeds",
            source_type="Aggregated Industry Postings",
            access_method="Deduplicated Web Ingestion",
            frequency="Bi-weekly",
            last_updated_at="2025-12-28",
            status="Connected",
            coverage_description="Corporate job openings across manufacturing, IT, logistics, and renewable energy sectors.",
            limitations="Contains duplicate postings across aggregator portals; requires algorithmic deduplication."
        ),
        SourceMetadata(
            source_id="SYNTHETIC_PILOT",
            name="Labour Market Simulation Benchmark Dataset",
            publisher="Decision-Support Analytical Engine",
            source_type="Synthetic Demo Sample",
            access_method="Internal Deterministic Seed",
            frequency="Deterministic",
            last_updated_at="2025-12-31",
            status="Synthetic Sample",
            coverage_description="Provides complete 24-month historical series and multi-horizon forecasts for pilot districts.",
            limitations="Generated for simulation, prototype demonstration, and stress testing only."
        )
    ]
    db.add_all(sources)

    # 2. States & Districts
    states_data = [
        {
            "code": "KA",
            "name": "Karnataka",
            "districts": [
                {"code": "KA_BLRU", "name": "Bengaluru Urban"},
                {"code": "KA_MYS", "name": "Mysuru"},
                {"code": "KA_DK", "name": "Dakshina Kannada"}
            ]
        },
        {
            "code": "MH",
            "name": "Maharashtra",
            "districts": [
                {"code": "MH_PUNE", "name": "Pune"},
                {"code": "MH_MUM", "name": "Mumbai Suburban"},
                {"code": "MH_NAG", "name": "Nagpur"}
            ]
        },
        {
            "code": "TN",
            "name": "Tamil Nadu",
            "districts": [
                {"code": "TN_CHN", "name": "Chennai"},
                {"code": "TN_CBE", "name": "Coimbatore"},
                {"code": "TN_MDU", "name": "Madurai"}
            ]
        }
    ]

    for s_info in states_data:
        st = State(code=s_info["code"], name=s_info["name"])
        db.add(st)
        db.flush()
        for d_info in s_info["districts"]:
            dst = District(code=d_info["code"], name=d_info["name"], state_code=st.code)
            db.add(dst)
    db.flush()

    # 3. Sectors & Occupations
    sectors_data = [
        {
            "id": "SEC_RENEWABLE",
            "name": "Renewable Energy & Cleantech",
            "description": "Solar PV installation, wind turbine upkeep, battery storage and green hydrogen operations."
        },
        {
            "id": "SEC_HEALTHCARE",
            "name": "Healthcare & Life Sciences",
            "description": "Allied healthcare, diagnostic laboratories, nursing specializations, and patient care."
        },
        {
            "id": "SEC_LOGISTICS",
            "name": "Logistics & Supply Chain",
            "description": "Warehouse operations, cold-chain preservation, multimodal freight management, and fleet coordination."
        },
        {
            "id": "SEC_IT",
            "name": "IT & Digital Services",
            "description": "Software architecture, cloud infrastructure, ML engineering, cybersecurity, and data operations."
        },
        {
            "id": "SEC_MANUFACTURING",
            "name": "Advanced Manufacturing & Automotive",
            "description": "Precision CNC machining, EV drivetrain servicing, robotics integration, and industrial automation."
        }
    ]

    for sec in sectors_data:
        db.add(Sector(id=sec["id"], name=sec["name"], description=sec["description"]))
    db.flush()

    occupations_data = [
        {
            "id": "OCC_SOLAR_TECH",
            "name": "Solar PV Rooftop & Plant Installation Technician",
            "nco_code": "3113.0100",
            "sector_id": "SEC_RENEWABLE",
            "nsqf_level": 4,
            "skills_list": "PV Module Installation, Inverter Configuration, DC/AC Cabling, Grid Synchronisation, Safety Auditing",
            "description": "Installs, tests, and commissions rooftop and utility-scale solar photovoltaic power generation systems."
        },
        {
            "id": "OCC_EV_SERVICE",
            "name": "Electric Vehicle Diagnostics & Drivetrain Specialist",
            "nco_code": "7231.0200",
            "sector_id": "SEC_MANUFACTURING",
            "nsqf_level": 5,
            "skills_list": "High Voltage Battery Servicing, BMS Diagnostics, Motor Controller Calibration, Regenerative Braking",
            "description": "Performs diagnostics, maintenance, and battery health inspections on commercial and consumer electric vehicles."
        },
        {
            "id": "OCC_NURSE_SPEC",
            "name": "Critical Care & ICU Specialized Nursing Officer",
            "nco_code": "2221.0100",
            "sector_id": "SEC_HEALTHCARE",
            "nsqf_level": 6,
            "skills_list": "Ventilator Management, Hemodynamic Monitoring, Emergency Triage, Pharmacology, Infection Control",
            "description": "Provides dedicated high-acuity care to critical and intensive-care patients in medical facilities."
        },
        {
            "id": "OCC_DATA_ENG",
            "name": "Data Infrastructure & ML Platform Engineer",
            "nco_code": "2512.0300",
            "sector_id": "SEC_IT",
            "nsqf_level": 7,
            "skills_list": "Distributed Pipelines, SQL/Python, Data Warehousing, Orchestration, Model Deployment, Stream Analytics",
            "description": "Designs robust analytical pipelines, cloud data warehouses, and ML feature storage infrastructures."
        },
        {
            "id": "OCC_CNC_OP",
            "name": "CNC Precision Milling & Multi-Axis Machining Specialist",
            "nco_code": "7223.0100",
            "sector_id": "SEC_MANUFACTURING",
            "nsqf_level": 4,
            "skills_list": "G-Code Programming, Geometric Dimensioning, Toolpath Optimization, Metrology, Tolerance Inspection",
            "description": "Sets up and operates high-precision multi-axis computer numerical control (CNC) machining equipment."
        },
        {
            "id": "OCC_SUPPLY_CHAIN_MGR",
            "name": "Cold Chain & Warehouse Operations Supervisor",
            "nco_code": "4321.0200",
            "sector_id": "SEC_LOGISTICS",
            "nsqf_level": 5,
            "skills_list": "Warehouse Management Systems, Temperature Monitoring, Inventory Forecasting, Cross-docking",
            "description": "Supervises temperature-controlled logistics, automated inventory logging, and warehouse flow management."
        },
        {
            "id": "OCC_MED_LAB_TECH",
            "name": "Medical Diagnostic & Pathology Laboratory Technologist",
            "nco_code": "3212.0100",
            "sector_id": "SEC_HEALTHCARE",
            "nsqf_level": 5,
            "skills_list": "Automated Chemistry Analyzers, Specimen Processing, Histopathology, Quality Assurance, Biosafety",
            "description": "Conducts clinical laboratory tests, specimen analyses, and computerized reporting for patient diagnostics."
        },
        {
            "id": "OCC_CLOUD_ARCH",
            "name": "Cloud Infrastructure & Cybersecurity Architect",
            "nco_code": "2522.0100",
            "sector_id": "SEC_IT",
            "nsqf_level": 7,
            "skills_list": "Cloud Native Architecture, IAM Security, Containerization (K8s), Disaster Recovery, Cost Governance",
            "description": "Architects resilient, secure enterprise cloud environments and enforces governance standards."
        }
    ]

    for occ in occupations_data:
        db.add(Occupation(
            id=occ["id"],
            name=occ["name"],
            nco_code=occ["nco_code"],
            sector_id=occ["sector_id"],
            nsqf_level=occ["nsqf_level"],
            skills_list=occ["skills_list"],
            description=occ["description"]
        ))
    db.flush()

    # 4. Generate 24 Months of Historical Demand & Supply (2024-01 to 2025-12)
    periods = []
    for year in [2024, 2025]:
        for month in range(1, 13):
            periods.append(f"{year}-{month:02d}")

    # District multiplier / traits
    district_multiplier = {
        "KA_BLRU": 2.4, # High IT, Cleantech, Healthcare
        "KA_MYS": 0.8,
        "KA_DK": 0.6,
        "MH_PUNE": 2.1, # High Automotive, CNC, Cleantech
        "MH_MUM": 2.6, # High Logistics, IT, Healthcare
        "MH_NAG": 0.7,
        "TN_CHN": 2.2, # Automotive, Healthcare, IT
        "TN_CBE": 1.2, # CNC, Solar, Manufacturing
        "TN_MDU": 0.6
    }

    # Occupation base traits: (base_postings, growth_rate_per_month, base_seats, seat_growth_rate)
    occ_traits = {
        "OCC_SOLAR_TECH": (180, 0.025, 140, 0.005), # Growing fast, supply lagging -> Shortage
        "OCC_EV_SERVICE": (160, 0.035, 110, 0.008), # Rapid surge, critical shortage
        "OCC_NURSE_SPEC": (240, 0.012, 180, 0.004), # Persistent shortage
        "OCC_DATA_ENG": (320, 0.018, 290, 0.020), # High demand, moderate balance
        "OCC_CNC_OP": (210, -0.005, 300, 0.002), # Flat/slight drop in traditional, high seats -> Oversupply
        "OCC_SUPPLY_CHAIN_MGR": (150, 0.015, 140, 0.010), # Balanced
        "OCC_MED_LAB_TECH": (130, 0.010, 115, 0.006), # Slight shortage
        "OCC_CLOUD_ARCH": (200, 0.016, 175, 0.012)  # Balanced / slight shortage
    }

    demand_obs_list = []
    supply_obs_list = []

    for t_idx, period in enumerate(periods):
        for s_info in states_data:
            state_code = s_info["code"]
            for d_info in s_info["districts"]:
                district_code = d_info["code"]
                dist_mult = district_multiplier.get(district_code, 1.0)

                for occ in occupations_data:
                    occ_id = occ["id"]
                    sec_id = occ["sector_id"]
                    base_post, demand_growth, base_seats, seat_growth = occ_traits[occ_id]

                    # Deterministic noise based on index to ensure repeatability
                    noise_demand = 1.0 + 0.08 * ((hash(f"{period}_{district_code}_{occ_id}") % 21) - 10) / 10.0
                    noise_supply = 1.0 + 0.05 * ((hash(f"sup_{period}_{district_code}_{occ_id}") % 21) - 10) / 10.0

                    computed_demand = int(base_post * dist_mult * ((1 + demand_growth) ** t_idx) * noise_demand)
                    employers = max(5, int(computed_demand * 0.35 + random.randint(2, 6)))
                    vacancies = max(computed_demand, int(computed_demand * 1.25))

                    demand_obs = DemandObservation(
                        period=period,
                        state_code=state_code,
                        district_code=district_code,
                        sector_id=sec_id,
                        occupation_id=occ_id,
                        job_postings_count=computed_demand,
                        unique_employer_count=employers,
                        estimated_vacancies=vacancies,
                        source_id="NCS" if t_idx % 2 == 0 else "JOB_AGGREGATOR",
                        source_type="Job Aggregator",
                        data_status="Synthetic Sample",
                        collected_at=datetime.utcnow()
                    )
                    demand_obs_list.append(demand_obs)

                    # Supply numbers
                    seats = int(base_seats * dist_mult * ((1 + seat_growth) ** t_idx) * noise_supply)
                    enrolments = int(seats * random.uniform(0.85, 0.96))
                    completions = int(enrolments * random.uniform(0.80, 0.92))
                    certified = int(completions * random.uniform(0.88, 0.98))
                    placed = int(certified * random.uniform(0.65, 0.88))
                    centres = max(2, int(seats / 45))

                    supply_obs = SupplyObservation(
                        period=period,
                        state_code=state_code,
                        district_code=district_code,
                        sector_id=sec_id,
                        occupation_id=occ_id,
                        sanctioned_seats=seats,
                        enrolments=enrolments,
                        completions=completions,
                        certified_candidates=certified,
                        placed_candidates=placed,
                        active_centres=centres,
                        source_id="TRAINING_ECOSYSTEM",
                        data_status="Synthetic Sample",
                        collected_at=datetime.utcnow()
                    )
                    supply_obs_list.append(supply_obs)

    db.bulk_save_objects(demand_obs_list)
    db.bulk_save_objects(supply_obs_list)
    db.commit()

    # 5. Generate Forecast Records (Horizons: 3m -> 2026-03, 6m -> 2026-06, 12m -> 2026-12)
    # Origin period: 2025-12
    horizons = [
        (3, "2026-03"),
        (6, "2026-06"),
        (12, "2026-12")
    ]

    forecast_records = []
    alerts_list = []
    recommendations_list = []

    for s_info in states_data:
        state_code = s_info["code"]
        for d_info in s_info["districts"]:
            district_code = d_info["code"]
            dist_mult = district_multiplier.get(district_code, 1.0)

            for occ in occupations_data:
                occ_id = occ["id"]
                sec_id = occ["sector_id"]
                base_post, demand_growth, base_seats, seat_growth = occ_traits[occ_id]

                # calculate baseline latest demand and supply (index 23 = 2025-12)
                latest_demand = int(base_post * dist_mult * ((1 + demand_growth) ** 23))
                latest_seats = int(base_seats * dist_mult * ((1 + seat_growth) ** 23))
                effective_supply = int(latest_seats * 0.80) # completions approx 80%

                for h_months, target_period in horizons:
                    # Projected demand at horizon
                    future_t = 23 + h_months
                    pred_demand = round(base_post * dist_mult * ((1 + demand_growth) ** future_t), 1)
                    
                    # Prediction Interval: wider for longer horizons
                    interval_width = pred_demand * (0.08 + 0.04 * (h_months / 3))
                    lower_b = round(max(10.0, pred_demand - interval_width), 1)
                    upper_b = round(pred_demand + interval_width, 1)

                    mae_val = round(pred_demand * 0.065, 2)
                    wape_val = round(0.065 + 0.008 * (h_months / 3), 3)

                    confidence = "High" if h_months == 3 else ("Moderate" if h_months == 6 else "Low")
                    if dist_mult < 0.8:
                        confidence = "Moderate" if h_months == 3 else "Low"

                    f_rec = ForecastRecord(
                        forecast_origin_period="2025-12",
                        target_period=target_period,
                        horizon_months=h_months,
                        state_code=state_code,
                        district_code=district_code,
                        sector_id=sec_id,
                        occupation_id=occ_id,
                        predicted_demand=pred_demand,
                        lower_bound=lower_b,
                        upper_bound=upper_b,
                        model_name="Ridge Lag Regression + Trend Baseline",
                        model_version="v1.2-chronological",
                        mae=mae_val,
                        wape=wape_val,
                        confidence_score=confidence,
                        data_coverage=0.96,
                        generated_at=datetime.utcnow()
                    )
                    forecast_records.append(f_rec)

                # Generate Alerts & Recommendations based on 6-month forecast
                pred_6m = base_post * dist_mult * ((1 + demand_growth) ** 29)
                gap = pred_6m - effective_supply
                gap_rate = (gap / max(pred_6m, 1.0)) * 100.0

                # Alerts & Recommendations rules
                if gap_rate >= 30.0:
                    alerts_list.append(Alert(
                        alert_type="shortage",
                        severity="critical",
                        state_code=state_code,
                        district_code=district_code,
                        sector_id=sec_id,
                        occupation_id=occ_id,
                        observed_value=round(gap_rate, 1),
                        threshold=30.0,
                        reason=f"Severe projected shortage: labour demand exceeds training supply capacity by {gap_rate:.1f}%.",
                        evidence=f"Projected 6M demand: {int(pred_6m)} vs Effective training supply: {effective_supply}. Growth trend: +{demand_growth*100:.1f}%/month.",
                        status="open",
                        created_at=datetime.utcnow()
                    ))
                    recommendations_list.append(Recommendation(
                        title=f"Expand Sanctioned Capacity for {occ['name']}",
                        action_type="expand_seats",
                        state_code=state_code,
                        district_code=district_code,
                        sector_id=sec_id,
                        occupation_id=occ_id,
                        proposed_action=f"Increase sanctioned training intake by {int(gap * 0.75)} seats across accredited training centres in {d_info['name']}.",
                        reasoning=f"High market expansion coupled with persistent local vacancy deficits. Candidates placed quickly with high absorption rate.",
                        evidence_metrics=json.dumps({
                            "projected_demand": int(pred_6m),
                            "effective_supply": effective_supply,
                            "gap_deficit": int(gap),
                            "gap_rate_pct": round(gap_rate, 1),
                            "historical_absorption": "88.4%"
                        }),
                        confidence="High" if dist_mult >= 1.0 else "Moderate",
                        suggested_review_period="Q1 2026",
                        caveats="Ensure availability of certified lab equipment and qualified trainers prior to seat expansion.",
                        status="proposed",
                        created_at=datetime.utcnow()
                    ))
                elif gap_rate >= 15.0:
                    alerts_list.append(Alert(
                        alert_type="shortage",
                        severity="high",
                        state_code=state_code,
                        district_code=district_code,
                        sector_id=sec_id,
                        occupation_id=occ_id,
                        observed_value=round(gap_rate, 1),
                        threshold=15.0,
                        reason=f"Emerging shortage: projected demand outstripping effective pipeline by {gap_rate:.1f}%.",
                        evidence=f"Demand trend is accelerating; current capacity of {latest_seats} seats insufficient for anticipated industrial requirements.",
                        status="open",
                        created_at=datetime.utcnow()
                    ))
                elif gap_rate <= -30.0:
                    alerts_list.append(Alert(
                        alert_type="oversupply",
                        severity="critical",
                        state_code=state_code,
                        district_code=district_code,
                        sector_id=sec_id,
                        occupation_id=occ_id,
                        observed_value=round(gap_rate, 1),
                        threshold=-30.0,
                        reason=f"Severe oversupply risk: training supply exceeds local hiring capacity by {abs(gap_rate):.1f}%.",
                        evidence=f"Training supply ({effective_supply}) exceeds demand ({int(pred_6m)}). Placement rates dropping below threshold.",
                        status="open",
                        created_at=datetime.utcnow()
                    ))
                    recommendations_list.append(Recommendation(
                        title=f"Rationalise Intake & Diversify Curriculum for {occ['name']}",
                        action_type="review_intake",
                        state_code=state_code,
                        district_code=district_code,
                        sector_id=sec_id,
                        occupation_id=occ_id,
                        proposed_action=f"Temporarily moderate sanctioned intake by 25% or transition centres towards multi-skilling in {d_info['name']}.",
                        reasoning=f"Persistent oversupply risk with stagnating local hiring signals. Avoid candidate underemployment.",
                        evidence_metrics=json.dumps({
                            "projected_demand": int(pred_6m),
                            "effective_supply": effective_supply,
                            "surplus": int(abs(gap)),
                            "gap_rate_pct": round(gap_rate, 1)
                        }),
                        confidence="Moderate",
                        suggested_review_period="Q2 2026",
                        caveats="Coordinate with local industry association to assess whether surplus candidates migrate to adjacent districts.",
                        status="under_review",
                        created_at=datetime.utcnow()
                    ))
                elif gap_rate <= -15.0:
                    alerts_list.append(Alert(
                        alert_type="oversupply",
                        severity="high",
                        state_code=state_code,
                        district_code=district_code,
                        sector_id=sec_id,
                        occupation_id=occ_id,
                        observed_value=round(gap_rate, 1),
                        threshold=-15.0,
                        reason=f"Supply surplus caution: intake exceeding absorbed candidates by {abs(gap_rate):.1f}%.",
                        evidence=f"Graduation rates remain elevated while posting velocity softened over recent quarters.",
                        status="open",
                        created_at=datetime.utcnow()
                    ))

    db.bulk_save_objects(forecast_records)
    db.bulk_save_objects(alerts_list)
    db.bulk_save_objects(recommendations_list)
    db.commit()

    # Seed an example scenario
    sample_scenario = Scenario(
        title="Bengaluru EV Workforce Seat Expansion Simulation",
        state_code="KA",
        district_code="KA_BLRU",
        occupation_id="OCC_EV_SERVICE",
        horizon_months=6,
        baseline_seats=320,
        proposed_seats=480,
        baseline_gap=210.0,
        simulated_gap=82.0,
        notes="Simulated a 50% expansion in EV Service Specialist seats to curb rising deficit in high-density automotive corridors.",
        created_at=datetime.utcnow()
    )
    db.add(sample_scenario)
    db.commit()

    return {
        "status": "success",
        "message": f"Successfully seeded 3 states, 9 districts, 5 sectors, 8 occupations, {len(demand_obs_list)} demand obs, {len(supply_obs_list)} supply obs, {len(forecast_records)} forecasts, {len(alerts_list)} alerts, {len(recommendations_list)} recommendations."
    }
