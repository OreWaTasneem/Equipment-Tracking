import React from 'react';
import {
  Activity,
  Cpu,
  History,
  LayoutGrid,
  PlusCircle,
  Radio,
  RotateCcw,
  SlidersHorizontal,
  Terminal,
  Zap
} from 'lucide-react';
import { LabManager } from '../models/LabManager';

export type ActiveTab = 'inventory' | 'active-sessions' | 'history' | 'workbench-map' | 'bench-simulator' | 'oop-architecture';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  activeSessionsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  activeSessionsCount
}) => {
  const labManager = LabManager.getInstance();

  const handleExportJSON = () => {
    const jsonStr = labManager.exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `volttrack-lab-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csvStr = labManager.exportUsageCSV();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `volttrack-usage-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all lab equipment and history to default factory state?')) {
      labManager.resetToFactoryDefaults();
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Lab Identifier */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 shadow-md shadow-cyan-600/20 ring-1 ring-cyan-500/30">
              <Activity className="h-5 w-5 text-white animate-pulse" />
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900 font-mono">
                  Volt<span className="text-cyan-600">Track</span>
                </span>
                <span className="rounded bg-cyan-50 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-700 border border-cyan-200 font-mono">
                  LAB-304
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Electronics Lab Instrument & Usage Tracker
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 rounded-xl bg-slate-100/90 p-1 border border-slate-200/80">
            <button
              id="tab-inventory"
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5 text-cyan-600" />
              Inventory & Devices
            </button>

            <button
              id="tab-active-sessions"
              onClick={() => setActiveTab('active-sessions')}
              className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'active-sessions'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Active Sessions
              {activeSessionsCount > 0 && (
                <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-100 px-1 text-[10px] font-bold text-amber-800 border border-amber-300">
                  {activeSessionsCount}
                </span>
              )}
            </button>

            <button
              id="tab-history"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <History className="h-3.5 w-3.5 text-slate-500" />
              Usage History
            </button>

            <button
              id="tab-workbench-map"
              onClick={() => setActiveTab('workbench-map')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'workbench-map'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
              Bench Map
            </button>

            <button
              id="tab-bench-simulator"
              onClick={() => setActiveTab('bench-simulator')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'bench-simulator'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Radio className="h-3.5 w-3.5 text-emerald-600" />
              Virtual Bench
            </button>

            <button
              id="tab-oop-architecture"
              onClick={() => setActiveTab('oop-architecture')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'oop-architecture'
                  ? 'bg-white text-indigo-900 shadow-sm border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Terminal className="h-3.5 w-3.5 text-indigo-600" />
              Java & OOP Architecture
            </button>
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-add-equipment-nav"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Register Instrument</span>
              <span className="sm:hidden">Add</span>
            </button>

            <div className="relative group">
              <button
                id="btn-options-dropdown"
                className="flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all"
                title="Lab Data Tools"
              >
                <Cpu className="h-4 w-4" />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl backdrop-blur-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Data & Backup
                </div>
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                >
                  <History className="h-3.5 w-3.5 text-emerald-600" />
                  Export Usage Audit (CSV)
                </button>
                <button
                  onClick={handleExportJSON}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                >
                  <Zap className="h-3.5 w-3.5 text-cyan-600" />
                  Backup Lab State (JSON)
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={handleResetData}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Factory Sample Data
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-200 no-scrollbar">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`whitespace-nowrap px-3 py-1 text-xs rounded-lg font-medium ${
              activeTab === 'inventory' ? 'bg-cyan-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('active-sessions')}
            className={`whitespace-nowrap px-3 py-1 text-xs rounded-lg font-medium flex items-center gap-1 ${
              activeTab === 'active-sessions' ? 'bg-cyan-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Active ({activeSessionsCount})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap px-3 py-1 text-xs rounded-lg font-medium ${
              activeTab === 'history' ? 'bg-cyan-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('workbench-map')}
            className={`whitespace-nowrap px-3 py-1 text-xs rounded-lg font-medium ${
              activeTab === 'workbench-map' ? 'bg-cyan-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Bench Map
          </button>
          <button
            onClick={() => setActiveTab('bench-simulator')}
            className={`whitespace-nowrap px-3 py-1 text-xs rounded-lg font-medium ${
              activeTab === 'bench-simulator' ? 'bg-cyan-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Virtual Bench
          </button>
          <button
            onClick={() => setActiveTab('oop-architecture')}
            className={`whitespace-nowrap px-3 py-1 text-xs rounded-lg font-medium ${
              activeTab === 'oop-architecture' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Java / OOP
          </button>
        </div>

      </div>
    </header>
  );
};
