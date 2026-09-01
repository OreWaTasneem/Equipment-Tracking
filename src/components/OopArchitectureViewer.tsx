import React, { useState } from 'react';
import {
  Boxes,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Cpu,
  FileCode,
  Layers,
  Network,
  ShieldCheck,
  Sparkles,
  Terminal
} from 'lucide-react';
import { JAVA_OOP_ARCHITECTURE_FILES, JavaFileSnippet } from '../data/javaCodeTemplates';

export const OopArchitectureViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<JavaFileSnippet>(JAVA_OOP_ARCHITECTURE_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Java OOP & Software Architecture Explorer</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Enterprise Object-Oriented Domain Model showcasing Abstraction, Encapsulation, Polymorphism, Factory, Observer & MVC GUI Patterns.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-mono font-semibold text-indigo-700 border border-indigo-200">
              Java 17/21 LTS • OOP Domain Model
            </span>
          </div>
        </div>
      </div>

      {/* 4 OOP Pillars Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Abstraction */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 hover:border-cyan-400 transition-all shadow-xs">
          <div className="flex items-center gap-2 text-cyan-700 font-mono text-xs font-bold uppercase tracking-wider">
            <Layers className="h-4 w-4 text-cyan-600" />
            1. Abstraction
          </div>
          <p className="text-xs text-slate-600">
            Abstract base class <code className="text-cyan-700 font-mono bg-cyan-50 px-1 py-0.5 rounded">Equipment</code> establishes essential contracts (<code className="text-cyan-700 font-mono bg-cyan-50 px-1 py-0.5 rounded">runSelfTest()</code>, <code className="text-cyan-700 font-mono bg-cyan-50 px-1 py-0.5 rounded">getSafetyChecklist()</code>) hiding complex hardware implementation details.
          </p>
        </div>

        {/* Encapsulation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 hover:border-emerald-400 transition-all shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 font-mono text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            2. Encapsulation
          </div>
          <p className="text-xs text-slate-600">
            Internal state (<code className="text-emerald-700 font-mono bg-emerald-50 px-1 py-0.5 rounded">status</code>, <code className="text-emerald-700 font-mono bg-emerald-50 px-1 py-0.5 rounded">totalUsageHours</code>, <code className="text-emerald-700 font-mono bg-emerald-50 px-1 py-0.5 rounded">healthScore</code>) protected with private fields and guarded transition methods.
          </p>
        </div>

        {/* Inheritance */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 hover:border-amber-400 transition-all shadow-xs">
          <div className="flex items-center gap-2 text-amber-700 font-mono text-xs font-bold uppercase tracking-wider">
            <Boxes className="h-4 w-4 text-amber-600" />
            3. Inheritance
          </div>
          <p className="text-xs text-slate-600">
            Subclasses (<code className="text-amber-700 font-mono bg-amber-50 px-1 py-0.5 rounded">Oscilloscope</code>, <code className="text-amber-700 font-mono bg-amber-50 px-1 py-0.5 rounded">DCPowerSupply</code>, etc.) inherit common lifecycle logic while introducing category-specific hardware specifications.
          </p>
        </div>

        {/* Polymorphism */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 hover:border-purple-400 transition-all shadow-xs">
          <div className="flex items-center gap-2 text-purple-700 font-mono text-xs font-bold uppercase tracking-wider">
            <Network className="h-4 w-4 text-purple-600" />
            4. Polymorphism
          </div>
          <p className="text-xs text-slate-600">
            Methods like <code className="text-purple-700 font-mono bg-purple-50 px-1 py-0.5 rounded">runSelfTest()</code> dynamically execute subclass-specific diagnostic routines without tight coupling in the calling UI layer.
          </p>
        </div>

      </div>

      {/* Interactive Class Diagram UML */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-cyan-600" />
            <h3 className="text-sm font-bold text-slate-900 font-mono">UML Domain Class Hierarchy</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Visual OOP Tree</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs overflow-x-auto">
          <div className="space-y-3 min-w-[600px]">
            {/* Base Class */}
            <div className="p-3 rounded-lg border-2 border-cyan-400 bg-cyan-50/80 text-cyan-900">
              <div className="font-bold text-cyan-800 flex items-center gap-2">
                <span>«abstract class»</span> Equipment
              </div>
              <div className="text-[11px] text-slate-700 mt-1">
                - id: UUID, - assetTag: String, - status: EquipmentStatus, - totalUsageHours: double
              </div>
              <div className="text-[11px] text-cyan-800 mt-1 border-t border-cyan-200 pt-1">
                + checkOut(), + returnEquipment(), + calculatePowerConsumption(), + runSelfTest()*
              </div>
            </div>

            {/* Tree Branch Line */}
            <div className="flex justify-center text-slate-400 font-bold">
              │ ▲ (inherits from abstract Equipment)
            </div>

            {/* Subclasses Grid */}
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-center shadow-2xs">
                <strong className="text-amber-700 block">Oscilloscope</strong>
                <span className="text-[10px] text-slate-500">bandwidthMHz, channels</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-center shadow-2xs">
                <strong className="text-emerald-700 block">FunctionGenerator</strong>
                <span className="text-[10px] text-slate-500">maxFreqMHz, waveforms</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-center shadow-2xs">
                <strong className="text-cyan-700 block">DigitalMultimeter</strong>
                <span className="text-[10px] text-slate-500">digits, trueRMS, CAT</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-center shadow-2xs">
                <strong className="text-purple-700 block">DCPowerSupply</strong>
                <span className="text-[10px] text-slate-500">maxVoltageV, maxCurrentA</span>
              </div>
            </div>

            {/* Services & Design Patterns */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200">
              <div className="p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/60 text-xs">
                <strong className="text-indigo-800 block">«Singleton» LabManager</strong>
                <span className="text-[10px] text-slate-600">Central state coordinator & Observable</span>
              </div>
              <div className="p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/60 text-xs">
                <strong className="text-indigo-800 block">«Factory» EquipmentFactory</strong>
                <span className="text-[10px] text-slate-600">Dynamic polymorphic object creation</span>
              </div>
              <div className="p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/60 text-xs">
                <strong className="text-indigo-800 block">«GUI Frame» LabEquipmentGUI</strong>
                <span className="text-[10px] text-slate-600">Java Swing/JavaFX MVC View</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Java Source Code Browser */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        
        {/* Code Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 border-b border-slate-200 px-4 py-2 gap-2">
          
          <div className="flex items-center overflow-x-auto gap-1 no-scrollbar">
            {JAVA_OOP_ARCHITECTURE_FILES.map(file => (
              <button
                key={file.fileName}
                onClick={() => setSelectedFile(file)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono transition-all whitespace-nowrap cursor-pointer ${
                  selectedFile.fileName === file.fileName
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <FileCode className="h-3.5 w-3.5" />
                {file.fileName}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 px-3 py-1.5 text-xs font-mono text-slate-700 shadow-2xs transition-all cursor-pointer self-end sm:self-auto"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-500" />
                <span>Copy Java Class</span>
              </>
            )}
          </button>

        </div>

        {/* File Meta Description */}
        <div className="bg-slate-50/80 px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <p>{selectedFile.description}</p>
          <div className="flex flex-wrap gap-1">
            {selectedFile.oopConcepts.map((c, i) => (
              <span key={i} className="rounded bg-white px-2 py-0.5 text-[10px] font-mono text-indigo-700 border border-indigo-200 font-medium">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Syntax Code Body */}
        <div className="p-4 bg-slate-950 overflow-x-auto max-h-[500px]">
          <pre className="text-xs font-mono text-slate-200 leading-relaxed">
            <code>{selectedFile.code}</code>
          </pre>
        </div>

      </div>

    </div>
  );
};
