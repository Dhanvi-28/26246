from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# Common Geographies & Taxonomies
class DistrictItem(BaseModel):
    code: str
    name: str
    state_code: str

class StateItem(BaseModel):
    code: str
    name: str
    districts: List[DistrictItem] = []

class SectorItem(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

class OccupationItem(BaseModel):
    id: str
    name: str
    nco_code: Optional[str] = None
    sector_id: str
    nsqf_level: Optional[int] = None
    skills_list: Optional[str] = None
    description: Optional[str] = None

class FilterMetadataResponse(BaseModel):
    states: List[StateItem]
    sectors: List[SectorItem]
    occupations: List[OccupationItem]
    periods: List[str]
    horizons: List[int]
    data_statuses: List[str]

# Overview KPIs
class OverviewKpi(BaseModel):
    ldi_score: float = Field(..., description="Labour Demand Index on 0-100 scale")
    ldi_trend_pct: float = Field(..., description="Change compared to previous period")
    training_seats: int
    effective_supply: int
    shortage_occupations_count: int
    oversupply_occupations_count: int
    data_coverage_pct: float
    last_updated: str
    data_status: str

class GapSeverityCount(BaseModel):
    critical_shortage: int
    high_shortage: int
    balanced: int
    high_oversupply: int
    critical_oversupply: int

class TrendPoint(BaseModel):
    period: str
    observed_demand: Optional[float] = None
    forecast_demand: Optional[float] = None
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    effective_supply: Optional[float] = None

class TopTradeGap(BaseModel):
    occupation_id: str
    occupation_name: str
    sector_name: str
    district_name: str
    state_name: str
    demand: float
    supply: float
    gap: float
    gap_rate: float
    severity: str

class OverviewResponse(BaseModel):
    kpis: OverviewKpi
    gap_distribution: GapSeverityCount
    trend_history: List[TrendPoint]
    top_shortages: List[TopTradeGap]
    top_oversupplies: List[TopTradeGap]
    insight_summary: str
    coverage_note: str

# Demand Responses
class DemandTrendItem(BaseModel):
    period: str
    job_postings_count: int
    unique_employers: int
    estimated_vacancies: int
    ldi_score: float

class DemandSectorBreakdown(BaseModel):
    sector_id: str
    sector_name: str
    postings_count: int
    avg_ldi: float
    growth_rate_pct: float

class OccupationDemandItem(BaseModel):
    occupation_id: str
    occupation_name: str
    nco_code: Optional[str]
    sector_name: str
    postings_count: int
    unique_employers: int
    vacancies: int
    ldi_score: float
    growth_rate_pct: float
    nco_status: str # "Verified Mapping", "Candidate Mapping", "Unmapped"

class OccupationDetailResponse(BaseModel):
    occupation: OccupationItem
    demand_history: List[DemandTrendItem]
    top_districts: List[Dict[str, Any]]
    key_skills: List[str]
    nco_audit: Dict[str, Any]

# Supply Responses
class SupplySummaryResponse(BaseModel):
    total_sanctioned_seats: int
    total_enrolments: int
    total_completions: int
    total_certified: int
    total_placed: int
    active_centres: int
    overall_completion_rate: float
    overall_placement_rate: float
    pipeline_trends: List[Dict[str, Any]]
    occupation_capacities: List[Dict[str, Any]]

# Gap & Forecast Responses
class GapRankingItem(BaseModel):
    id: int
    state_code: str
    state_name: str
    district_code: str
    district_name: str
    sector_name: str
    occupation_id: str
    occupation_name: str
    forecast_demand: float
    effective_supply: float
    gap: float
    gap_rate: float
    severity: str
    gap_type: str # "Count-based gap" or "Index-based pressure"
    confidence: str

class ForecastItem(BaseModel):
    id: int
    origin_period: str
    target_period: str
    horizon_months: int
    state_name: str
    district_name: str
    sector_name: str
    occupation_id: str
    occupation_name: str
    predicted_demand: float
    lower_bound: Optional[float]
    upper_bound: Optional[float]
    model_name: str
    mae: Optional[float]
    wape: Optional[float]
    confidence_score: str
    data_coverage: float

class ForecastEvaluationResponse(BaseModel):
    model_name: str
    model_version: str
    validation_method: str
    mae_overall: float
    wape_overall: float
    baseline_mae: float
    improvement_over_baseline_pct: float
    data_limitations: str

# Alerts
class AlertItem(BaseModel):
    id: int
    alert_type: str
    severity: str
    state_name: str
    district_name: str
    occupation_id: str
    occupation_name: str
    sector_name: str
    observed_value: float
    threshold: float
    reason: str
    evidence: str
    status: str
    created_at: datetime

class AlertStatusUpdate(BaseModel):
    status: str = Field(..., description="'open', 'acknowledged', or 'resolved'")

# Recommendations
class RecommendationItem(BaseModel):
    id: int
    title: str
    action_type: str
    state_name: str
    district_name: str
    occupation_id: str
    occupation_name: str
    sector_name: str
    proposed_action: str
    reasoning: str
    evidence_metrics: Dict[str, Any]
    confidence: str
    suggested_review_period: str
    caveats: Optional[str]
    status: str
    created_at: datetime

class RecommendationStatusUpdate(BaseModel):
    status: str = Field(..., description="'proposed', 'under_review', 'accepted', 'rejected', or 'completed'")

# Scenarios
class ScenarioSimulateRequest(BaseModel):
    state_code: str
    district_code: str
    occupation_id: str
    horizon_months: int = 6
    seat_adjustment_delta: Optional[int] = None
    seat_adjustment_pct: Optional[float] = None
    target_seats: Optional[int] = None

class ScenarioSimulateResponse(BaseModel):
    state_name: str
    district_name: str
    occupation_name: str
    horizon_months: int
    baseline_demand: float
    baseline_seats: int
    baseline_effective_supply: float
    baseline_gap: float
    baseline_gap_rate: float
    baseline_severity: str
    simulated_seats: int
    simulated_effective_supply: float
    simulated_gap: float
    simulated_gap_rate: float
    simulated_severity: str
    gap_improvement: float
    simulation_note: str

class ScenarioCreate(BaseModel):
    title: str
    state_code: str
    district_code: str
    occupation_id: str
    horizon_months: int
    baseline_seats: int
    proposed_seats: int
    baseline_gap: float
    simulated_gap: float
    notes: Optional[str] = None

class ScenarioItem(BaseModel):
    id: int
    title: str
    state_code: str
    district_code: str
    occupation_id: str
    horizon_months: int
    baseline_seats: int
    proposed_seats: int
    baseline_gap: float
    simulated_gap: float
    notes: Optional[str]
    created_at: datetime

# Source Metadata
class SourceMetadataResponse(BaseModel):
    source_id: str
    name: str
    publisher: str
    source_type: str
    access_method: str
    frequency: str
    last_updated_at: str
    status: str
    coverage_description: Optional[str]
    limitations: Optional[str]

# Imports
class ValidationErrorRow(BaseModel):
    row_number: int
    column: str
    value: Any
    error_message: str

class ImportValidationResponse(BaseModel):
    valid: bool
    total_rows: int
    preview_rows: List[Dict[str, Any]]
    errors: List[ValidationErrorRow]
    unmapped_occupations: List[str]
    summary_message: str

class ImportResultResponse(BaseModel):
    import_id: int
    filename: str
    status: str
    accepted_rows: int
    rejected_rows: int
    message: str

class HealthResponse(BaseModel):
    status: str
    project: str
    subtitle: str
    timestamp: datetime
    demo_mode: bool
