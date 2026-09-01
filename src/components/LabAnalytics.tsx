import React from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  CheckCircle2,
  Cpu,
  ShieldAlert,
  Wrench,
  Zap
} from 'lucide-react';
import { Equipment } from '../models/Equipment';
import { LabManager } from '../models/LabManager';

interface LabAnalyticsProps {
  equipmentList: Equipment[];
  onSelectEquipment: (equipment: Equipment) => void;
  onOpenCalibration: (equipment: Equipment) => void;
}

export const LabAnalytics: React.FC<LabAnalyticsProps> = ({
  equipmentList,
  onSelectEquipment,
  onOpenCalibration
}) => {
  const labManager = LabManager.getInstance();
  const stats = labManager.getLabStatistics();

  const overdueEquipment = equipmentList.filter(e => e.isCalibrationOverdue());
  const maintenanceEquipment = equipmentList.filter(e => e.status === 'Under Maintenance');

  return (
    <div className="space-y-4">
      
      {/* Calibration & Maintenance Alert Notices if Any */}
      {(overdueEquipment.length > 0 || maintenanceEquipment.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Calibration Overdue Alert */}
          {overdueEquipment.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 font-mono uppercase tracking-wider mb-1">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Calibration Verification Required ({overdueEquipment.length})
              </div>
              <p className="text-xs text-amber-700/90 mb-3">
                ISO-17025 certified calibration intervals have expired on the following lab instruments:
              </p>
              <div className="space-y-2">
                {overdueEquipment.map(eq => (
                  <div key={eq.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-amber-200 text-xs shadow-xs">
                    <div>
                      <span className="font-mono font-bold text-amber-800">{eq.assetTag}</span>
                      <span className="text-slate-700 ml-2 font-medium">{eq.name}</span>
                    </div>
                    <button
                      onClick={() => onOpenCalibration(eq)}
                      className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] transition-all cursor-pointer shadow-xs"
                    >
                      Calibrate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance / Repair Alert */}
          {maintenanceEquipment.length > 0 && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-800 font-mono uppercase tracking-wider mb-1">
                <Wrench className="h-4 w-4 text-rose-600" />
                Active Maintenance & Repair Tickets ({maintenanceEquipment.length})
              </div>
              <p className="text-xs text-rose-700/90 mb-3">
                Instruments flagged with hardware faults or blown safety fuses during checkout:
              </p>
              <div className="space-y-2">
                {maintenanceEquipment.map(eq => (
                  <div key={eq.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-rose-200 text-xs shadow-xs">
                    <div>
                      <span className="font-mono font-bold text-rose-800">{eq.assetTag}</span>
                      <span className="text-slate-700 ml-2 font-medium">{eq.name}</span>
                    </div>
                    <button
                      onClick={() => onSelectEquipment(eq)}
                      className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] transition-all cursor-pointer shadow-xs"
                    >
                      Diagnose
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
            <Cpu className="h-3.5 w-3.5 text-cyan-600" /> Inventory
          </span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{stats.totalDevices}</p>
          <span className="text-[10px] text-slate-400 font-mono">Lab instruments</span>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
            <Zap className="h-3.5 w-3.5 text-cyan-600" /> In Use
          </span>
          <p className="text-2xl font-bold font-mono text-cyan-700 mt-1">{stats.inUseCount}</p>
          <span className="text-[10px] text-cyan-600/80 font-mono">Active sessions</span>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Available
          </span>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">{stats.availableCount}</p>
          <span className="text-[10px] text-emerald-600/80 font-mono">Ready to use</span>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
            <Activity className="h-3.5 w-3.5 text-amber-500" /> Utilization
          </span>
          <p className="text-2xl font-bold font-mono text-amber-700 mt-1">{stats.utilizationRate}%</p>
          <span className="text-[10px] text-slate-400 font-mono">Bench occupancy</span>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
            <Award className="h-3.5 w-3.5 text-emerald-600" /> Health Score
          </span>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">{stats.avgHealthScore}%</p>
          <span className="text-[10px] text-slate-400 font-mono">Overall fleet avg</span>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
            <Zap className="h-3.5 w-3.5 text-amber-500" /> Total Energy
          </span>
          <p className="text-2xl font-bold font-mono text-amber-700 mt-1">{stats.totalKWhConsumed} <span className="text-xs">kWh</span></p>
          <span className="text-[10px] text-slate-400 font-mono">{stats.totalUsageHours} hrs total</span>
        </div>

      </div>

    </div>
  );
};
