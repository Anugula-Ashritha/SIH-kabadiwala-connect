import React, { useState } from 'react';
import { DataProvider, useData } from './services/dataService';
import { AdminTab } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AdminLoginView } from './components/AdminLoginView';
import { OverviewDashboardView } from './components/OverviewDashboardView';
import { CollectorManagementView } from './components/CollectorManagementView';
import { RecyclerManagementView } from './components/RecyclerManagementView';
import { LotManagementView } from './components/LotManagementView';
import { TransactionManagementView } from './components/TransactionManagementView';
import { HandoverTraceabilityView } from './components/HandoverTraceabilityView';
import { MaterialPriceManagementView } from './components/MaterialPriceManagementView';
import { FlaggedRecordsView } from './components/FlaggedRecordsView';
import { AdminProfileSettingsView } from './components/AdminProfileSettingsView';

const MainAdminDashboard: React.FC = () => {
  const { admin } = useData();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  if (!admin.is_logged_in) {
    return <AdminLoginView />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
        />

        {/* Dynamic Operational Content View */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/70">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && (
              <OverviewDashboardView setActiveTab={setActiveTab} selectedCity={selectedCity} />
            )}
            {activeTab === 'collectors' && (
              <CollectorManagementView selectedCity={selectedCity} globalSearch={globalSearch} />
            )}
            {activeTab === 'recyclers' && (
              <RecyclerManagementView selectedCity={selectedCity} globalSearch={globalSearch} />
            )}
            {activeTab === 'lots' && (
              <LotManagementView selectedCity={selectedCity} globalSearch={globalSearch} />
            )}
            {activeTab === 'transactions' && (
              <TransactionManagementView selectedCity={selectedCity} globalSearch={globalSearch} />
            )}
            {activeTab === 'handover' && (
              <HandoverTraceabilityView selectedCity={selectedCity} globalSearch={globalSearch} />
            )}
            {activeTab === 'pricing' && (
              <MaterialPriceManagementView selectedCity={selectedCity} globalSearch={globalSearch} />
            )}
            {activeTab === 'flagged' && (
              <FlaggedRecordsView selectedCity={selectedCity} globalSearch={globalSearch} />
            )}
            {activeTab === 'settings' && (
              <AdminProfileSettingsView />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <MainAdminDashboard />
    </DataProvider>
  );
}
