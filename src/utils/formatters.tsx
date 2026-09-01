import React from 'react';
import {
  Activity,
  AudioLines,
  Binary,
  Cpu,
  Flame,
  Gauge,
  Radio,
  Zap
} from 'lucide-react';
import { EquipmentCategory, EquipmentStatus } from '../types/equipment';

export const getCategoryIcon = (category: EquipmentCategory, className: string = 'h-5 w-5') => {
  switch (category) {
    case 'Oscilloscope':
      return <Activity className={className} />;
    case 'Function Generator':
      return <Radio className={className} />;
    case 'Digital Multimeter':
      return <Gauge className={className} />;
    case 'DC Power Supply':
      return <Zap className={className} />;
    case 'Spectrum Analyzer':
      return <AudioLines className={className} />;
    case 'Soldering & Rework':
      return <Flame className={className} />;
    case 'Logic Analyzer':
      return <Binary className={className} />;
    case 'LCR Meter':
      return <Cpu className={className} />;
    default:
      return <Activity className={className} />;
  }
};

export const getStatusBadgeClass = (status: EquipmentStatus) => {
  switch (status) {
    case 'Available':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'In Use':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200 shadow-sm';
    case 'Under Maintenance':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'Calibration Overdue':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Reserved':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
};
