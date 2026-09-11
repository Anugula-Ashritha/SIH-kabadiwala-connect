import React, { useState } from 'react';
import {
  IndianRupee,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  Download,
  Clock,
  AlertCircle,
  BarChart3,
  Filter,
} from 'lucide-react';
import { Transaction, PaymentStatus } from '../types';
import { INITIAL_TRANSACTIONS } from '../mockData';
import { offlineStorageService } from '../services/offlineStorageService';

export const EarningsScreen: React.FC = () => {
  const [transactions] = useState<Transaction[]>(() =>
    offlineStorageService.getTransactions(INITIAL_TRANSACTIONS)
  );
  const [statusFilter, setStatusFilter] = useState<'All' | PaymentStatus>('All');

  // Stats from prompt requirements:
  const totalEarnings = 42850;
  const thisMonthEarnings = 18420;
  const pendingPayments = 7225;
  const completedTransactionsCount = 28;

  const filteredTransactions = transactions.filter((tx) =>
    statusFilter === 'All' ? true : tx.payment_status === statusFilter
  );

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
            Paid
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-2.5 h-2.5 text-amber-600" />
            Pending
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
            Partially Paid
          </span>
        );
      case 'Disputed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
            Disputed
          </span>
        );
    }
  };

  // Monthly Earnings Trend Data for SVG Chart
  const MONTHLY_TREND = [
    { month: 'Apr', amount: 8200 },
    { month: 'May', amount: 9400 },
    { month: 'Jun', amount: 12500 },
    { month: 'Jul', amount: 15800 },
    { month: 'Aug', amount: 16900 },
    { month: 'Sep', amount: 18420 },
  ];

  const maxMonthAmount = Math.max(...MONTHLY_TREND.map((m) => m.amount));

  return (
    <div className="space-y-4 pb-24 px-4 pt-3 max-w-md mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">Earnings & Payouts</h2>
        <p className="text-xs text-slate-500">Track payments from authorized e-waste buyers</p>
      </div>

      {/* Main Balance Hero Card */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-emerald-200">
          <span>Collector Wallet / कुल राशि</span>
          <span className="bg-emerald-700/60 px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium">
            Direct Bank Transfer
          </span>
        </div>
        <div className="mt-2 text-3xl font-black tracking-tight text-white flex items-center">
          <IndianRupee className="w-7 h-7 stroke-[2.5]" />
          <span>{totalEarnings.toLocaleString('en-IN')}.00</span>
        </div>
        <div className="mt-1 text-xs text-emerald-300">
          Total earnings earned through Kabadiwala Connect
        </div>

        <div className="mt-4 pt-3 border-t border-emerald-700/50 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-emerald-300 block text-[10px]">This Month</span>
            <span className="font-bold text-white text-sm">
              ₹{thisMonthEarnings.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-amber-300 block text-[10px]">Pending Payments</span>
            <span className="font-bold text-amber-200 text-sm">
              ₹{pendingPayments.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Summary Strip */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500">Average Scrap Rate</div>
          <div className="text-base font-extrabold text-slate-900 mt-0.5">₹348 / kg</div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-0.5 mt-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> +18% vs middle-men
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500">Transactions</div>
          <div className="text-base font-extrabold text-slate-900 mt-0.5">
            {completedTransactionsCount} Completed
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">100% CPCB verified</div>
        </div>
      </div>

      {/* Monthly Trend Chart (SVG Bar Chart) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Monthly Earnings Growth
            </h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            +125% H1 2026
          </span>
        </div>

        {/* SVG Bars */}
        <div className="pt-2 pb-1">
          <div className="h-28 flex items-end justify-between gap-2 px-1">
            {MONTHLY_TREND.map((item) => {
              const heightPct = Math.round((item.amount / maxMonthAmount) * 100);
              const isCurrent = item.month === 'Sep';

              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[9px] font-extrabold text-slate-700">
                    ₹{(item.amount / 1000).toFixed(1)}k
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-lg transition-all ${
                      isCurrent
                        ? 'bg-emerald-600 shadow-xs ring-2 ring-emerald-300'
                        : 'bg-emerald-200/80 hover:bg-emerald-300'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-bold ${
                      isCurrent ? 'text-emerald-800' : 'text-slate-500'
                    }`}
                  >
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transaction History with Status Filter */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Transaction History</h3>
            <span className="text-[11px] text-slate-500">Individual consignment payouts</span>
          </div>
          <button
            type="button"
            className="text-xs font-semibold text-emerald-700 flex items-center gap-1 hover:underline"
          >
            <Download className="w-3 h-3" /> CPCB Receipt
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {(['All', 'Paid', 'Pending', 'Partially Paid'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                statusFilter === status
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.transaction_id}
              className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between"
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {tx.recycler_name}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                  {tx.material}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-1">
                  <Calendar className="w-3 h-3" />
                  <span>{tx.transaction_date}</span>
                  <span>•</span>
                  <span className="font-mono">{tx.lot_id}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-extrabold text-emerald-700">
                  +₹{tx.amount.toLocaleString('en-IN')}
                </div>
                <div className="mt-1">{getStatusBadge(tx.payment_status)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
