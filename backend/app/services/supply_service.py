from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models.entities import SupplyObservation, Occupation, Sector, District, State

def get_supply_summary(
    db: Session,
    state_code: Optional[str] = None,
    district_code: Optional[str] = None,
    sector_id: Optional[str] = None,
    occupation_id: Optional[str] = None,
    period: Optional[str] = None
) -> Dict[str, Any]:
    query = db.query(
        func.sum(SupplyObservation.sanctioned_seats).label("seats"),
        func.sum(SupplyObservation.enrolments).label("enrolments"),
        func.sum(SupplyObservation.completions).label("completions"),
        func.sum(SupplyObservation.certified_candidates).label("certified"),
        func.sum(SupplyObservation.placed_candidates).label("placed"),
        func.sum(SupplyObservation.active_centres).label("centres")
    )

    if state_code:
        query = query.filter(SupplyObservation.state_code == state_code)
    if district_code:
        query = query.filter(SupplyObservation.district_code == district_code)
    if sector_id:
        query = query.filter(SupplyObservation.sector_id == sector_id)
    if occupation_id:
        query = query.filter(SupplyObservation.occupation_id == occupation_id)
    
    # Use latest period if not specified
    if period:
        query = query.filter(SupplyObservation.period == period)
    else:
        latest = db.query(func.max(SupplyObservation.period)).scalar()
        if latest:
            query = query.filter(SupplyObservation.period == latest)

    row = query.first()

    seats = int(row.seats or 0)
    enrolments = int(row.enrolments or 0)
    completions = int(row.completions or 0)
    certified = int(row.certified or 0)
    placed = int(row.placed or 0)
    centres = int(row.centres or 0)

    completion_rate = round((completions / max(1, enrolments)) * 100.0, 1)
    placement_rate = round((placed / max(1, certified)) * 100.0, 1)

    # Pipeline trends across periods
    pipeline_q = db.query(
        SupplyObservation.period,
        func.sum(SupplyObservation.sanctioned_seats).label("seats"),
        func.sum(SupplyObservation.enrolments).label("enrolments"),
        func.sum(SupplyObservation.completions).label("completions"),
        func.sum(SupplyObservation.certified_candidates).label("certified"),
        func.sum(SupplyObservation.placed_candidates).label("placed")
    )
    if state_code:
        pipeline_q = pipeline_q.filter(SupplyObservation.state_code == state_code)
    if district_code:
        pipeline_q = pipeline_q.filter(SupplyObservation.district_code == district_code)
    if sector_id:
        pipeline_q = pipeline_q.filter(SupplyObservation.sector_id == sector_id)
    if occupation_id:
        pipeline_q = pipeline_q.filter(SupplyObservation.occupation_id == occupation_id)
    
    pipeline_rows = pipeline_q.group_by(SupplyObservation.period).order_by(SupplyObservation.period).all()
    pipeline_trends = [
        {
            "period": r.period,
            "seats": int(r.seats or 0),
            "enrolments": int(r.enrolments or 0),
            "completions": int(r.completions or 0),
            "certified": int(r.certified or 0),
            "placed": int(r.placed or 0)
        }
        for r in pipeline_rows
    ]

    # Occupation capacities
    cap_q = db.query(
        Occupation.id,
        Occupation.name,
        Sector.name.label("sector_name"),
        func.sum(SupplyObservation.sanctioned_seats).label("seats"),
        func.sum(SupplyObservation.enrolments).label("enrolments"),
        func.sum(SupplyObservation.completions).label("completions"),
        func.sum(SupplyObservation.placed_candidates).label("placed"),
        func.sum(SupplyObservation.active_centres).label("centres")
    ).join(SupplyObservation, SupplyObservation.occupation_id == Occupation.id)\
     .join(Sector, Sector.id == Occupation.sector_id)

    if state_code:
        cap_q = cap_q.filter(SupplyObservation.state_code == state_code)
    if district_code:
        cap_q = cap_q.filter(SupplyObservation.district_code == district_code)
    if sector_id:
        cap_q = cap_q.filter(SupplyObservation.sector_id == sector_id)
    if period:
        cap_q = cap_q.filter(SupplyObservation.period == period)
    else:
        latest = db.query(func.max(SupplyObservation.period)).scalar()
        if latest:
            cap_q = cap_q.filter(SupplyObservation.period == latest)

    cap_rows = cap_q.group_by(Occupation.id, Occupation.name, Sector.name).all()
    occupation_capacities = []
    for c in cap_rows:
        comp_r = round((c.completions / max(1, c.enrolments)) * 100.0, 1)
        plac_r = round((c.placed / max(1, c.completions)) * 100.0, 1)
        occupation_capacities.append({
            "occupation_id": c.id,
            "occupation_name": c.name,
            "sector_name": c.sector_name,
            "sanctioned_seats": int(c.seats or 0),
            "enrolments": int(c.enrolments or 0),
            "completions": int(c.completions or 0),
            "placed": int(c.placed or 0),
            "active_centres": int(c.centres or 0),
            "completion_rate": comp_r,
            "placement_rate": plac_r
        })

    return {
        "total_sanctioned_seats": seats,
        "total_enrolments": enrolments,
        "total_completions": completions,
        "total_certified": certified,
        "total_placed": placed,
        "active_centres": centres,
        "overall_completion_rate": completion_rate,
        "overall_placement_rate": placement_rate,
        "pipeline_trends": pipeline_trends,
        "occupation_capacities": occupation_capacities
    }
