import {
  FilterMetadata, OverviewData, DemandTrendItem, DemandSectorBreakdown,
  OccupationDemandItem, SupplySummary, GapRankingItem, ForecastItem,
  ForecastEvaluation, AlertItem, RecommendationItem, ScenarioSimulationResult,
  SavedScenarioItem, SourceMetadataItem, ImportLogItem
} from '../types/api';

const API_BASE = '/api/v1';

export async function fetchFilters(): Promise<FilterMetadata> {
  const res = await fetch(`${API_BASE}/filters`);
  if (!res.ok) throw new Error('Failed to fetch filter metadata');
  return res.json();
}

export async function fetchOverview(params?: Record<string, string>): Promise<OverviewData> {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await fetch(`${API_BASE}/overview${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error('Failed to fetch overview data');
  return res.json();
}

export async function fetchDemandTrends(params?: Record<string, string>): Promise<DemandTrendItem[]> {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await fetch(`${API_BASE}/demand/trends${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error('Failed to fetch demand trends');
  return res.json();
}

export async function fetchDemandBySector(params?: Record<string, string>): Promise<DemandSectorBreakdown[]> {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await fetch(`${API_BASE}/demand/by-sector${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error('Failed to fetch sector demand');
  return res.json();
}

export async function fetchDemandOccupations(params?: Record<string, string>): Promise<OccupationDemandItem[]> {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await fetch(`${API_BASE}/demand/occupations${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error('Failed to fetch occupations');
  return res.json();
}

export async function fetchOccupationDetail(id: string) {
  const res = await fetch(`${API_BASE}/occupations/${id}`);
  if (!res.ok) throw new Error('Failed to fetch occupation details');
  return res.json();
}

export async function fetchSupplySummary(params?: Record<string, string>): Promise<SupplySummary> {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await fetch(`${API_BASE}/supply/summary${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error('Failed to fetch supply summary');
  return res.json();
}

export async function fetchGapRankings(params?: Record<string, string>): Promise<GapRankingItem[]> {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await fetch(`${API_BASE}/gaps/rankings${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error('Failed to fetch gap rankings');
  return res.json();
}

export async function fetchForecasts(params?: Record<string, string>): Promise<ForecastItem[]> {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await fetch(`${API_BASE}/forecasts${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error('Failed to fetch forecasts');
  return res.json();
}

export async function fetchForecastEvaluation(): Promise<ForecastEvaluation> {
  const res = await fetch(`${API_BASE}/forecasts/evaluation`);
  if (!res.ok) throw new Error('Failed to fetch forecast evaluation');
  return res.json();
}

export async function fetchAlerts(params?: Record<string, string>): Promise<AlertItem[]> {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await fetch(`${API_BASE}/alerts${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function updateAlertStatus(id: number, status: string): Promise<any> {
  const res = await fetch(`${API_BASE}/alerts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update alert status');
  return res.json();
}

export async function fetchRecommendations(params?: Record<string, string>): Promise<RecommendationItem[]> {
  const qs = new URLSearchParams(params || {}).toString();
  const res = await fetch(`${API_BASE}/recommendations${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

export async function updateRecommendationStatus(id: number, status: string): Promise<any> {
  const res = await fetch(`${API_BASE}/recommendations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update recommendation status');
  return res.json();
}

export async function simulateScenario(payload: any): Promise<ScenarioSimulationResult> {
  const res = await fetch(`${API_BASE}/scenarios/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to simulate scenario');
  return res.json();
}

export async function saveScenario(payload: any): Promise<SavedScenarioItem> {
  const res = await fetch(`${API_BASE}/scenarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to save scenario');
  return res.json();
}

export async function fetchSavedScenarios(): Promise<SavedScenarioItem[]> {
  const res = await fetch(`${API_BASE}/scenarios`);
  if (!res.ok) throw new Error('Failed to fetch saved scenarios');
  return res.json();
}

export async function fetchSources(): Promise<SourceMetadataItem[]> {
  const res = await fetch(`${API_BASE}/sources`);
  if (!res.ok) throw new Error('Failed to fetch sources');
  return res.json();
}

export async function fetchImportLogs(): Promise<ImportLogItem[]> {
  const res = await fetch(`${API_BASE}/imports`);
  if (!res.ok) throw new Error('Failed to fetch import logs');
  return res.json();
}

export async function validateImportFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/imports/validate`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to validate file');
  return res.json();
}

export async function executeImportFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/imports`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to import file');
  return res.json();
}

export async function resetDemoData() {
  const res = await fetch(`${API_BASE}/imports/reset-demo`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reset demo data');
  return res.json();
}
