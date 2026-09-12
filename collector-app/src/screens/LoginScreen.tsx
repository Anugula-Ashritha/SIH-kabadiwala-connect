import React, { useState } from 'react';
import { Recycle, ArrowRight, ShieldCheck, Phone, CheckCircle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('1234');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      setOtpSent(true);
    } else {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-800 via-emerald-700 to-emerald-900 text-white flex flex-col justify-between p-5 max-w-md mx-auto">
      {/* Top Banner / SIH Badge */}
      <div className="pt-6">
        <div className="inline-flex items-center gap-1.5 bg-emerald-900/60 border border-emerald-500/40 rounded-full px-3 py-1 text-xs font-semibold text-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          SIH 2026 Software Edition
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-emerald-300 shadow-inner">
            <Recycle className="w-8 h-8 text-emerald-300 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Kabadiwala Connect
            </h1>
            <p className="text-xs text-emerald-200 font-medium">
              Informal E-Waste Collector Network
            </p>
          </div>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="my-8 bg-white rounded-3xl p-6 text-slate-900 shadow-2xl">
        <div className="mb-5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
            Collector Portal / कबाड़ी मित्र
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
            {otpSent ? 'Verify OTP Code' : 'Sign In with Mobile'}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            {otpSent
              ? `Enter 4-digit code sent to +91 ${phoneNumber}`
              : 'Direct connection to authorized CPCB e-waste recyclers with guaranteed fair pricing.'}
          </p>
        </div>

        <form onSubmit={handleSendOtp} className="space-y-4">
          {!otpSent ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Mobile Number / मोबाइल नंबर
              </label>
              <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 transition-all overflow-hidden">
                <span className="px-3.5 py-3 text-sm font-bold text-slate-600 bg-slate-200/70 border-r border-slate-300 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit number"
                  className="w-full px-3 py-3 text-base font-semibold text-slate-900 bg-transparent focus:outline-none"
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Verification OTP (Demo: 1234)
              </label>
              <input
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center tracking-[0.5em] text-2xl font-bold border border-slate-300 rounded-xl bg-slate-50 py-3 text-slate-900 focus:outline-emerald-600"
                required
              />
              <div className="flex justify-between items-center mt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-emerald-700 font-semibold hover:underline"
                >
                  Change Number
                </button>
                <span className="text-slate-600">Auto-filled for demo</span>
              </div>
            </div>
          )}

          {/* Large Touch Friendly Action Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-base"
          >
            {otpSent ? 'Verify & Continue' : 'Get OTP / ओटीपी प्राप्त करें'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* Quick Demo One-Click Access */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="text-[11px] font-medium text-slate-600 mb-2 text-center">
            Evaluator / Jury Quick Access:
          </div>
          <button
            type="button"
            onClick={onLogin}
            className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Quick Login as Ramesh Kumar (Collector)
          </button>
        </div>
      </div>

      {/* Trust & Compliance Footer */}
      <div className="pb-4 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-200 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>CPCB Registered Recycler Integration</span>
        </div>
        <p className="text-[10px] text-emerald-300/80 mt-1">
          Ministry of Environment, Forest & Climate Change aligned
        </p>
      </div>
    </div>
  );
};
