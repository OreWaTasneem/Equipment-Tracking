import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  RotateCcw,
  ShieldCheck,
  User,
  Zap
} from 'lucide-react';
import { Equipment } from '../models/Equipment';
import { ActiveSession } from '../types/equipment';
import { formatDuration, getCategoryIcon } from '../utils/formatters';

interface ActiveSessionsViewProps {
  activeSessions: { equipment: Equipment; session: ActiveSession }[];
  onReturn: (equipment: Equipment) => void;
  onInspect: (equipment: Equipment) => void;
}

export const ActiveSessionsView: React.FC<ActiveSessionsViewProps> = ({
  activeSessions,
  onReturn,
  onInspect
}) => {
  // Real-time ticker
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalCurrentDrawWatts = activeSessions.reduce((acc, item) => acc + item.equipment.powerRatingWatts, 0);

  return (
    <div className="space-y-5">
      
      {/* Top Telemetry Header */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3">
                <span className="h-full w-full animate-ping rounded-full bg-cyan-500 opacity-75"></span>
              </span>
              <h2 className="text-lg font-bold text-slate-900">Live Instrument Sessions & Bench Occupancy</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time monitoring of currently running lab equipment, operator timers, and instantaneous bench power consumption.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2 border border-slate-200 font-mono text-xs">
              <Zap className="h-4 w-4 text-amber-500 animate-pulse" />
              <span className="text-slate-500">Total Live Draw:</span>
              <strong className="text-amber-700">{totalCurrentDrawWatts} W</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions Grid */}
      {activeSessions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
            <Clock className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Instruments Currently In Use</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            All lab equipment is available in storage or on workbenches. Check out any instrument from the Inventory tab to begin an active session.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeSessions.map(({ equipment, session }) => {
            const startMs = new Date(session.startTime).getTime();
            const elapsedSecsTotal = Math.max(0, Math.floor((now - startMs) / 1000));
            const elapsedHours = Math.floor(elapsedSecsTotal / 3600);
            const elapsedMins = Math.floor((elapsedSecsTotal % 3600) / 60);
            const elapsedSecs = elapsedSecsTotal % 60;

            const expectedSecs = session.expectedDurationHours * 3600;
            const progressPercent = Math.min(100, Math.round((elapsedSecsTotal / expectedSecs) * 100));
            const isOverTime = elapsedSecsTotal > expectedSecs;

            const liveEnergyKWh = ((equipment.powerRatingWatts * (elapsedSecsTotal / 3600)) / 1000).toFixed(4);

            return (
              <div
                key={session.sessionId}
                className="rounded-2xl border border-cyan-200 bg-white p-5 shadow-sm relative overflow-hidden transition-all hover:border-cyan-400"
              >
                {/* Visual pulse glow on card top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-500 animate-pulse" />

                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
                      {getCategoryIcon(equipment.category, 'h-6 w-6')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                          {equipment.assetTag}
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                          {session.benchLocation}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                        {equipment.name}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => onInspect(equipment)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>

                {/* Operator Details */}
                <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <User className="h-3.5 w-3.5 text-cyan-600" />
                      Operator:
                    </span>
                    <strong className="text-slate-900 font-semibold">{session.userName}</strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500">Role & Project:</span>
                    <span className="text-right truncate max-w-[200px] text-cyan-700 font-mono text-[11px] font-medium">
                      {session.projectName} ({session.userRole})
                    </span>
                  </div>

                  {session.purposeNotes && (
                    <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200">
                      "{session.purposeNotes}"
                    </div>
                  )}
                </div>

                {/* Live Clock & Power Telemetry */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className={`rounded-xl p-3 border ${
                    isOverTime 
                      ? 'bg-amber-50 border-amber-200 text-amber-800' 
                      : 'bg-slate-50 border-slate-200 text-cyan-800'
                  }`}>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono uppercase font-semibold">
                      <Clock className="h-3 w-3 animate-spin" /> Elapsed Session
                    </span>
                    <div className="text-lg font-bold font-mono tracking-wider mt-0.5">
                      {String(elapsedHours).padStart(2, '0')}:{String(elapsedMins).padStart(2, '0')}:{String(elapsedSecs).padStart(2, '0')}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Expected: {session.expectedDurationHours}h {isOverTime && '(OVERTIME)'}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-amber-800">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono uppercase font-semibold">
                      <Zap className="h-3 w-3" /> Live Energy
                    </span>
                    <div className="text-lg font-bold font-mono tracking-wider mt-0.5">
                      {liveEnergyKWh} kWh
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      @ {equipment.powerRatingWatts}W rating
                    </span>
                  </div>
                </div>

                {/* Progress bar towards scheduled duration */}
                <div className="mt-3.5">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                    <span>Shift Progress</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        isOverTime ? 'bg-amber-500' : 'bg-gradient-to-r from-cyan-600 to-emerald-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Return Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Session ID: {session.sessionId.slice(0, 12)}...
                  </span>
                  <button
                    onClick={() => onReturn(equipment)}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Check In / Return
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
