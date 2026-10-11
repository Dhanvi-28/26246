from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.entities import Alert, State, District, Sector, Occupation

def get_alerts(
    db: Session,
    severity: Optional[str] = None,
    alert_type: Optional[str] = None,
    status: Optional[str] = None,
    state_code: Optional[str] = None,
    district_code: Optional[str] = None,
    sector_id: Optional[str] = None,
    occupation_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    query = db.query(
        Alert.id,
        Alert.alert_type,
        Alert.severity,
        State.name.label("state_name"),
        District.name.label("district_name"),
        Alert.occupation_id,
        Occupation.name.label("occupation_name"),
        Sector.name.label("sector_name"),
        Alert.observed_value,
        Alert.threshold,
        Alert.reason,
        Alert.evidence,
        Alert.status,
        Alert.created_at
    ).join(State, State.code == Alert.state_code)\
     .join(District, District.code == Alert.district_code)\
     .join(Sector, Sector.id == Alert.sector_id)\
     .join(Occupation, Occupation.id == Alert.occupation_id)

    if severity:
        query = query.filter(Alert.severity == severity)
    if alert_type:
        query = query.filter(Alert.alert_type == alert_type)
    if status:
        query = query.filter(Alert.status == status)
    if state_code:
        query = query.filter(Alert.state_code == state_code)
    if district_code:
        query = query.filter(Alert.district_code == district_code)
    if sector_id:
        query = query.filter(Alert.sector_id == sector_id)
    if occupation_id:
        query = query.filter(Alert.occupation_id == occupation_id)

    rows = query.order_by(Alert.severity.asc(), Alert.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "alert_type": r.alert_type,
            "severity": r.severity,
            "state_name": r.state_name,
            "district_name": r.district_name,
            "occupation_id": r.occupation_id,
            "occupation_name": r.occupation_name,
            "sector_name": r.sector_name,
            "observed_value": r.observed_value,
            "threshold": r.threshold,
            "reason": r.reason,
            "evidence": r.evidence,
            "status": r.status,
            "created_at": r.created_at
        }
        for r in rows
    ]

def update_alert_status(db: Session, alert_id: int, new_status: str) -> Optional[Dict[str, Any]]:
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        return None
    alert.status = new_status
    db.commit()
    db.refresh(alert)
    return {
        "id": alert.id,
        "status": alert.status,
        "message": f"Alert status updated to '{alert.status}'."
    }
