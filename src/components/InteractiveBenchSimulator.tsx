import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  AudioLines,
  Cpu,
  Gauge,
  Play,
  Power,
  Radio,
  RotateCcw,
  Sliders,
  Volume2,
  Zap
} from 'lucide-react';
import { Equipment } from '../models/Equipment';
import { getCategoryIcon } from '../utils/formatters';

interface InteractiveBenchSimulatorProps {
  equipmentList: Equipment[];
  selectedEquipment?: Equipment | null;
}

export const InteractiveBenchSimulator: React.FC<InteractiveBenchSimulatorProps> = ({
  equipmentList,
  selectedEquipment: initialSelected
}) => {
  // Instrument selection
  const [selectedId, setSelectedId] = useState<string>(
    initialSelected?.id || equipmentList[0]?.id || ''
  );

  const activeEquipment = equipmentList.find(e => e.id === selectedId) || equipmentList[0];

  // --- Oscilloscope State ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [oscWaveform, setOscWaveform] = useState<'sine' | 'square' | 'triangle' | 'pulse' | 'noise'>('sine');
  const [oscFreqHz, setOscFreqHz] = useState<number>(1000);
  const [oscAmplitudeVpp, setOscAmplitudeVpp] = useState<number>(3.3);
  const [oscTimeDivMs, setOscTimeDivMs] = useState<number>(0.5); // ms per division
  const [oscVoltsDivV, setOscVoltsDivV] = useState<number>(1.0); // V per division
  const [oscChannel1On, setOscChannel1On] = useState<boolean>(true);
  const [oscChannel2On, setOscChannel2On] = useState<boolean>(false);
  const [oscTriggerLevel, setOscTriggerLevel] = useState<number>(0);
  const [oscPhosphorColor, setOscPhosphorColor] = useState<'cyan' | 'emerald' | 'amber'>('cyan');
  const [oscShowGrid, setOscShowGrid] = useState<boolean>(true);
  const [oscShowFFT, setOscShowFFT] = useState<boolean>(false);

  // --- Power Supply State ---
  const [psVoltageSet, setPsVoltageSet] = useState<number>(12.0);
  const [psCurrentLimitSet, setPsCurrentLimitSet] = useState<number>(1.5);
  const [psOutputEnabled, setPsOutputEnabled] = useState<boolean>(true);
  const [psLoadResistance, setPsLoadResistance] = useState<number>(10); // Ohms
  const [psActiveChannel, setPsActiveChannel] = useState<number>(1);

  // Calculated PS values
  const theoreticalCurrent = psVoltageSet / Math.max(0.1, psLoadResistance);
  const isCurrentLimited = theoreticalCurrent > psCurrentLimitSet;
  const psActualCurrent = psOutputEnabled ? (isCurrentLimited ? psCurrentLimitSet : theoreticalCurrent) : 0;
  const psActualVoltage = psOutputEnabled ? (isCurrentLimited ? psCurrentLimitSet * psLoadResistance : psVoltageSet) : 0;
  const psActualPower = psActualVoltage * psActualCurrent;

  // --- DMM State ---
  const [dmmMode, setDmmMode] = useState<'DCV' | 'ACV' | 'DCI' | 'OHM' | 'CONT' | 'FREQ'>('DCV');
  const [dmmJitter, setDmmJitter] = useState<number>(0);
  const [dmmHold, setDmmHold] = useState<boolean>(false);

  // Update selected if prop changes
  useEffect(() => {
    if (initialSelected) {
      setSelectedId(initialSelected.id);
    }
  }, [initialSelected]);

  // Oscilloscope Animation Frame Loop
  useEffect(() => {
    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      // Dark Instrument CRT Background
      ctx.fillStyle = '#050a12';
      ctx.fillRect(0, 0, width, height);

      // Grid rendering (10 div horizontal, 8 div vertical)
      if (oscShowGrid) {
        ctx.strokeStyle = '#0f243a';
        ctx.lineWidth = 1;
        const gridX = width / 10;
        const gridY = height / 8;

        for (let x = 0; x <= width; x += gridX) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        for (let y = 0; y <= height; y += gridY) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Center crosshair with sub-divisions (graticule dots)
        ctx.strokeStyle = '#1e3a5f';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(0, midY);
        ctx.lineTo(width, midY);
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Channel 1 Trace
      if (oscChannel1On) {
        ctx.lineWidth = 2;
        const colorHex = oscPhosphorColor === 'cyan' ? '#06b6d4' : oscPhosphorColor === 'emerald' ? '#10b981' : '#f59e0b';
        ctx.strokeStyle = colorHex;
        ctx.shadowColor = colorHex;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        const totalDurationSecs = (oscTimeDivMs * 10) / 1000;
        const vPerPixel = (oscVoltsDivV * 8) / height;

        for (let px = 0; px < width; px++) {
          const t = (px / width) * totalDurationSecs + phase;
          let sampleV = 0;

          if (oscWaveform === 'sine') {
            sampleV = (oscAmplitudeVpp / 2) * Math.sin(2 * Math.PI * oscFreqHz * t);
          } else if (oscWaveform === 'square') {
            const raw = Math.sin(2 * Math.PI * oscFreqHz * t);
            sampleV = (oscAmplitudeVpp / 2) * Math.sign(raw);
            // Slight bandwidth ringing effect
            sampleV += Math.sin(2 * Math.PI * oscFreqHz * 9 * t) * (oscAmplitudeVpp * 0.04) * Math.exp(-((t * 1000) % 1) * 3);
          } else if (oscWaveform === 'triangle') {
            const period = 1 / oscFreqHz;
            const cyclePos = (t % period) / period;
            sampleV = (oscAmplitudeVpp / 2) * (4 * Math.abs(cyclePos - 0.5) - 1);
          } else if (oscWaveform === 'pulse') {
            const period = 1 / oscFreqHz;
            const cyclePos = (t % period) / period;
            sampleV = cyclePos < 0.2 ? (oscAmplitudeVpp / 2) : -(oscAmplitudeVpp / 2);
          } else if (oscWaveform === 'noise') {
            sampleV = (Math.random() - 0.5) * oscAmplitudeVpp;
          }

          const py = midY - (sampleV / vPerPixel);
          if (px === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset
      }

      // Draw Trigger Line
      if (oscTriggerLevel !== 0) {
        const vPerPixel = (oscVoltsDivV * 8) / height;
        const trigY = midY - (oscTriggerLevel / vPerPixel);
        ctx.strokeStyle = '#e11d48';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, trigY);
        ctx.lineTo(width, trigY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      phase += 0.00015 * (oscFreqHz / 100);
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    oscWaveform, oscFreqHz, oscAmplitudeVpp, oscTimeDivMs,
    oscVoltsDivV, oscChannel1On, oscTriggerLevel, oscPhosphorColor,
    oscShowGrid
  ]);

  // Periodic small jitter for DMM display
  useEffect(() => {
    const interval = setInterval(() => {
      if (!dmmHold) {
        setDmmJitter((Math.random() - 0.5) * 0.0004);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [dmmHold]);

  // Determine which visual front panel to render
  const isPowerSupply = activeEquipment.category === 'DC Power Supply';
  const isMultimeter = activeEquipment.category === 'Digital Multimeter';
  const isScopeOrGen = activeEquipment.category === 'Oscilloscope' || activeEquipment.category === 'Function Generator' || activeEquipment.category === 'Spectrum Analyzer';

  return (
    <div className="space-y-5">
      
      {/* Top Banner & Instrument Selector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">Interactive Virtual Electronics Workbench</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live hardware simulator allowing students & engineers to configure instruments, probe signals, and test circuits virtually.
            </p>
          </div>

          {/* Instrument Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Target Device:</span>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-mono font-semibold text-cyan-800 focus:border-cyan-500 focus:outline-none shadow-2xs"
            >
              {equipmentList.map(eq => (
                <option key={eq.id} value={eq.id}>
                  [{eq.assetTag}] {eq.manufacturer} {eq.model} ({eq.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* BENCH INSTRUMENT FRONT PANEL */}

      {/* 1. DIGITAL OSCILLOSCOPE / FUNCTION GENERATOR SIMULATOR */}
      {isScopeOrGen && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          
          {/* Top Instrument Header Bezel */}
          <div className="flex items-center justify-between bg-slate-50 px-5 py-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <div>
                <span className="font-mono text-xs font-bold text-slate-900 tracking-wide">
                  {activeEquipment.manufacturer} {activeEquipment.model}
                </span>
                <span className="ml-2 text-[11px] font-mono text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 font-semibold">
                  {activeEquipment.assetTag}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-slate-600">
              <span className="text-emerald-700 font-semibold">TRIG: AUTO</span>
              <span>•</span>
              <span className="text-cyan-700 font-semibold">CH1: {oscVoltsDivV}V/Div</span>
              <span>•</span>
              <span className="text-amber-700 font-semibold">TIME: {oscTimeDivMs}ms/Div</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* Phosphor CRT Screen Area (8 Cols) */}
            <div className="lg:col-span-8 p-4 bg-slate-950 flex flex-col items-center justify-center relative">
              <canvas
                ref={canvasRef}
                width={640}
                height={360}
                className="w-full max-w-full rounded-xl border border-slate-800 shadow-inner"
              />

              {/* On-Screen Readouts Overlay */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none text-[11px] font-mono text-cyan-300 bg-slate-900/85 backdrop-blur-sm p-2.5 rounded-lg border border-cyan-800/60 shadow-lg">
                <div className="flex items-center gap-4">
                  <span>Freq: <strong className="text-white">{(oscFreqHz >= 1000 ? `${(oscFreqHz/1000).toFixed(2)} kHz` : `${oscFreqHz} Hz`)}</strong></span>
                  <span>Vpp: <strong className="text-white">{oscAmplitudeVpp.toFixed(2)} V</strong></span>
                  <span>Vrms: <strong className="text-white">{(oscAmplitudeVpp / (2 * Math.SQRT2)).toFixed(2)} V</strong></span>
                </div>
                <div>
                  <span>Sampling: <strong className="text-emerald-400">1.00 GSa/s</strong></span>
                </div>
              </div>
            </div>

            {/* Front Panel Knobs & Controls (4 Cols) */}
            <div className="lg:col-span-4 bg-white p-5 border-l border-slate-200 space-y-4">
              
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>Front Panel Controls</span>
                <Sliders className="h-4 w-4 text-cyan-600" />
              </div>

              {/* Waveform Selector */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1.5">
                  Input Signal Waveform
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['sine', 'square', 'triangle', 'pulse', 'noise'] as const).map(wf => (
                    <button
                      key={wf}
                      onClick={() => setOscWaveform(wf)}
                      className={`rounded-lg py-1.5 px-2 text-xs font-mono capitalize transition-all cursor-pointer ${
                        oscWaveform === wf
                          ? 'bg-cyan-600 text-white font-bold shadow-xs'
                          : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {wf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency Knob Slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1 font-mono">
                  <span>Signal Frequency:</span>
                  <strong className="text-cyan-700">{oscFreqHz} Hz</strong>
                </div>
                <input
                  type="range"
                  min="50"
                  max="10000"
                  step="50"
                  value={oscFreqHz}
                  onChange={e => setOscFreqHz(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
              </div>

              {/* Amplitude Knob Slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1 font-mono">
                  <span>Amplitude (Vpp):</span>
                  <strong className="text-cyan-700">{oscAmplitudeVpp} V</strong>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.1"
                  value={oscAmplitudeVpp}
                  onChange={e => setOscAmplitudeVpp(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
              </div>

              {/* Timebase (Time/Div) */}
              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1 font-mono">
                  <span>Horizontal (Time/Div):</span>
                  <strong className="text-amber-700">{oscTimeDivMs} ms</strong>
                </div>
                <div className="flex gap-1">
                  {[0.1, 0.2, 0.5, 1.0, 2.0, 5.0].map(val => (
                    <button
                      key={val}
                      onClick={() => setOscTimeDivMs(val)}
                      className={`flex-1 rounded py-1 text-[11px] font-mono transition-all cursor-pointer ${
                        oscTimeDivMs === val
                          ? 'bg-amber-600 text-white font-bold shadow-xs'
                          : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {val}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Volts/Div (Scale) */}
              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1 font-mono">
                  <span>Vertical (Volts/Div):</span>
                  <strong className="text-cyan-700">{oscVoltsDivV} V</strong>
                </div>
                <div className="flex gap-1">
                  {[0.5, 1.0, 2.0, 5.0].map(val => (
                    <button
                      key={val}
                      onClick={() => setOscVoltsDivV(val)}
                      className={`flex-1 rounded py-1 text-[11px] font-mono transition-all cursor-pointer ${
                        oscVoltsDivV === val
                          ? 'bg-cyan-600 text-white font-bold shadow-xs'
                          : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {val}V
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Color Picker */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Phosphor Trace:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setOscPhosphorColor('cyan')}
                    className={`h-5 w-5 rounded-full bg-cyan-400 ring-2 ${oscPhosphorColor === 'cyan' ? 'ring-slate-900 ring-offset-2' : 'ring-transparent'}`}
                  />
                  <button
                    onClick={() => setOscPhosphorColor('emerald')}
                    className={`h-5 w-5 rounded-full bg-emerald-400 ring-2 ${oscPhosphorColor === 'emerald' ? 'ring-slate-900 ring-offset-2' : 'ring-transparent'}`}
                  />
                  <button
                    onClick={() => setOscPhosphorColor('amber')}
                    className={`h-5 w-5 rounded-full bg-amber-400 ring-2 ${oscPhosphorColor === 'amber' ? 'ring-slate-900 ring-offset-2' : 'ring-transparent'}`}
                  />
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 2. DC POWER SUPPLY SIMULATOR */}
      {isPowerSupply && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-amber-500" />
              <div>
                <h3 className="text-base font-bold text-slate-900 font-mono">
                  {activeEquipment.manufacturer} {activeEquipment.model} — Linear DC Power Supply
                </h3>
                <span className="text-xs text-slate-500 font-mono">Asset Tag: {activeEquipment.assetTag}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
                isCurrentLimited 
                  ? 'bg-rose-50 text-rose-700 border-rose-200' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                MODE: {isCurrentLimited ? 'CC (Constant Current)' : 'CV (Constant Voltage)'}
              </span>
            </div>
          </div>

          {/* Dual LED 7-Segment VFD Style Readouts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Voltage Display */}
            <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 shadow-inner">
              <div className="flex justify-between text-xs text-cyan-400 font-mono">
                <span>VOLTAGE OUTPUT</span>
                <span>VOLTS (V)</span>
              </div>
              <div className="text-4xl font-bold font-mono text-cyan-400 glow-cyan mt-2 tracking-widest">
                {psActualVoltage.toFixed(2)} <span className="text-lg">V</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-1">
                Setpoint: {psVoltageSet.toFixed(2)} V
              </div>
            </div>

            {/* Current Display */}
            <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 shadow-inner">
              <div className="flex justify-between text-xs text-emerald-400 font-mono">
                <span>CURRENT OUTPUT</span>
                <span>AMPS (A)</span>
              </div>
              <div className="text-4xl font-bold font-mono text-emerald-400 glow-emerald mt-2 tracking-widest">
                {psActualCurrent.toFixed(3)} <span className="text-lg">A</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-1">
                Limit (OCP): {psCurrentLimitSet.toFixed(3)} A
              </div>
            </div>

            {/* Power Wattage Display */}
            <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 shadow-inner">
              <div className="flex justify-between text-xs text-amber-400 font-mono">
                <span>TOTAL POWER</span>
                <span>WATTS (W)</span>
              </div>
              <div className="text-4xl font-bold font-mono text-amber-400 glow-amber mt-2 tracking-widest">
                {psActualPower.toFixed(2)} <span className="text-lg">W</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-1">
                Max Capacity: 195 W
              </div>
            </div>

          </div>

          {/* Interactive Knobs & Connected Load Simulator */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            
            {/* Voltage Dial */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3 shadow-2xs">
              <label className="block text-xs font-semibold text-cyan-800 font-mono">
                Voltage Adjustment (0 - 30V)
              </label>
              <input
                type="range"
                min="0"
                max="30"
                step="0.1"
                value={psVoltageSet}
                onChange={e => setPsVoltageSet(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
              <div className="flex justify-between font-mono text-xs text-slate-500">
                <span>0.0V</span>
                <span className="font-bold text-slate-900">{psVoltageSet.toFixed(1)}V</span>
                <span>30.0V</span>
              </div>
            </div>

            {/* Current Limit Dial */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3 shadow-2xs">
              <label className="block text-xs font-semibold text-emerald-800 font-mono">
                Current Limit (0 - 5A)
              </label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.05"
                value={psCurrentLimitSet}
                onChange={e => setPsCurrentLimitSet(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between font-mono text-xs text-slate-500">
                <span>0.1A</span>
                <span className="font-bold text-slate-900">{psCurrentLimitSet.toFixed(2)}A</span>
                <span>5.0A</span>
              </div>
            </div>

            {/* Virtual Breadboard Load Resistor Simulator */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3 shadow-2xs">
              <label className="block text-xs font-semibold text-amber-800 font-mono">
                Simulate Breadboard Load (Ω)
              </label>
              <select
                value={psLoadResistance}
                onChange={e => setPsLoadResistance(parseFloat(e.target.value))}
                className="w-full rounded-lg bg-white p-2 text-xs font-mono text-slate-900 border border-slate-200 focus:border-amber-500 shadow-2xs"
              >
                <option value="2">2 Ω (Heavy Draw - Trips Current Limit)</option>
                <option value="5">5 Ω (Moderate Load)</option>
                <option value="10">10 Ω (Standard Lab Load)</option>
                <option value="50">50 Ω (Light Load)</option>
                <option value="1000">1000 Ω (High Impedance)</option>
                <option value="0.1">0.1 Ω (Direct Short Circuit)</option>
              </select>

              {/* Power Switch */}
              <button
                onClick={() => setPsOutputEnabled(!psOutputEnabled)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  psOutputEnabled
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    : 'border border-slate-200 bg-white hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Power className="h-4 w-4" />
                OUTPUT {psOutputEnabled ? 'ENABLED (ON)' : 'MUTED (OFF)'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3. 6.5-DIGIT BENCH DIGITAL MULTIMETER (DMM) SIMULATOR */}
      {isMultimeter && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <Gauge className="h-6 w-6 text-cyan-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900 font-mono">
                  {activeEquipment.manufacturer} {activeEquipment.model} — 6.5 Digit Precision Multimeter
                </h3>
                <span className="text-xs text-slate-500 font-mono">Asset Tag: {activeEquipment.assetTag}</span>
              </div>
            </div>

            <button
              onClick={() => setDmmHold(!dmmHold)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs ${
                dmmHold ? 'bg-amber-500 text-slate-950 font-bold' : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              HOLD: {dmmHold ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* VFD Fluorescent Green High-Precision Display */}
          <div className="rounded-2xl bg-slate-950 p-6 border border-slate-800 shadow-inner">
            <div className="flex justify-between text-xs font-mono text-emerald-400/80 mb-2">
              <span>AUTO-RANGE • FAST 6.5 DIGITS</span>
              <span>CAT II 300V / CAT I 1000V</span>
            </div>

            <div className="text-5xl font-mono font-bold text-emerald-400 glow-emerald tracking-widest py-2">
              {dmmMode === 'DCV' && `${(12.0482 + dmmJitter).toFixed(5)} V DC`}
              {dmmMode === 'ACV' && `${(3.3012 + dmmJitter).toFixed(5)} V AC`}
              {dmmMode === 'DCI' && `${(0.4829 + dmmJitter).toFixed(5)} A DC`}
              {dmmMode === 'OHM' && `${(998.42 + (dmmJitter * 10)).toFixed(3)} Ω`}
              {dmmMode === 'CONT' && `0.024 Ω [BEEP CONTINUOUS]`}
              {dmmMode === 'FREQ' && `1.00002 kHz`}
            </div>

            <div className="flex justify-between text-xs font-mono text-slate-400 mt-2 border-t border-slate-800 pt-2">
              <span>Peak: 12.0489 V</span>
              <span>Min: 12.0475 V</span>
              <span>Average: 12.0482 V</span>
              <span>Samples: 2,400</span>
            </div>
          </div>

          {/* Function Buttons Bar */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { id: 'DCV', label: 'DC Voltage' },
              { id: 'ACV', label: 'AC Voltage' },
              { id: 'DCI', label: 'DC Current' },
              { id: 'OHM', label: '2W/4W Ohm' },
              { id: 'CONT', label: 'Continuity' },
              { id: 'FREQ', label: 'Frequency' }
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setDmmMode(btn.id as any)}
                className={`py-3 px-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  dmmMode === btn.id
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

        </div>
      )}

      {/* 4. OTHER SPECIALIZED LAB GEAR (Soldering, Logic Analyzer, Spectrum Analyzer, LCR) */}
      {!isScopeOrGen && !isPowerSupply && !isMultimeter && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-3">
            {getCategoryIcon(activeEquipment.category, 'h-6 w-6 text-cyan-600')}
            <div>
              <h3 className="text-base font-bold text-slate-900 font-mono">
                {activeEquipment.name} ({activeEquipment.manufacturer} {activeEquipment.model})
              </h3>
              <p className="text-xs text-slate-500 font-mono">Bench station: {activeEquipment.location}</p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs space-y-2">
            <span className="text-cyan-700 font-mono font-semibold block">Active Specifications Telemetry:</span>
            <div className="grid grid-cols-2 gap-2 text-slate-700 font-mono">
              {Object.entries(activeEquipment.getDetailedSpecs()).map(([k, v]) => (
                <div key={k} className="p-2 rounded-lg bg-white border border-slate-200 flex justify-between shadow-2xs">
                  <span className="text-slate-500">{k}:</span>
                  <span className="text-slate-900 font-semibold">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
