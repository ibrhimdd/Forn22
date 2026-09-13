import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  WorkerProfile,
  ProductionLog,
  ProductionStatus,
  AdvanceRecord,
  SettlementRecord,
  BakerySettings,
  AdvanceCategory,
  FlourSupplier,
  FlourDelivery,
  FlourPayment,
  FlourPaymentMethod,
  SupplierFinancials,
} from '../types';
import {
  initialBakerySettings,
  initialWorkers,
  initialProductionLogs,
  initialAdvances,
  initialSettlements,
  initialSuppliers,
  initialFlourDeliveries,
  initialFlourPayments,
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
  loginWorker: (identifier: string, password?: string) => boolean;
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
      shift?: 'morning' | 'evening';
      piecesCount: number;
      notes?: string;
      advanceAmount?: number;
      advanceCategory?: AdvanceCategory;
      advanceNotes?: string;
      ratePer1000?: number;
      status?: ProductionStatus;
    }
  ) => void;
  approveProductionLog: (
    id: string,
    adjustedPieces?: number,
    adjustedRate?: number,
    adjustedAdvance?: number,
    adminNotes?: string
  ) => void;
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
  
  // Flour & Suppliers Module (بند الدقيق وتنزيل الأطنان والمطاحن)
  suppliers: FlourSupplier[];
  flourDeliveries: FlourDelivery[];
  flourPayments: FlourPayment[];
  addSupplier: (supplier: Omit<FlourSupplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, updates: Partial<FlourSupplier>) => void;
  deleteSupplier: (id: string) => void;
  addFlourDelivery: (data: {
    supplierId: string;
    date: string;
    tons: number;
    bagsCount?: number;
    pricePerTon: number;
    driverName?: string;
    truckNumber?: string;
    invoiceNumber?: string;
    notes?: string;
  }) => void;
  deleteFlourDelivery: (id: string) => void;
  addFlourPayment: (data: {
    supplierId: string;
    date: string;
    amount: number;
    paymentMethod: FlourPaymentMethod;
    receiptNumber?: string;
    notes?: string;
  }) => void;
  deleteFlourPayment: (id: string) => void;
  getSupplierFinancials: (supplierId: string) => SupplierFinancials;
  getTotalFlourFinancials: () => {
    totalTons: number;
    totalBags: number;
    totalCost: number;
    totalPaid: number;
    totalBalanceRemaining: number;
  };

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
    if (saved) {
      try {
        const parsed: WorkerProfile[] = JSON.parse(saved);
        // Ensure all workers have username & password for the login system
        return parsed.map((w, index) => {
          const matchingInitial = initialWorkers.find((iw) => iw.id === w.id);
          const defaultUser =
            w.username ||
            matchingInitial?.username ||
            `worker${w.code ? w.code.replace(/\D/g, '') : index + 1}`;
          const defaultPass = w.password || matchingInitial?.password || '123';
          return {
            ...w,
            username: defaultUser,
            password: defaultPass,
          };
        });
      } catch (e) {
        return initialWorkers;
      }
    }
    return initialWorkers;
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

  // Flour & Suppliers State
  const [suppliers, setSuppliers] = useState<FlourSupplier[]>(() => {
    const saved = localStorage.getItem('syrian_bakery_suppliers');
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [flourDeliveries, setFlourDeliveries] = useState<FlourDelivery[]>(() => {
    const saved = localStorage.getItem('syrian_bakery_flour_deliveries');
    return saved ? JSON.parse(saved) : initialFlourDeliveries;
  });

  const [flourPayments, setFlourPayments] = useState<FlourPayment[]>(() => {
    const saved = localStorage.getItem('syrian_bakery_flour_payments');
    return saved ? JSON.parse(saved) : initialFlourPayments;
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

  useEffect(() => {
    localStorage.setItem('syrian_bakery_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('syrian_bakery_flour_deliveries', JSON.stringify(flourDeliveries));
  }, [flourDeliveries]);

  useEffect(() => {
    localStorage.setItem('syrian_bakery_flour_payments', JSON.stringify(flourPayments));
  }, [flourPayments]);

  const loginAdmin = (_password?: string): boolean => {
    const adminUser = {
      role: 'admin' as UserRole,
      name: settings.ownerName || 'مدير المخبز (الأدمين)',
    };
    setCurrentUser(adminUser);
    setCurrentRole('admin');
    return true;
  };

  const loginWorker = (identifier: string, password?: string): boolean => {
    const trimmed = identifier.trim().toLowerCase();
    const worker = workers.find(
      (w) =>
        w.id === identifier ||
        (w.username && w.username.trim().toLowerCase() === trimmed) ||
        w.code.trim().toLowerCase() === trimmed ||
        w.name.trim().toLowerCase() === trimmed
    );
    if (!worker) return false;
    if (worker.status === 'archived') return false;

    // If a password was provided, verify it
    if (password !== undefined && password !== null && password !== '') {
      if (worker.password && worker.password.trim() !== password.trim()) {
        return false;
      }
    }

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
    shift?: 'morning' | 'evening';
    piecesCount: number;
    notes?: string;
    advanceAmount?: number;
    advanceCategory?: AdvanceCategory;
    advanceNotes?: string;
    ratePer1000?: number;
    status?: ProductionStatus;
  }) => {
    const worker = workers.find((w) => w.id === data.workerId);
    const workerName = worker ? worker.name : 'عامل';
    // Rate: use passed rate, or worker's custom rate if set, otherwise bakery default rate per 1000
    const ratePer1000 =
      data.ratePer1000 !== undefined
        ? Number(data.ratePer1000)
        : (worker?.customRatePer1000 ?? settings.defaultRatePer1000);
    const grossAmount = (Number(data.piecesCount) / 1000) * ratePer1000;

    const advanceId = data.advanceAmount && data.advanceAmount > 0 ? `adv-${Date.now()}-prod` : undefined;

    const shouldAutoApprove = data.status === 'approved' || currentUser?.role === 'admin';

    const newLog: ProductionLog = {
      id: `prod-${Date.now()}`,
      workerId: data.workerId,
      workerName,
      date: data.date,
      shift: data.shift || 'morning',
      piecesCount: Number(data.piecesCount),
      ratePer1000,
      grossAmount,
      notes: data.notes || '',
      advanceId,
      advanceAmount: data.advanceAmount && data.advanceAmount > 0 ? Number(data.advanceAmount) : 0,
      advanceCategory: data.advanceCategory || 'cash',
      advanceNotes: data.advanceNotes || '',
      status: data.status || (shouldAutoApprove ? 'approved' : 'pending'),
      reviewedAt: shouldAutoApprove ? new Date().toISOString() : undefined,
      reviewedBy: shouldAutoApprove ? (settings.ownerName || 'مدير المخبز') : undefined,
      createdAt: new Date().toISOString(),
    };

    setProductionLogs((prev) => [newLog, ...prev]);

    // If an advance was requested with this production log, automatically create the advance record for the same day
    if (advanceId && data.advanceAmount && data.advanceAmount > 0) {
      const newAdvance: AdvanceRecord = {
        id: advanceId,
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
    adjustedRate?: number,
    adjustedAdvance?: number,
    adminNotes?: string
  ) => {
    const now = new Date().toISOString();
    let targetWorkerId = '';
    let targetWorkerName = '';
    let targetDate = '';
    let targetAdvanceId: string | undefined = undefined;
    let oldAdvanceAmount: number | undefined = undefined;

    setProductionLogs((prev) =>
      prev.map((log) => {
        if (log.id !== id) return log;

        targetWorkerId = log.workerId;
        targetWorkerName = log.workerName;
        targetDate = log.date;
        targetAdvanceId = log.advanceId;
        oldAdvanceAmount = log.advanceAmount;

        const pieces = adjustedPieces !== undefined ? adjustedPieces : log.piecesCount;
        const rate = adjustedRate !== undefined ? adjustedRate : log.ratePer1000;
        const gross = (pieces / 1000) * rate;
        const adv = adjustedAdvance !== undefined ? adjustedAdvance : (log.advanceAmount ?? 0);
        const finalNotes = adminNotes !== undefined ? adminNotes : log.notes;

        return {
          ...log,
          piecesCount: pieces,
          ratePer1000: rate,
          grossAmount: gross,
          advanceAmount: adv > 0 ? adv : 0,
          notes: finalNotes,
          status: 'approved',
          rejectionReason: undefined,
          reviewedAt: now,
          reviewedBy: settings.ownerName || 'مدير المخبز',
        };
      })
    );

    // Synchronize attached advance in advances list if adjustedAdvance is provided
    if (adjustedAdvance !== undefined) {
      const newAdvAmount = Number(adjustedAdvance);
      setAdvances((prev) => {
        // 1. If targetAdvanceId was explicitly set
        if (targetAdvanceId) {
          if (newAdvAmount > 0) {
            const exists = prev.some((a) => a.id === targetAdvanceId);
            if (exists) {
              return prev.map((a) =>
                a.id === targetAdvanceId
                  ? { ...a, amount: newAdvAmount, notes: `سلفة مرفقة مع يومية ${targetDate} (معدلة عند الاعتماد)` }
                  : a
              );
            } else {
              return [
                {
                  id: targetAdvanceId,
                  workerId: targetWorkerId,
                  workerName: targetWorkerName,
                  date: targetDate,
                  amount: newAdvAmount,
                  category: 'cash',
                  notes: `سلفة مرفقة مع يومية ${targetDate} (تم إقرارها عند الاعتماد)`,
                  createdAt: now,
                },
                ...prev,
              ];
            }
          } else {
            // Remove the advance since advance was set to 0
            return prev.filter((a) => a.id !== targetAdvanceId);
          }
        }

        // 2. If targetAdvanceId was not set, search by workerId, date and notes
        const matchingIndex = prev.findIndex(
          (a) =>
            a.workerId === targetWorkerId &&
            a.date === targetDate &&
            (a.notes.includes('سلفة مرفقة') || a.notes.includes('يومية') || (oldAdvanceAmount && a.amount === oldAdvanceAmount))
        );

        if (matchingIndex !== -1) {
          if (newAdvAmount > 0) {
            return prev.map((a, idx) =>
              idx === matchingIndex
                ? { ...a, amount: newAdvAmount, notes: `سلفة مرفقة مع يومية ${targetDate} (معدلة عند الاعتماد)` }
                : a
            );
          } else {
            return prev.filter((_, idx) => idx !== matchingIndex);
          }
        } else if (newAdvAmount > 0) {
          // If no advance previously existed and admin sets an advance amount > 0 upon approval
          return [
            {
              id: `adv-${Date.now()}-approved`,
              workerId: targetWorkerId,
              workerName: targetWorkerName,
              date: targetDate,
              amount: newAdvAmount,
              category: 'cash',
              notes: `سلفة مرفقة مع يومية ${targetDate} (تم إقرارها عند الاعتماد)`,
              createdAt: now,
            },
            ...prev,
          ];
        }

        return prev;
      });
    }
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
    const target = productionLogs.find((log) => log.id === id);
    if (target?.advanceId) {
      setAdvances((prev) => prev.filter((a) => a.id !== target.advanceId));
    }
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

  // ==================== FLOUR & SUPPLIERS METHODS ====================

  const addSupplier = (supplierData: Omit<FlourSupplier, 'id' | 'createdAt'>) => {
    const newSupplier: FlourSupplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
      code: supplierData.code || `SUP-${suppliers.length + 101}`,
      createdAt: new Date().toISOString(),
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
  };

  const updateSupplier = (id: string, updates: Partial<FlourSupplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    // Also sync supplier name in deliveries and payments if name changed
    if (updates.name) {
      setFlourDeliveries((prev) =>
        prev.map((d) => (d.supplierId === id ? { ...d, supplierName: updates.name! } : d))
      );
      setFlourPayments((prev) =>
        prev.map((p) => (p.supplierId === id ? { ...p, supplierName: updates.name! } : p))
      );
    }
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const addFlourDelivery = (data: {
    supplierId: string;
    date: string;
    tons: number;
    bagsCount?: number;
    pricePerTon: number;
    driverName?: string;
    truckNumber?: string;
    invoiceNumber?: string;
    notes?: string;
  }) => {
    const supplier = suppliers.find((s) => s.id === data.supplierId);
    const tonsNum = Number(data.tons) || 0;
    const rateNum = Number(data.pricePerTon) || 0;
    const totalCost = tonsNum * rateNum;
    const bagsCount =
      data.bagsCount !== undefined && data.bagsCount !== null && !isNaN(Number(data.bagsCount))
        ? Number(data.bagsCount)
        : Math.round(tonsNum * 20); // 20 شكارة زنة 50 كجم في الطن

    const newDelivery: FlourDelivery = {
      id: `del-${Date.now()}`,
      supplierId: data.supplierId,
      supplierName: supplier ? supplier.name : 'مورد دقيق',
      date: data.date,
      tons: tonsNum,
      bagsCount,
      pricePerTon: rateNum,
      totalCost,
      driverName: data.driverName?.trim() || undefined,
      truckNumber: data.truckNumber?.trim() || undefined,
      invoiceNumber: data.invoiceNumber?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    setFlourDeliveries((prev) => [newDelivery, ...prev]);
  };

  const deleteFlourDelivery = (id: string) => {
    setFlourDeliveries((prev) => prev.filter((d) => d.id !== id));
  };

  const addFlourPayment = (data: {
    supplierId: string;
    date: string;
    amount: number;
    paymentMethod: FlourPaymentMethod;
    receiptNumber?: string;
    notes?: string;
  }) => {
    const supplier = suppliers.find((s) => s.id === data.supplierId);
    const newPayment: FlourPayment = {
      id: `pay-${Date.now()}`,
      supplierId: data.supplierId,
      supplierName: supplier ? supplier.name : 'مورد دقيق',
      date: data.date,
      amount: Number(data.amount) || 0,
      paymentMethod: data.paymentMethod,
      receiptNumber: data.receiptNumber?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    setFlourPayments((prev) => [newPayment, ...prev]);
  };

  const deleteFlourPayment = (id: string) => {
    setFlourPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const getSupplierFinancials = (supplierId: string): SupplierFinancials => {
    const supDeliveries = flourDeliveries.filter((d) => d.supplierId === supplierId);
    const supPayments = flourPayments.filter((p) => p.supplierId === supplierId);

    const totalTons = supDeliveries.reduce((sum, d) => sum + (Number(d.tons) || 0), 0);
    const totalBags = supDeliveries.reduce(
      (sum, d) => sum + (Number(d.bagsCount) || Math.round((Number(d.tons) || 0) * 20)),
      0
    );
    const totalCost = supDeliveries.reduce((sum, d) => sum + (Number(d.totalCost) || 0), 0);
    const totalPaid = supPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const balanceRemaining = totalCost - totalPaid;

    const sortedDel = [...supDeliveries].sort((a, b) => b.date.localeCompare(a.date));
    const sortedPay = [...supPayments].sort((a, b) => b.date.localeCompare(a.date));

    return {
      totalTons,
      totalBags,
      totalCost,
      totalPaid,
      balanceRemaining,
      deliveriesCount: supDeliveries.length,
      paymentsCount: supPayments.length,
      lastDeliveryDate: sortedDel[0]?.date,
      lastPaymentDate: sortedPay[0]?.date,
    };
  };

  const getTotalFlourFinancials = () => {
    const totalTons = flourDeliveries.reduce((sum, d) => sum + (Number(d.tons) || 0), 0);
    const totalBags = flourDeliveries.reduce(
      (sum, d) => sum + (Number(d.bagsCount) || Math.round((Number(d.tons) || 0) * 20)),
      0
    );
    const totalCost = flourDeliveries.reduce((sum, d) => sum + (Number(d.totalCost) || 0), 0);
    const totalPaid = flourPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalBalanceRemaining = totalCost - totalPaid;

    return {
      totalTons,
      totalBags,
      totalCost,
      totalPaid,
      totalBalanceRemaining,
    };
  };

  const resetToDefaults = () => {
    localStorage.removeItem('syrian_bakery_settings');
    localStorage.removeItem('syrian_bakery_workers');
    localStorage.removeItem('syrian_bakery_production');
    localStorage.removeItem('syrian_bakery_advances');
    localStorage.removeItem('syrian_bakery_settlements');
    localStorage.removeItem('syrian_bakery_suppliers');
    localStorage.removeItem('syrian_bakery_flour_deliveries');
    localStorage.removeItem('syrian_bakery_flour_payments');
    setSettings(initialBakerySettings);
    setWorkers(initialWorkers);
    setProductionLogs(initialProductionLogs);
    setAdvances(initialAdvances);
    setSettlements(initialSettlements);
    setSuppliers(initialSuppliers);
    setFlourDeliveries(initialFlourDeliveries);
    setFlourPayments(initialFlourPayments);
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
        suppliers,
        flourDeliveries,
        flourPayments,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addFlourDelivery,
        deleteFlourDelivery,
        addFlourPayment,
        deleteFlourPayment,
        getSupplierFinancials,
        getTotalFlourFinancials,
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
