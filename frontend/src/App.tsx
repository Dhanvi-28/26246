import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { FilterBar, FilterState } from './components/FilterBar';
import { OverviewView } from './views/OverviewView';
import { DemandView } from './views/DemandView';
import { SupplyView } from './views/SupplyView';
import { ForecastView } from './views/ForecastView';
import { AlertsView } from './views/AlertsView';
import { RecommendationsView } from './views/RecommendationsView';
import { ScenarioView } from './views/ScenarioView';
import { DataManagementView } from './views/DataManagementView';
import { MethodologyView } from './views/MethodologyView';
import { FilterMetadata, OverviewData } from './types/api';
import { fetchFilters, fetchOverview, fetchAlerts, resetDemoData } from './lib/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [metadata, setMetadata] = useState<FilterMetadata | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    state_code: '',
    district_code: '',
    sector_id: '',
    occupation_id: '',
    horizon_months: 6,
  });
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [alertCount, setAlertCount] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  // Load initial filter metadata
  useEffect(() => {
    fetchFilters()
      .then((res) => setMetadata(res))
      .catch((err) => console.error('Failed to load filter metadata:', err));
  }, []);

  // Compute active query params object
  const activeParams = React.useMemo(() => {
    const p: Record<string, string> = {};
    if (filters.state_code) p.state_code = filters.state_code;
    if (filters.district_code) p.district_code = filters.district_code;
    if (filters.sector_id) p.sector_id = filters.sector_id;
    if (filters.occupation_id) p.occupation_id = filters.occupation_id;
    return p;
  }, [filters]);

  // Load overview data when filters change
  const refreshOverview = () => {
    setLoadingOverview(true);
    fetchOverview(activeParams)
      .then((res) => {
        setOverviewData(res);
        setLoadingOverview(false);
      })
      .catch((err) => {
        console.error('Failed to load overview data:', err);
        setLoadingOverview(false);
      });
  };

  // Load alert badge count
  const refreshAlertCount = () => {
    fetchAlerts({ status: 'open' })
      .then((res) => setAlertCount(res.length))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    refreshOverview();
    refreshAlertCount();
  }, [JSON.stringify(activeParams)]);

  const handleFilterChange = (key: keyof FilterState, val: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      state_code: '',
      district_code: '',
      sector_id: '',
      occupation_id: '',
      horizon_months: 6,
    });
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await resetDemoData();
      handleClearFilters();
      refreshOverview();
      refreshAlertCount();
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  // Check if current tab uses the global filter bar
  const showFilterBar = [
    'overview',
    'demand',
    'supply',
    'forecast',
    'alerts',
    'recommendations',
  ].includes(currentTab);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <Navbar onResetDemo={handleResetDemo} isResetting={isResetting} />

      {/* Mobile Tab Selector */}
      <div className="md:hidden overflow-x-auto bg-navy-900 border-b border-navy-800 p-2 flex gap-1">
        {(
          [
            ['overview', 'Overview'],
            ['demand', 'Demand'],
            ['supply', 'Supply'],
            ['forecast', 'Forecasts'],
            ['alerts', 'Alerts'],
            ['recommendations', 'Recommendations'],
            ['scenarios', 'Scenarios'],
            ['data-management', 'Data'],
            ['methodology', 'Methodology'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setCurrentTab(id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentTab === id
                ? 'bg-gold-500 text-navy-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          alertCount={alertCount}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {showFilterBar && (
            <FilterBar
              filters={filters}
              metadata={metadata}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          )}

          {/* Module Views */}
          {currentTab === 'overview' && (
            <OverviewView
              data={overviewData}
              loading={loadingOverview}
              onNavigateToTab={setCurrentTab}
            />
          )}

          {currentTab === 'demand' && <DemandView filterParams={activeParams} />}

          {currentTab === 'supply' && <SupplyView filterParams={activeParams} />}

          {currentTab === 'forecast' && (
            <ForecastView
              filterParams={activeParams}
              horizonMonths={filters.horizon_months}
              onHorizonChange={(h) => handleFilterChange('horizon_months', h)}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsView
              filterParams={activeParams}
              onAlertUpdated={refreshAlertCount}
            />
          )}

          {currentTab === 'recommendations' && (
            <RecommendationsView filterParams={activeParams} />
          )}

          {currentTab === 'scenarios' && <ScenarioView metadata={metadata} />}

          {currentTab === 'data-management' && <DataManagementView />}

          {currentTab === 'methodology' && <MethodologyView />}
        </main>
      </div>
    </div>
  );
};

export default App;
