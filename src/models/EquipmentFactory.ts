import { BaseEquipmentDTO } from '../types/equipment';
import {
  DCPowerSupply,
  DigitalMultimeter,
  Equipment,
  FunctionGenerator,
  LCRMeter,
  LogicAnalyzer,
  Oscilloscope,
  SolderingStation,
  SpectrumAnalyzer
} from './Equipment';

/**
 * Factory Design Pattern for Equipment instantiation.
 * Centralizes polymorphism and object construction from persistence/network DTOs.
 */
export class EquipmentFactory {
  public static createEquipment(dto: BaseEquipmentDTO): Equipment {
    switch (dto.category) {
      case 'Oscilloscope':
        return new Oscilloscope(dto);
      case 'Function Generator':
        return new FunctionGenerator(dto);
      case 'Digital Multimeter':
        return new DigitalMultimeter(dto);
      case 'DC Power Supply':
        return new DCPowerSupply(dto);
      case 'Spectrum Analyzer':
        return new SpectrumAnalyzer(dto);
      case 'Soldering & Rework':
        return new SolderingStation(dto);
      case 'Logic Analyzer':
        return new LogicAnalyzer(dto);
      case 'LCR Meter':
        return new LCRMeter(dto);
      default:
        // Default to base oscilloscope subclass or generic proxy
        return new Oscilloscope(dto);
    }
  }

  public static createDefaultDTO(category: BaseEquipmentDTO['category']): BaseEquipmentDTO {
    const timestamp = Date.now();
    const randomHex = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const today = new Date().toISOString().split('T')[0];

    const categorySpecs: Record<string, any> = {
      'Oscilloscope': {
        bandwidthMHz: 100,
        channels: 4,
        sampleRateGSa: 1.0,
        memoryDepthMpts: 12
      },
      'Function Generator': {
        maxFrequencyMHz: 25,
        outputChannels: 2,
        maxVoltageVpp: 20,
        waveformTypes: ['Sine', 'Square', 'Ramp', 'Pulse', 'Noise', 'Arbitrary']
      },
      'Digital Multimeter': {
        digits: '6.5 Digits',
        maxVoltageDC: 1000,
        maxCurrentA: 10,
        trueRMS: true
      },
      'DC Power Supply': {
        outputChannels: 3,
        maxVoltageV: 30,
        maxCurrentA: 5,
        maxPowerWattsSupply: 195
      },
      'Spectrum Analyzer': {
        maxFreqGHz: 3.2,
        danlDbm: -161
      },
      'Soldering & Rework': {
        tempRangeC: '200°C - 480°C',
        heaterPowerWatts: 75
      },
      'Logic Analyzer': {
        digitalChannels: 16,
        maxSampleRateMSa: 500
      },
      'LCR Meter': {
        testFrequencies: '20 Hz to 300 kHz',
        basicAccuracy: '0.05%'
      }
    };

    return {
      id: `EQ-${timestamp}`,
      assetTag: `LAB-${category.slice(0, 3).toUpperCase()}-${randomHex}`,
      name: `New ${category}`,
      manufacturer: 'Keysight / Rigol / Fluke',
      model: 'GEN-2000X',
      serialNumber: `SN-${randomHex}-VLT`,
      category: category,
      status: 'Available',
      location: 'Bench A1',
      powerRatingWatts: 60,
      purchaseDate: today,
      lastCalibrationDate: today,
      calibrationIntervalDays: 365,
      totalUsageHours: 0,
      healthScore: 100,
      specifications: categorySpecs[category] || {},
      notes: 'New laboratory equipment registered.'
    };
  }
}
