import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  FileCheck,
  Scale,
  RefreshCw,
  XCircle,
  Eye,
  X
} from 'lucide-react';
import { useData } from '../services/dataService';
import { FlaggedRecord } from '../types';
import { StatusBadge } from './StatusBadge';

interface FlaggedRecordsProps {
  selectedCity: string;
  globalSearch: string;
}

export const FlaggedRecordsView: React.FC<FlaggedRecordsProps> = ({
  selectedCity,
  globalSearch
}) => {
  const { flaggedRecords, resolveFlaggedRecord, admin } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedIssue, setSelectedIssue] = useState<FlaggedRecord | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionAction, setResolutionAction] = useState<'Resolved' | 'Overridden'>('Resolved');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const activeSearch = searchQuery || globalSearch;

  const filtered = flaggedRecords.filter((issue) => {
    if (severityFilter !== 'All' && issue.severity !== severityFilter) {
      return false;
    }
    if (statusFilter !== 'All' && issue.status !== statusFilter) {
      return false;
    }
    if (activeSearch.trim()) {
      const q = activeSearch.toLowerCase();
      const match =
        issue.issue_id.toLowerCase().includes(q) ||
        issue.type.toLowerCase().includes(q) ||
        issue.entity_id.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const openCount = flaggedRecords.filter(f => f.status === 'Open').length;
  const criticalCount = flaggedRecords.filter(f => f.severity === 'Critical' && f.status !== 'Resolved').length;

  const handleOpenResolve = (issue: FlaggedRecord) => {
    setSelectedIssue(issue);
    setResolutionNotes(issue.resolution_notes || '');
    setResolutionAction('Resolved');
    setIsResolveModalOpen(true);
  };

  const handleSaveResolution = () => {
    if (selectedIssue) {
      resolveFlaggedRecord(
        selectedIssue.issue_id,
        resolutionNotes || 'Reviewed and validated by Admin.',
        resolutionAction
      );
      setSelectedIssue(prev =>
        prev
          ? {
              ...prev,
              status: resolutionAction,
              resolution_notes: resolutionNotes,
              resolved_by: admin.name,
              resolved_at: new Date().toISOString().substring(0, 16).replace('T', ' ')
            }
          : null
      );
      setIsResolveModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Summary Header */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 text-white p-5 rounded-xl border border-rose-800/50 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" /> Operational Compliance & Exception Auditing
          </div>
          <h3 className="text-lg font-bold">Exceptions & Flagged Records Desk</h3>
          <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
            Reviewing weight deviations (&gt;5%), expired regulatory permits, shipment SLA delays, and informal collector pricing disputes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900/80 border border-slate-700 px-3 py-2 rounded-lg text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Open Exceptions</p>
            <p className="text-lg font-bold text-rose-400">{openCount}</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-700 px-3 py-2 rounded-lg text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Critical Priority</p>
            <p className="text-lg font-bold text-amber-400">{criticalCount}</p>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="flagged-search-input"
            type="text"
            placeholder="Search by issue ID, entity ID, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Severity:</span>
            <select
              id="flagged-severity-filter"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold">Status:</span>
            <select
              id="flagged-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Resolved">Resolved</option>
              <option value="Overridden">Overridden</option>
            </select>
          </div>

          <div className="text-xs text-slate-400 font-medium pl-2">
            Showing <span className="font-bold text-slate-800">{filtered.length}</span> of {flaggedRecords.length}
          </div>
        </div>
      </div>

      {/* Flagged Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200 tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Issue ID</th>
                <th className="px-4 py-3.5">Severity</th>
                <th className="px-4 py-3.5">Category Type</th>
                <th className="px-4 py-3.5">Affected Entity</th>
                <th className="px-4 py-3.5">Description & Impact</th>
                <th className="px-4 py-3.5">Reported On</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Resolved By</th>
                <th className="px-4 py-3.5 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    No flagged records found. All operational checks normal!
                  </td>
                </tr>
              ) : (
                filtered.map((issue) => (
                  <tr key={issue.issue_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-rose-700">
                      {issue.issue_id}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge type="severity" status={issue.severity} />
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      {issue.type}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-800">{issue.entity_type}</span>:
                      <span className="font-mono text-slate-600 ml-1">{issue.entity_id}</span>
                    </td>
                    <td className="px-4 py-3.5 max-w-sm text-slate-700">
                      <p className="line-clamp-2">{issue.description}</p>
                      {issue.resolution_notes && (
                        <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                          Resolution: {issue.resolution_notes}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                      {issue.reported_date}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge type="issueStatus" status={issue.status} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 text-[11px] whitespace-nowrap">
                      {issue.resolved_by || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenResolve(issue)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors inline-flex items-center gap-1 ${
                          issue.status === 'Resolved' || issue.status === 'Overridden'
                            ? 'text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200'
                            : 'text-rose-700 bg-rose-50 border-rose-300 hover:bg-rose-100'
                        }`}
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>{issue.status === 'Resolved' ? 'View Audit' : 'Resolve Issue'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolve Issue Modal */}
      {isResolveModalOpen && selectedIssue && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Resolve Operational Flagged Issue
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-mono">
              {selectedIssue.issue_id} • {selectedIssue.type} ({selectedIssue.entity_id})
            </p>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700">
                <p className="font-semibold text-slate-900 mb-1">Issue Description:</p>
                <p>{selectedIssue.description}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resolution Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResolutionAction('Resolved')}
                    className={`p-2.5 rounded-lg border font-semibold text-center ${
                      resolutionAction === 'Resolved'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Mark Resolved
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolutionAction('Overridden')}
                    className={`p-2.5 rounded-lg border font-semibold text-center ${
                      resolutionAction === 'Overridden'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Admin Override
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Audit Notes / Resolution Action Log
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="State the resolution steps taken (e.g. weighbridge recalibration approved, voucher adjustment credited, or SPCB renewal confirmed)..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsResolveModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                id="confirm-flag-resolution-btn"
                onClick={handleSaveResolution}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                Submit Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
