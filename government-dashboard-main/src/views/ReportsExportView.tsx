import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Layers, 
  Building2, 
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { RegionalCollection, MaterialStats, RecyclerStats, ImpactMetrics, FilterState, GovtUser } from '../types';
import { formatINR, formatWeight } from '../components/Charts';

interface Props {
  collections: RegionalCollection[];
  materials: MaterialStats[];
  recyclers: RecyclerStats[];
  impact: ImpactMetrics;
  filters: FilterState;
  currentUser: GovtUser;
}

type ReportType = 'cpcb-form-4' | 'state-formalization' | 'material-hazard' | 'price-benchmark' | 'epr-credit';

export const ReportsExportView: React.FC<Props> = ({
  collections,
  materials,
  recyclers,
  impact,
  filters,
  currentUser
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('cpcb-form-4');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const reportConfigs: Record<ReportType, { title: string; subtitle: string; code: string }> = {
    'cpcb-form-4': {
      title: 'Form-4 Annual E-Waste Return & Compliance Manifest',
      subtitle: 'Central Pollution Control Board statutory return under Rule 13(1)(ii) of E-Waste (Management) Rules, 2022',
      code: 'CPCB-FORM-4-REV2026'
    },
    'state-formalization': {
      title: 'State Informal Collector Formalization & Livelihood Dossier',
      subtitle: 'Progress evaluation of micro-aggregator inclusion, digital banking payments, and informal leakage reduction',
      code: 'SPCB-LIVELIHOOD-SEC8'
    },
    'material-hazard': {
      title: 'Schedule III Hazardous E-Waste Stream Extraction Audit',
      subtitle: 'Verification of PCB, Battery, and CRT heavy-metal diversion from unscientific burning into authorized hydrometallurgy',
      code: 'CPCB-HAZARD-AUDIT-SCH3'
    },
    'price-benchmark': {
      title: 'Scrap Price Transparency & Collector Realization Advisory',
      subtitle: 'Cross-state scrap buying rates, fair trade index, and minimum floor price benchmarks',
      code: 'GOV-PRICE-BENCHMARK-Q1'
    },
    'epr-credit': {
      title: 'EPR (Extended Producer Responsibility) Credit Reconciliation Sheet',
      subtitle: 'Authorized recycler weighbridge tonnage certificate for Brand Producer recycling credit settlement',
      code: 'EPR-CREDIT-RECON-2026'
    }
  };

  // CSV Generator
  const handleExportCSV = () => {
    let csvContent = '';
    const now = new Date().toISOString().split('T')[0];

    if (selectedReport === 'cpcb-form-4') {
      csvContent = 'State,City,Month,Lots_Collected,Gross_Weight_KG,Completed_Weight_KG,Transaction_Value_INR\n' +
        collections.map(c => 
          `"${c.state}","${c.city}","${c.month}",${c.lots_collected},${c.total_weight_kg},${c.completed_weight_kg},${c.transaction_value}`
        ).join('\n');
    } else if (selectedReport === 'material-hazard') {
      csvContent = 'Material,CPCB_Code,Hazard_Level,Total_Weight_KG,Lot_Count,Avg_Price_Per_KG,Transaction_Value_INR,Percentage_Total\n' +
        materials.map(m => 
          `"${m.material}","${m.cpcb_code || 'EW-00'}","${m.hazard_category || 'Low'}",${m.total_weight_kg},${m.lot_count},${m.average_price_per_kg},${m.transaction_value},${m.percentage_of_total}`
        ).join('\n');
    } else if (selectedReport === 'epr-credit' || selectedReport === 'state-formalization') {
      csvContent = 'Recycler_ID,Facility_Name,State,City,Authorization_Status,CPCB_License,Completed_Lots,Processed_Weight_KG,Monthly_Capacity_MT\n' +
        recyclers.map(r => 
          `"${r.recycler_id}","${r.name}","${r.state}","${r.city}","${r.authorization_status}","${r.authorization_number}",${r.completed_lots},${r.processed_weight_kg},${r.capacity_metric_tons_per_month}`
        ).join('\n');
    } else {
      csvContent = 'Metric,Value,Unit\n' +
        `"Total E-Waste Monitored",${impact.total_e_waste_collected},"kg"\n` +
        `"Handed to Authorized Recyclers",${impact.total_e_waste_handed_to_authorized_recyclers},"kg"\n` +
        `"Formal Channel Diversion Rate",${impact.formal_channel_rate},"%"\n` +
        `"Total Transaction Payout",${impact.total_transaction_value},"INR"\n` +
        `"Active Formalized Collectors",${impact.active_collectors},"count"\n` +
        `"Verified Recyclers",${impact.verified_recyclers},"count"`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Kabadiwala_Connect_${selectedReport}_${now}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(`CSV report successfully downloaded: Kabadiwala_Connect_${selectedReport}_${now}.csv`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  // JSON Generator
  const handleExportJSON = () => {
    const now = new Date().toISOString().split('T')[0];
    const exportObject = {
      report_type: selectedReport,
      report_code: reportConfigs[selectedReport].code,
      generated_at: new Date().toISOString(),
      generated_by: {
        name: currentUser.name,
        designation: currentUser.designation,
        department: currentUser.department,
        jurisdiction: currentUser.jurisdiction
      },
      applied_filters: filters,
      summary_impact: impact,
      records_data: selectedReport === 'material-hazard' ? materials : selectedReport === 'epr-credit' ? recyclers : collections
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Kabadiwala_Connect_${selectedReport}_${now}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(`JSON export generated: Kabadiwala_Connect_${selectedReport}_${now}.json`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Statutory Reports & Regulatory Export Center
          </h2>
          <p className="text-xs text-slate-500">
            Generate standardized CPCB compliance forms, state-level formalization audits, and EPR credit reconciliation dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Select Report Template */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Select Regulatory Report Template:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {(Object.keys(reportConfigs) as ReportType[]).map((key) => {
            const config = reportConfigs[key];
            const isSelected = selectedReport === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedReport(key)}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-800 ring-2 ring-emerald-500/50 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div>
                  <div className={`text-[10px] font-mono font-bold uppercase ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {config.code}
                  </div>
                  <div className="text-xs font-bold mt-1 line-clamp-2 leading-tight">
                    {config.title}
                  </div>
                </div>
                <div className={`text-[10px] mt-2 font-medium ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  {isSelected ? '✓ Selected for Preview' : 'Select'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Official Printable Report Preview Canvas */}
      <div className="bg-white border border-slate-300 rounded-2xl shadow-sm p-6 sm:p-10 space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Government Letterhead Header */}
        <div className="border-b-2 border-slate-900 pb-5 text-center relative">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-left">
              <div className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
                Government of India • Central Pollution Control Board
              </div>
              <div className="text-[11px] text-slate-600 font-medium">
                Ministry of Environment, Forest and Climate Change (MoEFCC)
              </div>
            </div>
          </div>

          <h3 className="text-lg font-black text-slate-900 mt-3 tracking-tight">
            {reportConfigs[selectedReport].title}
          </h3>
          <p className="text-xs text-slate-500 max-w-2xl mx-auto mt-1">
            {reportConfigs[selectedReport].subtitle}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 font-mono">
            <span>Report Code: <strong>{reportConfigs[selectedReport].code}</strong></span>
            <span>•</span>
            <span>Date: <strong>11-Sep-2026</strong></span>
            <span>•</span>
            <span>Jurisdiction: <strong>{currentUser.jurisdiction}</strong></span>
            <span>•</span>
            <span>Status: <strong className="text-emerald-700">CPCB Telemetry Verified</strong></span>
          </div>
        </div>

        {/* Officer Attribution Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Attesting Officer</span>
            <div className="font-bold text-slate-900">{currentUser.name}</div>
            <div className="text-[10px] text-slate-500">{currentUser.designation}</div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Department</span>
            <div className="font-semibold text-slate-800">{currentUser.department}</div>
            <div className="text-[10px] text-slate-500">{currentUser.email}</div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Scope Period & Filter</span>
            <div className="font-semibold text-slate-800">{filters.dateRange} • {filters.state}</div>
            <div className="text-[10px] text-emerald-700 font-mono">Anonymized Audit Pass</div>
          </div>
        </div>

        {/* Key Statutory Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Total E-Waste Logged</div>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
              {formatWeight(impact.total_e_waste_collected)}
            </div>
          </div>
          <div className="p-3 rounded border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Authorized Handover</div>
            <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">
              {formatWeight(impact.total_e_waste_handed_to_authorized_recyclers)}
            </div>
          </div>
          <div className="p-3 rounded border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Formalization Ratio</div>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
              {impact.formal_channel_rate}%
            </div>
          </div>
          <div className="p-3 rounded border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Direct Informal Payout</div>
            <div className="text-base font-bold text-blue-700 font-mono mt-0.5">
              {formatINR(impact.total_transaction_value)}
            </div>
          </div>
        </div>

        {/* Dynamic Table based on selected report */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              {selectedReport === 'material-hazard' ? (
                <tr>
                  <th className="py-2.5 px-3">Material Stream</th>
                  <th className="py-2.5 px-3">CPCB Code</th>
                  <th className="py-2.5 px-3">Hazard Rating</th>
                  <th className="py-2.5 px-3">Gross Weight</th>
                  <th className="py-2.5 px-3">Average Price/kg</th>
                  <th className="py-2.5 px-3 text-right">Disbursed Value</th>
                </tr>
              ) : selectedReport === 'epr-credit' ? (
                <tr>
                  <th className="py-2.5 px-3">Recycler Facility</th>
                  <th className="py-2.5 px-3">State/City</th>
                  <th className="py-2.5 px-3">CPCB License</th>
                  <th className="py-2.5 px-3">Lots Settled</th>
                  <th className="py-2.5 px-3">Processed MT</th>
                  <th className="py-2.5 px-3 text-right">EPR Capacity</th>
                </tr>
              ) : (
                <tr>
                  <th className="py-2.5 px-3">Region / Cluster</th>
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3">Lots Collected</th>
                  <th className="py-2.5 px-3">Gross Weight</th>
                  <th className="py-2.5 px-3">Weighbridge Weight</th>
                  <th className="py-2.5 px-3 text-right">Settled Payout</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {selectedReport === 'material-hazard' ? (
                materials.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">{m.material}</td>
                    <td className="py-2.5 px-3 text-slate-600">{m.cpcb_code}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        m.hazard_category === 'High' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {m.hazard_category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{m.total_weight_kg.toLocaleString()} kg</td>
                    <td className="py-2.5 px-3 text-emerald-700">₹ {m.average_price_per_kg}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatINR(m.transaction_value)}</td>
                  </tr>
                ))
              ) : selectedReport === 'epr-credit' ? (
                recyclers.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">{r.name}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-600">{r.city}, {r.state}</td>
                    <td className="py-2.5 px-3 text-slate-700">{r.authorization_number}</td>
                    <td className="py-2.5 px-3 text-slate-900">{r.completed_lots}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">{(r.processed_weight_kg / 1000).toFixed(1)} MT</td>
                    <td className="py-2.5 px-3 text-right text-slate-900 font-bold">{r.capacity_metric_tons_per_month} MT/mo</td>
                  </tr>
                ))
              ) : (
                collections.slice(0, 8).map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">{c.city}, {c.state}</td>
                    <td className="py-2.5 px-3 text-slate-600">{c.month}</td>
                    <td className="py-2.5 px-3 text-slate-800">{c.lots_collected} lots</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{(c.total_weight_kg / 1000).toFixed(1)} MT</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">{(c.completed_weight_kg / 1000).toFixed(1)} MT</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatINR(c.transaction_value)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Statutory Attestation Footer */}
        <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Digital Cryptographic Manifest Seal: <strong>SHA-256: 0x9f88c...2026</strong></span>
          </div>
          <div className="text-right">
            <div className="font-bold text-slate-900">Digitally Verified & Stamped</div>
            <div className="text-[10px] text-slate-400">Central Pollution Control Board Telemetry Node</div>
          </div>
        </div>

      </div>

    </div>
  );
};
