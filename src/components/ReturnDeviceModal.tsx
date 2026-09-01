import React, { useEffect, useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  User,
  X,
  Zap
} from 'lucide-react';
import { Equipment } from '../models/Equipment';
import { formatDuration, getCategoryIcon } from '../utils/formatters';

interface ReturnDeviceModalProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (params: {
    notes?: string;
    faultReported?: boolean;
    faultDetails?: string;
  }) => void;
}

export const ReturnDeviceModal: React.FC<ReturnDeviceModalProps> = ({
  equipment,
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !equipment || !equipment.activeSession) return null;

  const session = equipment.activeSession;
  const [elapsedMinutes, setElapsedMinutes] = useState(1);
  const [faultReported, setFaultReported] = useState(false);
  const [faultDetails, setFaultDetails] = useState('');
  const [returnNotes, setReturnNotes] = useState('Experiment concluded successfully. Instrument powered down cleanly.');

  useEffect(() => {
    const calculateElapsed = () => {
      const startMs = new Date(session.startTime).getTime();
      const nowMs = Date.now();
      const mins = Math.max(1, Math.round((nowMs - startMs) / (1000 * 60)));
      setElapsedMinutes(mins);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 10000);
    return () => clearInterval(interval);
  }, [session.startTime]);

  const durationHours = elapsedMinutes / 60;
  const energyKWh = equipment.calculatePowerConsumption(durationHours);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      notes: returnNotes.trim(),
      faultReported,
      faultDetails: faultReported ? faultDetails.trim() : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200">
              {getCategoryIcon(equipment.category, 'h-6 w-6')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-cyan-700 px-2 py-0.5 rounded bg-cyan-50 border border-cyan-200">
                  {equipment.assetTag}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {equipment.manufacturer} {equipment.model}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Check In / Return Equipment
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Active Session Summary Card */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs border-b border-slate-200/80 pb-2">
            <span className="text-slate-600 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-cyan-600" />
              Operator: <strong className="text-slate-900">{session.userName}</strong> ({session.userRole})
            </span>
            <span className="text-xs font-mono text-cyan-700 font-semibold">
              {session.benchLocation}
            </span>
          </div>

          <div className="text-xs text-slate-700">
            <span className="text-slate-500 font-medium">Project:</span> {session.projectName}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Clock className="h-3.5 w-3.5 text-cyan-600" />
                Active Session Duration
              </div>
              <div className="text-base font-bold font-mono text-cyan-700 mt-0.5">
                {formatDuration(elapsedMinutes)} ({elapsedMinutes} mins)
              </div>
            </div>

            <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Calculated Power Used
              </div>
              <div className="text-base font-bold font-mono text-amber-700 mt-0.5">
                {energyKWh} kWh
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Session Findings / Return Comments
            </label>
            <textarea
              rows={2}
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Fault Reporting Option */}
          <div className={`rounded-xl border p-3.5 transition-all ${
            faultReported 
              ? 'border-rose-300 bg-rose-50/80' 
              : 'border-slate-200 bg-slate-50'
          }`}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={faultReported}
                onChange={(e) => setFaultReported(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 bg-white text-rose-600 focus:ring-rose-600 accent-rose-600"
              />
              <span className="text-xs font-semibold text-rose-800 flex items-center gap-1.5">
                <AlertOctagon className="h-4 w-4 text-rose-600" />
                Report Equipment Fault, Blown Fuse, or Calibration Drift
              </span>
            </label>

            {faultReported && (
              <div className="mt-3 space-y-2 border-t border-rose-200 pt-2.5">
                <label className="block text-xs font-medium text-rose-900">
                  Fault Description & Symptoms *
                </label>
                <textarea
                  rows={2}
                  required={faultReported}
                  placeholder="Describe error code, abnormal noise, blown probe ground, or erratic readings..."
                  value={faultDetails}
                  onChange={(e) => setFaultDetails(e.target.value)}
                  className="w-full rounded-lg border border-rose-300 bg-white p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:outline-none"
                />
                <p className="text-[11px] text-rose-700">
                  Instrument will be flagged as "Under Maintenance" and technician notified immediately.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center gap-2 rounded-lg px-5 py-2 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer ${
                faultReported
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete Return & Log History
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
