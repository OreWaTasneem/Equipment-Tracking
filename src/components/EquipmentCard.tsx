import React, { useEffect, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Radio,
  RotateCcw,
  User,
  Zap
} from 'lucide-react';
import { Equipment } from '../models/Equipment';
import { formatDuration, getCategoryIcon, getStatusBadgeClass } from '../utils/formatters';

interface EquipmentCardProps {
  equipment: Equipment;
  onSelect: (equipment: Equipment) => void;
  onCheckOut: (equipment: Equipment) => void;
  onReturn: (equipment: Equipment) => void;
  onOpenSimulator: (equipment: Equipment) => void;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  onSelect,
  onCheckOut,
  onReturn,
  onOpenSimulator
}) => {
  const isCheckedOut = equipment.status === 'In Use' && equipment.activeSession;
  const session = equipment.activeSession;

  // Live timer for active checkouts
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    if (!session) return;
    const calculate = () => {
      const startMs = new Date(session.startTime).getTime();
      const diffMins = Math.max(1, Math.round((Date.now() - startMs) / (1000 * 60)));
      setElapsedMinutes(diffMins);
    };

    calculate();
    const interval = setInterval(calculate, 15000);
    return () => clearInterval(interval);
  }, [session]);

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-200 hover:border-cyan-400 hover:shadow-md">
      
      {/* Top Meta Bar */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
              {equipment.assetTag}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${getStatusBadgeClass(equipment.status)}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${equipment.status === 'In Use' ? 'bg-cyan-500 animate-ping' : 'bg-current'}`} />
              {equipment.status}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onOpenSimulator(equipment)}
              title="Open in Virtual Bench Simulator"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
            >
              <Radio className="h-4 w-4" />
            </button>
            <button
              onClick={() => onSelect(equipment)}
              title="Inspect Datasheet & Hardware Test"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-cyan-600 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Title & Model */}
        <div className="flex items-start gap-3 my-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 group-hover:border-cyan-300 group-hover:bg-cyan-100/60 transition-all">
            {getCategoryIcon(equipment.category, 'h-5 w-5')}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-cyan-700 transition-colors">
              {equipment.name}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {equipment.manufacturer} • {equipment.model}
            </p>
          </div>
        </div>

        {/* Bench Location & Power Specs */}
        <div className="mt-3.5 flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-slate-500 border-t border-slate-100 pt-3">
          <span className="flex items-center gap-1 font-mono text-slate-700">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            {equipment.location}
          </span>
          <span className="flex items-center gap-1 font-mono text-amber-600">
            <Zap className="h-3.5 w-3.5" />
            {equipment.powerRatingWatts}W
          </span>
          <span className="flex items-center gap-1 font-mono text-slate-700">
            <Activity className="h-3.5 w-3.5 text-cyan-600" />
            {equipment.totalUsageHours}h logged
          </span>
        </div>

        {/* Active Session Display if In Use */}
        {isCheckedOut && session && (
          <div className="mt-3.5 rounded-xl border border-cyan-200 bg-cyan-50/70 p-3 text-xs text-cyan-900">
            <div className="flex items-center justify-between font-semibold text-cyan-900 mb-1">
              <span className="flex items-center gap-1.5 truncate">
                <User className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
                <span className="truncate">{session.userName}</span>
              </span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-cyan-700 shrink-0">
                <Clock className="h-3 w-3 animate-spin" />
                {formatDuration(elapsedMinutes)}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 truncate font-mono">
              Project: {session.projectName}
            </p>
          </div>
        )}
      </div>

      {/* Card Action Buttons */}
      <div className="mt-5 flex items-center gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={() => onSelect(equipment)}
          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all text-center"
        >
          Details
        </button>

        {equipment.status === 'Available' ? (
          <button
            onClick={() => onCheckOut(equipment)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 py-2 px-3 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Check Out
          </button>
        ) : equipment.status === 'In Use' ? (
          <button
            onClick={() => onReturn(equipment)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 py-2 px-3 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Return Device
          </button>
        ) : (
          <button
            onClick={() => onSelect(equipment)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 py-2 px-3 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
          >
            Inspect
          </button>
        )}
      </div>

    </div>
  );
};
