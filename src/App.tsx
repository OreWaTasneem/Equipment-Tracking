import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  CheckCircle2,
  Cpu,
  Filter,
  History,
  Layers,
  MapPin,
  PlusCircle,
  Radio,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Terminal,
  Zap
} from 'lucide-react';
import { ActiveSessionsView } from './components/ActiveSessionsView';
import { AddEquipmentModal } from './components/AddEquipmentModal';
import { CheckOutModal } from './components/CheckOutModal';
import { EquipmentCard } from './components/EquipmentCard';
import { EquipmentDetailModal } from './components/EquipmentDetailModal';
import { InteractiveBenchSimulator } from './components/InteractiveBenchSimulator';
import { LabAnalytics } from './components/LabAnalytics';
import { ActiveTab, Navbar } from './components/Navbar';
import { OopArchitectureViewer } from './components/OopArchitectureViewer';
import { ReturnDeviceModal } from './components/ReturnDeviceModal';
import { UsageHistoryTable } from './components/UsageHistoryTable';
import { WorkbenchMap } from './components/WorkbenchMap';
import { Equipment } from './models/Equipment';
import { LabManager } from './models/LabManager';
import {
  BaseEquipmentDTO,
  EquipmentCategory,
  EquipmentStatus,
  LabBenchLocation
} from './types/equipment';
import { getCategoryIcon } from './utils/formatters';

const ALL_CATEGORIES: EquipmentCategory[] = [
  'Oscilloscope',
  'Function Generator',
  'Digital Multimeter',
  'DC Power Supply',
  'Spectrum Analyzer',
  'Soldering & Rework',
  'Logic Analyzer',
  'LCR Meter'
];

export default function App() {
  const labManager = LabManager.getInstance();

  // State synchronized with Singleton Domain Service
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(() => labManager.getEquipmentList());
  const [usageHistory, setUsageHistory] = useState(() => labManager.getUsageHistory());
  const [activeTab, setActiveTab] = useState<ActiveTab>('inventory');

  // Search & Filtering State for Inventory Tab
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'hours' | 'tag' | 'power'>('tag');

  // Modals state
  const [checkoutTarget, setCheckoutTarget] = useState<Equipment | null>(null);
  const [returnTarget, setReturnTarget] = useState<Equipment | null>(null);
  const [detailTarget, setDetailTarget] = useState<Equipment | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [simulatorTarget, setSimulatorTarget] = useState<Equipment | null>(null);

  // Toast / Status notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Subscribe to LabManager domain model events (Observer pattern)
  useEffect(() => {
    const unsubscribe = labManager.subscribe(() => {
      setEquipmentList(labManager.getEquipmentList());
      setUsageHistory(labManager.getUsageHistory());
    });
    return () => unsubscribe();
  }, [labManager]);

  const activeSessions = labManager.getActiveSessions();

  // --- Filtered & Sorted Equipment ---
  const filteredEquipment = equipmentList.filter(eq => {
    const matchesSearch =
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = selectedCategory === 'ALL' || eq.category === selectedCategory;
    const matchesStat = selectedStatus === 'ALL' || eq.status === selectedStatus;
    const matchesLoc = selectedLocation === 'ALL' || eq.location.startsWith(selectedLocation);

    return matchesSearch && matchesCat && matchesStat && matchesLoc;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'hours') return b.totalUsageHours - a.totalUsageHours;
    if (sortBy === 'power') return b.powerRatingWatts - a.powerRatingWatts;
    return a.assetTag.localeCompare(b.assetTag);
  });

  // --- Handlers ---
  const handleCheckOutConfirm = (sessionData: any) => {
    if (!checkoutTarget) return;
    try {
      labManager.checkOutEquipment(checkoutTarget.id, sessionData);
      showToast(`Successfully checked out ${checkoutTarget.assetTag} to ${sessionData.userName}!`);
    } catch (err: any) {
      showToast(err.message || 'Check out failed', 'error');
    }
  };

  const handleReturnConfirm = (params: any) => {
    if (!returnTarget) return;
    try {
      const entry = labManager.returnEquipment(returnTarget.id, params);
      showToast(`Device ${returnTarget.assetTag} checked in! ${entry.durationMinutes} minutes logged.`);
    } catch (err: any) {
      showToast(err.message || 'Return failed', 'error');
    }
  };

  const handleAddEquipment = (dto: BaseEquipmentDTO) => {
    const newEq = labManager.addEquipment(dto);
    showToast(`New instrument ${newEq.assetTag} (${newEq.name}) registered to laboratory!`);
  };

  const handleCalibrate = (id: string, certNo: string, tech: string) => {
    labManager.calibrateEquipment(id, certNo, tech);
    showToast(`Calibration record certified for ${id}.`);
  };

  const handleOpenSimulator = (eq: Equipment) => {
    setSimulatorTarget(eq);
    setActiveTab('bench-simulator');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-cyan-500/20 selection:text-cyan-900">
      
      {/* Top Application Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        activeSessionsCount={activeSessions.length}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 text-xs font-semibold text-slate-800 shadow-xl backdrop-blur-md animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Lab Overview Analytics & Alert Banner */}
        <LabAnalytics
          equipmentList={equipmentList}
          onSelectEquipment={(eq) => setDetailTarget(eq)}
          onOpenCalibration={(eq) => setDetailTarget(eq)}
        />

        {/* VIEW 1: INVENTORY & DEVICE LIST */}
        {activeTab === 'inventory' && (
          <div className="space-y-5">
            
            {/* Filter Toolbar */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm space-y-3">
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by asset tag, model, serial, or bench..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600 transition-all"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  
                  {/* Status filter */}
                  <select
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50/80 py-2 px-3 text-xs font-medium text-slate-700 focus:border-cyan-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600 transition-all"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Available">Available Only</option>
                    <option value="In Use">In Use (Checked Out)</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Calibration Overdue">Calibration Overdue</option>
                  </select>

                  {/* Location Group */}
                  <select
                    value={selectedLocation}
                    onChange={e => setSelectedLocation(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50/80 py-2 px-3 text-xs font-medium text-slate-700 focus:border-cyan-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600 transition-all"
                  >
                    <option value="ALL">All Locations</option>
                    <option value="Bench A">Bench Row A</option>
                    <option value="Bench B">Bench Row B</option>
                    <option value="Bench C">Bench Row C</option>
                    <option value="Bench D">Bench Row D</option>
                    <option value="Rack">Equipment Racks</option>
                    <option value="Storage">Storage Cabinets</option>
                  </select>

                  {/* Sort By */}
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="rounded-xl border border-slate-200 bg-slate-50/80 py-2 px-3 text-xs font-medium text-slate-700 focus:border-cyan-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600 transition-all font-mono"
                  >
                    <option value="tag">Sort: Asset Tag</option>
                    <option value="name">Sort: Name</option>
                    <option value="hours">Sort: Most Used Hours</option>
                    <option value="power">Sort: Power Draw (W)</option>
                  </select>

                </div>
              </div>

              {/* Category Quick Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 no-scrollbar">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === 'ALL'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  All Instruments ({equipmentList.length})
                </button>
                {ALL_CATEGORIES.map(cat => {
                  const count = equipmentList.filter(e => e.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      <span>{getCategoryIcon(cat, 'h-3.5 w-3.5')}</span>
                      <span>{cat}</span>
                      <span className="text-[10px] opacity-75 font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Equipment Grid */}
            {filteredEquipment.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <Search className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <h3 className="text-base font-bold text-slate-800">No Equipment Found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting your search criteria or register a new device to the laboratory.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredEquipment.map(eq => (
                  <EquipmentCard
                    key={eq.id}
                    equipment={eq}
                    onSelect={(e) => setDetailTarget(e)}
                    onCheckOut={(e) => setCheckoutTarget(e)}
                    onReturn={(e) => setReturnTarget(e)}
                    onOpenSimulator={(e) => handleOpenSimulator(e)}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: ACTIVE SESSIONS */}
        {activeTab === 'active-sessions' && (
          <ActiveSessionsView
            activeSessions={activeSessions}
            onReturn={(eq) => setReturnTarget(eq)}
            onInspect={(eq) => setDetailTarget(eq)}
          />
        )}

        {/* VIEW 3: USAGE AUDIT HISTORY */}
        {activeTab === 'history' && (
          <UsageHistoryTable history={usageHistory} />
        )}

        {/* VIEW 4: WORKBENCH FLOORPLAN MAP */}
        {activeTab === 'workbench-map' && (
          <WorkbenchMap
            equipmentList={equipmentList}
            onSelectEquipment={(eq) => setDetailTarget(eq)}
            onCheckOut={(eq) => setCheckoutTarget(eq)}
          />
        )}

        {/* VIEW 5: VIRTUAL BENCH SIMULATOR */}
        {activeTab === 'bench-simulator' && (
          <InteractiveBenchSimulator
            equipmentList={equipmentList}
            selectedEquipment={simulatorTarget}
          />
        )}

        {/* VIEW 6: JAVA & OOP ARCHITECTURE EXPLORER */}
        {activeTab === 'oop-architecture' && (
          <OopArchitectureViewer />
        )}

      </main>

      {/* --- APPLICATION MODALS --- */}

      {/* Check Out Modal */}
      <CheckOutModal
        equipment={checkoutTarget}
        isOpen={checkoutTarget !== null}
        onClose={() => setCheckoutTarget(null)}
        onConfirm={handleCheckOutConfirm}
      />

      {/* Return Device Modal */}
      <ReturnDeviceModal
        equipment={returnTarget}
        isOpen={returnTarget !== null}
        onClose={() => setReturnTarget(null)}
        onConfirm={handleReturnConfirm}
      />

      {/* Equipment Detailed Datasheet & Diagnostic Self-Test Modal */}
      <EquipmentDetailModal
        equipment={detailTarget}
        isOpen={detailTarget !== null}
        onClose={() => setDetailTarget(null)}
        onCheckOut={(eq) => setCheckoutTarget(eq)}
        onReturn={(eq) => setReturnTarget(eq)}
        onCalibrate={handleCalibrate}
        onOpenSimulator={(eq) => handleOpenSimulator(eq)}
      />

      {/* Add New Equipment Modal */}
      <AddEquipmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEquipment={handleAddEquipment}
      />

    </div>
  );
}
