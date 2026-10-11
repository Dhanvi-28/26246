export interface DistrictItem {
  code: string;
  name: string;
  state_code: string;
}

export interface StateItem {
  code: string;
  name: string;
  districts: DistrictItem[];
}

export interface SectorItem {
  id: string;
  name: string;
  description?: string;
}

export interface OccupationItem {
  id: string;
  name: string;
  nco_code?: string;
  sector_id: string;
  nsqf_level?: number;
  skills_list?: string;
  description?: string;
}

export interface FilterMetadata {
  states: StateItem[];
  sectors: SectorItem[];
  occupations: OccupationItem[];
  periods: string[];
  horizons: number[];
  data_statuses: string[];
}

export interface OverviewKpi {
  ldi_score: number;
  ldi_trend_pct: number;
  training_seats: number;
  effective_supply: number;
  shortage_occupations_count: number;
  oversupply_occupations_count: number;
  data_coverage_pct: number;
  last_updated: string;
  data_status: string;
}

export interface GapSeverityCount {
  critical_shortage: number;
  high_shortage: number;
  balanced: number;
  high_oversupply: number;
  critical_oversupply: number;
}

export interface TrendPoint {
  period: string;
  observed_demand: number | null;
  forecast_demand: number | null;
  lower_bound: number | null;
  upper_bound: number | null;
  effective_supply: number | null;
}

export interface TopTradeGap {
  occupation_id: string;
  occupation_name: string;
  sector_name: string;
  district_name: string;
  state_name: string;
  demand: number;
  supply: number;
  gap: number;
  gap_rate: number;
  severity: string;
}

export interface OverviewData {
  kpis: OverviewKpi;
  gap_distribution: GapSeverityCount;
  trend_history: TrendPoint[];
  top_shortages: TopTradeGap[];
  top_oversupplies: TopTradeGap[];
  insight_summary: string;
  coverage_note: string;
}

export interface DemandTrendItem {
  period: string;
  job_postings_count: number;
  unique_employers: number;
  estimated_vacancies: number;
  ldi_score: number;
}

export interface DemandSectorBreakdown {
  sector_id: string;
  sector_name: string;
  postings_count: number;
  avg_ldi: number;
  growth_rate_pct: number;
}

export interface OccupationDemandItem {
  occupation_id: string;
  occupation_name: string;
  nco_code?: string;
  sector_name: string;
  postings_count: number;
  unique_employers: number;
  vacancies: number;
  ldi_score: number;
  growth_rate_pct: number;
  nco_status: string;
}

export interface SupplySummary {
  total_sanctioned_seats: number;
  total_enrolments: number;
  total_completions: number;
  total_certified: number;
  total_placed: number;
  active_centres: number;
  overall_completion_rate: number;
  overall_placement_rate: number;
  pipeline_trends: Array<{
    period: string;
    seats: number;
    enrolments: number;
    completions: number;
    certified: number;
    placed: number;
  }>;
  occupation_capacities: Array<{
    occupation_id: string;
    occupation_name: string;
    sector_name: string;
    sanctioned_seats: number;
    enrolments: number;
    completions: number;
    placed: number;
    active_centres: number;
    completion_rate: number;
    placement_rate: number;
  }>;
}

export interface GapRankingItem {
  id: number;
  state_code: string;
  state_name: string;
  district_code: string;
  district_name: string;
  sector_name: string;
  occupation_id: string;
  occupation_name: string;
  forecast_demand: number;
  effective_supply: number;
  gap: number;
  gap_rate: number;
  severity: string;
  gap_type: string;
  confidence: string;
}

export interface ForecastItem {
  id: number;
  origin_period: string;
  target_period: string;
  horizon_months: number;
  state_name: string;
  district_name: string;
  sector_name: string;
  occupation_id: string;
  occupation_name: string;
  predicted_demand: number;
  lower_bound: number | null;
  upper_bound: number | null;
  model_name: string;
  mae: number | null;
  wape: number | null;
  confidence_score: string;
  data_coverage: number;
}

export interface ForecastEvaluation {
  model_name: string;
  model_version: string;
  validation_method: string;
  mae_overall: number;
  wape_overall: number;
  baseline_mae: number;
  improvement_over_baseline_pct: number;
  data_limitations: string;
}

export interface AlertItem {
  id: number;
  alert_type: string;
  severity: string;
  state_name: string;
  district_name: string;
  occupation_id: string;
  occupation_name: string;
  sector_name: string;
  observed_value: number;
  threshold: number;
  reason: string;
  evidence: string;
  status: string;
  created_at: string;
}

export interface RecommendationItem {
  id: number;
  title: string;
  action_type: string;
  state_name: string;
  district_name: string;
  occupation_id: string;
  occupation_name: string;
  sector_name: string;
  proposed_action: string;
  reasoning: string;
  evidence_metrics: Record<string, any>;
  confidence: string;
  suggested_review_period: string;
  caveats?: string;
  status: string;
  created_at: string;
}

export interface ScenarioSimulationResult {
  state_name: string;
  district_name: string;
  occupation_name: string;
  horizon_months: number;
  baseline_demand: number;
  baseline_seats: number;
  baseline_effective_supply: number;
  baseline_gap: number;
  baseline_gap_rate: number;
  baseline_severity: string;
  simulated_seats: number;
  simulated_effective_supply: number;
  simulated_gap: number;
  simulated_gap_rate: number;
  simulated_severity: string;
  gap_improvement: number;
  simulation_note: string;
}

export interface SavedScenarioItem {
  id: number;
  title: string;
  state_code: string;
  district_code: string;
  occupation_id: string;
  horizon_months: number;
  baseline_seats: number;
  proposed_seats: number;
  baseline_gap: number;
  simulated_gap: number;
  notes?: string;
  created_at: string;
}

export interface SourceMetadataItem {
  source_id: string;
  name: string;
  publisher: string;
  source_type: string;
  access_method: string;
  frequency: string;
  last_updated_at: string;
  status: string;
  coverage_description?: string;
  limitations?: string;
}

export interface ImportLogItem {
  id: number;
  filename: string;
  imported_at: string;
  status: string;
  total_rows: number;
  accepted_rows: number;
  rejected_rows: number;
  error_summary?: string;
}
