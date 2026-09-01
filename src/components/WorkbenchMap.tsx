import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Cpu,
  Layers,
  MapPin,
  Radio,
  SlidersHorizontal,
  User,
  Zap
} from 'lucide-react';
import { Equipment } from '../models/Equipment';
import { LabBenchLocation } from '../types/equipment';
import { getCategoryIcon } from '../utils/formatters';

interface WorkbenchMapProps {
  equipmentList: Equipment[];
  onSelectEquipment: (equipment: Equipment) => void;
  onCheckOut: (equipment: Equipment) => void;
}

interface BenchZone {
  id: string;
  name: string;
  description: string;
  benches: LabBenchLocation[];
}

const ZONES: BenchZone[] = [
  {
    id: 'zone-a',
    name: 'Row A: Analog Circuitry & High-Res Signal Analysis',
    description: 'Workstations optimized for low-noise measurement, op-amp filters, and precision signal capture.',
    benches: ['Bench A1', 'Bench A2', 'Bench A3', 'Bench A4']
  },
  {
    id: 'zone-b',
    name: 'Row B: Power Electronics & Motor Control Station',
    description: 'Equipped with isolated differential channels, high current supplies, and thermal monitoring.',
    benches: ['Bench B1', 'Bench B2', 'Bench B3', 'Bench B4']
  },
  {
    id: 'zone-c',
    name: 'Row C: Soldering, Rework & PCB Assembly Pods',
    description: 'Fume extractors, ESD-safe grounding mats, hot air rework, and microscope inspection.',
    benches: ['Bench C1', 'Bench C2', 'Bench C3', 'Bench C4']
  },
  {
    id: 'zone-d',
    name: 'Row D: Digital Protocols & Embedded Microcontrollers',
    description: 'Logic analyzers, SPI/I2C/CAN bus decoders, and FPGA development testbeds.',
    benches: ['Bench D1', 'Bench D2', 'Bench D3', 'Bench D4']
  },
  {
    id: 'zone-racks',
    name: 'RF Lab Racks & Instrument Storage Cabinets',
    description: 'Centralized calibration storage, spectrum analyzers, and high-frequency vector network gear.',
    benches: ['Rack 1 (RF Lab)', 'Rack 2 (High Power)', 'Storage Cabinet 1', 'Storage Cabinet 2']
  }
];

export const WorkbenchMap: React.FC<WorkbenchMapProps> = ({
  equipmentList,
  onSelectEquipment,
  onCheckOut
}) => {
  const [selectedBench, setSelectedBench] = useState<LabBenchLocation | null>('Bench A1');

  const getEquipmentAtBench = (location: LabBenchLocation): Equipment[] => {
    return equipmentList.filter(eq => eq.location === location);
  };

  const selectedBenchEquipment = selectedBench ? getEquipmentAtBench(selectedBench) : [];

  return (
    <div className="space-y-5">
      
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-cyan-600" />
              <h2 className="text-lg font-bold text-slate-900">Laboratory 304 Floorplan & Bench Allocation</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive spatial layout of physical workbenches, instrument placement, and real-time station occupancy.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Available Station
            </span>
            <span className="flex items-center gap-1.5 text-cyan-700 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-500 animate-ping" /> Active In-Use
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Floorplan Layout (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {ZONES.map(zone => (
            <div
              key={zone.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 font-mono">{zone.name}</h3>
                  <p className="text-[11px] text-slate-500">{zone.description}</p>
                </div>
              </div>

              {/* Benches in Zone */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {zone.benches.map(bench => {
                  const items = getEquipmentAtBench(bench);
                  const inUseItems = items.filter(e => e.status === 'In Use');
                  const isSelected = selectedBench === bench;

                  return (
                    <button
                      key={bench}
                      onClick={() => setSelectedBench(bench)}
                      className={`relative flex flex-col justify-between rounded-xl p-3 text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-cyan-600 bg-cyan-50 shadow-xs ring-1 ring-cyan-600'
                          : inUseItems.length > 0
                          ? 'border-cyan-200 bg-cyan-50/50 hover:border-cyan-300'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {bench}
                        </span>
                        {inUseItems.length > 0 ? (
                          <span className="flex h-2 w-2">
                            <span className="h-full w-full animate-ping rounded-full bg-cyan-500 opacity-75" />
                          </span>
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>{items.length} {items.length === 1 ? 'device' : 'devices'}</span>
                        {inUseItems.length > 0 && (
                          <span className="text-cyan-700 font-bold">BUSY</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bench Station Inspector Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-900 font-mono">
                  {selectedBench || 'Select a Workbench'}
                </h3>
              </div>
              <span className="text-xs font-mono text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 font-semibold">
                {selectedBenchEquipment.length} Mounted
              </span>
            </div>

            {selectedBenchEquipment.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No instruments currently stationed at this location.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedBenchEquipment.map(eq => (
                  <div
                    key={eq.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2 hover:border-cyan-300 transition-all shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-600">
                          {getCategoryIcon(eq.category, 'h-4 w-4')}
                        </span>
                        <div>
                          <div className="font-semibold text-xs text-slate-900">{eq.name}</div>
                          <div className="text-[11px] font-mono text-slate-500">{eq.manufacturer} {eq.model}</div>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 font-semibold">
                        {eq.assetTag}
                      </span>
                    </div>

                    {eq.activeSession && (
                      <div className="rounded-lg bg-cyan-50/80 p-2 text-[11px] text-cyan-800 border border-cyan-200 font-mono">
                        <div className="flex items-center gap-1 font-bold">
                          <User className="h-3 w-3 text-cyan-600" />
                          {eq.activeSession.userName}
                        </div>
                        <div className="truncate text-slate-600">{eq.activeSession.projectName}</div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                      <span className="text-[10px] font-mono text-amber-700 font-medium">
                        Rating: {eq.powerRatingWatts}W
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onSelectEquipment(eq)}
                          className="px-2 py-1 rounded border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 hover:bg-slate-100 shadow-2xs transition-all"
                        >
                          Specs
                        </button>
                        {eq.status === 'Available' && (
                          <button
                            onClick={() => onCheckOut(eq)}
                            className="px-2.5 py-1 rounded bg-cyan-600 text-[11px] font-semibold text-white hover:bg-cyan-700 cursor-pointer shadow-2xs transition-all"
                          >
                            Check Out
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
