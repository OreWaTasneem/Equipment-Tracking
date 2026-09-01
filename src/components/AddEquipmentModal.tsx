import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  PlusCircle,
  X
} from 'lucide-react';
import { EquipmentFactory } from '../models/EquipmentFactory';
import {
  BaseEquipmentDTO,
  EquipmentCategory,
  LabBenchLocation
} from '../types/equipment';
import { getCategoryIcon } from '../utils/formatters';

interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEquipment: (dto: BaseEquipmentDTO) => void;
}

const CATEGORIES: EquipmentCategory[] = [
  'Oscilloscope',
  'Function Generator',
  'Digital Multimeter',
  'DC Power Supply',
  'Spectrum Analyzer',
  'Soldering & Rework',
  'Logic Analyzer',
  'LCR Meter'
];

const LOCATIONS: LabBenchLocation[] = [
  'Bench A1', 'Bench A2', 'Bench A3', 'Bench A4',
  'Bench B1', 'Bench B2', 'Bench B3', 'Bench B4',
  'Bench C1', 'Bench C2', 'Bench C3', 'Bench C4',
  'Bench D1', 'Bench D2', 'Bench D3', 'Bench D4',
  'Rack 1 (RF Lab)', 'Rack 2 (High Power)', 'Storage Cabinet 1', 'Storage Cabinet 2'
];

export const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({
  isOpen,
  onClose,
  onAddEquipment
}) => {
  if (!isOpen) return null;

  const [category, setCategory] = useState<EquipmentCategory>('Oscilloscope');
  const [formData, setFormData] = useState<BaseEquipmentDTO>(() => EquipmentFactory.createDefaultDTO('Oscilloscope'));
  const [errorMsg, setErrorMsg] = useState('');

  const handleCategoryChange = (newCat: EquipmentCategory) => {
    setCategory(newCat);
    const template = EquipmentFactory.createDefaultDTO(newCat);
    setFormData({
      ...template,
      location: formData.location
    });
  };

  const handleSpecChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetTag.trim()) {
      setErrorMsg('Asset tag is required.');
      return;
    }
    if (!formData.name.trim()) {
      setErrorMsg('Equipment name is required.');
      return;
    }

    try {
      onAddEquipment(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add equipment.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl my-6">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200">
              <PlusCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Register New Lab Equipment
              </h2>
              <p className="text-xs text-slate-500">
                Instantiates a typed domain object subclass with specifications and safety requirements.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">
              Equipment Subclass / Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`flex items-center gap-2 rounded-lg p-2.5 text-xs text-left border transition-all cursor-pointer ${
                    category === cat
                      ? 'border-cyan-600 bg-cyan-50 text-cyan-800 font-semibold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className={category === cat ? 'text-cyan-600' : 'text-slate-400'}>
                    {getCategoryIcon(cat, 'h-4 w-4')}
                  </span>
                  <span className="truncate">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Asset Tag / Barcode *
              </label>
              <input
                type="text"
                required
                value={formData.assetTag}
                onChange={e => setFormData({ ...formData, assetTag: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-900 font-mono focus:border-cyan-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Equipment Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                required
                value={formData.manufacturer}
                onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Model Number
              </label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 font-mono focus:border-cyan-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Serial Number
              </label>
              <input
                type="text"
                required
                value={formData.serialNumber}
                onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 font-mono focus:border-cyan-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Default Location / Bench
              </label>
              <select
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value as LabBenchLocation })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-800 focus:border-cyan-600 focus:bg-white focus:outline-none font-mono"
              >
                {LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Power Draw (Watts)
              </label>
              <input
                type="number"
                min="1"
                max="3000"
                value={formData.powerRatingWatts}
                onChange={e => setFormData({ ...formData, powerRatingWatts: parseFloat(e.target.value) || 50 })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 font-mono focus:border-cyan-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Cal Interval (Days)
              </label>
              <input
                type="number"
                min="30"
                max="1095"
                value={formData.calibrationIntervalDays}
                onChange={e => setFormData({ ...formData, calibrationIntervalDays: parseInt(e.target.value) || 365 })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 font-mono focus:border-cyan-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Dynamic Specifications according to Subclass */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <h4 className="text-xs font-bold text-cyan-700 flex items-center gap-1.5 font-mono">
              <Cpu className="h-4 w-4 text-cyan-600" />
              {category} Specific Attributes:
            </h4>

            {category === 'Oscilloscope' && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">Bandwidth (MHz)</label>
                  <input
                    type="number"
                    value={formData.specifications.bandwidthMHz as number || 100}
                    onChange={e => handleSpecChange('bandwidthMHz', Number(e.target.value))}
                    className="w-full rounded bg-white p-2 text-slate-900 border border-slate-200 font-mono focus:border-cyan-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Channels</label>
                  <input
                    type="number"
                    value={formData.specifications.channels as number || 4}
                    onChange={e => handleSpecChange('channels', Number(e.target.value))}
                    className="w-full rounded bg-white p-2 text-slate-900 border border-slate-200 font-mono focus:border-cyan-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {category === 'DC Power Supply' && (
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">Max Voltage (V)</label>
                  <input
                    type="number"
                    value={formData.specifications.maxVoltageV as number || 30}
                    onChange={e => handleSpecChange('maxVoltageV', Number(e.target.value))}
                    className="w-full rounded bg-white p-2 text-slate-900 border border-slate-200 font-mono focus:border-cyan-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Max Current (A)</label>
                  <input
                    type="number"
                    value={formData.specifications.maxCurrentA as number || 5}
                    onChange={e => handleSpecChange('maxCurrentA', Number(e.target.value))}
                    className="w-full rounded bg-white p-2 text-slate-900 border border-slate-200 font-mono focus:border-cyan-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Channels</label>
                  <input
                    type="number"
                    value={formData.specifications.outputChannels as number || 3}
                    onChange={e => handleSpecChange('outputChannels', Number(e.target.value))}
                    className="w-full rounded bg-white p-2 text-slate-900 border border-slate-200 font-mono focus:border-cyan-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {category === 'Function Generator' && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">Max Frequency (MHz)</label>
                  <input
                    type="number"
                    value={formData.specifications.maxFrequencyMHz as number || 25}
                    onChange={e => handleSpecChange('maxFrequencyMHz', Number(e.target.value))}
                    className="w-full rounded bg-white p-2 text-slate-900 border border-slate-200 font-mono focus:border-cyan-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Max Amplitude (Vpp)</label>
                  <input
                    type="number"
                    value={formData.specifications.maxVoltageVpp as number || 20}
                    onChange={e => handleSpecChange('maxVoltageVpp', Number(e.target.value))}
                    className="w-full rounded bg-white p-2 text-slate-900 border border-slate-200 font-mono focus:border-cyan-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {category === 'Digital Multimeter' && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">Resolution Digits</label>
                  <input
                    type="text"
                    value={formData.specifications.digits as string || '6.5 Digits'}
                    onChange={e => handleSpecChange('digits', e.target.value)}
                    className="w-full rounded bg-white p-2 text-slate-900 border border-slate-200 font-mono focus:border-cyan-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Max DC Voltage (V)</label>
                  <input
                    type="number"
                    value={formData.specifications.maxVoltageDC as number || 1000}
                    onChange={e => handleSpecChange('maxVoltageDC', Number(e.target.value))}
                    className="w-full rounded bg-white p-2 text-slate-900 border border-slate-200 font-mono focus:border-cyan-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {category === 'Spectrum Analyzer' && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">Max Frequency (GHz)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.specifications.maxFreqGHz as number || 3.2}
                    onChange={e => handleSpecChange('maxFreqGHz', Number(e.target.value))}
                    className="w-full rounded bg-white p-2 text-slate-900 border border-slate-200 font-mono focus:border-cyan-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">DANL (dBm)</label>
                  <input
                    type="number"
                    value={formData.specifications.danlDbm as number || -161}
                    onChange={e => handleSpecChange('danlDbm', Number(e.target.value))}
                    className="w-full rounded bg-white p-2 text-slate-900 border border-slate-200 font-mono focus:border-cyan-600 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Instrument Notes / Maintenance History
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Equipped with passive 500MHz probes."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 transition-all cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              Instantiate & Register Instrument
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
