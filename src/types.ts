export type UserRole = 'admin' | 'worker';

export type WorkerRoleTitle = 
  | 'فران رئيسي' 
  | 'عجان' 
  | 'صانع لقم / فراش' 
  | 'قطاع عجين' 
  | 'مساعد فرن وتعبئة';

export type WorkerStatus = 'active' | 'archived';

export interface SettlementRecord {
  id: string;
  workerId: string;
  workerName: string;
  settlementDate: string;
  totalPieces: number;
  totalGross: number;
  totalAdvances: number;
  netPaid: number;
  clearedLogsCount: number;
  clearedAdvancesCount: number;
  notes: string;
  settledBy: string;
}

export interface WorkerProfile {
  id: string;
  code: string; // e.g., W-101
  name: string;
  phone: string;
  roleTitle: WorkerRoleTitle;
  customRatePer1000: number | null; // if null, uses bakery global default
  joinDate: string;
  status: WorkerStatus;
  archivedDate?: string;
  archivedReason?: string;
  nationalId?: string;
  notes?: string;
}

export type ProductionShift = 'morning' | 'evening';

export type ProductionStatus = 'pending' | 'approved' | 'rejected';

export type AdvanceCategory = 'cash' | 'food' | 'supplies' | 'other';

export interface ProductionLog {
  id: string;
  workerId: string;
  workerName: string;
  date: string; // YYYY-MM-DD
  shift: ProductionShift;
  piecesCount: number; // عدد اللقم / الأرغفة
  ratePer1000: number; // السعر لكل 1000 لقمة المعتمد لهذه اليومية
  grossAmount: number; // (piecesCount / 1000) * ratePer1000
  notes?: string;
  advanceAmount?: number; // سلفة اليومية المرفقة بنفس اليوم
  advanceCategory?: AdvanceCategory;
  advanceNotes?: string;
  status: ProductionStatus;
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  settledInId?: string; // If settled in a final liquidation
  createdAt: string;
}

export interface AdvanceRecord {
  id: string;
  workerId: string;
  workerName: string;
  date: string;
  amount: number;
  category: AdvanceCategory;
  notes: string;
  settledInId?: string; // If settled in a final liquidation
  createdAt: string;
}

export interface BakerySettings {
  bakeryName: string;
  ownerName: string;
  defaultRatePer1000: number; // سعر الـ 1000 لقمة الافتراضي للمخبز
  currency: string; // ج.م أو ر.س أو ل.س
  phone: string;
  address: string;
}
