import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  Cpu,
  FileCheck,
  Hash,
  MapPin,
  Play,
  QrCode,
  Radio,
  ShieldCheck,
  Wrench,
  X,
  Zap
} from 'lucide-react';
import { Equipment } from '../models/Equipment';
import { getCategoryIcon, getStatusBadgeClass } from '../utils/formatters';

interface EquipmentDetailModalProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckOut: (equipment: Equipment) => void;
  onReturn: (equipment: Equipment) => void;
  onCalibrate: (equipmentId: string, certNo: string, technician: string) => void;
  onOpenSimulator: (equipment: Equipment) => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  equipment,
  isOpen,
  onClose,
  onCheckOut,
  onReturn,
  onCalibrate,
  onOpenSimulator
}) => {
  if (!isOpen || !equipment) return null;

  const [activeTab, setActiveTab] = useState<'specs' | 'diagnostics' | 'safety' | 'calibration'>('specs');
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<ReturnType<typeof equipment.runSelfTest> | null>(null);

  // Calibration Form State
  const [certNo, setCertNo] = useState(`CAL-CERT-${Date.now().toString().slice(-6)}`);
  const [technician, setTechnician] = useState('Certified Metrology Lab Tech');
  const [calSuccess, setCalSuccess] = useState(false);

  const specs = equipment.getDetailedSpecs();
  const safetyList = equipment.getSafetyChecklist();
  const daysUntilCal = equipment.getDaysUntilCalibrationDue();
  const isOverdue = equipment.isCalibrationOverdue();

  const handleRunSelfTest = () => {
    setIsRunningTest(true);
    setTestResult(null);
    setTimeout(() => {
      const result = equipment.runSelfTest();
      setTestResult(result);
      setIsRunningTest(false);
    }, 900);
  };

  const handlePerformCalibration = (e: React.FormEvent) => {
    e.preventDefault();
    onCalibrate(equipment.id, certNo, technician);
    setCalSuccess(true);
    setTimeout(() => setCalSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-6">
        
        {/* Top Header with Instrument Visual Accent */}
        <div className="bg-slate-50 p-6 border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 border border-cyan-200 shadow-xs">
                {getCategoryIcon(equipment.category, 'h-7 w-7')}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                    {equipment.assetTag}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getStatusBadgeClass(equipment.status)}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${equipment.status === 'In Use' ? 'bg-cyan-500 animate-ping' : 'bg-current'}`} />
                    {equipment.status}
                  </span>
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {equipment.location}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-slate-900">
                  {equipment.name}
                </h1>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {equipment.manufacturer} • Model: <strong className="text-slate-800">{equipment.model}</strong> • SN: {equipment.serialNumber}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200">
            <div className="rounded-xl bg-white p-2.5 border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-amber-500" /> Power Rating
              </span>
              <p className="text-sm font-bold font-mono text-slate-800 mt-0.5">{equipment.powerRatingWatts} Watts</p>
            </div>

            <div className="rounded-xl bg-white p-2.5 border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Activity className="h-3.5 w-3.5 text-cyan-600" /> Total Usage
              </span>
              <p className="text-sm font-bold font-mono text-cyan-700 mt-0.5">{equipment.totalUsageHours} hrs</p>
            </div>

            <div className="rounded-xl bg-white p-2.5 border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5 text-emerald-600" /> Health Score
              </span>
              <p className="text-sm font-bold font-mono text-emerald-700 mt-0.5">{equipment.healthScore}%</p>
            </div>

            <div className="rounded-xl bg-white p-2.5 border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-indigo-500" /> Cal Due
              </span>
              <p className={`text-sm font-bold font-mono mt-0.5 ${isOverdue ? 'text-amber-600' : 'text-slate-800'}`}>
                {isOverdue ? 'OVERDUE' : `${daysUntilCal} days`}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white">
          <button
            onClick={() => setActiveTab('specs')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'specs'
                ? 'border-cyan-600 text-cyan-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'diagnostics'
                ? 'border-cyan-600 text-cyan-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            Hardware Self-Test
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'safety'
                ? 'border-cyan-600 text-cyan-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Safety Protocols
          </button>
          <button
            onClick={() => setActiveTab('calibration')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'calibration'
                ? 'border-cyan-600 text-cyan-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            Calibration & Compliance
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 max-h-[50vh] overflow-y-auto space-y-4 bg-white">
          
          {/* TAB: Specifications */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 divide-y divide-slate-200">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 text-xs">
                    <span className="text-slate-500 capitalize font-medium">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="font-mono text-slate-900 font-semibold text-right">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>

              {equipment.notes && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700">
                  <span className="font-semibold text-slate-500 block mb-1">Lab Admin Notes:</span>
                  {equipment.notes}
                </div>
              )}

              {/* Barcode / Asset Tag Reference */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <QrCode className="h-8 w-8 text-cyan-600" />
                  <div>
                    <div className="text-[11px] text-slate-500">Barcode / Asset Registry</div>
                    <div className="text-xs font-mono font-bold text-slate-900 tracking-widest">{equipment.assetTag}</div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  ISO-17025 Calibrated
                </span>
              </div>
            </div>
          )}

          {/* TAB: Diagnostics / Self-Test */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Automated Instrument Self-Test</h3>
                    <p className="text-xs text-slate-500">
                      Executes internal ADC baseline alignment, PLL lock checks, and relay continuity sweeps.
                    </p>
                  </div>
                  <button
                    onClick={handleRunSelfTest}
                    disabled={isRunningTest}
                    className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 disabled:opacity-50 cursor-pointer"
                  >
                    <Play className={`h-3.5 w-3.5 ${isRunningTest ? 'animate-spin' : ''}`} />
                    {isRunningTest ? 'Running Sweep...' : 'Run Self-Test'}
                  </button>
                </div>

                {isRunningTest && (
                  <div className="py-6 text-center space-y-3">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
                    <p className="text-xs font-mono text-cyan-700">
                      Querying SCPI diagnostics register and sweeping hardware ADC channels...
                    </p>
                  </div>
                )}

                {testResult && (
                  <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Hardware Self-Test PASSED
                    </div>
                    <p className="text-xs text-slate-700">{testResult.summary}</p>
                    <div className="mt-2 rounded bg-white p-2.5 font-mono text-[11px] text-cyan-900 border border-slate-200 space-y-1">
                      {Object.entries(testResult.diagnostics).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-slate-500">{k}:</span>
                          <span className="font-semibold">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: Safety Protocols */}
          {activeTab === 'safety' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                <ShieldCheck className="h-4 w-4" />
                Mandatory Lab Safety Checklist for {equipment.category}
              </div>
              <ul className="space-y-2.5">
                {safetyList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TAB: Calibration */}
          {activeTab === 'calibration' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Calibration Certification Log</h3>
                    <p className="text-xs text-slate-500">
                      Last Calibrated: <strong className="text-slate-700">{equipment.lastCalibrationDate}</strong> (Interval: {equipment.calibrationIntervalDays} days)
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-semibold font-mono border ${isOverdue ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {isOverdue ? 'CALIBRATION OVERDUE' : 'CALIBRATED & CERTIFIED'}
                  </span>
                </div>

                {calSuccess && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Calibration certificate recorded successfully! Instrument status updated.
                  </div>
                )}

                <form onSubmit={handlePerformCalibration} className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Certificate / NIST Traceability Number
                      </label>
                      <input
                        type="text"
                        required
                        value={certNo}
                        onChange={(e) => setCertNo(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-900 font-mono focus:border-cyan-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Certifying Metrologist / Lab Tech
                      </label>
                      <input
                        type="text"
                        required
                        value={technician}
                        onChange={(e) => setTechnician(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-xs"
                  >
                    <FileCheck className="h-3.5 w-3.5" />
                    Record Official Calibration
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 p-4">
          <button
            onClick={() => {
              onOpenSimulator(equipment);
              onClose();
            }}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-cyan-700 hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
          >
            <Radio className="h-4 w-4 text-cyan-600" />
            Launch Virtual Bench
          </button>

          <div className="flex items-center gap-2">
            {equipment.status === 'Available' ? (
              <button
                onClick={() => {
                  onCheckOut(equipment);
                  onClose();
                }}
                className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 transition-all cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                Check Out Device
              </button>
            ) : equipment.status === 'In Use' ? (
              <button
                onClick={() => {
                  onReturn(equipment);
                  onClose();
                }}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-all cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                Return Device
              </button>
            ) : (
              <button
                onClick={() => {
                  onCheckOut(equipment);
                  onClose();
                }}
                className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition-all cursor-pointer shadow-xs"
              >
                <Wrench className="h-4 w-4" />
                Override & Check Out
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
