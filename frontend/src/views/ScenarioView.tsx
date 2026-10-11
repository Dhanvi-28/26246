import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Play,
  Save,
  CheckCircle2,
  TrendingDown,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  Bookmark
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell
} from 'recharts';
import { FilterMetadata, ScenarioSimulationResult, SavedScenarioItem } from '../types/api';
import { simulateScenario, saveScenario, fetchSavedScenarios } from '../lib/api';
import { StatusBadge } from '../components/StatusBadge';

interface ScenarioViewProps {
  metadata: FilterMetadata | null;
}

export const ScenarioView: React.FC<ScenarioViewProps> = ({ metadata }) => {
  const [selectedState, setSelectedState] = useState('KA');
  const [selectedDistrict, setSelectedDistrict] = useState('KA_BLRU');
  const [selectedOccupation, setSelectedOccupation] = useState('OCC_EV_SERVICE');
  const [horizonMonths, setHorizonMonths] = useState(6);
  const [targetSeats, setTargetSeats] = useState<number>(450);
  const [simulationResult, setSimulationResult] = useState<ScenarioSimulationResult | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Save Scenario State
  const [scenarioTitle, setScenarioTitle] = useState('');
  const [scenarioNotes, setScenarioNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenarioItem[]>([]);

  // Load Saved Scenarios
  useEffect(() => {
    fetchSavedScenarios()
      .then((res) => setSavedScenarios(res))
      .catch((e) => console.error(e));
  }, []);

  // Run initial simulation
  const handleRunSimulation = () => {
    setSimulating(true);
    simulateScenario({
      state_code: selectedState,
      district_code: selectedDistrict,
      occupation_id: selectedOccupation,
      horizon_months: horizonMonths,
      target_seats: targetSeats,
    })
      .then((res) => {
        setSimulationResult(res);
        setSimulating(false);
        // Default scenario title
        setScenarioTitle(
          `${res.district_name} ${res.occupation_name} Target ${res.simulated_seats} Seats`
        );
      })
      .catch((err) => {
        console.error(err);
        setSimulating(false);
      });
  };

  useEffect(() => {
    if (metadata) {
      handleRunSimulation();
    }
  }, [metadata, selectedState, selectedDistrict, selectedOccupation, horizonMonths]);

  const handleSaveScenario = async () => {
    if (!simulationResult) return;
    setSaving(true);
    try {
      const created = await saveScenario({
        title: scenarioTitle || `Simulation ${new Date().toLocaleDateString()}`,
        state_code: selectedState,
        district_code: selectedDistrict,
        occupation_id: selectedOccupation,
        horizon_months: horizonMonths,
        baseline_seats: simulationResult.baseline_seats,
        proposed_seats: simulationResult.simulated_seats,
        baseline_gap: simulationResult.baseline_gap,
        simulated_gap: simulationResult.simulated_gap,
        notes: scenarioNotes,
      });
      setSavedScenarios((prev) => [created, ...prev]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Districts for selected state
  const stateDistricts = metadata?.states.find((s) => s.code === selectedState)?.districts || [];

  // Data for comparison chart
  const comparisonData = simulationResult
    ? [
        {
          metric: 'Sanctioned Intake',
          Baseline: simulationResult.baseline_seats,
          Simulated: simulationResult.simulated_seats,
        },
        {
          metric: 'Effective Supply',
          Baseline: Math.round(simulationResult.baseline_effective_supply),
          Simulated: Math.round(simulationResult.simulated_effective_supply),
        },
        {
          metric: 'Labour Demand',
          Baseline: Math.round(simulationResult.baseline_demand),
          Simulated: Math.round(simulationResult.baseline_demand),
        },
        {
          metric: 'Net Gap (Deficit)',
          Baseline: Math.round(simulationResult.baseline_gap),
          Simulated: Math.round(simulationResult.simulated_gap),
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-gold-500/30 shadow-navy-card">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-gold-400" />
          Interactive Training Capacity Scenario Planner ("What If?")
        </h3>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Simulate how adjusting sanctioned training seats in accredited centres influences forecasted net workforce deficits or surplus risks across pilot districts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-navy-800">
            <Sliders className="w-4 h-4 text-gold-400" /> Simulation Parameters
          </h4>

          {/* State & District */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">State</label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  const firstDist = metadata?.states.find((s) => s.code === e.target.value)?.districts[0]?.code;
                  if (firstDist) setSelectedDistrict(firstDist);
                }}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-gold-500"
              >
                {metadata?.states.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-gold-500"
              >
                {stateDistricts.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Target Trade / Role</label>
              <select
                value={selectedOccupation}
                onChange={(e) => setSelectedOccupation(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-gold-500"
              >
                {metadata?.occupations.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Horizon */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Planning Horizon</label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 6, 12].map((m) => (
                  <button
                    key={m}
                    onClick={() => setHorizonMonths(m)}
                    className={`py-1 text-xs font-semibold rounded border transition-colors ${
                      horizonMonths === m
                        ? 'bg-gold-500 text-navy-950 border-gold-400'
                        : 'bg-navy-950 text-slate-300 border-navy-800 hover:border-slate-700'
                    }`}
                  >
                    {m} Months
                  </button>
                ))}
              </div>
            </div>

            {/* Proposed Seats Slider */}
            <div className="pt-2 border-t border-navy-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300">Proposed Sanctioned Seats</span>
                <span className="font-mono text-gold-400 font-bold text-sm">{targetSeats} Seats</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={targetSeats}
                onChange={(e) => setTargetSeats(Number(e.target.value))}
                className="w-full accent-gold-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>50 Seats</span>
                <span>500 Seats</span>
                <span>1000 Seats</span>
              </div>
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={simulating}
              className="w-full mt-2 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-gold-glow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{simulating ? 'Calculating...' : 'Recalculate Gap Simulation'}</span>
            </button>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2 space-y-6">
          {simulationResult && (
            <div className="p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-navy-800">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Simulation Outcome: {simulationResult.district_name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {simulationResult.occupation_name} ({simulationResult.horizon_months}M Target)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Revised Severity:</span>
                  <StatusBadge status={simulationResult.simulated_severity} />
                </div>
              </div>

              {/* Side by side comparison metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-navy-950 border border-navy-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Baseline Seats</span>
                  <span className="font-mono text-base font-bold text-slate-300">
                    {simulationResult.baseline_seats}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Current Capacity</span>
                </div>

                <div className="p-3 rounded-lg bg-navy-950 border border-gold-500/40">
                  <span className="text-[10px] text-gold-400 uppercase font-bold block">Simulated Seats</span>
                  <span className="font-mono text-base font-bold text-gold-300">
                    {simulationResult.simulated_seats}
                  </span>
                  <span className="text-[10px] text-gold-400/80 block">
                    {simulationResult.simulated_seats > simulationResult.baseline_seats
                      ? `+${simulationResult.simulated_seats - simulationResult.baseline_seats} Delta`
                      : `${simulationResult.simulated_seats - simulationResult.baseline_seats} Delta`}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-navy-950 border border-navy-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Baseline Gap</span>
                  <span className="font-mono text-base font-bold text-rose-400">
                    +{Math.round(simulationResult.baseline_gap)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {simulationResult.baseline_gap_rate}% Deficit
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-navy-950 border border-emerald-500/40">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">Simulated Gap</span>
                  <span className="font-mono text-base font-bold text-emerald-300">
                    {simulationResult.simulated_gap > 0
                      ? `+${Math.round(simulationResult.simulated_gap)}`
                      : Math.round(simulationResult.simulated_gap)}
                  </span>
                  <span className="text-[10px] text-emerald-400/80 block">
                    {simulationResult.simulated_gap_rate}% Rate
                  </span>
                </div>
              </div>

              {/* Visual Comparison Chart */}
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="metric" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0B1528', borderColor: '#2A4E7F', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Baseline" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Simulated" fill="#F5A623" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Simulation Note Disclaimer */}
              <div className="p-3 rounded-lg bg-navy-950 border border-navy-800 flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
                <Info className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span>{simulationResult.simulation_note}</span>
              </div>

              {/* Save Scenario Box */}
              <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-gold-400" /> Save Simulation as Planning Scenario
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Scenario title..."
                    value={scenarioTitle}
                    onChange={(e) => setScenarioTitle(e.target.value)}
                    className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                  <input
                    type="text"
                    placeholder="Notes or institutional rationale..."
                    value={scenarioNotes}
                    onChange={(e) => setScenarioNotes(e.target.value)}
                    className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  {saveSuccess ? (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Scenario successfully saved!
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">Persists scenario parameters into database</span>
                  )}
                  <button
                    onClick={handleSaveScenario}
                    disabled={saving}
                    className="px-4 py-1.5 rounded-lg bg-navy-800 hover:bg-gold-500/20 text-gold-300 border border-navy-700 hover:border-gold-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save Scenario'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Saved Scenarios List */}
          {savedScenarios.length > 0 && (
            <div className="p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-gold-400" /> Saved Planning Scenarios
              </h4>
              <div className="space-y-2">
                {savedScenarios.map((sc) => (
                  <div
                    key={sc.id}
                    className="p-3 rounded-lg bg-navy-950 border border-navy-800 flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-white">{sc.title}</p>
                      <p className="text-[11px] text-slate-400">
                        {sc.district_code} • {sc.occupation_id} • {sc.horizon_months}M Horizon
                      </p>
                      {sc.notes && <p className="text-[10px] text-slate-500 mt-1 italic">{sc.notes}</p>}
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-gold-300 font-bold block">
                        {sc.baseline_seats} → {sc.proposed_seats} Seats
                      </span>
                      <span className="text-[10px] text-emerald-400">
                        Gap {Math.round(sc.baseline_gap)} → {Math.round(sc.simulated_gap)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
