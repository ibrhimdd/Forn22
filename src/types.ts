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
  username?: string; // اسم المستخدم لتسجيل الدخول
  password?: string; // كلمة المرور / الباسورد
  phone?: string;
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
  advanceId?: string; // معرف السلفة المرفقة باليومية إن وجدت
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

// ==================== FLOUR & SUPPLIERS MODULE (بند الدقيق والموردين) ====================

export interface FlourSupplier {
  id: string;
  code: string; // e.g., "SUP-101"
  name: string; // اسم المورد أو المطحن أو تاجر الدقيق
  contactPerson?: string; // اسم المندوب أو المسؤول
  phone: string; // رقم التليفون
  address?: string; // مقر المطحن أو المحافظة
  flourType?: string; // نوع الدقيق (فاخر 72%، شامي، استخراج 82%)
  notes?: string;
  createdAt: string;
}

export interface FlourDelivery {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string; // YYYY-MM-DD
  tons: number; // عدد الأطنان (e.g., 5 أو 10.5 طن)
  bagsCount?: number; // عدد الشكاير التقديري (50 كجم = 20 شيكارة / طن)
  pricePerTon: number; // سعر الطن بالعملة (e.g., 16000 ج.م)
  totalCost: number; // tons * pricePerTon (يتم حسابه تلقائياً)
  driverName?: string; // اسم السائق
  truckNumber?: string; // رقم السيارة
  invoiceNumber?: string; // رقم الفاتورة أو إذن الاستلام
  notes?: string;
  createdAt: string;
}

export type FlourPaymentMethod = 'cash' | 'transfer' | 'cheque' | 'vodafone_cash' | 'other';

export interface FlourPayment {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string; // YYYY-MM-DD
  amount: number; // المبلغ المدفوع
  paymentMethod: FlourPaymentMethod;
  receiptNumber?: string; // رقم الإيصال / الشيك / التحويل
  notes?: string;
  createdAt: string;
}

export interface SupplierFinancials {
  totalTons: number;
  totalBags: number;
  totalCost: number; // إجمالي قيمة الشحنات
  totalPaid: number; // إجمالي الدفعات المسددة
  balanceRemaining: number; // totalCost - totalPaid (الرصيد المتبقي له)
  deliveriesCount: number;
  paymentsCount: number;
  lastDeliveryDate?: string;
  lastPaymentDate?: string;
}
