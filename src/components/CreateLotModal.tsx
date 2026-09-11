import React, { useState } from 'react';
import { X, Camera, Plus, CheckCircle2, Sparkles } from 'lucide-react';
import { WasteLot } from '../types';

interface CreateLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLot: (newLot: WasteLot) => void;
}

const CATEGORIES = [
  { id: 'pcb', name: 'Mobile / Tablet PCBs', rate: 850, defaultWeight: 5 },
  { id: 'wire', name: 'Copper Wire & Cables', rate: 480, defaultWeight: 10 },
  { id: 'desktop', name: 'Computer Motherboards', rate: 340, defaultWeight: 8 },
  { id: 'battery', name: 'Lithium-Ion Batteries', rate: 160, defaultWeight: 4 },
  { id: 'mixed', name: 'Mixed E-Waste Scrap', rate: 55, defaultWeight: 20 },
];

export const CreateLotModal: React.FC<CreateLotModalProps> = ({
  isOpen,
  onClose,
  onCreateLot,
}) => {
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0]);
  const [weightKg, setWeightKg] = useState<number>(selectedCat.defaultWeight);
  const [hasPhoto, setHasPhoto] = useState<boolean>(true);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const estimatedTotal = Math.round(weightKg * selectedCat.rate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const generatedId = `LOT-2026-${Math.floor(100 + Math.random() * 900)}`;
      const newLot: WasteLot = {
        id: generatedId,
        lot_id: generatedId,
        collector_id: 'COL-DEL-042',
        material: selectedCat.name,
        category: selectedCat.name,
        weightKg: Number(weightKg),
        weight_kg: Number(weightKg),
        condition: 'clean',
        location: 'Mayapuri, Delhi',
        estimatedPrice: estimatedTotal,
        estimated_min_value: Math.round(estimatedTotal * 0.95),
        estimated_max_value: Math.round(estimatedTotal * 1.05),
        status: 'pending',
        createdAt: 'Just now',
        created_at: 'Just now',
        itemsSummary: notes.trim() || `${selectedCat.name} sorted lot ready for recycler pickup`,
        description: notes.trim() || `${selectedCat.name} sorted lot ready for recycler pickup`,
      };
      onCreateLot(newLot);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">SIH 2026 E-Waste</span>
            <h2 className="text-lg font-bold text-slate-900">Create New Lot</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center border border-slate-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Step 1: Category Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
              Select E-Waste Category
            </label>
            <div className="grid grid-cols-1 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => {
                    setSelectedCat(cat);
                    setWeightKg(cat.defaultWeight);
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    selectedCat.id === cat.id
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-800 bg-white'
                  }`}
                >
                  <div className="font-medium text-sm">{cat.name}</div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-700">₹{cat.rate}/kg</span>
                    <span className="text-[10px] text-slate-600 block">Govt/Recycler Rate</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Weight Adjustment */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Estimated Weight (KG)
              </label>
              <span className="text-xs font-medium text-slate-500">Manual scale input</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(Math.max(0.1, parseFloat(e.target.value) || 1))}
                className="w-28 text-center text-xl font-bold bg-slate-50 border border-slate-300 rounded-xl py-2.5 text-slate-900 focus:outline-emerald-600"
              />
              {/* Quick Increment buttons for collector */}
              <div className="flex gap-1.5 flex-1">
                {[+2, +5, +10].map((inc) => (
                  <button
                    type="button"
                    key={inc}
                    onClick={() => setWeightKg((prev) => prev + inc)}
                    className="flex-1 py-2 px-1 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 active:scale-95 transition-transform"
                  >
                    +{inc} kg
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Photo Verification (Mock upload) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
              Lot Photo Verification
            </label>
            <div
              onClick={() => setHasPhoto(!hasPhoto)}
              className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    {hasPhoto ? 'Photo Attached (lot_image_01.jpg)' : 'Tap to Take Photo'}
                  </div>
                  <div className="text-[11px] text-slate-500">Required by Authorized Recyclers</div>
                </div>
              </div>
              {hasPhoto ? (
                <span className="text-xs bg-emerald-600 text-white font-medium px-2 py-1 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Added
                </span>
              ) : (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-0.5">
                  <Plus className="w-3.5 h-3.5" /> Attach
                </span>
              )}
            </div>
          </div>

          {/* Quick Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Collector Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 15 keyboards, 4 laptops without batteries"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-emerald-600"
            />
          </div>

          {/* Estimated Value Banner */}
          <div className="bg-emerald-800 text-white p-3.5 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[10px] text-emerald-200 uppercase tracking-wider flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3 text-emerald-300" />
                Fair Price Estimate
              </div>
              <div className="text-xs text-emerald-100">
                {weightKg} kg × ₹{selectedCat.rate}/kg
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-emerald-200 mr-1">Est.</span>
              <span className="text-xl font-extrabold text-white">₹{estimatedTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Lot...' : 'Post Lot to Authorized Recyclers'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
