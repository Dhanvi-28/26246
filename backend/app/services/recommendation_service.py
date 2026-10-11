import json
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.entities import Recommendation, State, District, Sector, Occupation

def get_recommendations(
    db: Session,
    action_type: Optional[str] = None,
    status: Optional[str] = None,
    state_code: Optional[str] = None,
    district_code: Optional[str] = None,
    sector_id: Optional[str] = None,
    occupation_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    query = db.query(
        Recommendation.id,
        Recommendation.title,
        Recommendation.action_type,
        State.name.label("state_name"),
        District.name.label("district_name"),
        Recommendation.occupation_id,
        Occupation.name.label("occupation_name"),
        Sector.name.label("sector_name"),
        Recommendation.proposed_action,
        Recommendation.reasoning,
        Recommendation.evidence_metrics,
        Recommendation.confidence,
        Recommendation.suggested_review_period,
        Recommendation.caveats,
        Recommendation.status,
        Recommendation.created_at
    ).join(State, State.code == Recommendation.state_code)\
     .join(District, District.code == Recommendation.district_code)\
     .join(Sector, Sector.id == Recommendation.sector_id)\
     .join(Occupation, Occupation.id == Recommendation.occupation_id)

    if action_type:
        query = query.filter(Recommendation.action_type == action_type)
    if status:
        query = query.filter(Recommendation.status == status)
    if state_code:
        query = query.filter(Recommendation.state_code == state_code)
    if district_code:
        query = query.filter(Recommendation.district_code == district_code)
    if sector_id:
        query = query.filter(Recommendation.sector_id == sector_id)
    if occupation_id:
        query = query.filter(Recommendation.occupation_id == occupation_id)

    rows = query.order_by(Recommendation.created_at.desc()).all()
    results = []
    for r in rows:
        try:
            ev = json.loads(r.evidence_metrics) if isinstance(r.evidence_metrics, str) else r.evidence_metrics
        except Exception:
            ev = {"raw": str(r.evidence_metrics)}

        results.append({
            "id": r.id,
            "title": r.title,
            "action_type": r.action_type,
            "state_name": r.state_name,
            "district_name": r.district_name,
            "occupation_id": r.occupation_id,
            "occupation_name": r.occupation_name,
            "sector_name": r.sector_name,
            "proposed_action": r.proposed_action,
            "reasoning": r.reasoning,
            "evidence_metrics": ev,
            "confidence": r.confidence,
            "suggested_review_period": r.suggested_review_period,
            "caveats": r.caveats,
            "status": r.status,
            "created_at": r.created_at
        })
    return results

def update_recommendation_status(db: Session, rec_id: int, new_status: str) -> Optional[Dict[str, Any]]:
    rec = db.query(Recommendation).filter(Recommendation.id == rec_id).first()
    if not rec:
        return None
    rec.status = new_status
    db.commit()
    db.refresh(rec)
    return {
        "id": rec.id,
        "status": rec.status,
        "message": f"Recommendation status updated to '{rec.status}'."
    }
