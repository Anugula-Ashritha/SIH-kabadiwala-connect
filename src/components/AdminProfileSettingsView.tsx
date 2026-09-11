import React, { useState } from 'react';
import {
  Settings,
  User,
  ShieldCheck,
  MapPin,
  Bell,
  Sliders,
  Database,
  RefreshCw,
  Download,
  CheckCircle,
  Save,
  Phone,
  Mail,
  Lock
} from 'lucide-react';
import { useData } from '../services/dataService';

export const AdminProfileSettingsView: React.FC = () => {
  const { admin, updateAdminProfile, resetAllData, collectors, recyclers, lots, transactions } = useData();

  const [nameInput, setNameInput] = useState(admin.name);
  const [emailInput, setEmailInput] = useState(admin.email);
  const [roleInput, setRoleInput] = useState(admin.role);
  const [phoneInput, setPhoneInput] = useState(admin.phone);
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  // System thresholds state
  const [discrepancyTolerance, setDiscrepancyTolerance] = useState('5.0');
  const [transitSlaHours, setTransitSlaHours] = useState('24');
  const [expiryWarningDays, setExpiryWarningDays] = useState('60');
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [auditLogRetention, setAuditLogRetention] = useState('180');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminProfile({
      name: nameInput,
      email: emailInput,
      role: roleInput,
      phone: phoneInput
    });
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2500);
  };

  const handleExportData = () => {
    const exportPayload = {
      exported_at: new Date().toISOString(),
      admin_user: admin,
      collectors_count: collectors.length,
      recyclers_count: recyclers.length,
      lots_count: lots.length,
      transactions_count: transactions.length,
      collectors,
      recyclers,
      lots,
      transactions
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `kabadiwala_connect_admin_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {isSavedAlert && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Admin profile and operational configurations saved successfully!</span>
        </div>
      )}

      {/* Admin Profile Details */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              Admin User Profile & Security Credentials
            </h3>
            <p className="text-xs text-slate-500">
              Operational officer credentials for SIH 2026 Kabadiwala Connect Admin Console
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            {admin.designation}
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operations Role</label>
              <input
                type="text"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 text-xs">
              Assigned Operational Clusters / Jurisdiction
            </label>
            <div className="flex flex-wrap gap-2">
              {admin.assigned_regions.map((reg) => (
                <span
                  key={reg}
                  className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {reg}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              id="save-admin-profile-btn"
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Update Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Operational Thresholds & Governance */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-teal-600" />
            Platform Operational Thresholds (PS 26229 Governance)
          </h3>
          <p className="text-xs text-slate-500">
            Automated guardrails for weighbridge tolerances, transport transit SLA, and compliance notices
          </p>
        </div>

        <div className="p-6 space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-slate-200 p-4 rounded-xl space-y-2">
              <label className="block font-bold text-slate-800">
                Weight Deviation Alert Threshold (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={discrepancyTolerance}
                  onChange={(e) => setDiscrepancyTolerance(e.target.value)}
                  className="w-20 p-2 bg-slate-50 border border-slate-300 rounded font-bold text-slate-900"
                />
                <span className="text-slate-500 font-medium">% variance</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Auto-flags handovers if certified weighbridge scales vary by &gt; 5%.
              </p>
            </div>

            <div className="border border-slate-200 p-4 rounded-xl space-y-2">
              <label className="block font-bold text-slate-800">
                Transit Delivery SLA (Hours)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={transitSlaHours}
                  onChange={(e) => setTransitSlaHours(e.target.value)}
                  className="w-20 p-2 bg-slate-50 border border-slate-300 rounded font-bold text-slate-900"
                />
                <span className="text-slate-500 font-medium">hours</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Maximum transit duration before dispatch is marked as Delayed Transit.
              </p>
            </div>

            <div className="border border-slate-200 p-4 rounded-xl space-y-2">
              <label className="block font-bold text-slate-800">
                CPCB Authorization Advance Notice
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={expiryWarningDays}
                  onChange={(e) => setExpiryWarningDays(e.target.value)}
                  className="w-20 p-2 bg-slate-50 border border-slate-300 rounded font-bold text-slate-900"
                />
                <span className="text-slate-500 font-medium">days</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Warns recyclers before state pollution control authorization expires.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-bold text-slate-800">Collector SMS & WhatsApp Notifications</p>
                <p className="text-[11px] text-slate-500">
                  Notify informal kabadiwalas in regional languages on offer match and UPI payouts
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={smsAlertsEnabled}
                onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Management & Export */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-600" />
            Mock Operational State Storage & Backup
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Reset records back to original state or export complete JSON snapshot for evaluation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportData}
            className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Snapshot (JSON)</span>
          </button>
          <button
            onClick={() => {
              if (confirm('Reset all mock records (collectors, lots, recyclers, prices) back to fresh SIH 2026 data?')) {
                resetAllData();
              }
            }}
            className="px-3.5 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Mock Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
