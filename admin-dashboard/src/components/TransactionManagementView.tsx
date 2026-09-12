import React, { useState } from 'react';
import {
  ReceiptText,
  Search,
  Filter,
  IndianRupee,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Download,
  Eye,
  CheckCircle2,
  X
} from 'lucide-react';
import { useData } from '../services/dataService';
import { Transaction, PaymentStatus, PaymentMethod } from '../types';
import { StatusBadge } from './StatusBadge';

interface TransactionManagementProps {
  selectedCity: string;
  globalSearch: string;
}

export const TransactionManagementView: React.FC<TransactionManagementProps> = ({
  selectedCity,
  globalSearch
}) => {
  const { transactions, collectors, recyclers, updateTransactionPayment } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [methodFilter, setMethodFilter] = useState<string>('All');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>('Paid');
  const [utrInput, setUtrInput] = useState('');

  const activeSearch = searchQuery || globalSearch;

  // Filter transactions
  const filtered = transactions.filter((tx) => {
    // Status
    if (statusFilter !== 'All' && tx.payment_status !== statusFilter) {
      return false;
    }
    // Method
    if (methodFilter !== 'All' && tx.payment_method !== methodFilter) {
      return false;
    }
    // Search
    if (activeSearch.trim()) {
      const q = activeSearch.toLowerCase();
      const col = collectors.find(c => c.collector_id === tx.collector_id);
      const rec = recyclers.find(r => r.recycler_id === tx.recycler_id);
      const match =
        tx.transaction_id.toLowerCase().includes(q) ||
        tx.lot_id.toLowerCase().includes(q) ||
        (tx.reference_utr && tx.reference_utr.toLowerCase().includes(q)) ||
        (col && col.name.toLowerCase().includes(q)) ||
        (rec && rec.organization_name.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const totalPaidAmount = transactions
    .filter(t => t.payment_status === 'Paid')
    .reduce((acc, t) => acc + t.final_price, 0);

  const totalPendingAmount = transactions
    .filter(t => t.payment_status === 'Pending' || t.payment_status === 'Processing')
    .reduce((acc, t) => acc + t.final_price, 0);

  const totalTds = transactions.reduce((acc, t) => acc + (t.tds_deducted || 0), 0);

  const handleOpenPayModal = (tx: Transaction) => {
    setSelectedTx(tx);
    setNewPaymentStatus(tx.payment_status);
    setUtrInput(tx.reference_utr || `UTR-BANK-${Date.now().toString().slice(-8)}`);
    setIsPayModalOpen(true);
  };

  const handleSavePayment = () => {
    if (selectedTx) {
      updateTransactionPayment(selectedTx.transaction_id, newPaymentStatus, utrInput);
      setSelectedTx(prev =>
        prev ? { ...prev, payment_status: newPaymentStatus, reference_utr: utrInput } : null
      );
      setIsPayModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Disbursed Settlements
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">
              ₹{totalPaidAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Successfully Paid</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Directly transferred to informal collectors</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Escrow / In-Processing
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">
              ₹{totalPendingAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-amber-700 font-medium">Pending Release</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Awaiting weighbridge sign-off</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Formal Tax & TDS Compliance
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">
              ₹{totalTds.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-500 font-medium">Section 194C (1%)</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Government formalization ledger</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="transaction-search-input"
            type="text"
            placeholder="Search by transaction ID, lot ID, UTR, or parties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Payment Status:</span>
            <select
              id="transaction-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold">Method:</span>
            <select
              id="transaction-method-filter"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="All">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT)</option>
              <option value="Direct Wallet">Direct Wallet</option>
              <option value="Direct Bank Mandate">Direct Bank Mandate</option>
            </select>
          </div>

          <div className="text-xs text-slate-400 font-medium pl-2">
            Showing <span className="font-bold text-slate-800">{filtered.length}</span> of {transactions.length}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200 tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Transaction ID</th>
                <th className="px-4 py-3.5">Lot ID</th>
                <th className="px-4 py-3.5">Collector (Beneficiary)</th>
                <th className="px-4 py-3.5">Recycler (Payer)</th>
                <th className="px-4 py-3.5">Quoted Price</th>
                <th className="px-4 py-3.5">Final Settled Price</th>
                <th className="px-4 py-3.5">Payment Method</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">UTR / Reference</th>
                <th className="px-4 py-3.5">Date & Time</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const collector = collectors.find(c => c.collector_id === tx.collector_id);
                  const recycler = recyclers.find(r => r.recycler_id === tx.recycler_id);

                  return (
                    <tr key={tx.transaction_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-700">
                        {tx.transaction_id}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-800">
                        {tx.lot_id}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">
                          {collector ? collector.name : tx.collector_id}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {collector?.upi_id || tx.collector_id}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800 truncate max-w-xs">
                          {recycler ? recycler.organization_name : tx.recycler_id}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-500 whitespace-nowrap">
                        ₹{tx.quoted_price.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                        ₹{tx.final_price.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                          {tx.payment_method}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge type="payment" status={tx.payment_status} />
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[10px] text-slate-600 whitespace-nowrap">
                        {tx.reference_utr || 'Pending'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 text-[11px]">
                        {tx.transaction_date}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded border border-slate-200 transition-colors inline-flex items-center gap-1"
                          title="View Digital Voucher"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-semibold">Voucher</span>
                        </button>
                        <button
                          onClick={() => handleOpenPayModal(tx)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded border border-slate-200 transition-colors inline-flex items-center gap-1"
                          title="Update Status / UTR"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-semibold">Update</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Digital Voucher Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Kabadiwala Connect Settlement Receipt
                </h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID</span>
                  <span className="font-mono font-bold text-emerald-700">{selectedTx.transaction_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Associated Lot</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedTx.lot_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Settlement Date</span>
                  <span className="font-medium text-slate-800">{selectedTx.transaction_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Banking UTR</span>
                  <span className="font-mono text-slate-800">{selectedTx.reference_utr || 'Pending generation'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Disbursement Status</span>
                  <StatusBadge type="payment" status={selectedTx.payment_status} size="sm" />
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-900">Financial Breakdown</h4>
                <div className="flex justify-between text-slate-600">
                  <span>Gross Quoted Price:</span>
                  <span>₹{selectedTx.quoted_price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>Agreed Final Settlement:</span>
                  <span>₹{selectedTx.final_price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>TDS Withheld (1%):</span>
                  <span>- ₹{selectedTx.tds_deducted || 0}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-emerald-800">
                  <span>Net Paid to Collector:</span>
                  <span>₹{(selectedTx.final_price - (selectedTx.tds_deducted || 0)).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 text-[11px]">
                Beneficiary: <span className="font-bold">{collectors.find(c => c.collector_id === selectedTx.collector_id)?.name}</span> ({selectedTx.collector_id})
                <br />
                Method: <span className="font-semibold">{selectedTx.payment_method}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Payment Modal */}
      {isPayModalOpen && selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Update Settlement Status
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Transaction: <span className="font-mono font-bold text-slate-800">{selectedTx.transaction_id}</span> (₹{selectedTx.final_price.toLocaleString('en-IN')})
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Status</label>
                <select
                  id="txn-payment-status-select"
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="Paid">Paid (Confirmed by Bank)</option>
                  <option value="Processing">Processing (In Escrow)</option>
                  <option value="Pending">Pending Dispatch</option>
                  <option value="Failed">Failed (Invalid VPA/Account)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank UTR / Transaction Reference</label>
                <input
                  type="text"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="e.g. UTR-SBI-260909172084"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                id="save-txn-payment-button"
                onClick={handleSavePayment}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                Save Payment Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
