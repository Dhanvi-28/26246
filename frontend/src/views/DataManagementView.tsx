import React, { useState, useEffect } from 'react';
import {
  Database,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Download,
  RefreshCw,
  FileSpreadsheet,
  Check,
  X,
  History,
  ShieldCheck
} from 'lucide-react';
import { SourceMetadataItem, ImportLogItem } from '../types/api';
import { fetchSources, fetchImportLogs, validateImportFile, executeImportFile, resetDemoData } from '../lib/api';

export const DataManagementView: React.FC = () => {
  const [sources, setSources] = useState<SourceMetadataItem[]>([]);
  const [logs, setLogs] = useState<ImportLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // Reseed state
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([fetchSources(), fetchImportLogs()])
      .then(([sData, lData]) => {
        setSources(sData);
        setLogs(lData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setValidationResult(null);
    setImportSuccessMessage(null);
    setValidating(true);

    try {
      const res = await validateImportFile(selected);
      setValidationResult(res);
    } catch (err: any) {
      console.error(err);
      setValidationResult({
        valid: false,
        total_rows: 0,
        errors: [{ row_number: 0, column: 'file', error_message: err.message || 'File validation error' }],
        summary_message: 'Validation failed.',
      });
    } finally {
      setValidating(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const res = await executeImportFile(file);
      setImportSuccessMessage(res.message);
      setValidationResult(null);
      setFile(null);
      loadData();
    } catch (err: any) {
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  const handleResetPilotData = async () => {
    if (!confirm('Are you sure you want to reseed all synthetic pilot records back to default state?')) {
      return;
    }
    setResetting(true);
    try {
      const res = await resetDemoData();
      setResetMessage(res.message);
      loadData();
      setTimeout(() => setResetMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      'period,state_code,district_code,sector_id,occupation_id,job_postings_count,unique_employer_count,estimated_vacancies\n' +
      '2025-11,KA,KA_BLRU,SEC_RENEWABLE,OCC_SOLAR_TECH,310,48,450\n' +
      '2025-11,KA,KA_BLRU,SEC_MANUFACTURING,OCC_EV_SERVICE,290,42,420\n' +
      '2025-12,KA,KA_BLRU,SEC_HEALTHCARE,OCC_NURSE_SPEC,395,58,520\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'demand_observations_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 rounded-xl bg-navy-900 border border-navy-800" />
        <div className="h-64 rounded-xl bg-navy-900 border border-navy-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Pilot Reseed Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-gold-500/30 shadow-navy-card">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-gold-400" />
            Data Ingestion & Provenance Management
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Manage public employment feeds, upload localized recruitment CSV observations, review validation audits, and manage pipeline resets.
          </p>
        </div>

        <button
          onClick={handleResetPilotData}
          disabled={resetting}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-navy-800 hover:bg-gold-500/20 text-gold-300 border border-navy-700 hover:border-gold-500/40 text-xs font-semibold transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Reseeding...' : 'Reseed Pilot Dataset'}</span>
        </button>
      </div>

      {resetMessage && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Upload & Validation Flow */}
      <div className="p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-navy-800">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-gold-400" />
              Ingest District Observations via CSV
            </h4>
            <p className="text-xs text-slate-400">
              Upload monthly demand postings or training numbers with pre-commit schema validation
            </p>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-950 hover:bg-navy-850 text-slate-300 border border-navy-700 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-gold-400" />
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* Upload drop zone */}
        <div className="border-2 border-dashed border-navy-700 hover:border-gold-500/50 rounded-xl p-6 text-center space-y-3 bg-navy-950/50 transition-colors">
          <FileSpreadsheet className="w-10 h-10 text-gold-400 mx-auto" />
          <div className="space-y-1">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-bold transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Select CSV File</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            <p className="text-xs text-slate-400">or drop your CSV file here</p>
          </div>
          {file && (
            <p className="text-xs text-gold-300 font-mono">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        {validating && (
          <div className="p-4 text-center text-xs text-slate-400 animate-pulse">
            Validating row headers, formats, and values...
          </div>
        )}

        {/* Validation Result Preview */}
        {validationResult && (
          <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {validationResult.valid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                )}
                <div>
                  <h5 className="text-xs font-bold text-white">
                    {validationResult.summary_message}
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    Total Rows Analyzed: {validationResult.total_rows}
                  </p>
                </div>
              </div>

              {validationResult.valid && (
                <button
                  onClick={handleExecuteImport}
                  disabled={importing}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  {importing ? 'Ingesting Records...' : 'Confirm & Ingest CSV'}
                </button>
              )}
            </div>

            {/* Error Preview if Invalid */}
            {!validationResult.valid && validationResult.errors.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                  Validation Errors Found:
                </span>
                <div className="max-h-40 overflow-y-auto space-y-1.5 font-mono text-[11px]">
                  {validationResult.errors.map((err: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-rose-950/40 border border-rose-900/60 text-rose-300 flex items-start gap-2"
                    >
                      <span className="font-bold shrink-0">Row {err.row_number}:</span>
                      <span>
                        [{err.column}] {err.error_message} (Value: "{err.value}")
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {importSuccessMessage && (
          <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{importSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Sources Catalogue Table */}
      <div className="p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-gold-400" />
          Active Public Data Source Catalogue & Provenance
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-800 text-slate-400 font-semibold">
                <th className="pb-3">Source Identifier</th>
                <th className="pb-3">Publisher</th>
                <th className="pb-3">Integration Mode</th>
                <th className="pb-3">Frequency</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Limitations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-850">
              {sources.map((s) => (
                <tr key={s.source_id} className="hover:bg-navy-800/40 transition-colors">
                  <td className="py-3 font-semibold text-white">
                    {s.name}
                    <span className="block text-[10px] text-gold-400 font-mono">{s.source_id}</span>
                  </td>
                  <td className="py-3 text-slate-300">{s.publisher}</td>
                  <td className="py-3 text-slate-400">{s.access_method}</td>
                  <td className="py-3 text-slate-300">{s.frequency}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        s.status === 'Connected'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                          : s.status === 'Synthetic Sample'
                          ? 'bg-gold-500/10 text-gold-300 border-gold-500/30'
                          : 'bg-sky-950/60 text-sky-300 border-sky-500/30'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 text-[11px] text-slate-400 max-w-xs">{s.limitations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ingestion History Logs */}
      {logs.length > 0 && (
        <div className="p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-gold-400" />
            Ingestion Audit History
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-navy-800 text-slate-400 font-semibold">
                  <th className="pb-2.5">Import Timestamp</th>
                  <th className="pb-2.5">File Name</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Accepted Rows</th>
                  <th className="pb-2.5 text-right">Rejected Rows</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-850">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-navy-800/40">
                    <td className="py-2.5 text-slate-300">{new Date(l.imported_at).toLocaleString()}</td>
                    <td className="py-2.5 font-mono text-slate-200">{l.filename}</td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          l.status === 'Success'
                            ? 'bg-emerald-950 text-emerald-300'
                            : 'bg-rose-950 text-rose-300'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-emerald-400">{l.accepted_rows}</td>
                    <td className="py-2.5 text-right font-mono text-rose-400">{l.rejected_rows}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
