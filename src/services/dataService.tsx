import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Collector,
  Recycler,
  Material,
  Lot,
  Transaction,
  Handover,
  Price,
  FlaggedRecord,
  AdminUser,
  RecyclerVerificationStatus,
  LotStatus,
  CollectorAccountStatus,
  PaymentStatus,
  RecyclerAccountStatus
} from '../types';
import {
  INITIAL_ADMIN,
  INITIAL_COLLECTORS,
  INITIAL_RECYCLERS,
  INITIAL_MATERIALS,
  INITIAL_LOTS,
  INITIAL_TRANSACTIONS,
  INITIAL_HANDOVERS,
  INITIAL_PRICES,
  INITIAL_FLAGGED_RECORDS
} from '../data/mockData';

interface DataContextType {
  admin: AdminUser;
  collectors: Collector[];
  recyclers: Recycler[];
  materials: Material[];
  lots: Lot[];
  transactions: Transaction[];
  handovers: Handover[];
  prices: Price[];
  flaggedRecords: FlaggedRecord[];
  
  // Auth actions
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  updateAdminProfile: (updated: Partial<AdminUser>) => void;
  
  // Operational mutations (designed to easily swap with REST API)
  updateCollectorStatus: (collectorId: string, status: CollectorAccountStatus) => void;
  updateRecyclerVerification: (recyclerId: string, status: RecyclerVerificationStatus, reason?: string) => void;
  updateRecyclerAccountStatus: (recyclerId: string, status: RecyclerAccountStatus) => void;
  updateLotStatus: (lotId: string, status: LotStatus, recyclerId?: string, finalPrice?: number) => void;
  updateTransactionPayment: (transactionId: string, status: PaymentStatus, utr?: string) => void;
  confirmHandover: (handoverId: string, confirmedWeight: number, signoffName: string) => void;
  updatePriceRate: (priceId: string, buyingRate: number, minRate: number, maxRate: number) => void;
  addPriceRate: (price: Omit<Price, 'price_id'>) => void;
  resolveFlaggedRecord: (issueId: string, notes: string, resolutionAction: 'Resolved' | 'Overridden') => void;
  resetAllData: () => void;
}

const STORAGE_KEY = 'kabadiwala_connect_admin_data_v1';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_admin`);
    return saved ? JSON.parse(saved) : INITIAL_ADMIN;
  });

  const [collectors, setCollectors] = useState<Collector[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_collectors`);
    return saved ? JSON.parse(saved) : INITIAL_COLLECTORS;
  });

  const [recyclers, setRecyclers] = useState<Recycler[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_recyclers`);
    return saved ? JSON.parse(saved) : INITIAL_RECYCLERS;
  });

  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_materials`);
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [lots, setLots] = useState<Lot[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_lots`);
    return saved ? JSON.parse(saved) : INITIAL_LOTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [handovers, setHandovers] = useState<Handover[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_handovers`);
    return saved ? JSON.parse(saved) : INITIAL_HANDOVERS;
  });

  const [prices, setPrices] = useState<Price[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_prices`);
    return saved ? JSON.parse(saved) : INITIAL_PRICES;
  });

  const [flaggedRecords, setFlaggedRecords] = useState<FlaggedRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_flagged`);
    return saved ? JSON.parse(saved) : INITIAL_FLAGGED_RECORDS;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_admin`, JSON.stringify(admin));
  }, [admin]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_collectors`, JSON.stringify(collectors));
  }, [collectors]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_recyclers`, JSON.stringify(recyclers));
  }, [recyclers]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_materials`, JSON.stringify(materials));
  }, [materials]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_lots`, JSON.stringify(lots));
  }, [lots]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_handovers`, JSON.stringify(handovers));
  }, [handovers]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_prices`, JSON.stringify(prices));
  }, [prices]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_flagged`, JSON.stringify(flaggedRecords));
  }, [flaggedRecords]);

  // Auth
  const login = (email: string, _pass: string) => {
    // In mock operational mode, accept admin credentials
    setAdmin(prev => ({
      ...prev,
      email: email || prev.email,
      is_logged_in: true,
      last_login: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' IST'
    }));
    return true;
  };

  const logout = () => {
    setAdmin(prev => ({
      ...prev,
      is_logged_in: false
    }));
  };

  const updateAdminProfile = (updated: Partial<AdminUser>) => {
    setAdmin(prev => ({ ...prev, ...updated }));
  };

  // Collector actions
  const updateCollectorStatus = (collectorId: string, status: CollectorAccountStatus) => {
    setCollectors(prev =>
      prev.map(col => (col.collector_id === collectorId ? { ...col, account_status: status } : col))
    );
  };

  // Recycler verification & account status
  const updateRecyclerVerification = (recyclerId: string, status: RecyclerVerificationStatus, reason?: string) => {
    setRecyclers(prev =>
      prev.map(rec => {
        if (rec.recycler_id === recyclerId) {
          const updatedAccount = status === 'Rejected' ? 'Suspended' : status === 'Verified' ? 'Active' : rec.account_status;
          return {
            ...rec,
            authorization_status: status,
            account_status: updatedAccount
          };
        }
        return rec;
      })
    );

    // If verified or rejected, update corresponding flagged records if any
    if (status === 'Verified') {
      setFlaggedRecords(prev =>
        prev.map(flag =>
          flag.entity_id === recyclerId
            ? {
                ...flag,
                status: 'Resolved',
                resolution_notes: reason || 'Recycler compliance re-verified by Admin.',
                resolved_by: admin.name,
                resolved_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
              }
            : flag
        )
      );
    }
  };

  const updateRecyclerAccountStatus = (recyclerId: string, status: RecyclerAccountStatus) => {
    setRecyclers(prev =>
      prev.map(rec => (rec.recycler_id === recyclerId ? { ...rec, account_status: status } : rec))
    );
  };

  // Lot actions
  const updateLotStatus = (lotId: string, status: LotStatus, recyclerId?: string, finalPrice?: number) => {
    setLots(prev =>
      prev.map(lot => {
        if (lot.lot_id === lotId) {
          return {
            ...lot,
            status,
            ...(recyclerId ? { recycler_id: recyclerId } : {}),
            ...(finalPrice !== undefined ? { final_price: finalPrice } : {})
          };
        }
        return lot;
      })
    );
  };

  // Transactions
  const updateTransactionPayment = (transactionId: string, status: PaymentStatus, utr?: string) => {
    setTransactions(prev =>
      prev.map(tx => {
        if (tx.transaction_id === transactionId) {
          return {
            ...tx,
            payment_status: status,
            ...(utr ? { reference_utr: utr } : {})
          };
        }
        return tx;
      })
    );
  };

  // Handovers
  const confirmHandover = (handoverId: string, confirmedWeight: number, signoffName: string) => {
    setHandovers(prev =>
      prev.map(h => {
        if (h.handover_id === handoverId) {
          return {
            ...h,
            weight_confirmed: confirmedWeight,
            recycler_confirmation: true,
            status: 'Verified',
            manifest_signoff_by: signoffName
          };
        }
        return h;
      })
    );
  };

  // Prices
  const updatePriceRate = (priceId: string, buyingRate: number, minRate: number, maxRate: number) => {
    setPrices(prev =>
      prev.map(p =>
        p.price_id === priceId
          ? {
              ...p,
              buying_price_per_kg: buyingRate,
              market_min: minRate,
              market_max: maxRate,
              effective_date: new Date().toISOString().substring(0, 10)
            }
          : p
      )
    );
  };

  const addPriceRate = (price: Omit<Price, 'price_id'>) => {
    const newPriceId = `PRC-CUST-${Date.now().toString().slice(-4)}`;
    setPrices(prev => [{ ...price, price_id: newPriceId }, ...prev]);
  };

  // Flagged records
  const resolveFlaggedRecord = (issueId: string, notes: string, resolutionAction: 'Resolved' | 'Overridden') => {
    setFlaggedRecords(prev =>
      prev.map(issue =>
        issue.issue_id === issueId
          ? {
              ...issue,
              status: resolutionAction,
              resolution_notes: notes,
              resolved_by: admin.name,
              resolved_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
            }
          : issue
      )
    );
  };

  const resetAllData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_admin`);
    localStorage.removeItem(`${STORAGE_KEY}_collectors`);
    localStorage.removeItem(`${STORAGE_KEY}_recyclers`);
    localStorage.removeItem(`${STORAGE_KEY}_materials`);
    localStorage.removeItem(`${STORAGE_KEY}_lots`);
    localStorage.removeItem(`${STORAGE_KEY}_transactions`);
    localStorage.removeItem(`${STORAGE_KEY}_handovers`);
    localStorage.removeItem(`${STORAGE_KEY}_prices`);
    localStorage.removeItem(`${STORAGE_KEY}_flagged`);

    setAdmin(INITIAL_ADMIN);
    setCollectors(INITIAL_COLLECTORS);
    setRecyclers(INITIAL_RECYCLERS);
    setMaterials(INITIAL_MATERIALS);
    setLots(INITIAL_LOTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setHandovers(INITIAL_HANDOVERS);
    setPrices(INITIAL_PRICES);
    setFlaggedRecords(INITIAL_FLAGGED_RECORDS);
  };

  return (
    <DataContext.Provider
      value={{
        admin,
        collectors,
        recyclers,
        materials,
        lots,
        transactions,
        handovers,
        prices,
        flaggedRecords,
        login,
        logout,
        updateAdminProfile,
        updateCollectorStatus,
        updateRecyclerVerification,
        updateRecyclerAccountStatus,
        updateLotStatus,
        updateTransactionPayment,
        confirmHandover,
        updatePriceRate,
        addPriceRate,
        resolveFlaggedRecord,
        resetAllData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
