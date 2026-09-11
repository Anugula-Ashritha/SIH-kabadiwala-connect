import React, { useState } from 'react';
import { ShieldCheck, Lock, Building, ArrowRight, CheckCircle2, User, KeyRound, AlertCircle } from 'lucide-react';
import { GovtUser } from '../types';
import { GOVT_USERS } from '../data/mockData';

interface Props {
  onLogin: (user: GovtUser) => void;
}

export const GovernmentLoginView: React.FC<Props> = ({ onLogin }) => {
  const [selectedUser, setSelectedUser] = useState<GovtUser>(GOVT_USERS[0]);
  const [securityPin, setSecurityPin] = useState('26229');
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityPin.length < 4) {
      setErrorMsg('Please enter a valid 5-digit security pin or official credential token.');
      return;
    }
    setErrorMsg('');
    setIsAuthenticating(true);

    setTimeout(() => {
      setIsAuthenticating(false);
      onLogin(selectedUser);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-950/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-950/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Ministry Ribbon */}
      <div className="w-full bg-slate-950 border-b border-slate-800 py-3 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-300">
              Government of India • Ministry of Environment, Forest & Climate Change
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Central Pollution Control Board (CPCB)</span>
            <span>•</span>
            <span>Smart India Hackathon 2026 • PS 26229</span>
          </div>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-xl bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-b border-slate-700 text-center relative">
            <div className="w-14 h-14 mx-auto rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center mb-3 text-emerald-400 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              KABADIWALA CONNECT
            </h1>
            <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest mt-1">
              Government & Regulatory Impact Analytics Portal
            </p>
            <div className="mt-2 text-[11px] text-slate-400 max-w-md mx-auto">
              Statutory monitoring platform for informal e-waste formalization, material flow traceability, and verified CPCB recycling channels.
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Officer Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Select Authorized Regulatory Profile
              </label>
              <div className="space-y-2">
                {GOVT_USERS.map((user) => {
                  const isSelected = selectedUser.id === user.id;
                  return (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                        isSelected
                          ? 'bg-emerald-950/50 border-emerald-500/60 ring-1 ring-emerald-500/40 text-white'
                          : 'bg-slate-900/60 border-slate-700 hover:border-slate-600 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full mt-0.5 flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white flex items-center gap-2">
                            {user.name}
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                          <div className="text-xs text-slate-400 leading-snug">{user.designation}</div>
                          <div className="text-[10px] text-emerald-400/90 font-mono mt-0.5">{user.department}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {user.jurisdiction}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Official Token / PIN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Officer Security Token / PIN
                </label>
                <span className="text-[10px] text-slate-400">Demo Key: 26229</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  id="security-pin-input"
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  placeholder="Enter 5-digit PIN"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm font-mono focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-login-submit"
              disabled={isAuthenticating}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAuthenticating ? (
                <span>Validating CPCB Telemetry Credentials...</span>
              ) : (
                <>
                  <span>Authenticate & Open Regulatory Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Privacy & Statutory Footer */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Statutory Data Privacy & Anonymization Protection</span>
            </div>
            <p className="leading-relaxed">
              In accordance with E-Waste (Management) Rules, 2022, informal collector phone numbers, residential addresses, and private banking identifiers are strictly tokenized and withheld from public exposure.
            </p>
          </div>

        </div>
      </div>

      {/* Footer Disclaimer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-800">
        SIH 2026 Problem Statement PS 26229: Kabadiwala Connect • Central Pollution Control Board (CPCB) System Prototype
      </footer>
    </div>
  );
};
