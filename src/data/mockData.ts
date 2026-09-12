import { BakerySettings, WorkerProfile, ProductionLog, AdvanceRecord, SettlementRecord } from '../types';

export const initialBakerySettings: BakerySettings = {
  bakeryName: 'مخبز أبو ريان للعيش السوري',
  ownerName: 'المعلم مصطفى السوري',
  defaultRatePer1000: 85, // 85 جنيه مصري لكل 1000 لقمة
  currency: 'ج.م',
  phone: '01012345678',
  address: 'شارع النصر - الحي العاشر - مدينة نصر',
};

export const initialWorkers: WorkerProfile[] = [
  {
    id: 'w-1',
    code: 'W-101',
    name: 'أحمد كنعان (أبو النور)',
    phone: '01123456781',
    roleTitle: 'فران رئيسي',
    customRatePer1000: 90,
    joinDate: '2025-01-15',
    status: 'active',
    nationalId: '28910120101928',
    notes: 'معلم فرن خبير في العيش السوري والشامي الرقيق',
  },
  {
    id: 'w-2',
    code: 'W-102',
    name: 'فراس الأتاسي (أبو عمر)',
    phone: '01234567892',
    roleTitle: 'عجان',
    customRatePer1000: 85,
    joinDate: '2025-02-01',
    status: 'active',
    nationalId: '29205140103847',
    notes: 'مسؤول عجانة الدقيق الفاخر وضبط التخمير',
  },
  {
    id: 'w-3',
    code: 'W-103',
    name: 'مجد الدين الشهابي',
    phone: '01098765433',
    roleTitle: 'صانع لقم / فراش',
    customRatePer1000: null, // يستخدم السعر العام للمخبز
    joinDate: '2025-03-10',
    status: 'active',
    nationalId: '29508220104712',
    notes: 'فراش سريع على بيت النار',
  },
  {
    id: 'w-4',
    code: 'W-104',
    name: 'ياسين الحلبي',
    phone: '01511223344',
    roleTitle: 'قطاع عجين',
    customRatePer1000: null,
    joinDate: '2025-04-05',
    status: 'active',
    nationalId: '29711050106291',
    notes: 'تقطيع وميزان اللقمة بدقة',
  },
  {
    id: 'w-5',
    code: 'W-105',
    name: 'خليل الشامي',
    phone: '01199887766',
    roleTitle: 'مساعد فرن وتعبئة',
    customRatePer1000: 80,
    joinDate: '2024-11-20',
    status: 'archived',
    archivedDate: '2026-03-01',
    archivedReason: 'سفر مفاجئ وانتهاء فترة العمل - بانتظار التصفية النهائية للأجر',
    nationalId: '28807180105566',
    notes: 'حساب مؤرشف ومتبقي له مستحقات بحاجة للتصفية النهائية',
  },
  {
    id: 'w-6',
    code: 'W-106',
    name: 'سليمان درويش',
    phone: '01055443322',
    roleTitle: 'فران رئيسي',
    customRatePer1000: 90,
    joinDate: '2024-08-10',
    status: 'archived',
    archivedDate: '2025-12-30',
    archivedReason: 'انتقال لمخبز آخر - تمت التصفية سابقاً',
    nationalId: '28604120108877',
    notes: 'تمت تصفية كامل حسابه وسحب السند',
  },
];

// Today's date and recent dates formatted YYYY-MM-DD
const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const dayBefore = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];

export const initialProductionLogs: ProductionLog[] = [
  // Today's logs
  {
    id: 'prod-1',
    workerId: 'w-1',
    workerName: 'أحمد كنعان (أبو النور)',
    date: today,
    shift: 'morning',
    piecesCount: 4500, // 4,500 لقمة
    ratePer1000: 90,
    grossAmount: (4500 / 1000) * 90, // 405 ج.م
    notes: 'إنتاج ممتاز من الدقيق التركي النخب الأول',
    status: 'pending', // Pending Admin review!
    createdAt: `${today}T10:30:00.000Z`,
  },
  {
    id: 'prod-2',
    workerId: 'w-2',
    workerName: 'فراس الأتاسي (أبو عمر)',
    date: today,
    shift: 'morning',
    piecesCount: 5000,
    ratePer1000: 85,
    grossAmount: (5000 / 1000) * 85, // 425 ج.م
    notes: 'عجنة صباحية 10 شكائر دقيق',
    status: 'pending', // Pending Admin review!
    createdAt: `${today}T11:00:00.000Z`,
  },
  {
    id: 'prod-3',
    workerId: 'w-3',
    workerName: 'مجد الدين الشهابي',
    date: today,
    shift: 'morning',
    piecesCount: 3800,
    ratePer1000: 85,
    grossAmount: (3800 / 1000) * 85, // 323 ج.م
    notes: 'عمل مستمر على الصاج الدوار',
    status: 'approved',
    reviewedAt: `${today}T12:00:00.000Z`,
    reviewedBy: 'المعلم مصطفى',
    createdAt: `${today}T09:45:00.000Z`,
  },
  // Yesterday's logs
  {
    id: 'prod-4',
    workerId: 'w-1',
    workerName: 'أحمد كنعان (أبو النور)',
    date: yesterday,
    shift: 'evening',
    piecesCount: 5200,
    ratePer1000: 90,
    grossAmount: (5200 / 1000) * 90, // 468 ج.م
    notes: 'وردية مسائية لمطاعم الشاورما',
    status: 'approved',
    reviewedAt: `${yesterday}T23:30:00.000Z`,
    reviewedBy: 'المعلم مصطفى',
    createdAt: `${yesterday}T21:15:00.000Z`,
  },
  {
    id: 'prod-5',
    workerId: 'w-2',
    workerName: 'فراس الأتاسي (أبو عمر)',
    date: yesterday,
    shift: 'evening',
    piecesCount: 4800,
    ratePer1000: 85,
    grossAmount: (4800 / 1000) * 85, // 408 ج.م
    status: 'approved',
    reviewedAt: `${yesterday}T23:30:00.000Z`,
    reviewedBy: 'المعلم مصطفى',
    createdAt: `${yesterday}T21:00:00.000Z`,
  },
  {
    id: 'prod-6',
    workerId: 'w-4',
    workerName: 'ياسين الحلبي',
    date: yesterday,
    shift: 'morning',
    piecesCount: 3500,
    ratePer1000: 85,
    grossAmount: (3500 / 1000) * 85, // 297.5 ج.م
    status: 'rejected',
    rejectionReason: 'خطأ في عدد الصواني واحتساب تالف العجين دون خصم',
    reviewedAt: `${yesterday}T14:00:00.000Z`,
    reviewedBy: 'المعلم مصطفى',
    createdAt: `${yesterday}T12:00:00.000Z`,
  },
  // Day before logs
  {
    id: 'prod-7',
    workerId: 'w-1',
    workerName: 'أحمد كنعان (أبو النور)',
    date: dayBefore,
    shift: 'morning',
    piecesCount: 6000,
    ratePer1000: 90,
    grossAmount: (6000 / 1000) * 90, // 540 ج.م
    status: 'approved',
    reviewedAt: `${dayBefore}T13:00:00.000Z`,
    reviewedBy: 'المعلم مصطفى',
    createdAt: `${dayBefore}T11:30:00.000Z`,
  },
  // Archived worker w-5 (خليل الشامي) has unsettled approved production!
  {
    id: 'prod-8',
    workerId: 'w-5',
    workerName: 'خليل الشامي',
    date: '2026-02-27',
    shift: 'morning',
    piecesCount: 4000,
    ratePer1000: 80,
    grossAmount: (4000 / 1000) * 80, // 320 ج.م
    status: 'approved',
    reviewedAt: '2026-02-27T18:00:00.000Z',
    reviewedBy: 'المعلم مصطفى',
    createdAt: '2026-02-27T12:00:00.000Z',
  },
  {
    id: 'prod-9',
    workerId: 'w-5',
    workerName: 'خليل الشامي',
    date: '2026-02-28',
    shift: 'morning',
    piecesCount: 4500,
    ratePer1000: 80,
    grossAmount: (4500 / 1000) * 80, // 360 ج.م
    status: 'approved',
    reviewedAt: '2026-02-28T18:00:00.000Z',
    reviewedBy: 'المعلم مصطفى',
    createdAt: '2026-02-28T12:00:00.000Z',
  },
];

export const initialAdvances: AdvanceRecord[] = [
  {
    id: 'adv-1',
    workerId: 'w-1',
    workerName: 'أحمد كنعان (أبو النور)',
    date: today,
    amount: 100,
    category: 'cash',
    notes: 'سلفة نقدية شخصية',
    createdAt: `${today}T08:30:00.000Z`,
  },
  {
    id: 'adv-2',
    workerId: 'w-1',
    workerName: 'أحمد كنعان (أبو النور)',
    date: today,
    amount: 50,
    category: 'food',
    notes: 'وجبة غداء وشاي',
    createdAt: `${today}T13:00:00.000Z`,
  },
  {
    id: 'adv-3',
    workerId: 'w-2',
    workerName: 'فراس الأتاسي (أبو عمر)',
    date: today,
    amount: 150,
    category: 'cash',
    notes: 'سلفة للمنزل',
    createdAt: `${today}T09:00:00.000Z`,
  },
  {
    id: 'adv-4',
    workerId: 'w-1',
    workerName: 'أحمد كنعان (أبو النور)',
    date: yesterday,
    amount: 120,
    category: 'cash',
    notes: 'سلفة مسائية',
    createdAt: `${yesterday}T20:00:00.000Z`,
  },
  // Unsettled advance for archived worker w-5 (خليل الشامي)
  {
    id: 'adv-5',
    workerId: 'w-5',
    workerName: 'خليل الشامي',
    date: '2026-02-28',
    amount: 150,
    category: 'cash',
    notes: 'سلفة نقدية قبل السفر',
    createdAt: '2026-02-28T10:00:00.000Z',
  },
];

export const initialSettlements: SettlementRecord[] = [
  {
    id: 'settle-1',
    workerId: 'w-6',
    workerName: 'سليمان درويش',
    settlementDate: '2025-12-30',
    totalPieces: 45000,
    totalGross: 4050,
    totalAdvances: 1200,
    netPaid: 2850,
    clearedLogsCount: 10,
    clearedAdvancesCount: 6,
    notes: 'مخالصة نهائية تامة مع تسليم كامل المستحقات وإخلاء الطرف برضا الطرفين.',
    settledBy: 'المعلم مصطفى السوري',
  },
];
