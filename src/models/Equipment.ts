import {
  ActiveSession,
  BaseEquipmentDTO,
  EquipmentCategory,
  EquipmentStatus,
  LabBenchLocation,
  MaintenanceLog,
  UsageHistoryEntry
} from '../types/equipment';

/**
 * OOP Core: Abstract Base Class representing generic Electronics Laboratory Equipment.
 * Demonstrates Abstraction, Encapsulation, Polymorphism, and Invariant Validation.
 */
export abstract class Equipment {
  protected _id: string;
  protected _assetTag: string;
  protected _name: string;
  protected _manufacturer: string;
  protected _model: string;
  protected _serialNumber: string;
  protected _category: EquipmentCategory;
  protected _status: EquipmentStatus;
  protected _location: LabBenchLocation;
  protected _powerRatingWatts: number;
  protected _purchaseDate: string;
  protected _lastCalibrationDate: string;
  protected _calibrationIntervalDays: number;
  protected _totalUsageHours: number;
  protected _healthScore: number;
  protected _activeSession: ActiveSession | null = null;
  protected _notes: string;
  protected _imageUrl?: string;

  constructor(dto: BaseEquipmentDTO) {
    this._id = dto.id;
    this._assetTag = dto.assetTag;
    this._name = dto.name;
    this._manufacturer = dto.manufacturer;
    this._model = dto.model;
    this._serialNumber = dto.serialNumber;
    this._category = dto.category;
    this._status = dto.status;
    this._location = dto.location;
    this._powerRatingWatts = dto.powerRatingWatts;
    this._purchaseDate = dto.purchaseDate;
    this._lastCalibrationDate = dto.lastCalibrationDate;
    this._calibrationIntervalDays = dto.calibrationIntervalDays;
    this._totalUsageHours = dto.totalUsageHours || 0;
    this._healthScore = dto.healthScore ?? 100;
    this._activeSession = dto.activeSession || null;
    this._notes = dto.notes || '';
    this._imageUrl = dto.imageUrl;

    // Check status invariants
    if (this._activeSession && this._status === 'Available') {
      this._status = 'In Use';
    }
    if (this.isCalibrationOverdue() && this._status === 'Available') {
      this._status = 'Calibration Overdue';
    }
  }

  // --- Getters & Encapsulated Accessors ---
  get id(): string { return this._id; }
  get assetTag(): string { return this._assetTag; }
  get name(): string { return this._name; }
  get manufacturer(): string { return this._manufacturer; }
  get model(): string { return this._model; }
  get serialNumber(): string { return this._serialNumber; }
  get category(): EquipmentCategory { return this._category; }
  get status(): EquipmentStatus { return this._status; }
  get location(): LabBenchLocation { return this._location; }
  get powerRatingWatts(): number { return this._powerRatingWatts; }
  get purchaseDate(): string { return this._purchaseDate; }
  get lastCalibrationDate(): string { return this._lastCalibrationDate; }
  get calibrationIntervalDays(): number { return this._calibrationIntervalDays; }
  get totalUsageHours(): number { return Math.round(this._totalUsageHours * 10) / 10; }
  get healthScore(): number { return this._healthScore; }
  get activeSession(): ActiveSession | null { return this._activeSession; }
  get notes(): string { return this._notes; }
  get imageUrl(): string | undefined { return this._imageUrl; }

  // --- Polymorphic Abstract Methods ---
  abstract getDetailedSpecs(): Record<string, string | number | boolean>;
  abstract getSafetyChecklist(): string[];
  abstract runSelfTest(): { passed: boolean; summary: string; diagnostics: Record<string, any> };
  
  // Power consumption calculation in kWh
  calculatePowerConsumption(hours: number): number {
    return parseFloat(((this._powerRatingWatts * hours) / 1000).toFixed(3));
  }

  // --- Business Operations & Domain Logic ---
  
  /**
   * Checks out the device for an authorized user session.
   */
  checkOut(sessionData: Omit<ActiveSession, 'sessionId' | 'equipmentId' | 'startTime'>): ActiveSession {
    if (this._status === 'In Use') {
      throw new Error(`Device ${this._assetTag} is already checked out.`);
    }
    if (this._status === 'Under Maintenance') {
      throw new Error(`Device ${this._assetTag} is currently under maintenance.`);
    }

    const sessionId = `SES-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random()*1000)}`;
    const newSession: ActiveSession = {
      ...sessionData,
      sessionId,
      equipmentId: this._id,
      startTime: new Date().toISOString()
    };

    this._activeSession = newSession;
    this._status = 'In Use';
    this._location = sessionData.benchLocation;
    return newSession;
  }

  /**
   * Returns the device and generates a finalized UsageHistoryEntry.
   */
  returnEquipment(params: {
    notes?: string;
    faultReported?: boolean;
    faultDetails?: string;
    actualEndTime?: string;
  }): UsageHistoryEntry {
    if (!this._activeSession) {
      throw new Error(`No active checkout session exists for ${this._name} (${this._assetTag}).`);
    }

    const endTime = params.actualEndTime || new Date().toISOString();
    const startMs = new Date(this._activeSession.startTime).getTime();
    const endMs = new Date(endTime).getTime();
    const durationMinutes = Math.max(1, Math.round((endMs - startMs) / (1000 * 60)));
    const durationHours = durationMinutes / 60;
    
    // Accumulate total usage hours
    this._totalUsageHours += durationHours;
    const powerKWh = this.calculatePowerConsumption(durationHours);

    const historyEntry: UsageHistoryEntry = {
      id: `LOG-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random()*1000)}`,
      equipmentId: this._id,
      equipmentName: `${this._manufacturer} ${this._model} (${this._name})`,
      equipmentAssetTag: this._assetTag,
      equipmentCategory: this._category,
      userName: this._activeSession.userName,
      userRole: this._activeSession.userRole,
      projectName: this._activeSession.projectName,
      benchLocation: this._activeSession.benchLocation,
      startTime: this._activeSession.startTime,
      endTime: endTime,
      durationMinutes: durationMinutes,
      powerConsumedKWh: powerKWh,
      faultReported: !!params.faultReported,
      faultDetails: params.faultDetails || '',
      notes: params.notes || this._activeSession.purposeNotes || 'Normal session completed.'
    };

    // State transition
    this._activeSession = null;
    if (params.faultReported) {
      this._status = 'Under Maintenance';
      this._healthScore = Math.max(20, this._healthScore - 30);
    } else if (this.isCalibrationOverdue()) {
      this._status = 'Calibration Overdue';
    } else {
      this._status = 'Available';
    }

    return historyEntry;
  }

  /**
   * Verifies whether calibration interval has passed.
   */
  isCalibrationOverdue(): boolean {
    const lastCal = new Date(this._lastCalibrationDate).getTime();
    const now = Date.now();
    const daysSince = (now - lastCal) / (1000 * 60 * 60 * 24);
    return daysSince > this._calibrationIntervalDays;
  }

  getDaysUntilCalibrationDue(): number {
    const lastCal = new Date(this._lastCalibrationDate).getTime();
    const dueDate = lastCal + this._calibrationIntervalDays * (1000 * 60 * 60 * 24);
    const diffDays = Math.round((dueDate - Date.now()) / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  performCalibration(certificateNumber: string, technician: string = 'Certified Cal Lab'): void {
    this._lastCalibrationDate = new Date().toISOString().split('T')[0];
    this._healthScore = Math.min(100, this._healthScore + 15);
    if (this._status === 'Calibration Overdue') {
      this._status = this._activeSession ? 'In Use' : 'Available';
    }
  }

  setStatus(newStatus: EquipmentStatus): void {
    this._status = newStatus;
  }

  setLocation(newLocation: LabBenchLocation): void {
    this._location = newLocation;
  }

  toJSON(): BaseEquipmentDTO {
    return {
      id: this._id,
      assetTag: this._assetTag,
      name: this._name,
      manufacturer: this._manufacturer,
      model: this._model,
      serialNumber: this._serialNumber,
      category: this._category,
      status: this._status,
      location: this._location,
      powerRatingWatts: this._powerRatingWatts,
      purchaseDate: this._purchaseDate,
      lastCalibrationDate: this._lastCalibrationDate,
      calibrationIntervalDays: this._calibrationIntervalDays,
      totalUsageHours: this._totalUsageHours,
      healthScore: this._healthScore,
      imageUrl: this._imageUrl,
      activeSession: this._activeSession,
      specifications: this.getDetailedSpecs(),
      notes: this._notes
    };
  }
}

// -------------------------------------------------------------
// Specialized Subclasses (Polymorphism & Domain Specialization)
// -------------------------------------------------------------

export class Oscilloscope extends Equipment {
  private _bandwidthMHz: number;
  private _channels: number;
  private _sampleRateGSa: number;
  private _memoryDepthMpts: number;

  constructor(dto: BaseEquipmentDTO) {
    super(dto);
    this._bandwidthMHz = Number(dto.specifications.bandwidthMHz || 100);
    this._channels = Number(dto.specifications.channels || 4);
    this._sampleRateGSa = Number(dto.specifications.sampleRateGSa || 1.0);
    this._memoryDepthMpts = Number(dto.specifications.memoryDepthMpts || 12);
  }

  get bandwidthMHz(): number { return this._bandwidthMHz; }
  get channels(): number { return this._channels; }
  get sampleRateGSa(): number { return this._sampleRateGSa; }
  get memoryDepthMpts(): number { return this._memoryDepthMpts; }

  getDetailedSpecs(): Record<string, string | number | boolean> {
    return {
      bandwidthMHz: this._bandwidthMHz,
      channels: this._channels,
      sampleRateGSa: this._sampleRateGSa,
      memoryDepthMpts: this._memoryDepthMpts,
      verticalResolution: '8-bit ADC / 12-bit High-Res Mode',
      triggerTypes: 'Edge, Pulse, Video, Slope, Pattern, Timeout',
      inputImpedance: '1 MΩ ±1% || 14 pF'
    };
  }

  getSafetyChecklist(): string[] {
    return [
      'Ensure BNC probe ground clips are connected to true GND, not floating high voltage.',
      'Verify probe attenuation switch (1X vs 10X) matches oscilloscope channel setting.',
      'Do not exceed maximum input voltage (300V CAT I / 400Vpk).',
      'Use isolated differential probes when probing mains/floating circuits.'
    ];
  }

  runSelfTest() {
    const chOk = this._channels >= 2;
    return {
      passed: chOk,
      summary: `Channels 1-${this._channels} ADC self-calibration verified. Trigger baseline aligned.`,
      diagnostics: {
        ch1OffsetErrorMv: 0.12,
        ch2OffsetErrorMv: -0.08,
        clockJitterPs: 4.2,
        adcFirmware: 'v3.42-revB'
      }
    };
  }
}

export class FunctionGenerator extends Equipment {
  private _maxFrequencyMHz: number;
  private _waveformTypes: string[];
  private _maxVoltageVpp: number;
  private _outputChannels: number;

  constructor(dto: BaseEquipmentDTO) {
    super(dto);
    this._maxFrequencyMHz = Number(dto.specifications.maxFrequencyMHz || 25);
    const wf = dto.specifications.waveformTypes;
    this._waveformTypes = Array.isArray(wf) ? (wf as string[]) : ['Sine', 'Square', 'Ramp', 'Pulse', 'Noise', 'Arbitrary'];
    this._maxVoltageVpp = Number(dto.specifications.maxVoltageVpp || 20);
    this._outputChannels = Number(dto.specifications.outputChannels || 2);
  }

  getDetailedSpecs(): Record<string, string | number | boolean> {
    return {
      maxFrequencyMHz: this._maxFrequencyMHz,
      outputChannels: this._outputChannels,
      maxVoltageVpp: this._maxVoltageVpp,
      waveformTypes: this._waveformTypes.join(', '),
      samplingRate: '1.2 GSa/s',
      frequencyResolution: '1 µHz',
      outputImpedance: '50 Ω / High-Z selectable'
    };
  }

  getSafetyChecklist(): string[] {
    return [
      'Verify connected circuit is not back-driving voltage into generator output terminal.',
      'Confirm 50Ω load impedance matching before applying high amplitude signals.',
      'Do not short output when configured to maximum 20Vpp output mode.',
      'Observe ESD precautions on direct BNC interfaces.'
    ];
  }

  runSelfTest() {
    return {
      passed: true,
      summary: 'DDS synthesizer PLL lock verified across 1µHz - 50MHz span.',
      diagnostics: {
        harmonicDistortionDbc: -55.4,
        pllLockTimeMs: 1.2,
        amplitudeAccuracyPercent: 0.04
      }
    };
  }
}

export class DigitalMultimeter extends Equipment {
  private _digits: string;
  private _maxVoltageDC: number;
  private _maxCurrentA: number;
  private _trueRMS: boolean;

  constructor(dto: BaseEquipmentDTO) {
    super(dto);
    this._digits = String(dto.specifications.digits || '6.5 Digits');
    this._maxVoltageDC = Number(dto.specifications.maxVoltageDC || 1000);
    this._maxCurrentA = Number(dto.specifications.maxCurrentA || 10);
    this._trueRMS = dto.specifications.trueRMS !== false;
  }

  getDetailedSpecs(): Record<string, string | number | boolean> {
    return {
      digits: this._digits,
      maxVoltageDC: `${this._maxVoltageDC} V`,
      maxCurrentA: `${this._maxCurrentA} A`,
      trueRMS: this._trueRMS ? 'Yes (AC+DC coupled)' : 'No',
      inputImpedance: '> 10 GΩ (DCV range up to 10V)',
      measurementModes: 'DCV, ACV, DCI, ACI, 2W/4W Ohm, Freq, Period, Diode, Continuity, Temp'
    };
  }

  getSafetyChecklist(): string[] {
    return [
      'Ensure test leads are connected to Volt/Ohm jack before measuring voltage (NEVER in Current jack).',
      'Inspect probe insulation and CAT rating before measuring circuits above 50V.',
      'Verify internal 10A / 500mA fast-acting ceramic safety fuses are intact.',
      'Discharge all filter capacitors before measuring resistance or continuity.'
    ];
  }

  runSelfTest() {
    return {
      passed: true,
      summary: 'Precision voltage reference 10.00000V verified against internal standard.',
      diagnostics: {
        zeroOffsetVolts: '0.000002 V',
        internalTempC: 27.4,
        currentFuseStatus: 'INTACT'
      }
    };
  }
}

export class DCPowerSupply extends Equipment {
  private _outputChannels: number;
  private _maxVoltageV: number;
  private _maxCurrentA: number;
  private _maxPowerWattsSupply: number;

  constructor(dto: BaseEquipmentDTO) {
    super(dto);
    this._outputChannels = Number(dto.specifications.outputChannels || 3);
    this._maxVoltageV = Number(dto.specifications.maxVoltageV || 30);
    this._maxCurrentA = Number(dto.specifications.maxCurrentA || 5);
    this._maxPowerWattsSupply = Number(dto.specifications.maxPowerWattsSupply || 195);
  }

  getDetailedSpecs(): Record<string, string | number | boolean> {
    return {
      outputChannels: this._outputChannels,
      maxVoltageV: `${this._maxVoltageV} V per channel`,
      maxCurrentA: `${this._maxCurrentA} A per channel`,
      maxPowerWattsSupply: `${this._maxPowerWattsSupply} W`,
      rippleAndNoise: '< 350 µVrms / 2 mVpp',
      trackingModes: 'Independent, Series (60V), Parallel (10A)',
      protections: 'OVP (Over Voltage), OCP (Over Current), OTP (Over Temp)'
    };
  }

  getSafetyChecklist(): string[] {
    return [
      'ALWAYS set Current Limit (CC mode) before powering on target microcontroller/IC board.',
      'Verify polarity (+ RED, - BLACK) prior to connecting device under test.',
      'Keep output toggled OFF while wiring circuit breadboards.',
      'Ensure sufficient ventilation around rear cooling fans during continuous high-current draw.'
    ];
  }

  runSelfTest() {
    return {
      passed: true,
      summary: 'Channel 1-3 linear regulation and OCP trip points certified.',
      diagnostics: {
        ovpTripMs: 1.5,
        ocpTripMs: 0.8,
        thermalSenseTempC: 31.8
      }
    };
  }
}

export class SpectrumAnalyzer extends Equipment {
  private _maxFreqGHz: number;
  private _danlDbm: number;

  constructor(dto: BaseEquipmentDTO) {
    super(dto);
    this._maxFreqGHz = Number(dto.specifications.maxFreqGHz || 3.2);
    this._danlDbm = Number(dto.specifications.danlDbm || -161);
  }

  getDetailedSpecs(): Record<string, string | number | boolean> {
    return {
      frequencyRange: `9 kHz - ${this._maxFreqGHz} GHz`,
      displayedAverageNoiseLevel: `${this._danlDbm} dBm/Hz`,
      resolutionBandwidth: '1 Hz to 3 MHz',
      phaseNoise: '< -98 dBc/Hz @ 10 kHz offset',
      rfInputMax: '+30 dBm (1 Watt) / 50 VDC max'
    };
  }

  getSafetyChecklist(): string[] {
    return [
      'DANGER: Do NOT exceed +30 dBm (1W) RF input power — immediate frontend mixer blowout.',
      'Always insert inline RF attenuator (20dB/30dB) when probing transmitter stages.',
      'Discharge antenna cables before connecting to 50Ω N-type input connector.',
      'Do not apply direct DC voltage across RF input port.'
    ];
  }

  runSelfTest() {
    return {
      passed: true,
      summary: 'RF frontend LO frequency synthesizer lock & attenuator step calibration OK.',
      diagnostics: {
        yigHeaterCurrentMa: 140,
        loPhaseLock: 'LOCKED',
        attenuatorStepErrorDb: 0.05
      }
    };
  }
}

export class SolderingStation extends Equipment {
  private _tempRangeC: string;
  private _heaterPowerWatts: number;

  constructor(dto: BaseEquipmentDTO) {
    super(dto);
    this._tempRangeC = String(dto.specifications.tempRangeC || '200°C - 480°C');
    this._heaterPowerWatts = Number(dto.specifications.heaterPowerWatts || 75);
  }

  getDetailedSpecs(): Record<string, string | number | boolean> {
    return {
      tempRangeC: this._tempRangeC,
      heaterPowerWatts: `${this._heaterPowerWatts} W composite tip`,
      temperatureStability: '±5°C at idle',
      tipToGroundResistance: '< 2 Ω',
      esdSafe: true,
      sleepTimeoutMinutes: 10
    };
  }

  getSafetyChecklist(): string[] {
    return [
      'Operate under active fume extraction duct / HEPA carbon filter.',
      'Always place hot handpiece in safety iron stand with brass wire sponge.',
      'Turn OFF power immediately after soldering task is complete.',
      'Wear safety glasses to protect eyes from flux splatter.'
    ];
  }

  runSelfTest() {
    return {
      passed: true,
      summary: 'Ceramic heater thermocouple PID loop calibrated within ±1.5°C.',
      diagnostics: {
        heaterResistanceOhms: 8.2,
        tipGroundContinuity: 'PASSED (<0.4Ω)',
        standAutoSleepSensor: 'FUNCTIONAL'
      }
    };
  }
}

export class LogicAnalyzer extends Equipment {
  private _digitalChannels: number;
  private _maxSampleRateMSa: number;

  constructor(dto: BaseEquipmentDTO) {
    super(dto);
    this._digitalChannels = Number(dto.specifications.digitalChannels || 16);
    this._maxSampleRateMSa = Number(dto.specifications.maxSampleRateMSa || 500);
  }

  getDetailedSpecs(): Record<string, string | number | boolean> {
    return {
      digitalChannels: this._digitalChannels,
      maxSampleRateMSa: `${this._maxSampleRateMSa} MSa/s`,
      supportedProtocols: 'I2C, SPI, UART/RS232, CAN, LIN, USB 1.1, I2S, 1-Wire, MIDI',
      inputVoltageRange: '-25.0 V to +25.0 V',
      thresholdVoltages: '1.2V, 1.8V, 2.5V, 3.3V, 5.0V user-defined'
    };
  }

  getSafetyChecklist(): string[] {
    return [
      'Connect target GND probe BEFORE connecting digital channel signal clips.',
      'Verify target logic level does not exceed maximum ±25V absolute tolerance.',
      'Avoid pulling flying lead probe harness while attached to sensitive IC pins.'
    ];
  }

  runSelfTest() {
    return {
      passed: true,
      summary: 'FPGA timing capture memory buffer and probe flywire continuity verified.',
      diagnostics: {
        fpgaSyncClock: '100 MHz UltraScale',
        usb3ThroughputMBs: 380,
        podPowerDrawMa: 210
      }
    };
  }
}

export class LCRMeter extends Equipment {
  private _testFrequencies: string;
  private _basicAccuracy: string;

  constructor(dto: BaseEquipmentDTO) {
    super(dto);
    this._testFrequencies = String(dto.specifications.testFrequencies || '20 Hz to 300 kHz');
    this._basicAccuracy = String(dto.specifications.basicAccuracy || '0.05%');
  }

  getDetailedSpecs(): Record<string, string | number | boolean> {
    return {
      testFrequencies: this._testFrequencies,
      basicAccuracy: this._basicAccuracy,
      testSignals: '0.1V - 2.0Vrms, 10mV steps',
      measurableParameters: 'L, C, R, |Z|, Y, X, B, G, D, Q, θ, DCR, ESR',
      kelvinProbes: '4-Terminal Kelvin fixture included'
    };
  }

  getSafetyChecklist(): string[] {
    return [
      'CRITICAL: Discharge electrolytic and film capacitors fully before inserting in Kelvin fixture.',
      'Perform OPEN/SHORT fixture compensation prior to low ESR / high frequency measurements.',
      'Do not apply external AC or DC bias voltages exceeding instrument specs.'
    ];
  }

  runSelfTest() {
    return {
      passed: true,
      summary: '4-wire Kelvin bridge zero balance verified across all frequency decades.',
      diagnostics: {
        bridgeZeroBalance: '0.0001% error',
        oscillatorPurityTHD: '<0.01%',
        dcBiasLevelV: 0.00
      }
    };
  }
}
