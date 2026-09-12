import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  WorkerProfile,
  ProductionLog,
  AdvanceRecord,
  SettlementRecord,
  BakerySettings,
  AdvanceCategory,
} from '../types';
import {
  initialBakerySettings,
  initialWorkers,
  initialProductionLogs,
  initialAdvances,
  initialSettlements,
} from '../data/mockData';

interface WorkerFinancials {
  approvedGross: number;
  pendingGross: number;
  rejectedGross: number;
  totalAdvances: number;
  netPayable: number;
  totalPiecesApproved: number;
  pendingLogsCount: number;
  unsettledApprovedLogs: ProductionLog[];
  unsettledAdvances: AdvanceRecord[];
}

interface BakeryContextType {
  // Authentication & Session
  isAuthenticated: boolean;
  currentUser: {
    role: UserRole;
    name: string;
    workerId?: string;
  } | null;
  loginAdmin: (password?: string) => boolean;
  loginWorker: (workerId: string) => boolean;
  logout: () => void;

  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentWorkerId: string;
  setCurrentWorkerId: (id: string) => void;
  currentWorker: WorkerProfile | undefined;
  workers: WorkerProfile[];
  productionLogs: ProductionLog[];
  advances: AdvanceRecord[];
  settlements: SettlementRecord[];
  settings: BakerySettings;
  updateSettings: (newSettings: Partial<BakerySettings>) => void;
  addWorker: (worker: Omit<WorkerProfile, 'id' | 'status'>) => void;
  updateWorker: (id: string, updates: Partial<WorkerProfile>) => void;
  archiveWorker: (id: string, reason?: string) => void;
  unarchiveWorker: (id: string) => void;
  addProductionLog: (
    data: {
      workerId: string;
      date: string;
      shift: 'morning' | 'evening';
      piecesCount: number;
      notes?: string;
      advanceAmount?: number;
      advanceCategory?: AdvanceCategory;
      advanceNotes?: string;
    }
  ) => void;
  approveProductionLog: (id: string, adjustedPieces?: number, adjustedRate?: number) => void;
  rejectProductionLog: (id: string, reason: string) => void;
  deleteProductionLog: (id: string) => void;
  addAdvance: (
    data: {
      workerId: string;
      date: string;
      amount: number;
      category: 'cash' | 'food' | 'supplies' | 'other';
      notes: string;
    }
  ) => void;
  deleteAdvance: (id: string) => void;
  getWorkerFinancials: (workerId: string) => WorkerFinancials;
  executeFinalSettlement: (workerId: string, notes?: string) => SettlementRecord;
  resetToDefaults: () => void;
}

const BakeryContext = createContext<BakeryContextType | undefined>(undefined);

export const BakeryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence via localStorage
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('syrian_bakery_role') as UserRole) || 'admin';
  });

  const [currentWorkerId, setCurrentWorkerId] = useState<string>(() => {
    return localStorage.getItem('syrian_bakery_worker_id') || 'w-1';
  });

  // Auth / session state (default: logged out so user gets login screen upon opening)
  const [currentUser, setCurrentUser] = useState<{
    role: UserRole;
    name: string;
    workerId?: string;
  } | null>(() => {
    const savedAuth = localStorage.getItem('syrian_bakery_auth_session');
    if (savedAuth) {
      try {
        return JSON.parse(savedAuth);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [settings, setSettings] = useState<BakerySettings>(() => {
    const saved = localStorage.getItem('syrian_bakery_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.bakeryName === 'مخبز بركة الشام للعيش السوري' || !parsed.bakeryName) {
          parsed.bakeryName = 'مخبز أبو ريان للعيش السوري';
        }
        return parsed;
      } catch (e) {
        return initialBakerySettings;
      }
    }
    return initialBakerySettings;
  });

  const [workers, setWorkers] = useState<WorkerProfile[]>(() => {
    const saved = localStorage.getItem('syrian_bakery_workers');
    return saved ? JSON.parse(saved) : initialWorkers;
  });

  const [productionLogs, setProductionLogs] = useState<ProductionLog[]>(() => {
    const saved = localStorage.getItem('syrian_bakery_production');
    return saved ? JSON.parse(saved) : initialProductionLogs;
  });

  const [advances, setAdvances] = useState<AdvanceRecord[]>(() => {
    const saved = localStorage.getItem('syrian_bakery_advances');
    return saved ? JSON.parse(saved) : initialAdvances;
  });

  const [settlements, setSettlements] = useState<SettlementRecord[]>(() => {
    const saved = localStorage.getItem('syrian_bakery_settlements');
    return saved ? JSON.parse(saved) : initialSettlements;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('syrian_bakery_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('syrian_bakery_worker_id', currentWorkerId);
  }, [currentWorkerId]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('syrian_bakery_auth_session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('syrian_bakery_auth_session');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('syrian_bakery_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('syrian_bakery_workers', JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('syrian_bakery_production', JSON.stringify(productionLogs));
  }, [productionLogs]);

  useEffect(() => {
    localStorage.setItem('syrian_bakery_advances', JSON.stringify(advances));
  }, [advances]);

  useEffect(() => {
    localStorage.setItem('syrian_bakery_settlements', JSON.stringify(settlements));
  }, [settlements]);

  const loginAdmin = (_password?: string): boolean => {
    const adminUser = {
      role: 'admin' as UserRole,
      name: settings.ownerName || 'مدير المخبز (الأدمين)',
    };
    setCurrentUser(adminUser);
    setCurrentRole('admin');
    return true;
  };

  const loginWorker = (workerId: string): boolean => {
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) return false;
    const workerUser = {
      role: 'worker' as UserRole,
      name: worker.name,
      workerId: worker.id,
    };
    setCurrentUser(workerUser);
    setCurrentRole('worker');
    setCurrentWorkerId(worker.id);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const currentWorker = workers.find((w) => w.id === currentWorkerId);

  const updateSettings = (newSettings: Partial<BakerySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addWorker = (workerData: Omit<WorkerProfile, 'id' | 'status'>) => {
    const newId = `w-${Date.now()}`;
    const newWorker: WorkerProfile = {
      ...workerData,
      id: newId,
      status: 'active',
    };
    setWorkers((prev) => [newWorker, ...prev]);
  };

  const updateWorker = (id: string, updates: Partial<WorkerProfile>) => {
    setWorkers((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
    );
    // Also update names in logs & advances if name changed
    if (updates.name) {
      setProductionLogs((prev) =>
        prev.map((l) => (l.workerId === id ? { ...l, workerName: updates.name! } : l))
      );
      setAdvances((prev) =>
        prev.map((a) => (a.workerId === id ? { ...a, workerName: updates.name! } : a))
      );
    }
  };

  const archiveWorker = (id: string, reason?: string) => {
    const today = new Date().toISOString().split('T')[0];
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              status: 'archived',
              archivedDate: today,
              archivedReason: reason || 'أرشفة الحساب من قبل الإدارة',
            }
          : w
      )
    );
  };

  const unarchiveWorker = (id: string) => {
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              status: 'active',
              archivedDate: undefined,
              archivedReason: undefined,
            }
          : w
      )
    );
  };

  const addProductionLog = (data: {
    workerId: string;
    date: string;
    shift: 'morning' | 'evening';
    piecesCount: number;
    notes?: string;
    advanceAmount?: number;
    advanceCategory?: AdvanceCategory;
    advanceNotes?: string;
  }) => {
    const worker = workers.find((w) => w.id === data.workerId);
    const workerName = worker ? worker.name : 'عامل';
    // Rate: use worker's custom rate if set, otherwise bakery default rate per 1000
    const ratePer1000 = worker?.customRatePer1000 ?? settings.defaultRatePer1000;
    const grossAmount = (data.piecesCount / 1000) * ratePer1000;

    const newLog: ProductionLog = {
      id: `prod-${Date.now()}`,
      workerId: data.workerId,
      workerName,
      date: data.date,
      shift: data.shift,
      piecesCount: Number(data.piecesCount),
      ratePer1000,
      grossAmount,
      notes: data.notes || '',
      advanceAmount: data.advanceAmount && data.advanceAmount > 0 ? Number(data.advanceAmount) : undefined,
      advanceCategory: data.advanceCategory || 'cash',
      advanceNotes: data.advanceNotes || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setProductionLogs((prev) => [newLog, ...prev]);

    // If an advance was requested with this production log, automatically create the advance record for the same day
    if (data.advanceAmount && data.advanceAmount > 0) {
      const newAdvance: AdvanceRecord = {
        id: `adv-${Date.now()}-prod`,
        workerId: data.workerId,
        workerName,
        date: data.date,
        amount: Number(data.advanceAmount),
        category: data.advanceCategory || 'cash',
        notes: data.advanceNotes?.trim() || `سلفة مرفقة مع يومية ${data.shift === 'morning' ? 'الوردية الصباحية' : 'الوردية المسائية'} (${data.date})`,
        createdAt: new Date().toISOString(),
      };
      setAdvances((prev) => [newAdvance, ...prev]);
    }
  };

  const approveProductionLog = (
    id: string,
    adjustedPieces?: number,
    adjustedRate?: number
  ) => {
    const now = new Date().toISOString();
    setProductionLogs((prev) =>
      prev.map((log) => {
        if (log.id !== id) return log;

        const pieces = adjustedPieces !== undefined ? adjustedPieces : log.piecesCount;
        const rate = adjustedRate !== undefined ? adjustedRate : log.ratePer1000;
        const gross = (pieces / 1000) * rate;

        return {
          ...log,
          piecesCount: pieces,
          ratePer1000: rate,
          grossAmount: gross,
          status: 'approved',
          rejectionReason: undefined,
          reviewedAt: now,
          reviewedBy: settings.ownerName || 'مدير المخبز',
        };
      })
    );
  };

  const rejectProductionLog = (id: string, reason: string) => {
    const now = new Date().toISOString();
    setProductionLogs((prev) =>
      prev.map((log) => {
        if (log.id !== id) return log;
        return {
          ...log,
          status: 'rejected',
          rejectionReason: reason || 'تم الرفض بواسطة الإدارة',
          reviewedAt: now,
          reviewedBy: settings.ownerName || 'مدير المخبز',
        };
      })
    );
  };

  const deleteProductionLog = (id: string) => {
    setProductionLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const addAdvance = (data: {
    workerId: string;
    date: string;
    amount: number;
    category: 'cash' | 'food' | 'supplies' | 'other';
    notes: string;
  }) => {
    const worker = workers.find((w) => w.id === data.workerId);
    const workerName = worker ? worker.name : 'عامل';

    const newAdvance: AdvanceRecord = {
      id: `adv-${Date.now()}`,
      workerId: data.workerId,
      workerName,
      date: data.date,
      amount: Number(data.amount),
      category: data.category,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };

    setAdvances((prev) => [newAdvance, ...prev]);
  };

  const deleteAdvance = (id: string) => {
    setAdvances((prev) => prev.filter((a) => a.id !== id));
  };

  const getWorkerFinancials = (workerId: string): WorkerFinancials => {
    const unsettledApprovedLogs = productionLogs.filter(
      (l) => l.workerId === workerId && l.status === 'approved' && !l.settledInId
    );
    const unsettledPendingLogs = productionLogs.filter(
      (l) => l.workerId === workerId && l.status === 'pending'
    );
    const unsettledRejectedLogs = productionLogs.filter(
      (l) => l.workerId === workerId && l.status === 'rejected'
    );
    const unsettledAdvances = advances.filter(
      (a) => a.workerId === workerId && !a.settledInId
    );

    const approvedGross = unsettledApprovedLogs.reduce(
      (sum, l) => sum + (l.grossAmount || 0),
      0
    );
    const pendingGross = unsettledPendingLogs.reduce(
      (sum, l) => sum + (l.grossAmount || 0),
      0
    );
    const rejectedGross = unsettledRejectedLogs.reduce(
      (sum, l) => sum + (l.grossAmount || 0),
      0
    );
    const totalAdvancesAmount = unsettledAdvances.reduce(
      (sum, a) => sum + (a.amount || 0),
      0
    );
    const totalPiecesApproved = unsettledApprovedLogs.reduce(
      (sum, l) => sum + (l.piecesCount || 0),
      0
    );

    const netPayable = approvedGross - totalAdvancesAmount;

    return {
      approvedGross,
      pendingGross,
      rejectedGross,
      totalAdvances: totalAdvancesAmount,
      netPayable,
      totalPiecesApproved,
      pendingLogsCount: unsettledPendingLogs.length,
      unsettledApprovedLogs,
      unsettledAdvances,
    };
  };

  // Final Settlement / Liquidation for archived worker
  const executeFinalSettlement = (workerId: string, notes?: string): SettlementRecord => {
    const worker = workers.find((w) => w.id === workerId);
    const financials = getWorkerFinancials(workerId);
    const today = new Date().toISOString().split('T')[0];

    const settlementId = `settle-${Date.now()}`;
    const newSettlement: SettlementRecord = {
      id: settlementId,
      workerId,
      workerName: worker ? worker.name : 'عامل',
      settlementDate: today,
      totalPieces: financials.totalPiecesApproved,
      totalGross: financials.approvedGross,
      totalAdvances: financials.totalAdvances,
      netPaid: financials.netPayable,
      clearedLogsCount: financials.unsettledApprovedLogs.length,
      clearedAdvancesCount: financials.unsettledAdvances.length,
      notes:
        notes ||
        'تمت تصفية كامل الحساب والمستحقات وصرف الصافي نقداً وإخلاء الطرف النهائي.',
      settledBy: settings.ownerName || 'مدير المخبز',
    };

    // Mark logs and advances as settled
    setProductionLogs((prev) =>
      prev.map((l) =>
        l.workerId === workerId && l.status === 'approved' && !l.settledInId
          ? { ...l, settledInId: settlementId }
          : l
      )
    );

    setAdvances((prev) =>
      prev.map((a) =>
        a.workerId === workerId && !a.settledInId
          ? { ...a, settledInId: settlementId }
          : a
      )
    );

    setSettlements((prev) => [newSettlement, ...prev]);

    return newSettlement;
  };

  const resetToDefaults = () => {
    localStorage.removeItem('syrian_bakery_settings');
    localStorage.removeItem('syrian_bakery_workers');
    localStorage.removeItem('syrian_bakery_production');
    localStorage.removeItem('syrian_bakery_advances');
    localStorage.removeItem('syrian_bakery_settlements');
    setSettings(initialBakerySettings);
    setWorkers(initialWorkers);
    setProductionLogs(initialProductionLogs);
    setAdvances(initialAdvances);
    setSettlements(initialSettlements);
    setCurrentWorkerId('w-1');
  };

  return (
    <BakeryContext.Provider
      value={{
        isAuthenticated: !!currentUser,
        currentUser,
        loginAdmin,
        loginWorker,
        logout,
        currentRole,
        setCurrentRole,
        currentWorkerId,
        setCurrentWorkerId,
        currentWorker,
        workers,
        productionLogs,
        advances,
        settlements,
        settings,
        updateSettings,
        addWorker,
        updateWorker,
        archiveWorker,
        unarchiveWorker,
        addProductionLog,
        approveProductionLog,
        rejectProductionLog,
        deleteProductionLog,
        addAdvance,
        deleteAdvance,
        getWorkerFinancials,
        executeFinalSettlement,
        resetToDefaults,
      }}
    >
      {children}
    </BakeryContext.Provider>
  );
};

export const useBakery = () => {
  const context = useContext(BakeryContext);
  if (!context) {
    throw new Error('useBakery must be used within a BakeryProvider');
  }
  return context;
};
