import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  User,
  X,
  Zap
} from 'lucide-react';
import { Equipment } from '../models/Equipment';
import { LabBenchLocation, UserRole } from '../types/equipment';
import { getCategoryIcon } from '../utils/formatters';

interface CheckOutModalProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sessionData: {
    userName: string;
    userRole: UserRole;
    userEmail: string;
    projectName: string;
    benchLocation: LabBenchLocation;
    expectedDurationHours: number;
    safetyCheckConfirmed: boolean;
    purposeNotes: string;
  }) => void;
}

const BENCH_LOCATIONS: LabBenchLocation[] = [
  'Bench A1', 'Bench A2', 'Bench A3', 'Bench A4',
  'Bench B1', 'Bench B2', 'Bench B3', 'Bench B4',
  'Bench C1', 'Bench C2', 'Bench C3', 'Bench C4',
  'Bench D1', 'Bench D2', 'Bench D3', 'Bench D4',
  'Rack 1 (RF Lab)', 'Rack 2 (High Power)', 'Storage Cabinet 1', 'Storage Cabinet 2'
];

const USER_ROLES: UserRole[] = [
  'Undergraduate Student',
  'Graduate Researcher',
  'Lab Assistant / TA',
  'Principal Investigator',
  'Electronics Technician',
  'Faculty Member'
];

export const CheckOutModal: React.FC<CheckOutModalProps> = ({
  equipment,
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !equipment) return null;

  const safetyChecklist = equipment.getSafetyChecklist();

  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('Undergraduate Student');
  const [userEmail, setUserEmail] = useState('');
  const [projectName, setProjectName] = useState('');
  const [benchLocation, setBenchLocation] = useState<LabBenchLocation>(equipment.location);
  const [expectedDurationHours, setExpectedDurationHours] = useState(2);
  const [purposeNotes, setPurposeNotes] = useState('');
  const [safetyAccepted, setSafetyAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setErrorMsg('Please provide the operator / researcher name.');
      return;
    }
    if (!projectName.trim()) {
      setErrorMsg('Please specify the lab experiment or project name.');
      return;
    }
    if (!safetyAccepted) {
      setErrorMsg('You must review and check the safety requirements acknowledgment.');
      return;
    }

    onConfirm({
      userName: userName.trim(),
      userRole,
      userEmail: userEmail.trim() || `${userName.toLowerCase().replace(/\s+/g, '.')}@lab.edu`,
      projectName: projectName.trim(),
      benchLocation,
      expectedDurationHours,
      safetyCheckConfirmed: safetyAccepted,
      purposeNotes: purposeNotes.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        
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
                Check Out {equipment.name}
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

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Operator Information */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Researcher / Operator Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g., Jane Doe"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Academic Role / Level
              </label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-800 focus:border-cyan-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600"
              >
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Project / Course / Experiment Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., EE302 Lab 4: Switching Converter"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Workbench Station
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <select
                  value={benchLocation}
                  onChange={(e) => setBenchLocation(e.target.value as LabBenchLocation)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-cyan-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600 font-mono"
                >
                  {BENCH_LOCATIONS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Duration & Energy Estimation */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-700 mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="h-3.5 w-3.5 text-cyan-600" />
                Estimated Usage Duration: <strong className="text-slate-900 font-mono">{expectedDurationHours} Hours</strong>
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <Zap className="h-3.5 w-3.5 text-amber-600" />
                Est. Energy: <strong className="text-amber-700 font-mono">{equipment.calculatePowerConsumption(expectedDurationHours)} kWh</strong>
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="8"
              step="0.5"
              value={expectedDurationHours}
              onChange={(e) => setExpectedDurationHours(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>30m</span>
              <span>2h</span>
              <span>4h</span>
              <span>6h</span>
              <span>8h (Max Lab Shift)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Purpose / Test Setup Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Measuring rise time and overshoot on FPGA output lines."
              value={purposeNotes}
              onChange={(e) => setPurposeNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Safety Checklist (Polymorphic from Equipment Subclass) */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 mb-2">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              Safety Protocols & Operating Limits Checklist:
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {safetyChecklist.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-600 text-xs mt-0.5">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>

            <label className="mt-3.5 flex items-center gap-2 cursor-pointer pt-2 border-t border-amber-200">
              <input
                type="checkbox"
                checked={safetyAccepted}
                onChange={(e) => setSafetyAccepted(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 bg-white text-cyan-600 focus:ring-cyan-600 accent-cyan-600"
              />
              <span className="text-xs font-medium text-slate-900">
                I have verified circuit ground, voltage limits, and confirm compliance with lab safety regulations.
              </span>
            </label>
          </div>

          {/* Modal Actions */}
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
              className="flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 transition-all cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirm Check Out & Start Timer
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
