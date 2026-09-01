import { INITIAL_EQUIPMENT_DATA, INITIAL_USAGE_HISTORY } from '../data/initialEquipment';
import {
  ActiveSession,
  BaseEquipmentDTO,
  EquipmentCategory,
  EquipmentStatus,
  LabBenchLocation,
  UsageHistoryEntry,
  UserRole
} from '../types/equipment';
import { Equipment } from './Equipment';
import { EquipmentFactory } from './EquipmentFactory';

type Listener = () => void;

const STORAGE_KEY_EQUIPMENT = 'volttrack_lab_equipment_v1';
const STORAGE_KEY_HISTORY = 'volttrack_usage_history_v1';

export class LabManager {
  private static _instance: LabManager | null = null;
  private _equipmentList: Equipment[] = [];
  private _usageHistory: UsageHistoryEntry[] = [];
  private _listeners: Set<Listener> = new Set();

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): LabManager {
    if (!LabManager._instance) {
      LabManager._instance = new LabManager();
    }
    return LabManager._instance;
  }

  // --- Observer Pattern ---
  public subscribe(listener: Listener): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  private notify(): void {
    this.saveToStorage();
    this._listeners.forEach(fn => {
      try {
        fn();
      } catch (e) {
        console.error('Error in LabManager observer:', e);
      }
    });
  }

  // --- Persistence ---
  private loadFromStorage(): void {
    try {
      const storedEq = localStorage.getItem(STORAGE_KEY_EQUIPMENT);
      const storedHist = localStorage.getItem(STORAGE_KEY_HISTORY);

      if (storedEq) {
        const parsedDTOs: BaseEquipmentDTO[] = JSON.parse(storedEq);
        this._equipmentList = parsedDTOs.map(dto => EquipmentFactory.createEquipment(dto));
      } else {
        this._equipmentList = INITIAL_EQUIPMENT_DATA.map(dto => EquipmentFactory.createEquipment(dto));
      }

      if (storedHist) {
        this._usageHistory = JSON.parse(storedHist);
      } else {
        this._usageHistory = [...INITIAL_USAGE_HISTORY];
      }
    } catch (e) {
      console.warn('Failed to load lab data from localStorage, reverting to defaults', e);
      this._equipmentList = INITIAL_EQUIPMENT_DATA.map(dto => EquipmentFactory.createEquipment(dto));
      this._usageHistory = [...INITIAL_USAGE_HISTORY];
    }
  }

  private saveToStorage(): void {
    try {
      const dtoArray = this._equipmentList.map(eq => eq.toJSON());
      localStorage.setItem(STORAGE_KEY_EQUIPMENT, JSON.stringify(dtoArray));
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(this._usageHistory));
    } catch (e) {
      console.warn('Failed to save lab data to localStorage', e);
    }
  }

  public resetToFactoryDefaults(): void {
    this._equipmentList = INITIAL_EQUIPMENT_DATA.map(dto => EquipmentFactory.createEquipment(dto));
    this._usageHistory = [...INITIAL_USAGE_HISTORY];
    this.notify();
  }

  // --- Equipment Accessors ---
  public getEquipmentList(): Equipment[] {
    return [...this._equipmentList];
  }

  public getEquipmentById(id: string): Equipment | undefined {
    return this._equipmentList.find(eq => eq.id === id);
  }

  public getUsageHistory(): UsageHistoryEntry[] {
    return [...this._usageHistory].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  public getActiveSessions(): { equipment: Equipment; session: ActiveSession }[] {
    return this._equipmentList
      .filter(eq => eq.activeSession !== null)
      .map(eq => ({ equipment: eq, session: eq.activeSession! }));
  }

  // --- Actions ---

  /**
   * Check out an equipment piece for a user session
   */
  public checkOutEquipment(
    equipmentId: string,
    sessionData: {
      userName: string;
      userRole: UserRole;
      userEmail: string;
      projectName: string;
      benchLocation: LabBenchLocation;
      expectedDurationHours: number;
      safetyCheckConfirmed: boolean;
      purposeNotes: string;
    }
  ): ActiveSession {
    const equipment = this.getEquipmentById(equipmentId);
    if (!equipment) {
      throw new Error(`Equipment with ID ${equipmentId} not found in lab registry.`);
    }

    const session = equipment.checkOut(sessionData);
    this.notify();
    return session;
  }

  /**
   * Return equipment and log usage history
   */
  public returnEquipment(
    equipmentId: string,
    params: {
      notes?: string;
      faultReported?: boolean;
      faultDetails?: string;
    }
  ): UsageHistoryEntry {
    const equipment = this.getEquipmentById(equipmentId);
    if (!equipment) {
      throw new Error(`Equipment with ID ${equipmentId} not found.`);
    }

    const historyEntry = equipment.returnEquipment(params);
    this._usageHistory.unshift(historyEntry);
    this.notify();
    return historyEntry;
  }

  /**
   * Add a new equipment piece to the inventory
   */
  public addEquipment(dto: BaseEquipmentDTO): Equipment {
    // Prevent duplicate asset tag
    const exists = this._equipmentList.some(e => e.assetTag.toLowerCase() === dto.assetTag.toLowerCase());
    if (exists) {
      throw new Error(`An instrument with Asset Tag '${dto.assetTag}' already exists.`);
    }

    const newEquipment = EquipmentFactory.createEquipment(dto);
    this._equipmentList.push(newEquipment);
    this.notify();
    return newEquipment;
  }

  /**
   * Update equipment data
   */
  public updateEquipment(dto: BaseEquipmentDTO): void {
    const index = this._equipmentList.findIndex(e => e.id === dto.id);
    if (index === -1) {
      throw new Error(`Equipment with ID ${dto.id} not found.`);
    }

    const updated = EquipmentFactory.createEquipment(dto);
    this._equipmentList[index] = updated;
    this.notify();
  }

  /**
   * Retire / delete equipment from lab
   */
  public removeEquipment(id: string): void {
    const equipment = this.getEquipmentById(id);
    if (equipment?.activeSession) {
      throw new Error(`Cannot remove equipment while active session is running. Return device first.`);
    }
    this._equipmentList = this._equipmentList.filter(e => e.id !== id);
    this.notify();
  }

  /**
   * Calibrate equipment
   */
  public calibrateEquipment(id: string, certificateNo: string, technician: string): void {
    const equipment = this.getEquipmentById(id);
    if (!equipment) return;
    equipment.performCalibration(certificateNo, technician);
    this.notify();
  }

  /**
   * Change status (e.g. Set Under Maintenance or Available)
   */
  public setEquipmentStatus(id: string, status: EquipmentStatus): void {
    const equipment = this.getEquipmentById(id);
    if (!equipment) return;
    equipment.setStatus(status);
    this.notify();
  }

  // --- Lab Analytics & Metrics ---
  public getLabStatistics() {
    const totalDevices = this._equipmentList.length;
    const inUseCount = this._equipmentList.filter(e => e.status === 'In Use').length;
    const availableCount = this._equipmentList.filter(e => e.status === 'Available').length;
    const maintenanceCount = this._equipmentList.filter(e => e.status === 'Under Maintenance').length;
    const overdueCalCount = this._equipmentList.filter(e => e.isCalibrationOverdue()).length;

    const utilizationRate = totalDevices > 0 ? Math.round((inUseCount / totalDevices) * 100) : 0;
    
    const totalUsageHours = this._equipmentList.reduce((acc, eq) => acc + eq.totalUsageHours, 0);
    const avgHealthScore = totalDevices > 0
      ? Math.round(this._equipmentList.reduce((acc, eq) => acc + eq.healthScore, 0) / totalDevices)
      : 100;

    const totalKWhConsumed = this._usageHistory.reduce((acc, h) => acc + (h.powerConsumedKWh || 0), 0);

    return {
      totalDevices,
      inUseCount,
      availableCount,
      maintenanceCount,
      overdueCalCount,
      utilizationRate,
      totalUsageHours: Math.round(totalUsageHours * 10) / 10,
      avgHealthScore,
      totalKWhConsumed: Math.round(totalKWhConsumed * 100) / 100
    };
  }

  // --- Export / Import ---
  public exportDataJSON(): string {
    const payload = {
      exportTimestamp: new Date().toISOString(),
      equipment: this._equipmentList.map(e => e.toJSON()),
      history: this._usageHistory
    };
    return JSON.stringify(payload, null, 2);
  }

  public exportUsageCSV(): string {
    const headers = ['Log ID', 'Asset Tag', 'Equipment Name', 'Category', 'User Name', 'Role', 'Project', 'Bench', 'Start Time', 'End Time', 'Duration (Mins)', 'Power (kWh)', 'Fault Reported', 'Notes'];
    const rows = this._usageHistory.map(h => [
      h.id,
      `"${h.equipmentAssetTag}"`,
      `"${h.equipmentName.replace(/"/g, '""')}"`,
      `"${h.equipmentCategory}"`,
      `"${h.userName.replace(/"/g, '""')}"`,
      `"${h.userRole}"`,
      `"${h.projectName.replace(/"/g, '""')}"`,
      `"${h.benchLocation}"`,
      h.startTime,
      h.endTime,
      h.durationMinutes,
      h.powerConsumedKWh,
      h.faultReported ? 'YES' : 'NO',
      `"${h.notes.replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  public importDataJSON(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.equipment)) {
        this._equipmentList = data.equipment.map((dto: BaseEquipmentDTO) => EquipmentFactory.createEquipment(dto));
      }
      if (Array.isArray(data.history)) {
        this._usageHistory = data.history;
      }
      this.notify();
      return { success: true, message: `Successfully imported ${this._equipmentList.length} devices and ${this._usageHistory.length} usage logs.` };
    } catch (err: any) {
      return { success: false, message: `Import error: ${err.message}` };
    }
  }
}
