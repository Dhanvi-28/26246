import io
import csv
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.entities import (
    State, District, Sector, Occupation, SourceMetadata,
    DemandObservation, SupplyObservation, ForecastRecord, DataImportLog
)
from backend.app.schemas.pydantic_models import (
    HealthResponse, FilterMetadataResponse, StateItem, DistrictItem, SectorItem,
    OccupationItem, OverviewResponse, DemandTrendItem, DemandSectorBreakdown,
    OccupationDemandItem, OccupationDetailResponse, SupplySummaryResponse,
    GapRankingItem, ForecastItem, ForecastEvaluationResponse, AlertItem,
    AlertStatusUpdate, RecommendationItem, RecommendationStatusUpdate,
    ScenarioSimulateRequest, ScenarioSimulateResponse, ScenarioCreate,
    ScenarioItem, SourceMetadataResponse, ImportValidationResponse, ImportResultResponse
)
from backend.app.services.seed_data import seed_database
from backend.app.services.demand_service import (
    get_demand_trends, get_demand_by_sector, get_occupation_demands, get_occupation_details
)
from backend.app.services.supply_service import get_supply_summary
from backend.app.services.gap_service import get_gap_rankings, get_overview_data
from backend.app.services.forecast_service import get_forecasts, evaluate_models_chronological
from backend.app.services.alert_service import get_alerts, update_alert_status
from backend.app.services.recommendation_service import get_recommendations, update_recommendation_status
from backend.app.services.scenario_service import simulate_scenario, create_scenario, list_scenarios
from backend.app.services.import_service import validate_csv_content, execute_csv_import
from backend.app.core.config import settings

router = APIRouter()

# --- Health & Metadata ---

@router.get("/health", response_model=HealthResponse)
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "subtitle": settings.PROJECT_SUBTITLE,
        "timestamp": datetime.utcnow(),
        "demo_mode": settings.DEMO_MODE
    }

@router.get("/filters", response_model=FilterMetadataResponse)
def get_filters(db: Session = Depends(get_db)):
    states = db.query(State).all()
    sectors = db.query(Sector).all()
    occupations = db.query(Occupation).all()
    periods = db.query(DemandObservation.period).distinct().order_by(DemandObservation.period.desc()).all()

    state_items = []
    for s in states:
        dists = [DistrictItem(code=d.code, name=d.name, state_code=d.state_code) for d in s.districts]
        state_items.append(StateItem(code=s.code, name=s.name, districts=dists))

    sector_items = [SectorItem(id=sec.id, name=sec.name, description=sec.description) for sec in sectors]
    occ_items = [
        OccupationItem(
            id=o.id,
            name=o.name,
            nco_code=o.nco_code,
            sector_id=o.sector_id,
            nsqf_level=o.nsqf_level,
            skills_list=o.skills_list,
            description=o.description
        ) for o in occupations
    ]

    return {
        "states": state_items,
        "sectors": sector_items,
        "occupations": occ_items,
        "periods": [p[0] for p in periods],
        "horizons": [3, 6, 12],
        "data_statuses": ["Official", "Uploaded", "Synthetic Sample"]
    }

@router.get("/sources", response_model=List[SourceMetadataResponse])
def get_sources(db: Session = Depends(get_db)):
    sources = db.query(SourceMetadata).all()
    return sources

# --- Overview & Demand ---

@router.get("/overview", response_model=OverviewResponse)
def get_overview(
    state_code: Optional[str] = None,
    district_code: Optional[str] = None,
    sector_id: Optional[str] = None,
    occupation_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return get_overview_data(
        db,
        state_code=state_code,
        district_code=district_code,
        sector_id=sector_id,
        occupation_id=occupation_id
    )

@router.get("/demand/trends", response_model=List[DemandTrendItem])
def get_demand_trends_api(
    state_code: Optional[str] = None,
    district_code: Optional[str] = None,
    sector_id: Optional[str] = None,
    occupation_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return get_demand_trends(
        db,
        state_code=state_code,
        district_code=district_code,
        sector_id=sector_id,
        occupation_id=occupation_id
    )

@router.get("/demand/by-sector", response_model=List[DemandSectorBreakdown])
def get_demand_by_sector_api(
    state_code: Optional[str] = None,
    district_code: Optional[str] = None,
    period: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return get_demand_by_sector(
        db,
        state_code=state_code,
        district_code=district_code,
        period=period
    )

@router.get("/demand/occupations", response_model=List[OccupationDemandItem])
def get_demand_occupations_api(
    state_code: Optional[str] = None,
    district_code: Optional[str] = None,
    sector_id: Optional[str] = None,
    period: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return get_occupation_demands(
        db,
        state_code=state_code,
        district_code=district_code,
        sector_id=sector_id,
        period=period
    )

@router.get("/occupations/{occupation_id}", response_model=OccupationDetailResponse)
def get_occupation_detail_api(occupation_id: str, db: Session = Depends(get_db)):
    detail = get_occupation_details(db, occupation_id=occupation_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Occupation '{occupation_id}' not found.")
    return detail

# --- Supply & Gap ---

@router.get("/supply/summary", response_model=SupplySummaryResponse)
def get_supply_summary_api(
    state_code: Optional[str] = None,
    district_code: Optional[str] = None,
    sector_id: Optional[str] = None,
    occupation_id: Optional[str] = None,
    period: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return get_supply_summary(
        db,
        state_code=state_code,
        district_code=district_code,
        sector_id=sector_id,
        occupation_id=occupation_id,
        period=period
    )

@router.get("/gaps/rankings", response_model=List[GapRankingItem])
def get_gaps_rankings_api(
    horizon_months: int = Query(6, description="Forecast horizon (3, 6, 12)"),
    state_code: Optional[str] = None,
    district_code: Optional[str] = None,
    sector_id: Optional[str] = None,
    occupation_id: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return get_gap_rankings(
        db,
        horizon_months=horizon_months,
        state_code=state_code,
        district_code=district_code,
        sector_id=sector_id,
        occupation_id=occupation_id,
        severity=severity
    )

# --- Forecasting ---

@router.get("/forecasts", response_model=List[ForecastItem])
def get_forecasts_api(
    horizon_months: int = Query(6, description="Forecast horizon (3, 6, 12)"),
    state_code: Optional[str] = None,
    district_code: Optional[str] = None,
    sector_id: Optional[str] = None,
    occupation_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return get_forecasts(
        db,
        horizon_months=horizon_months,
        state_code=state_code,
        district_code=district_code,
        sector_id=sector_id,
        occupation_id=occupation_id
    )

@router.get("/forecasts/evaluation", response_model=ForecastEvaluationResponse)
def get_forecast_evaluation_api(db: Session = Depends(get_db)):
    return evaluate_models_chronological(db)

# --- Alerts & Recommendations ---

@router.get("/alerts", response_model=List[AlertItem])
def get_alerts_api(
    severity: Optional[str] = None,
    alert_type: Optional[str] = None,
    status: Optional[str] = None,
    state_code: Optional[str] = None,
    district_code: Optional[str] = None,
    sector_id: Optional[str] = None,
    occupation_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return get_alerts(
        db,
        severity=severity,
        alert_type=alert_type,
        status=status,
        state_code=state_code,
        district_code=district_code,
        sector_id=sector_id,
        occupation_id=occupation_id
    )

@router.patch("/alerts/{alert_id}")
def update_alert_api(alert_id: int, payload: AlertStatusUpdate, db: Session = Depends(get_db)):
    res = update_alert_status(db, alert_id, payload.status)
    if not res:
        raise HTTPException(status_code=404, detail="Alert not found")
    return res

@router.get("/recommendations", response_model=List[RecommendationItem])
def get_recommendations_api(
    action_type: Optional[str] = None,
    status: Optional[str] = None,
    state_code: Optional[str] = None,
    district_code: Optional[str] = None,
    sector_id: Optional[str] = None,
    occupation_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return get_recommendations(
        db,
        action_type=action_type,
        status=status,
        state_code=state_code,
        district_code=district_code,
        sector_id=sector_id,
        occupation_id=occupation_id
    )

@router.patch("/recommendations/{recommendation_id}")
def update_recommendation_api(recommendation_id: int, payload: RecommendationStatusUpdate, db: Session = Depends(get_db)):
    res = update_recommendation_status(db, recommendation_id, payload.status)
    if not res:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return res

# --- Scenarios ---

@router.post("/scenarios/simulate", response_model=ScenarioSimulateResponse)
def simulate_scenario_api(req: ScenarioSimulateRequest, db: Session = Depends(get_db)):
    return simulate_scenario(
        db,
        state_code=req.state_code,
        district_code=req.district_code,
        occupation_id=req.occupation_id,
        horizon_months=req.horizon_months,
        seat_adjustment_delta=req.seat_adjustment_delta,
        seat_adjustment_pct=req.seat_adjustment_pct,
        target_seats=req.target_seats
    )

@router.post("/scenarios", response_model=ScenarioItem)
def create_scenario_api(sc: ScenarioCreate, db: Session = Depends(get_db)):
    return create_scenario(db, sc.model_dump())

@router.get("/scenarios", response_model=List[ScenarioItem])
def list_scenarios_api(db: Session = Depends(get_db)):
    return list_scenarios(db)

# --- Data Management & Imports ---

@router.post("/imports/validate", response_model=ImportValidationResponse)
async def validate_import_api(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        text = contents.decode("utf-8")
    except UnicodeDecodeError:
        text = contents.decode("latin-1")
    return validate_csv_content(text)

@router.post("/imports", response_model=ImportResultResponse)
async def execute_import_api(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    try:
        text = contents.decode("utf-8")
    except UnicodeDecodeError:
        text = contents.decode("latin-1")
    return execute_csv_import(db, file.filename or "upload.csv", text)

@router.get("/imports")
def list_import_logs_api(db: Session = Depends(get_db)):
    logs = db.query(DataImportLog).order_by(DataImportLog.imported_at.desc()).all()
    return logs

@router.post("/imports/reset-demo")
def reset_demo_data_api(db: Session = Depends(get_db)):
    return seed_database(db, force=True)

# --- Safe CSV Exports ---

def escape_csv_val(val: Any) -> str:
    s = str(val) if val is not None else ""
    # Formula injection safeguard
    if s.startswith(("=", "+", "-", "@")):
        s = "'" + s
    return s

@router.get("/exports/gaps.csv")
def export_gaps_csv(
    horizon_months: int = 6,
    state_code: Optional[str] = None,
    district_code: Optional[str] = None,
    db: Session = Depends(get_db)
):
    rankings = get_gap_rankings(
        db,
        horizon_months=horizon_months,
        state_code=state_code,
        district_code=district_code
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "State", "District", "Sector", "Occupation ID", "Occupation Name",
        "Forecast Demand", "Effective Supply", "Gap (Demand - Supply)", "Gap Rate (%)", "Severity", "Confidence"
    ])

    for r in rankings:
        writer.writerow([
            escape_csv_val(r["state_name"]),
            escape_csv_val(r["district_name"]),
            escape_csv_val(r["sector_name"]),
            escape_csv_val(r["occupation_id"]),
            escape_csv_val(r["occupation_name"]),
            escape_csv_val(r["forecast_demand"]),
            escape_csv_val(r["effective_supply"]),
            escape_csv_val(r["gap"]),
            escape_csv_val(f"{r['gap_rate']}%"),
            escape_csv_val(r["severity"]),
            escape_csv_val(r["confidence"])
        ])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=demand_supply_gaps_{horizon_months}m.csv"}
    )

@router.get("/exports/forecasts.csv")
def export_forecasts_csv(
    horizon_months: int = 6,
    state_code: Optional[str] = None,
    district_code: Optional[str] = None,
    db: Session = Depends(get_db)
):
    forecasts = get_forecasts(
        db,
        horizon_months=horizon_months,
        state_code=state_code,
        district_code=district_code
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Origin Period", "Target Period", "Horizon (Months)", "State", "District",
        "Sector", "Occupation ID", "Occupation Name", "Predicted Demand",
        "Lower Bound", "Upper Bound", "Model Name", "MAE", "WAPE", "Confidence"
    ])

    for f in forecasts:
        writer.writerow([
            escape_csv_val(f["origin_period"]),
            escape_csv_val(f["target_period"]),
            escape_csv_val(f["horizon_months"]),
            escape_csv_val(f["state_name"]),
            escape_csv_val(f["district_name"]),
            escape_csv_val(f["sector_name"]),
            escape_csv_val(f["occupation_id"]),
            escape_csv_val(f["occupation_name"]),
            escape_csv_val(f["predicted_demand"]),
            escape_csv_val(f["lower_bound"]),
            escape_csv_val(f["upper_bound"]),
            escape_csv_val(f["model_name"]),
            escape_csv_val(f["mae"]),
            escape_csv_val(f["wape"]),
            escape_csv_val(f["confidence_score"])
        ])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=labour_demand_forecasts_{horizon_months}m.csv"}
    )
