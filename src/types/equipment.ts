export type EquipmentCategory = 
  | 'Oscilloscope'
  | 'Function Generator'
  | 'Digital Multimeter'
  | 'DC Power Supply'
  | 'Spectrum Analyzer'
  | 'Soldering & Rework'
  | 'Logic Analyzer'
  | 'LCR Meter';

export type EquipmentStatus = 
  | 'Available'
  | 'In Use'
  | 'Under Maintenance'
  | 'Calibration Overdue'
  | 'Reserved';

export type LabBenchLocation = 
  | 'Bench A1' | 'Bench A2' | 'Bench A3' | 'Bench A4'
  | 'Bench B1' | 'Bench B2' | 'Bench B3' | 'Bench B4'
  | 'Bench C1' | 'Bench C2' | 'Bench C3' | 'Bench C4'
  | 'Bench D1' | 'Bench D2' | 'Bench D3' | 'Bench D4'
  | 'Rack 1 (RF Lab)' | 'Rack 2 (High Power)' | 'Storage Cabinet 1' | 'Storage Cabinet 2';

export type UserRole = 
  | 'Undergraduate Student'
  | 'Graduate Researcher'
  | 'Lab Assistant / TA'
  | 'Principal Investigator'
  | 'Electronics Technician'
  | 'Faculty Member';

export interface ActiveSession {
  sessionId: string;
  equipmentId: string;
  userName: string;
  userRole: UserRole;
  userEmail: string;
  projectName: string;
  benchLocation: LabBenchLocation;
  startTime: string; // ISO string
  expectedDurationHours: number;
  safetyCheckConfirmed: boolean;
  purposeNotes: string;
}

export interface UsageHistoryEntry {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentAssetTag: string;
  equipmentCategory: EquipmentCategory;
  userName: string;
  userRole: UserRole;
  projectName: string;
  benchLocation: LabBenchLocation;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  powerConsumedKWh: number;
  faultReported: boolean;
  faultDetails?: string;
  notes: string;
}

export interface MaintenanceLog {
  id: string;
  equipmentId: string;
  date: string;
  type: 'Routine Calibration' | 'Repair' | 'Safety Inspection' | 'Firmware Update' | 'Part Replacement';
  technician: string;
  notes: string;
  costUSD?: number;
  certificateNumber?: string;
  nextDueDate: string;
}

export interface BaseEquipmentDTO {
  id: string;
  assetTag: string;
  name: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  location: LabBenchLocation;
  powerRatingWatts: number;
  purchaseDate: string;
  lastCalibrationDate: string;
  calibrationIntervalDays: number;
  totalUsageHours: number;
  healthScore: number; // 0-100%
  imageUrl?: string;
  activeSession?: ActiveSession | null;
  specifications: Record<string, string | number | boolean | string[]>;
  notes: string;
}
