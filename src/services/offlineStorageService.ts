import { WasteLot, Transaction } from '../types';

const STORAGE_KEYS = {
  LOTS: 'kc_collector_lots_v1',
  TRANSACTIONS: 'kc_collector_transactions_v1',
  SIMULATED_OFFLINE: 'kc_simulated_offline',
};

class OfflineStorageService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // Check connectivity: either real browser navigator.onLine or explicit demo toggle
  isOnline(): boolean {
    if (!this.isBrowser()) return true;
    const manualOffline = localStorage.getItem(STORAGE_KEYS.SIMULATED_OFFLINE);
    if (manualOffline === 'true') return false;
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  setSimulatedOffline(offline: boolean): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.SIMULATED_OFFLINE, offline ? 'true' : 'false');
  }

  getLots(defaultLots: WasteLot[]): WasteLot[] {
    if (!this.isBrowser()) return defaultLots;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOTS);
      if (!stored) {
        this.saveLots(defaultLots);
        return defaultLots;
      }
      return JSON.parse(stored) as WasteLot[];
    } catch {
      return defaultLots;
    }
  }

  saveLots(lots: WasteLot[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.LOTS, JSON.stringify(lots));
    } catch (e) {
      console.warn('Failed to save lots to local storage', e);
    }
  }

  addLot(lot: WasteLot): WasteLot[] {
    const current = this.getLots([]);
    // If offline, mark sync_pending
    const lotToStore: WasteLot = {
      ...lot,
      sync_pending: !this.isOnline(),
    };
    const updated = [lotToStore, ...current];
    this.saveLots(updated);
    return updated;
  }

  updateLot(updatedLot: WasteLot): WasteLot[] {
    const current = this.getLots([]);
    const updated = current.map((l) =>
      (l.lot_id === updatedLot.lot_id || l.id === updatedLot.id || l.id === updatedLot.lot_id)
        ? { ...l, ...updatedLot, sync_pending: !this.isOnline() }
        : l
    );
    this.saveLots(updated);
    return updated;
  }

  getTransactions(defaultTransactions: Transaction[]): Transaction[] {
    if (!this.isBrowser()) return defaultTransactions;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!stored) {
        this.saveTransactions(defaultTransactions);
        return defaultTransactions;
      }
      return JSON.parse(stored) as Transaction[];
    } catch {
      return defaultTransactions;
    }
  }

  saveTransactions(transactions: Transaction[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.warn('Failed to save transactions to local storage', e);
    }
  }

  addTransaction(tx: Transaction): Transaction[] {
    const current = this.getTransactions([]);
    const updated = [tx, ...current];
    this.saveTransactions(updated);
    return updated;
  }

  syncPendingLots(): WasteLot[] {
    const lots = this.getLots([]);
    const synced = lots.map((l) => ({ ...l, sync_pending: false }));
    this.saveLots(synced);
    return synced;
  }
}

export const offlineStorageService = new OfflineStorageService();
