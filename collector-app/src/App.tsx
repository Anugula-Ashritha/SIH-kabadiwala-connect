/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { NavTab, WasteLot, Recycler, LotStatus, AppNotification } from './types';
import {
  INITIAL_COLLECTOR,
  INITIAL_LOTS,
  NEARBY_RECYCLERS,
  DAILY_PRICE_BOARD,
} from './mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { CreateLotWizard } from './components/CreateLotWizard';
import { LotDetailsModal } from './components/LotDetailsModal';
import { FindRecyclerModal } from './components/FindRecyclerModal';
import { SafetyGuidanceModal } from './components/SafetyGuidanceModal';
import { NotificationsModal } from './components/NotificationsModal';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { MyLotsScreen } from './screens/MyLotsScreen';
import { PriceBoardScreen } from './screens/PriceBoardScreen';
import { EarningsScreen } from './screens/EarningsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { offlineStorageService } from './services/offlineStorageService';
import { DEFAULT_NOTIFICATIONS } from './services/notificationService';
import {
  fetchCollectorLots,
  fetchLotById,
  updateLotStatusOnBackend,
  mapBackendLotToWasteLot,
  mapFrontendStatusToBackend,
  DEFAULT_COLLECTOR_ID,
} from './services/backendApiService';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Persistence and State
  const [lots, setLots] = useState<WasteLot[]>(() =>
    offlineStorageService.getLots(INITIAL_LOTS)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(DEFAULT_NOTIFICATIONS);
  const [isOffline, setIsOffline] = useState<boolean>(!offlineStorageService.isOnline());
  const [isLoadingBackendLots, setIsLoadingBackendLots] = useState<boolean>(false);
  const [backendLotsNotice, setBackendLotsNotice] = useState<string | null>(null);

  // Modals & Sheets
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLotForDetails, setSelectedLotForDetails] = useState<WasteLot | null>(null);
  const [selectedLotForMatching, setSelectedLotForMatching] = useState<WasteLot | null>(null);
  const [isFindRecyclerOpen, setIsFindRecyclerOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const collector = INITIAL_COLLECTOR;

  // Fetch collector lots from backend API
  const loadLotsFromBackend = useCallback(async () => {
    if (isOffline) {
      console.log('[Backend API] App is offline, skipping fetch from backend');
      return;
    }

    setIsLoadingBackendLots(true);
    console.log('[Backend API] Fetching lots for collector:', DEFAULT_COLLECTOR_ID);

    try {
      const backendLots = await fetchCollectorLots(DEFAULT_COLLECTOR_ID);
      console.log('[Backend API] Fetched lots successfully:', backendLots);

      if (backendLots && backendLots.length > 0) {
        const mapped = backendLots.map(mapBackendLotToWasteLot);

        setLots((prevLots) => {
          // Merge backend lots with any offline/local lots created locally
          const backendIds = new Set(mapped.map((l) => l.lot_id));
          const localOnly = prevLots.filter(
            (l) => !backendIds.has(l.lot_id) && !backendIds.has(l.id || '')
          );
          const combined = [...mapped, ...localOnly];
          offlineStorageService.saveLots(combined);
          return combined;
        });
      }
      setBackendLotsNotice(null);
    } catch (err: any) {
      console.error('[Backend API] Backend error fetching lots:', err);
      setBackendLotsNotice('Backend unavailable (http://127.0.0.1:8001). Showing cached lots.');
    } finally {
      setIsLoadingBackendLots(false);
    }
  }, [isOffline]);

  // Initial load from backend
  useEffect(() => {
    loadLotsFromBackend();
  }, [loadLotsFromBackend]);

  // Re-fetch when switching to lots screen
  useEffect(() => {
    if (activeTab === 'lots') {
      loadLotsFromBackend();
    }
  }, [activeTab, loadLotsFromBackend]);

  // Listen for browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      offlineStorageService.setSimulatedOffline(false);
      const synced = offlineStorageService.syncPendingLots();
      setLots(synced);
      loadLotsFromBackend();
    };
    const handleOffline = () => {
      setIsOffline(true);
      offlineStorageService.setSimulatedOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadLotsFromBackend]);

  // Handlers
  const handleToggleOffline = (offline: boolean) => {
    setIsOffline(offline);
    offlineStorageService.setSimulatedOffline(offline);
    if (!offline) {
      const synced = offlineStorageService.syncPendingLots();
      setLots(synced);
      loadLotsFromBackend();
    }
  };

  const handleSelectLotForDetails = async (lot: WasteLot) => {
    setSelectedLotForDetails(lot);

    const targetLotId = lot.lot_id || lot.id;
    if (!isOffline && targetLotId) {
      try {
        console.log('[Backend API] Fetching lot details for:', targetLotId);
        const backendLot = await fetchLotById(targetLotId);
        console.log('[Backend API] Backend response received for lot details:', backendLot);
        if (backendLot) {
          const mapped = mapBackendLotToWasteLot(backendLot);
          setSelectedLotForDetails((current) =>
            current && (current.lot_id === targetLotId || current.id === targetLotId)
              ? { ...current, ...mapped }
              : current
          );
        }
      } catch (err) {
        console.error('[Backend API] Backend error fetching lot details:', err);
      }
    }
  };

  const handleCreateLot = (newLot: WasteLot, andFindRecycler = false) => {
    const updated = offlineStorageService.addLot(newLot);
    setLots(updated);

    // Add automatic system notification
    const notif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      title: 'Consignment Created',
      message: `${newLot.lot_id || newLot.id} (${newLot.material || newLot.category}) is now listed.`,
      timestamp: 'Just now',
      read: false,
      type: 'lot',
      lot_id: newLot.lot_id || newLot.id,
    };
    setNotifications((prev) => [notif, ...prev]);

    if (andFindRecycler) {
      setSelectedLotForMatching(newLot);
      setIsFindRecyclerOpen(true);
    }
  };

  const handleUpdateLotStatus = async (lot: WasteLot, newStatus: LotStatus) => {
    const targetLotId = lot.lot_id || lot.id;
    const backendStatusString = mapFrontendStatusToBackend(newStatus);

    // Call real backend PATCH /api/lots/{lot_id}/status?status=STATUS when online
    if (targetLotId && !isOffline) {
      try {
        console.log(
          `[Backend API] Updating lot status on backend: PATCH /api/lots/${targetLotId}/status?status=${backendStatusString}`
        );
        const response = await updateLotStatusOnBackend(targetLotId, backendStatusString);
        console.log('[Backend API] Backend response received for status update:', response);
      } catch (err) {
        console.error('[Backend API] Backend error updating lot status:', err);
      }
    }

    const updatedLot: WasteLot = {
      ...lot,
      status: newStatus,
    };

    // If marked completed, set final price and add to transaction history
    if (newStatus === 'completed') {
      const finalAmt =
        lot.final_price ||
        lot.quoted_price ||
        lot.estimatedPrice ||
        lot.estimated_min_value ||
        1500;
      updatedLot.final_price = finalAmt;

      offlineStorageService.addTransaction({
        transaction_id: `TXN-2026-${Math.floor(100 + Math.random() * 900)}`,
        lot_id: lot.lot_id || lot.id || 'LOT-2026',
        collector_id: collector.collector_id,
        recycler_id: lot.recycler_id || 'REC-01',
        recycler_name: lot.recycler_name || lot.recyclerName || 'EcoTech E-Waste Recyclers',
        material: lot.material || lot.category || 'E-Waste',
        amount: finalAmt,
        payment_status: 'Paid',
        payment_method: 'Direct Bank / UPI',
        transaction_date: 'Just now',
      });
    }

    const updated = offlineStorageService.updateLot(updatedLot);
    setLots(updated);
    setSelectedLotForDetails(updatedLot);
  };

  const handleSelectRecyclerForLot = (targetLot: WasteLot, recycler: Recycler) => {
    const recyclerName = recycler.organization_name || recycler.name || 'Authorized Recycler';
    const rate = recycler.offered_rates?.pcb || 540;
    const weight = targetLot.weight_kg || targetLot.weightKg || 1;
    const quoted = Math.round(rate * weight);

    const targetLotId = targetLot.lot_id || targetLot.id;
    if (targetLotId && !isOffline) {
      try {
        console.log(
          `[Backend API] Updating lot status on backend: PATCH /api/lots/${targetLotId}/status?status=PENDING`
        );
        updateLotStatusOnBackend(targetLotId, 'PENDING').catch((err) => {
          console.error('[Backend API] Backend error updating lot status:', err);
        });
      } catch (err) {
        console.error('[Backend API] Backend error updating lot status:', err);
      }
    }

    const updatedLot: WasteLot = {
      ...targetLot,
      recycler_id: recycler.recycler_id || recycler.id,
      recycler_name: recyclerName,
      recyclerName: recyclerName,
      status: 'pending',
      quoted_price: quoted,
    };

    const updated = offlineStorageService.updateLot(updatedLot);
    setLots(updated);

    // Add confirmation notification
    const notif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      title: 'Offer Sent to Recycler',
      message: `Lot ${targetLot.lot_id || targetLot.id} successfully sent to ${recyclerName}.`,
      timestamp: 'Just now',
      read: false,
      type: 'lot',
      lot_id: targetLot.lot_id || targetLot.id,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-0 sm:p-4">
        <div className="w-full max-w-md bg-white shadow-2xl sm:rounded-3xl overflow-hidden min-h-screen sm:min-h-0">
          <LoginScreen onLogin={() => setIsLoggedIn(true)} />
        </div>
      </div>
    );
  }

  const pendingCount = lots.filter(
    (l) => l.status === 'pending' || l.status === 'finding_recycler' || l.status === 'draft'
  ).length;

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start sm:py-6">
      {/* Mobile container viewport */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen sm:min-h-[844px] shadow-2xl sm:rounded-3xl overflow-hidden flex flex-col relative border-0 sm:border sm:border-slate-300/80">
        {/* Collector Header */}
        <Header
          collector={collector}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadNotificationsCount={unreadNotifsCount}
          isOffline={isOffline}
        />

        {/* Dynamic Screen View */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'home' && (
            <HomeScreen
              lots={lots}
              recyclers={NEARBY_RECYCLERS}
              onOpenCreateLot={() => setIsCreateModalOpen(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onSelectLot={handleSelectLotForDetails}
              onSelectRecycler={(_recycler) => {
                setSelectedLotForMatching(lots[0]);
                setIsFindRecyclerOpen(true);
              }}
            />
          )}

          {activeTab === 'lots' && (
            <MyLotsScreen
              lots={lots}
              onOpenCreateLot={() => setIsCreateModalOpen(true)}
              onSelectLot={handleSelectLotForDetails}
              onRefresh={loadLotsFromBackend}
              isLoading={isLoadingBackendLots}
              backendNotice={backendLotsNotice}
            />
          )}

          {activeTab === 'prices' && (
            <PriceBoardScreen prices={DAILY_PRICE_BOARD} />
          )}

          {activeTab === 'earnings' && <EarningsScreen />}

          {activeTab === 'profile' && (
            <ProfileScreen
              collector={collector}
              onLogout={() => {
                setIsLoggedIn(false);
                setActiveTab('home');
              }}
              onOpenSafetyGuidance={() => setIsSafetyModalOpen(true)}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              isOffline={isOffline}
              onToggleOffline={handleToggleOffline}
            />
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          pendingLotsCount={pendingCount}
        />

        {/* Complete 4-Step Create Lot Wizard + AI Camera Classification */}
        <CreateLotWizard
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateLot={handleCreateLot}
          collectorLocation={collector.location}
        />

        {/* Lot Details & Status Tracking Timeline Modal */}
        <LotDetailsModal
          lot={selectedLotForDetails}
          isOpen={!!selectedLotForDetails}
          onClose={() => setSelectedLotForDetails(null)}
          onFindRecyclerForLot={(lot) => {
            setSelectedLotForMatching(lot);
            setIsFindRecyclerOpen(true);
          }}
          onUpdateLotStatus={handleUpdateLotStatus}
        />

        {/* Find Recycler & Matching Screen */}
        <FindRecyclerModal
          isOpen={isFindRecyclerOpen}
          onClose={() => setIsFindRecyclerOpen(false)}
          lot={selectedLotForMatching}
          allLots={lots}
          recyclers={NEARBY_RECYCLERS}
          onSelectRecyclerForLot={handleSelectRecyclerForLot}
        />

        {/* Safety Guidance Pictorial Modal */}
        <SafetyGuidanceModal
          isOpen={isSafetyModalOpen}
          onClose={() => setIsSafetyModalOpen(false)}
        />

        {/* Notifications Modal / Sheet */}
        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          onSelectNotification={(notif) => {
            if (notif.lot_id) {
              const matchedLot = lots.find(
                (l) => l.lot_id === notif.lot_id || l.id === notif.lot_id
              );
              if (matchedLot) {
                setSelectedLotForDetails(matchedLot);
                setIsNotificationsOpen(false);
              }
            }
          }}
        />
      </div>
    </div>
  );
}
