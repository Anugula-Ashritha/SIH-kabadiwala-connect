import React from 'react';
import {
  LotStatus,
  RecyclerVerificationStatus,
  CollectorAccountStatus,
  PaymentStatus,
  HandoverStatus
} from '../types';

interface StatusBadgeProps {
  type: 'lot' | 'recyclerAuth' | 'collector' | 'payment' | 'handover' | 'severity' | 'issueStatus';
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, status, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (type === 'lot') {
    const s = status as LotStatus;
    switch (s) {
      case 'Created':
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
        break;
      case 'Finding Recycler':
        colorClasses = 'bg-sky-50 text-sky-700 border-sky-300 animate-pulse';
        break;
      case 'Offer Received':
        colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-300';
        break;
      case 'Accepted':
        colorClasses = 'bg-teal-50 text-teal-700 border-teal-300';
        break;
      case 'In Transit':
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-300';
        break;
      case 'Handover Pending':
        colorClasses = 'bg-orange-50 text-orange-700 border-orange-300 font-medium';
        break;
      case 'Payment Pending':
        colorClasses = 'bg-yellow-50 text-yellow-800 border-yellow-300';
        break;
      case 'Completed':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-medium';
        break;
      case 'Rejected':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-300';
        break;
      default:
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
    }
  } else if (type === 'recyclerAuth') {
    const s = status as RecyclerVerificationStatus;
    switch (s) {
      case 'Verified':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold';
        break;
      case 'Pending':
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-300';
        break;
      case 'Needs Update':
        colorClasses = 'bg-orange-50 text-orange-700 border-orange-300 font-medium';
        break;
      case 'Rejected':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-300 font-medium';
        break;
      default:
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
    }
  } else if (type === 'collector') {
    const s = status as CollectorAccountStatus;
    switch (s) {
      case 'Active':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'Under Review':
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'Suspended':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
      case 'Inactive':
        colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
        break;
    }
  } else if (type === 'payment') {
    const s = status as PaymentStatus;
    switch (s) {
      case 'Paid':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
        break;
      case 'Processing':
        colorClasses = 'bg-sky-50 text-sky-700 border-sky-200';
        break;
      case 'Pending':
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'Failed':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
    }
  } else if (type === 'handover') {
    const s = status as HandoverStatus;
    switch (s) {
      case 'Completed':
      case 'Verified':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-300';
        break;
      case 'Scheduled':
        colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'Discrepancy Flagged':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-300 font-semibold';
        break;
    }
  } else if (type === 'severity') {
    switch (status) {
      case 'Critical':
        colorClasses = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
        break;
      case 'High':
        colorClasses = 'bg-orange-100 text-orange-800 border-orange-300 font-semibold';
        break;
      case 'Medium':
        colorClasses = 'bg-amber-100 text-amber-800 border-amber-300';
        break;
      case 'Low':
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
        break;
    }
  } else if (type === 'issueStatus') {
    switch (status) {
      case 'Open':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-300';
        break;
      case 'Under Investigation':
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-300';
        break;
      case 'Resolved':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-medium';
        break;
      case 'Overridden':
        colorClasses = 'bg-purple-50 text-purple-700 border-purple-300';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${sizeClasses} ${colorClasses} whitespace-nowrap`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
};
