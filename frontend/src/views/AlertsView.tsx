import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  Filter,
  Check,
  Clock,
  ShieldAlert,
  Flame,
  Layers
} from 'lucide-react';
import { AlertItem } from '../types/api';
import { fetchAlerts, updateAlertStatus } from '../lib/api';
import { StatusBadge } from '../components/StatusBadge';

interface AlertsViewProps {
  filterParams: Record<string, string>;
  onAlertUpdated?: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ filterParams, onAlertUpdated }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadAlerts = () => {
    setLoading(true);
    const params: Record<string, string> = { ...filterParams };
    if (statusFilter) params.status = statusFilter;

    fetchAlerts(params)
      .then((res) => {
        setAlerts(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAlerts();
  }, [JSON.stringify(filterParams), statusFilter]);

  const handleUpdateStatus = async (alertId: number, newStatus: string) => {
    setUpdatingId(alertId);
    try {
      await updateAlertStatus(alertId, newStatus);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a))
      );
      if (onAlertUpdated) onAlertUpdated();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-navy-900 border border-navy-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-navy-900/90 border border-navy-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-gold-400" />
            Early Warning Incident Monitor
          </h3>
          <p className="text-xs text-slate-400">
            Systemic shortage deficits, sudden recruitment spikes, and surplus capacity alarms
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-gold-500"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-navy-900 border border-navy-800 text-slate-400">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
          <p className="font-semibold text-white">No active warnings for selected scope.</p>
          <p className="text-xs mt-1">All occupational pipelines are within permissible stability thresholds.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {alerts.map((alert) => {
            const isShortage = alert.alert_type === 'shortage';
            const isResolved = alert.status === 'resolved';
            const isAcknowledged = alert.status === 'acknowledged';

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-xl border transition-all ${
                  isResolved
                    ? 'bg-navy-900/40 border-navy-800 opacity-60'
                    : isShortage
                    ? 'bg-navy-900/90 border-rose-500/30 shadow-sm'
                    : 'bg-navy-900/90 border-purple-500/30 shadow-sm'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={alert.severity} size="sm" />
                      <span className="font-bold text-sm text-white">
                        {alert.occupation_name}
                      </span>
                      <span className="text-xs text-slate-400">
                        • {alert.district_name}, {alert.state_name} ({alert.sector_name})
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-200 mt-2">
                      {alert.reason}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed font-mono text-[11px] bg-navy-950 p-2.5 rounded-lg border border-navy-800 mt-2">
                      Evidence: {alert.evidence}
                    </p>
                  </div>

                  {/* Actions & Status Pill */}
                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          isResolved
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : isAcknowledged
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-950 text-rose-300 border border-rose-500/40 animate-pulse'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>

                    {/* Operational Action Buttons */}
                    <div className="flex items-center gap-2 mt-1">
                      {alert.status === 'open' && (
                        <button
                          onClick={() => handleUpdateStatus(alert.id, 'acknowledged')}
                          disabled={updatingId === alert.id}
                          className="px-2.5 py-1 rounded bg-navy-800 hover:bg-gold-500/20 text-gold-300 border border-navy-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3" /> Acknowledge
                        </button>
                      )}

                      {alert.status !== 'resolved' && (
                        <button
                          onClick={() => handleUpdateStatus(alert.id, 'resolved')}
                          disabled={updatingId === alert.id}
                          className="px-2.5 py-1 rounded bg-navy-800 hover:bg-emerald-500/20 text-emerald-300 border border-navy-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3 h-3" /> Mark Resolved
                        </button>
                      )}

                      {alert.status === 'resolved' && (
                        <button
                          onClick={() => handleUpdateStatus(alert.id, 'open')}
                          disabled={updatingId === alert.id}
                          className="px-2 py-1 rounded bg-navy-800 text-slate-400 hover:text-white border border-navy-700 text-xs font-medium"
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
