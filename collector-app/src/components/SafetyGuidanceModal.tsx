import React from 'react';
import {
  X,
  ShieldAlert,
  Flame,
  BatteryWarning,
  Eye,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface SafetyGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SafetyItem {
  id: string;
  title: string;
  hindiTitle: string;
  desc: string;
  hindiDesc: string;
  icon: React.ReactNode;
  variant: 'danger' | 'warning' | 'info' | 'success';
}

const SAFETY_ITEMS: SafetyItem[] = [
  {
    id: 'safe-handling',
    title: 'Handle E-Waste Carefully',
    hindiTitle: 'ई-कचरे को सावधानी से संभालें',
    desc: 'Avoid smashing tubes, LCD glass or leaking capacitors which contain toxic mercury and phosphor powders.',
    hindiDesc: 'सीआरटी ग्लास व कैपेसिटर को न तोड़ें, इनमें पारा व जहरीले रसायन होते हैं।',
    icon: <Eye className="w-5 h-5 text-sky-600" />,
    variant: 'info',
  },
  {
    id: 'battery-safety',
    title: 'Avoid Unsafe Battery Handling',
    hindiTitle: 'खराब बैटरियों को सुरक्षित रखें',
    desc: 'Never puncture, crush, or short-circuit Lithium-ion batteries. Tape exposed metallic terminals before transit.',
    hindiDesc: 'लीथियम बैटरियों को न कुचलें। शॉर्ट-सर्किट व आग से बचने हेतु टर्मिनलों पर टेप लगाएं।',
    icon: <BatteryWarning className="w-5 h-5 text-amber-600" />,
    variant: 'warning',
  },
  {
    id: 'protective-gear',
    title: 'Use Protective Practices & PPE',
    hindiTitle: 'दस्ताने व मास्क का उपयोग करें',
    desc: 'Always wear puncture-resistant gloves and a dust mask when stripping circuit boards or sorting sharp metals.',
    hindiDesc: 'धारदार धातु व पीसीबी को छांटते समय मोटे दस्ताने व मास्क अवश्य पहनें।',
    icon: <ShieldAlert className="w-5 h-5 text-emerald-600" />,
    variant: 'success',
  },
  {
    id: 'no-burning',
    title: 'Do Not Burn or Acid-Wash Wires',
    hindiTitle: 'तार या कचरा कभी न जलाएं',
    desc: 'Open burning of PVC cables and acid-bath extraction releases deadly dioxins, causing severe lung damage and legal penalties.',
    hindiDesc: 'तांबा निकालने हेतु तार जलाना या तेजाब का उपयोग गैर-कानूनी और जानलेवा है।',
    icon: <Flame className="w-5 h-5 text-rose-600" />,
    variant: 'danger',
  },
  {
    id: 'authorized-handover',
    title: 'Channel Through CPCB Recyclers',
    hindiTitle: 'प्रमाणित रिसाइकलर को ही सौंपें',
    desc: 'Sell hazardous e-waste exclusively to CPCB-authorized dismantlers to ensure scientific precious-metal recovery.',
    hindiDesc: 'अपना लॉट केवल सरकार द्वारा अधिकृत रिसाइक्लर्स को देकर उचित दाम और रसीद पाएं।',
    icon: <Building2 className="w-5 h-5 text-emerald-700" />,
    variant: 'success',
  },
];

export const SafetyGuidanceModal: React.FC<SafetyGuidanceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                SIH 2026 Formal Protocol
              </span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5 leading-tight">
              Safety Guidance / सुरक्षा दिशा-निर्देश
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-emerald-700 hover:bg-emerald-600 flex items-center justify-center text-emerald-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Safety Guidance Cards */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {SAFETY_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl p-3.5 border transition-all ${
                item.variant === 'danger'
                  ? 'bg-rose-50/70 border-rose-200'
                  : item.variant === 'warning'
                  ? 'bg-amber-50/70 border-amber-200'
                  : item.variant === 'info'
                  ? 'bg-sky-50/70 border-sky-200'
                  : 'bg-emerald-50/70 border-emerald-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white shadow-2xs flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <h3 className="font-bold text-xs text-slate-900 leading-tight">
                      {item.title}
                    </h3>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-800 mt-0.5">
                    {item.hindiTitle}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    {item.desc}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-snug">
                    {item.hindiDesc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            Ministry of Environment & CPCB Compliant
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Understood / समझ गया
          </button>
        </div>
      </div>
    </div>
  );
};
