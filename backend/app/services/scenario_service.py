from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models.entities import (
    Scenario, ForecastRecord, SupplyObservation, District, State, Occupation
)
from backend.app.services.gap_service import classify_severity

def simulate_scenario(
    db: Session,
    state_code: str,
    district_code: str,
    occupation_id: str,
    horizon_months: int = 6,
    seat_adjustment_delta: Optional[int] = None,
    seat_adjustment_pct: Optional[float] = None,
    target_seats: Optional[int] = None
) -> Dict[str, Any]:
    # 1. Fetch State, District, Occupation details
    st = db.query(State).filter(State.code == state_code).first()
    dst = db.query(District).filter(District.code == district_code).first()
    occ = db.query(Occupation).filter(Occupation.id == occupation_id).first()

    state_name = st.name if st else state_code
    district_name = dst.name if dst else district_code
    occupation_name = occ.name if occ else occupation_id

    # 2. Fetch baseline predicted demand from forecast
    fc = db.query(ForecastRecord).filter(
        ForecastRecord.district_code == district_code,
        ForecastRecord.occupation_id == occupation_id,
        ForecastRecord.horizon_months == horizon_months
    ).first()

    baseline_demand = float(fc.predicted_demand) if fc else 250.0

    # 3. Fetch latest baseline seats
    latest_period = db.query(func.max(SupplyObservation.period)).scalar()
    sup = db.query(SupplyObservation).filter(
        SupplyObservation.district_code == district_code,
        SupplyObservation.occupation_id == occupation_id,
        SupplyObservation.period == latest_period
    ).first()

    baseline_seats = int(sup.sanctioned_seats) if sup else 200
    baseline_eff_supply = float(sup.completions * 0.85 + sup.placed_candidates * 0.15) if sup else (baseline_seats * 0.80)

    # 4. Compute simulated seats
    if target_seats is not None:
        sim_seats = max(0, target_seats)
    elif seat_adjustment_delta is not None:
        sim_seats = max(0, baseline_seats + seat_adjustment_delta)
    elif seat_adjustment_pct is not None:
        sim_seats = max(0, int(baseline_seats * (1.0 + seat_adjustment_pct / 100.0)))
    else:
        sim_seats = baseline_seats

    # Effective supply conversion factor based on baseline ratio
    eff_factor = (baseline_eff_supply / max(1.0, baseline_seats)) if baseline_seats > 0 else 0.80
    sim_eff_supply = round(sim_seats * eff_factor, 1)

    # Baseline gap & rate
    base_gap = round(baseline_demand - baseline_eff_supply, 1)
    base_gap_rate = round((base_gap / max(baseline_demand, 1.0)) * 100.0, 1)
    base_sev = classify_severity(base_gap_rate)

    # Simulated gap & rate
    sim_gap = round(baseline_demand - sim_eff_supply, 1)
    sim_gap_rate = round((sim_gap / max(baseline_demand, 1.0)) * 100.0, 1)
    sim_sev = classify_severity(sim_gap_rate)

    improvement = round(abs(base_gap) - abs(sim_gap), 1)

    return {
        "state_name": state_name,
        "district_name": district_name,
        "occupation_name": occupation_name,
        "horizon_months": horizon_months,
        "baseline_demand": baseline_demand,
        "baseline_seats": baseline_seats,
        "baseline_effective_supply": baseline_eff_supply,
        "baseline_gap": base_gap,
        "baseline_gap_rate": base_gap_rate,
        "baseline_severity": base_sev,
        "simulated_seats": sim_seats,
        "simulated_effective_supply": sim_eff_supply,
        "simulated_gap": sim_gap,
        "simulated_gap_rate": sim_gap_rate,
        "simulated_severity": sim_sev,
        "gap_improvement": improvement,
        "simulation_note": "Planning simulation only. Assumes labour demand elasticity remains independent of seat reallocation over the chosen horizon."
    }

def create_scenario(db: Session, data: Dict[str, Any]) -> Scenario:
    sc = Scenario(
        title=data["title"],
        state_code=data["state_code"],
        district_code=data["district_code"],
        occupation_id=data["occupation_id"],
        horizon_months=data.get("horizon_months", 6),
        baseline_seats=data["baseline_seats"],
        proposed_seats=data["proposed_seats"],
        baseline_gap=data["baseline_gap"],
        simulated_gap=data["simulated_gap"],
        notes=data.get("notes"),
        created_at=datetime.utcnow()
    )
    db.add(sc)
    db.commit()
    db.refresh(sc)
    return sc

def list_scenarios(db: Session) -> List[Scenario]:
    return db.query(Scenario).order_by(Scenario.created_at.desc()).all()
