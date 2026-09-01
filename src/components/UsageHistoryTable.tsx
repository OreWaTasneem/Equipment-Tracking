import React, { useState } from 'react';
import {
  AlertOctagon,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  Filter,
  History,
  MapPin,
  Search,
  User,
  Zap
} from 'lucide-react';
import { LabManager } from '../models/LabManager';
import { EquipmentCategory, UsageHistoryEntry, UserRole } from '../types/equipment';
import { formatDuration, getCategoryIcon } from '../utils/formatters';

interface UsageHistoryTableProps {
  history: UsageHistoryEntry[];
}

export const UsageHistoryTable: React.FC<UsageHistoryTableProps> = ({ history }) => {
  const labManager = LabManager.getInstance();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [faultOnly, setFaultOnly] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<UsageHistoryEntry | null>(null);

  const filteredHistory = history.filter(item => {
    const matchesSearch = 
      item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.equipmentAssetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.benchLocation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || item.userRole === roleFilter;
    const matchesCategory = categoryFilter === 'ALL' || item.equipmentCategory === categoryFilter;
    const matchesFault = !faultOnly || item.faultReported;

    return matchesSearch && matchesRole && matchesCategory && matchesFault;
  });

  const totalFilteredMinutes = filteredHistory.reduce((acc, h) => acc + h.durationMinutes, 0);
  const totalFilteredKWh = filteredHistory.reduce((acc, h) => acc + (h.powerConsumedKWh || 0), 0);

  const handleExportCSV = () => {
    const csvStr = labManager.exportUsageCSV();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `volttrack-usage-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      
      {/* Top Banner & Summary Stats */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-cyan-600" />
              <h2 className="text-lg font-bold text-slate-900">Equipment Usage & Maintenance Audit Trail</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive tamper-evident record of all operator checkouts, duration, power telemetry, and fault reports.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export Audit CSV
            </button>
          </div>
        </div>

        {/* Quick Metric Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
            <span className="text-[11px] text-slate-500">Total Recorded Sessions</span>
            <p className="text-base font-bold font-mono text-slate-900 mt-0.5">{filteredHistory.length} logs</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
            <span className="text-[11px] text-slate-500">Cumulative Time Logged</span>
            <p className="text-base font-bold font-mono text-cyan-700 mt-0.5">{formatDuration(totalFilteredMinutes)}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
            <span className="text-[11px] text-slate-500">Total Power Consumed</span>
            <p className="text-base font-bold font-mono text-amber-700 mt-0.5">{totalFilteredKWh.toFixed(2)} kWh</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
            <span className="text-[11px] text-slate-500">Reported Hardware Faults</span>
            <p className="text-base font-bold font-mono text-rose-600 mt-0.5">
              {filteredHistory.filter(h => h.faultReported).length} incidents
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by instrument, tag, user, or project..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs text-slate-700 focus:border-cyan-600 focus:bg-white focus:outline-none font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="Oscilloscope">Oscilloscopes</option>
            <option value="Function Generator">Function Generators</option>
            <option value="Digital Multimeter">Multimeters</option>
            <option value="DC Power Supply">Power Supplies</option>
            <option value="Spectrum Analyzer">Spectrum Analyzers</option>
            <option value="Soldering & Rework">Soldering & Rework</option>
            <option value="Logic Analyzer">Logic Analyzers</option>
            <option value="LCR Meter">LCR Meters</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs text-slate-700 focus:border-cyan-600 focus:bg-white focus:outline-none font-medium"
          >
            <option value="ALL">All Operator Roles</option>
            <option value="Undergraduate Student">Undergrad Students</option>
            <option value="Graduate Researcher">Grad Researchers</option>
            <option value="Principal Investigator">Principal Investigators</option>
            <option value="Electronics Technician">Technicians</option>
            <option value="Faculty Member">Faculty Members</option>
          </select>

          {/* Faults Only Toggle */}
          <button
            onClick={() => setFaultOnly(!faultOnly)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
              faultOnly
                ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertOctagon className="h-3.5 w-3.5" />
            Faults Only
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
            <tr>
              <th className="py-3 px-4">Log ID & Tag</th>
              <th className="py-3 px-4">Equipment</th>
              <th className="py-3 px-4">Operator & Role</th>
              <th className="py-3 px-4">Project / Bench</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Energy</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  No usage history records found matching your filters.
                </td>
              </tr>
            ) : (
              filteredHistory.map(entry => {
                const startDate = new Date(entry.startTime).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-cyan-700">{entry.equipmentAssetTag}</div>
                      <div className="text-[10px] text-slate-400">{entry.id}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-600">
                          {getCategoryIcon(entry.equipmentCategory, 'h-4 w-4')}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900 max-w-[200px] truncate">{entry.equipmentName}</div>
                          <div className="text-[11px] text-slate-500">{entry.equipmentCategory}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{entry.userName}</div>
                      <div className="text-[11px] text-slate-500">{entry.userRole}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-700 max-w-[180px] truncate">{entry.projectName}</div>
                      <div className="text-[11px] font-mono text-cyan-700">{entry.benchLocation}</div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {startDate}
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {formatDuration(entry.durationMinutes)}
                    </td>

                    <td className="py-3 px-4 font-mono text-amber-700 font-medium">
                      {entry.powerConsumedKWh} kWh
                    </td>

                    <td className="py-3 px-4 text-center">
                      {entry.faultReported ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                          <AlertOctagon className="h-3 w-3" />
                          FAULT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          OK
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all shadow-xs"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Selected Entry Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs text-cyan-700">{selectedEntry.id}</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedEntry.equipmentName}</h3>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Asset Tag:</span>
                <span className="font-mono text-slate-900 font-semibold">{selectedEntry.equipmentAssetTag}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Researcher / Operator:</span>
                <span className="text-slate-900 font-medium">{selectedEntry.userName} ({selectedEntry.userRole})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Project / Experiment:</span>
                <span className="text-slate-900">{selectedEntry.projectName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Workbench Location:</span>
                <span className="font-mono text-cyan-700 font-semibold">{selectedEntry.benchLocation}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Duration:</span>
                <span className="font-mono text-slate-900 font-semibold">{formatDuration(selectedEntry.durationMinutes)} ({selectedEntry.durationMinutes} mins)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Power Consumed:</span>
                <span className="font-mono text-amber-700 font-semibold">{selectedEntry.powerConsumedKWh} kWh</span>
              </div>

              {selectedEntry.faultReported && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-800">
                  <div className="font-bold flex items-center gap-1 text-xs">
                    <AlertOctagon className="h-4 w-4 text-rose-600" />
                    Reported Fault Details:
                  </div>
                  <p className="mt-1 text-xs">{selectedEntry.faultDetails || 'Fault flagged upon check-in.'}</p>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-slate-500 block mb-1 font-semibold">Session Findings / Notes:</span>
                <p className="text-slate-800">{selectedEntry.notes}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedEntry(null)}
                className="rounded-lg bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
