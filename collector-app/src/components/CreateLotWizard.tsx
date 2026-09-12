import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  Cpu,
  Cable,
  Monitor,
  BatteryCharging,
  RotateCw,
  Tv,
  Boxes,
  Package,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Scale,
  Info,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { WasteLot, MaterialCondition } from '../types';
import { MATERIAL_CATEGORIES, calculateLotValueRange, LotValueEstimate } from '../services/pricingService';
import {
  classifyMaterialImage,
  ClassificationResult,
  getOfflineFallbackResult,
} from '../services/mlService';
import {
  createLotOnBackend,
  CreateLotPayload,
} from '../services/backendApiService';

interface CreateLotWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLot: (lot: WasteLot, andFindRecycler?: boolean) => void;
  collectorLocation?: string;
}

type WizardStep = 1 | 2 | 3 | 4 | 'success';

export const CreateLotWizard: React.FC<CreateLotWizardProps> = ({
  isOpen,
  onClose,
  onCreateLot,
  collectorLocation = 'Mayapuri Scrap Market, Gate 3, Delhi',
}) => {
  const [step, setStep] = useState<WizardStep>(1);

  // Form State
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('pcb');
  const [weightKg, setWeightKg] = useState<number>(2.5);
  const [condition, setCondition] = useState<MaterialCondition>('clean');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>(collectorLocation);
  const [isUsingGps, setIsUsingGps] = useState<boolean>(true);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // AI Classification State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<ClassificationResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [lastImageInput, setLastImageInput] = useState<File | string | null>(null);
  const [appliedAiMaterial, setAppliedAiMaterial] = useState<string | null>(null);

  // Backend Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<string | null>(null);

  // Created Lot result for success screen
  const [createdLot, setCreatedLot] = useState<WasteLot | null>(null);

  if (!isOpen) return null;

  const currentEstimate: LotValueEstimate = calculateLotValueRange(
    selectedMaterialId,
    weightKg,
    condition
  );

  const selectedCategory =
    MATERIAL_CATEGORIES.find((c) => c.id === selectedMaterialId) || MATERIAL_CATEGORIES[0];

  // Helper for material category icon
  const renderMaterialIcon = (id: string, className = 'w-6 h-6') => {
    switch (id) {
      case 'pcb':
        return <Cpu className={className} />;
      case 'cables':
        return <Cable className={className} />;
      case 'lcd':
        return <Monitor className={className} />;
      case 'batteries':
        return <BatteryCharging className={className} />;
      case 'motors':
        return <RotateCw className={className} />;
      case 'crt':
        return <Tv className={className} />;
      case 'plastics':
        return <Boxes className={className} />;
      case 'other':
      default:
        return <Package className={className} />;
    }
  };

  // Central classification executor
  const executeClassification = async (
    imageInput: File | string,
    materialHint?: string
  ) => {
    setIsClassifying(true);
    setAiError(null);
    setLastImageInput(imageInput);

    try {
      const result = await classifyMaterialImage(imageInput, materialHint);
      setAiResult(result);
    } catch {
      // Graceful error display (do not crash)
      setAiError('Unable to identify the material right now. Please try again.');
      setAiResult(null);
    } finally {
      setIsClassifying(false);
    }
  };

  // Real Camera capture or Gallery File upload handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    setAiResult(null);
    setAiError(null);
    executeClassification(file);
  };

  // Quick sample photo trigger
  const handleSimulatePhotoUpload = async (materialHint: string = 'pcb') => {
    setAiResult(null);
    setAiError(null);
    const mockImage = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect fill="%23064e3b" width="300" height="200"/><text fill="%23a7f3d0" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold">${materialHint.toUpperCase()} Scrap Item</text></svg>`;
    setPhotoPreview(mockImage);
    executeClassification(mockImage, materialHint);
  };

  // Retry previous scan
  const handleRetryAi = () => {
    if (lastImageInput) {
      executeClassification(lastImageInput);
    } else {
      handleSimulatePhotoUpload('pcb');
    }
  };

  // Fallback to offline mock result if network/API is unavailable
  const handleUseOfflineResult = () => {
    setAiError(null);
    const fallback = getOfflineFallbackResult();
    setAiResult(fallback);
  };

  // Remove photo and reset analysis
  const handleClearPhoto = () => {
    setPhotoPreview(null);
    setAiResult(null);
    setAiError(null);
    setLastImageInput(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyAiResult = () => {
    if (aiResult) {
      setSelectedMaterialId(aiResult.materialId);
      // Retain the real ML prediction for material assignment when available
      setAppliedAiMaterial(aiResult.materialName);
      if (aiResult.suggestedCondition) {
        setCondition(aiResult.suggestedCondition);
      }
      setAiResult(null);
    }
  };

  const handleResetAndClose = () => {
    setStep(1);
    setSelectedMaterialId('pcb');
    setWeightKg(2.5);
    setCondition('clean');
    setDescription('');
    setPhotoPreview(null);
    setAiResult(null);
    setAiError(null);
    setLastImageInput(null);
    setAppliedAiMaterial(null);
    setIsSubmitting(false);
    setSubmitError(null);
    setBackendStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setCreatedLot(null);
    onClose();
  };

  const handleFinalCreateLot = async (andFindRecycler = false) => {
    setIsSubmitting(true);
    setSubmitError(null);

    // 1. Material: Use the real ML classification result when available, else selected category name
    const materialToUse = appliedAiMaterial || aiResult?.materialName || selectedCategory.name;
    const estValue = currentEstimate.averageValue;
    const quotedPrice = Math.round(estValue * 0.95);

    try {
      const payload: CreateLotPayload = {
        collector_id: 1,
        material: materialToUse,
        weight: weightKg,
        estimated_value: estValue,
        quoted_price: quotedPrice,
        location: location.trim() || collectorLocation,
      };

      const backendResponse = await createLotOnBackend(payload);
      const realLotId = backendResponse.lot_id;
      const realStatus = backendResponse.status || 'CREATED';
      setBackendStatus(realStatus);

      const newLot: WasteLot = {
        lot_id: realLotId,
        collector_id: String(backendResponse.collector_id ?? 1),
        material: backendResponse.material,
        image: photoPreview || undefined,
        weight_kg: backendResponse.weight,
        condition,
        description:
          description.trim() || `${backendResponse.material} e-waste collected in ${location}`,
        location: backendResponse.location,
        estimated_min_value: currentEstimate.estimatedMinValue,
        estimated_max_value: currentEstimate.estimatedMaxValue,
        quoted_price: backendResponse.quoted_price ?? quotedPrice,
        status: 'finding_recycler',
        created_at: 'Just now',
        // Compatibility fields
        id: realLotId,
        category: backendResponse.material,
        weightKg: backendResponse.weight,
        estimatedPrice: backendResponse.estimated_value,
        createdAt: 'Just now',
        itemsSummary: description.trim() || selectedCategory.commonExamples,
      };

      setCreatedLot(newLot);
      onCreateLot(newLot, andFindRecycler);
      setStep('success');
    } catch (err: any) {
      console.error('[Backend API] Backend error creating lot:', err);

      // Error handling: If backend is unavailable, do not crash.
      // Show a clear message and preserve the existing offline/local fallback behavior.
      const fallbackSuffix = Math.floor(100 + Math.random() * 900);
      const fallbackLotId = `LOT-2026-${fallbackSuffix}`;
      setBackendStatus('CREATED (Local)');
      setSubmitError('Backend is unavailable. Lot saved to local storage.');

      const fallbackLot: WasteLot = {
        lot_id: fallbackLotId,
        collector_id: '1',
        material: materialToUse,
        image: photoPreview || undefined,
        weight_kg: weightKg,
        condition,
        description: description.trim() || `${materialToUse} e-waste collected in ${location}`,
        location,
        estimated_min_value: currentEstimate.estimatedMinValue,
        estimated_max_value: currentEstimate.estimatedMaxValue,
        quoted_price: quotedPrice,
        status: 'finding_recycler',
        created_at: 'Just now',
        sync_pending: true,
        // Compatibility fields
        id: fallbackLotId,
        category: materialToUse,
        weightKg,
        estimatedPrice: estValue,
        createdAt: 'Just now',
        itemsSummary: description.trim() || selectedCategory.commonExamples,
      };

      setCreatedLot(fallbackLot);
      onCreateLot(fallbackLot, andFindRecycler);
      setStep('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Strip */}
        <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">
                SIH 2026 E-Waste Consignment
              </span>
            </div>
            <h2 className="text-base font-bold text-white leading-tight mt-0.5">
              Create New Lot / नया लॉट
            </h2>
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-emerald-700 hover:bg-emerald-600 flex items-center justify-center text-emerald-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        {step !== 'success' && (
          <div className="bg-emerald-50/80 px-5 py-2.5 border-b border-emerald-100/80 flex items-center justify-between text-xs">
            {[
              { num: 1, label: 'Material' },
              { num: 2, label: 'Details' },
              { num: 3, label: 'Value' },
              { num: 4, label: 'Review' },
            ].map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-1.5 ${
                  step === s.num
                    ? 'text-emerald-800 font-extrabold'
                    : (step as number) > s.num
                    ? 'text-emerald-700 font-bold'
                    : 'text-slate-400 font-medium'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    step === s.num
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : (step as number) > s.num
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {(step as number) > s.num ? '✓' : s.num}
                </span>
                <span className="text-[11px]">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* ================= STEP 1: MATERIAL ================= */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Select Material Type / सामग्री चुनें
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  List your collected e-waste and get offers from authorized recyclers.
                </p>
              </div>

              {/* Identify with Photo / AI Feature */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl p-3.5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-900">
                      Identify with Photo / फोटो से पहचानें
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                    AI Assist
                  </span>
                </div>

                {photoPreview ? (
                  <div className="space-y-2">
                    <div className="relative rounded-xl overflow-hidden border border-emerald-300 max-h-36 bg-slate-900 flex items-center justify-center">
                      <img
                        src={photoPreview}
                        alt="E-waste lot item"
                        className="w-full object-cover max-h-36"
                      />
                      <button
                        id="btn-remove-photo"
                        type="button"
                        onClick={handleClearPhoto}
                        className="absolute top-2 right-2 bg-slate-900/80 text-white p-1 rounded-full text-xs hover:bg-slate-900"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {isClassifying ? (
                      <div className="flex items-center justify-center gap-2 py-2.5 text-xs text-emerald-800 font-semibold bg-white/90 rounded-xl border border-emerald-200 shadow-xs">
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                        Running Edge AI vision scan...
                      </div>
                    ) : aiError ? (
                      <div className="bg-white rounded-xl p-3 border border-amber-300 text-xs space-y-2 shadow-xs">
                        <div className="flex items-start gap-2 text-amber-900 font-medium">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>{aiError}</span>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            id="btn-retry-ai"
                            type="button"
                            onClick={handleRetryAi}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1 active:scale-98 transition-all"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Try Again
                          </button>
                          <button
                            id="btn-use-offline-fallback"
                            type="button"
                            onClick={handleUseOfflineResult}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-1.5 px-3 rounded-lg text-xs"
                          >
                            Use Offline Mode
                          </button>
                        </div>
                      </div>
                    ) : aiResult ? (
                      <div className="bg-white rounded-xl p-2.5 border border-emerald-300 text-xs space-y-1.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">
                              AI detected:{' '}
                              <span className="text-emerald-700 font-extrabold">
                                {aiResult.materialName}
                              </span>
                            </span>
                            {aiResult.isOffline && (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                Offline Result
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {aiResult.confidenceStr || `${Math.round(aiResult.confidence * 100)}%`} confidence
                          </span>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            id="btn-use-ai-result"
                            type="button"
                            onClick={handleApplyAiResult}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1 active:scale-98 transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Use Result
                          </button>
                          <button
                            id="btn-change-ai-manually"
                            type="button"
                            onClick={() => setAiResult(null)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-1.5 px-3 rounded-lg text-xs"
                          >
                            Change Manually
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      id="lot-photo-file-input"
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Snap a picture with your phone camera or select a sample to test automated material grading.
                    </p>
                    <button
                      id="btn-capture-upload-photo"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-98 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo / Upload Image (फ़ोटो लें)
                    </button>
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <button
                        id="btn-sample-pcb"
                        type="button"
                        onClick={() => handleSimulatePhotoUpload('pcb')}
                        className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-white hover:bg-emerald-100/50 border border-emerald-300 rounded-xl text-[11px] font-bold text-emerald-800 shadow-xs active:scale-98 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Sample PCB
                      </button>
                      <button
                        id="btn-sample-battery"
                        type="button"
                        onClick={() => handleSimulatePhotoUpload('batteries')}
                        className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-white hover:bg-emerald-100/50 border border-emerald-300 rounded-xl text-[11px] font-bold text-emerald-800 shadow-xs active:scale-98 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Sample Battery
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Material Grid with Large Touch Targets */}
              <div className="grid grid-cols-2 gap-2.5">
                {MATERIAL_CATEGORIES.map((cat) => {
                  const isSelected = selectedMaterialId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedMaterialId(cat.id);
                        if (weightKg === 2.5) {
                          setWeightKg(cat.defaultWeight);
                        }
                      }}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/30'
                          : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {renderMaterialIcon(cat.id, 'w-5 h-5')}
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <div className="mt-2.5">
                        <h4 className="font-bold text-xs text-slate-900 leading-tight">
                          {cat.name}
                        </h4>
                        <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                          {cat.hindiName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-1">
                          ₹{cat.baseMinRate}–₹{cat.baseMaxRate}/{cat.unit}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= STEP 2: DETAILS ================= */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Consignment Details / लॉट का विवरण
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Material: <span className="font-bold text-emerald-800">{selectedCategory.name}</span>
                </p>
              </div>

              {/* Approximate Weight Input */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    Approximate Weight / लगभग वजन
                  </label>
                  <span className="text-xs font-semibold text-slate-500">Unit: Kilograms (kg)</span>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setWeightKg((prev) => Math.max(0.5, Number((prev - 0.5).toFixed(1))))}
                    className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-lg flex items-center justify-center active:scale-95"
                    aria-label="Decrease weight by 0.5 kg"
                  >
                    -
                  </button>

                  <div className="relative flex-1 max-w-[150px]">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                      className="w-full text-center text-2xl font-black text-emerald-800 py-2 bg-emerald-50/50 border-2 border-emerald-300 rounded-xl focus:outline-emerald-600"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                      kg
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setWeightKg((prev) => Number((prev + 0.5).toFixed(1)))}
                    className="w-11 h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-lg flex items-center justify-center active:scale-95 shadow-xs"
                    aria-label="Increase weight by 0.5 kg"
                  >
                    +
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  {[1, 2.5, 5, 10, 20].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setWeightKg(preset)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                        weightKg === preset
                          ? 'bg-emerald-800 text-white border-emerald-800'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset} kg
                    </button>
                  ))}
                </div>
              </div>

              {/* Material Condition */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Material Condition / स्थिति
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'clean', title: 'Clean / साफ', sub: 'Sorted, no hazardous leaks' },
                    { id: 'mixed', title: 'Mixed / मिश्रित', sub: 'Multiple components mingled' },
                    { id: 'damaged', title: 'Damaged / टूटा-फूटा', sub: 'Cracked, dismantled casing' },
                    { id: 'unknown', title: 'Unknown / अज्ञात', sub: 'Unsorted raw consignment' },
                  ].map((cond) => (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => setCondition(cond.id as MaterialCondition)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        condition === cond.id
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-2xs ring-1 ring-emerald-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-900">{cond.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{cond.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Collection Location */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Collection Location / स्थान
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUsingGps(!isUsingGps);
                      if (!isUsingGps) setLocation(collectorLocation);
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    {isUsingGps ? 'Enter Manually' : 'Use Current GPS'}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setIsUsingGps(false);
                    }}
                    placeholder="Enter pickup address or market gate..."
                    className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-emerald-600"
                  />
                  {isUsingGps && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      GPS Active
                    </span>
                  )}
                </div>
              </div>

              {/* Optional Description */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Optional Remarks / विवरण (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 15 motherboards with RAM sticks, battery removed safely..."
                  rows={2}
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-emerald-600"
                />
              </div>
            </div>
          )}

          {/* ================= STEP 3: VALUE ESTIMATION ================= */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Value Estimation / अनुमानित मूल्य
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Transparent CPCB benchmarked pricing calculated in real time.
                </p>
              </div>

              {/* Main Estimation Hero Card */}
              <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-emerald-200">
                  <span>Estimated Lot Value / अनुमानित राशि</span>
                  <span className="bg-emerald-700/60 px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium">
                    Fair Market Benchmark
                  </span>
                </div>

                <div className="mt-3 text-3xl font-black tracking-tight text-white flex items-center gap-1">
                  <span>₹{currentEstimate.estimatedMinValue.toLocaleString('en-IN')}</span>
                  <span className="text-xl font-bold text-emerald-300">–</span>
                  <span>₹{currentEstimate.estimatedMaxValue.toLocaleString('en-IN')}</span>
                </div>

                <div className="mt-2 text-xs text-emerald-200 flex items-center justify-between">
                  <span>Expected Average: ~₹{currentEstimate.averageValue.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-emerald-300 font-mono">
                    Updated: {currentEstimate.priceUpdated}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-700/60 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-emerald-300 block text-[10px]">Selected Material</span>
                    <span className="font-bold text-white text-sm">{selectedCategory.name}</span>
                  </div>
                  <div>
                    <span className="text-emerald-300 block text-[10px]">Current Market Range</span>
                    <span className="font-bold text-white text-sm">
                      ₹{currentEstimate.minRatePerKg} – ₹{currentEstimate.maxRatePerKg} / kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Transparency Notice */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    Under SIH 2026 E-Waste guidelines, authorized recyclers compete directly on this platform. Final payout is confirmed upon weight verification at drop-off or pickup.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-semibold text-slate-700">
                  <span>Weight: {weightKg} kg</span>
                  <span className="capitalize">Grading: {condition}</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: REVIEW ================= */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Review Consignment / समीक्षा करें
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm your lot details before publishing to authorized recyclers.
                </p>
              </div>

              {/* Review Card */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      {renderMaterialIcon(selectedMaterialId, 'w-6 h-6')}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        NEW CONSIGNMENT
                      </span>
                      <h4 className="font-bold text-base text-slate-900 leading-tight mt-1">
                        {selectedCategory.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">{selectedCategory.hindiName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-emerald-700">
                      ₹{currentEstimate.estimatedMinValue}–₹{currentEstimate.estimatedMaxValue}
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{weightKg} kg</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Condition
                    </span>
                    <span className="font-bold text-slate-800 capitalize">{condition}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Rate Range
                    </span>
                    <span className="font-bold text-slate-800">
                      ₹{currentEstimate.minRatePerKg}–₹{currentEstimate.maxRatePerKg}/kg
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Pickup / Handover Location
                  </span>
                  <div className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{location}</span>
                  </div>
                </div>

                {description && (
                  <div className="pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Collector Notes
                    </span>
                    <p className="text-slate-600 italic mt-0.5">{description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= SUCCESS SCREEN ================= */}
          {step === 'success' && createdLot && (
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                  CPCB Consignment Created
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">
                  Lot Created Successfully!
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">लॉट सफलतापूर्वक दर्ज किया गया</p>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5 max-w-sm mx-auto shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-800 bg-slate-200/80 px-2 py-0.5 rounded border border-slate-300">
                    {createdLot.lot_id}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 uppercase tracking-wide">
                    {backendStatus || createdLot.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-sm text-slate-900">{createdLot.material}</span>
                  <span className="font-bold text-sm text-slate-700">{createdLot.weight_kg} kg</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Estimated Value</span>
                  <span className="font-extrabold text-emerald-700">
                    ₹{createdLot.estimated_min_value.toLocaleString('en-IN')} – ₹
                    {createdLot.estimated_max_value.toLocaleString('en-IN')}
                  </span>
                </div>

                {submitError && (
                  <p className="text-[11px] text-amber-800 font-medium bg-amber-50 border border-amber-200 rounded-lg p-2 mt-1">
                    Notice: {submitError}
                  </p>
                )}
              </div>

              <p className="text-xs text-slate-600 px-2">
                Your lot is now visible to verified nearby recyclers. Select a recycler to lock in your offer.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleResetAndClose();
                  }}
                  className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  Find Recycler / खरीदार खोजें <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs border border-slate-200"
                >
                  View Lot in My Lots
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Button Bar */}
        {step !== 'success' && (
          <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => ((prev as number) - 1) as WizardStep)}
                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResetAndClose}
                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => ((prev as number) + 1) as WizardStep)}
                className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                Next: {step === 1 ? 'Details' : step === 2 ? 'Estimate Value' : 'Review'}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="btn-confirm-create-lot"
                type="button"
                disabled={isSubmitting}
                onClick={() => handleFinalCreateLot(false)}
                className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-75 active:scale-98 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    Connecting to Backend...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Create Lot
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
