import React, { useState } from 'react';
import { Recycle, ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';
import { useData } from '../services/dataService';

export const AdminLoginView: React.FC = () => {
  const { login } = useData();
  const [email, setEmail] = useState('admin@kabadiwalaconnect.org');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (email.trim().length > 0) {
        login(email, password);
      } else {
        setError('Please enter a valid admin email.');
      }
      setIsLoading(false);
    }, 400);
  };

  const handleQuickDemoFill = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center shadow-xl shadow-emerald-950/60 border border-emerald-400/30">
          <Recycle className="w-9 h-9 text-white" />
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-white">
          Kabadiwala Connect
        </h2>
        <p className="mt-1 text-xs font-semibold text-emerald-400 uppercase tracking-widest">
          SIH 2026 • PS 26229 • Operational Admin Console
        </p>
        <p className="mt-2 text-xs text-slate-400 max-w-sm mx-auto">
          Operational gateway bringing informal e-waste collectors into the formal recycling value chain.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/90 border border-slate-700 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 backdrop-blur-sm">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-rose-900/40 border border-rose-700 text-rose-200 text-xs rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300">
                Official Admin Email
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="admin-login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-sm bg-slate-900/70 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="admin@kabadiwalaconnect.org"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">
                Security Password
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="admin-login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-sm bg-slate-900/70 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Remember session</span>
              </label>
              <span className="text-emerald-400 hover:text-emerald-300 cursor-pointer">
                Authorized credentials only
              </span>
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow-lg shadow-emerald-900/40 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo quick roles */}
          <div className="mt-6 pt-5 border-t border-slate-700/80">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" /> Demo Admin Access
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoFill('admin@kabadiwalaconnect.org')}
                className="p-2 rounded-lg bg-slate-900/60 border border-slate-700 hover:border-emerald-500/50 text-left text-slate-300 transition-colors"
              >
                <p className="font-semibold text-white text-[11px]">Operations Lead</p>
                <p className="text-[10px] text-slate-400">Chennai / National</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('auditor@kabadiwalaconnect.org')}
                className="p-2 rounded-lg bg-slate-900/60 border border-slate-700 hover:border-emerald-500/50 text-left text-slate-300 transition-colors"
              >
                <p className="font-semibold text-white text-[11px]">Compliance Auditor</p>
                <p className="text-[10px] text-slate-400">CPCB/SPCB Desk</p>
              </button>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Encrypted Operational Sandbox • CPCB E-Waste Rules 2022 Compliant</span>
        </div>
      </div>
    </div>
  );
};
