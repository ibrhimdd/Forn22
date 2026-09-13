import React, { useState } from 'react';
import { useBakery } from '../../context/BakeryContext';
import { WorkerProfile, ProductionLog, AdvanceRecord } from '../../types';
import {
  User,
  Phone,
  Calendar,
  Layers,
  Wallet,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  XCircle,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Receipt,
  X,
  ShieldCheck,
  Building2,
  Filter,
  PlusCircle,
  Plus,
  Coins,
  DollarSign,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface Props {
  worker: WorkerProfile;
  onBack: () => void;
  onOpenSettlementModal?: (worker: WorkerProfile) => void;
}

export const WorkerProfileReport: React.FC<Props> = ({
  worker,
  onBack,
  onOpenSettlementModal,
}) => {
  const {
    productionLogs,
    advances,
    settings,
    getWorkerFinancials,
    addProductionLog,
    addAdvance,
  } = useBakery();

  const [activeTab, setActiveTab] = useState<'all' | 'production' | 'advances'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'unsettled' | 'settled'>('all');

  // Modals state
  const [showAddProductionModal, setShowAddProductionModal] = useState(false);
  const [showAddAdvanceModal, setShowAddAdvanceModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for adding Production
  const todayStr = new Date().toISOString().split('T')[0];
  const effectiveRate = worker.customRatePer1000 ?? settings.defaultRatePer1000;

  const [prodPieces, setProdPieces] = useState('');
  const [prodDate, setProdDate] = useState(todayStr);
  const [prodShift, setProdShift] = useState<'morning' | 'evening'>('morning');
  const [prodRate, setProdRate] = useState<number>(effectiveRate);
  const [prodAdvance, setProdAdvance] = useState('0');
  const [prodNotes, setProdNotes] = useState('');
  const [prodError, setProdError] = useState('');

  // Form states for adding Advance
  const [advAmount, setAdvAmount] = useState('');
  const [advDate, setAdvDate] = useState(todayStr);
  const [advCategory, setAdvCategory] = useState<'cash' | 'food' | 'supplies' | 'other'>('cash');
  const [advNotes, setAdvNotes] = useState('');
  const [advError, setAdvError] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleCreateProduction = (e: React.FormEvent) => {
    e.preventDefault();
    setProdError('');
    const pieces = Number(prodPieces);
    if (!pieces || pieces <= 0) {
      setProdError('يرجى إدخال كمية اللقم بشكل صحيح (أكبر من صفر)');
      return;
    }
    const advanceAmount = Number(prodAdvance) || 0;
    if (advanceAmount < 0) {
      setProdError('السلفة المرفقة لا يمكن أن تكون قيمة سالبة');
      return;
    }

    addProductionLog({
      workerId: worker.id,
      date: prodDate,
      shift: prodShift,
      piecesCount: pieces,
      ratePer1000: prodRate,
      advanceAmount: advanceAmount,
      notes: prodNotes.trim(),
      status: 'approved',
    });

    setShowAddProductionModal(false);
    setProdPieces('');
    setProdAdvance('0');
    setProdNotes('');
    showToast(`تمت إضافة يومية ${pieces.toLocaleString('ar-EG')} لقمة واعتمادها بنجاح لحساب ${worker.name}`);
  };

  const handleCreateAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    setAdvError('');
    const amount = Number(advAmount);
    if (!amount || amount <= 0) {
      setAdvError('يرجى إدخال مبلغ السلفة بشكل صحيح (أكبر من صفر)');
      return;
    }

    addAdvance({
      workerId: worker.id,
      date: advDate,
      amount,
      category: advCategory,
      notes: advNotes.trim() || 'سلفة من الإدارة',
    });

    setShowAddAdvanceModal(false);
    setAdvAmount('');
    setAdvNotes('');
    showToast(`تم قيد سلفة بمبلغ ${amount.toLocaleString('ar-EG')} ${settings.currency} لحساب ${worker.name}`);
  };

  // Compute worker financial summary
  const financials = getWorkerFinancials(worker.id);

  // All logs & advances for this worker
  const workerLogs = productionLogs.filter((l) => l.workerId === worker.id);
  const workerAdvances = advances.filter((a) => a.workerId === worker.id);

  // Filtered lists
  const filteredLogs = workerLogs.filter((l) => {
    if (dateFilter === 'unsettled') return !l.settledInId;
    if (dateFilter === 'settled') return !!l.settledInId;
    return true;
  });

  const filteredAdvances = workerAdvances.filter((a) => {
    if (dateFilter === 'unsettled') return !a.settledInId;
    if (dateFilter === 'settled') return !!a.settledInId;
    return true;
  });

  // Total Lifetime Production pieces
  const lifetimePieces = workerLogs
    .filter((l) => l.status === 'approved')
    .reduce((sum, l) => sum + (l.piecesCount || 0), 0);

  const lifetimeGross = workerLogs
    .filter((l) => l.status === 'approved')
    .reduce((sum, l) => sum + (l.grossAmount || 0), 0);

  const lifetimeAdvances = workerAdvances.reduce(
    (sum, a) => sum + (a.amount || 0),
    0
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-900/90 border border-emerald-600 text-emerald-100 text-xs font-bold flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 no-print">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Breadcrumb & Action Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <ChevronRight className="w-4 h-4" />
            <span>العودة لقائمة العمال</span>
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
              <span>التقرير الشامل للملف الشخصي واليوميات</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                {worker.code}
              </span>
            </h2>
            <p className="text-xs text-stone-500">
              كشف تفصيلي بإنتاج كل يوم، السلف والمصروفات، ومستحقات العامل الصافية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Action 1: Add Production / Quantity */}
          <button
            type="button"
            onClick={() => {
              setProdPieces('');
              setProdDate(new Date().toISOString().split('T')[0]);
              setProdRate(effectiveRate);
              setProdAdvance('0');
              setProdNotes('');
              setProdError('');
              setShowAddProductionModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-sm shadow-amber-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة كمية (إنتاج)</span>
          </button>

          {/* Action 2: Add Advance */}
          <button
            type="button"
            onClick={() => {
              setAdvAmount('');
              setAdvDate(new Date().toISOString().split('T')[0]);
              setAdvCategory('cash');
              setAdvNotes('');
              setAdvError('');
              setShowAddAdvanceModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs flex items-center gap-1.5 shadow-sm shadow-red-600/20 active:scale-95 transition-all"
          >
            <Coins className="w-4 h-4" />
            <span>إضافة سلفة</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير</span>
          </button>

          {worker.status === 'archived' && onOpenSettlementModal && (
            <button
              onClick={() => onOpenSettlementModal(worker)}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Receipt className="w-4 h-4" />
              <span>تصفية الحساب النهائي</span>
            </button>
          )}
        </div>
      </div>

      {/* Worker Overview Card */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-6 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-2xl shrink-0">
              {worker.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {worker.name}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  worker.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {worker.status === 'active' ? 'على رأس العمل (نشط)' : 'مؤرشف وموقوف'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-300 mt-2">
                <div className="flex items-center gap-1 text-amber-300 font-semibold">
                  <User className="w-3.5 h-3.5" />
                  <span>{worker.roleTitle}</span>
                </div>
                {worker.phone && (
                  <div className="flex items-center gap-1 text-stone-400">
                    <Phone className="w-3.5 h-3.5" />
                    <span dir="ltr">{worker.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-stone-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>تاريخ الالتحاق: {worker.joinDate}</span>
                </div>
              </div>
              {worker.notes && (
                <p className="text-xs text-stone-400 mt-2 bg-stone-800/60 p-2 rounded-xl border border-stone-700/60 inline-block">
                  ملاحظة إدارية: {worker.notes}
                </p>
              )}
            </div>
          </div>

          {/* Rates Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-stone-800/80 border border-amber-500/30 rounded-2xl p-4 text-right">
              <span className="text-[11px] text-stone-400 block font-medium">سعر الـ 1000 لقمة المعتمد:</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {effectiveRate}
                </span>
                <span className="text-xs text-stone-300">{settings.currency}</span>
              </div>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                {worker.customRatePer1000 ? 'سعر مخصص لهذا العامل' : 'السعر العام للمخبز'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Status Summary (الحساب الحالي غير المصفى) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Unsettled Pieces */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-semibold block">
            إجمالي اللقم المعتمدة حالياً
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-stone-900 font-mono">
              {financials.totalPiecesApproved.toLocaleString('ar-EG')}
            </span>
            <span className="text-xs text-stone-500">لقمة</span>
          </div>
          <span className="text-[11px] text-stone-400 block mt-1">
            {(financials.totalPiecesApproved / 1000).toFixed(1)} ألف لقمة
          </span>
        </div>

        {/* Unsettled Gross */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-semibold">
              إجمالي المستحقات (المعتمدة)
            </span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-700 font-mono">
              {financials.approvedGross.toLocaleString('ar-EG', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs text-stone-500">{settings.currency}</span>
          </div>
          {financials.pendingGross > 0 && (
            <span className="text-[11px] text-amber-700 font-bold block mt-1">
              +{financials.pendingGross.toFixed(1)} بانتظار الاعتماد
            </span>
          )}
        </div>

        {/* Unsettled Advances */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-semibold">
              إجمالي السلف والمسحوبات
            </span>
            <Wallet className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-red-600 font-mono">
              {financials.totalAdvances.toLocaleString('ar-EG', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs text-stone-500">{settings.currency}</span>
          </div>
          <span className="text-[11px] text-stone-400 block mt-1">
            عدد السلف: {financials.unsettledAdvances.length} سلفة
          </span>
        </div>

        {/* Current Net Payable */}
        <div className={`rounded-2xl p-4 border shadow-xs ${
          financials.netPayable < 0
            ? 'bg-red-50 border-red-200'
            : 'bg-emerald-50 border-emerald-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800">
              صافي مستحق العامل الحالي
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-2xl font-black font-mono ${
              financials.netPayable < 0 ? 'text-red-700' : 'text-emerald-800'
            }`}>
              {financials.netPayable.toLocaleString('ar-EG', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs font-bold text-stone-600">{settings.currency}</span>
          </div>
          <span className="text-[11px] text-stone-600 block mt-1 font-medium">
            {financials.netPayable >= 0 ? 'مستحق للصرف للعامل' : 'مديونية سلف على العامل'}
          </span>
        </div>

      </div>

      {/* Tabs & View Controls */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            السجل الكامل الموحد ({workerLogs.length + workerAdvances.length})
          </button>
          <button
            onClick={() => setActiveTab('production')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'production'
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            سجل كميات الإنتاج ({workerLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('advances')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'advances'
                ? 'bg-white text-red-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            سجل السلف والمصروفات ({workerAdvances.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-semibold">تصفية حسب حالة الحساب:</span>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="p-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 font-semibold"
          >
            <option value="all">كافة السجلات (المصفى وغير المصفى)</option>
            <option value="unsettled">الحساب الجاري غير المصفى فقط</option>
            <option value="settled">السجلات المصورة والمصفاة سابقاً</option>
          </select>
        </div>
      </div>

      {/* SECTION 1: DETAILED PRODUCTION LOGS TABLE */}
      {(activeTab === 'all' || activeTab === 'production') && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-extrabold text-stone-900">
                سجل يوميات وكميات الإنتاج (تفاصيل كل يوم)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setProdPieces('');
                  setProdDate(new Date().toISOString().split('T')[0]);
                  setProdRate(effectiveRate);
                  setProdAdvance('0');
                  setProdNotes('');
                  setProdError('');
                  setShowAddProductionModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة يومية جديدة</span>
              </button>
              <span className="text-xs text-stone-500 font-medium">
                ({filteredLogs.length})
              </span>
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-xs">
              لا توجد يوميات مسجلة لهذا العامل في هذا النطاق.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-stone-50/80 text-stone-600 border-b border-stone-200">
                    <th className="py-3 px-4 font-bold">التاريخ</th>
                    <th className="py-3 px-4 font-bold">الوردية</th>
                    <th className="py-3 px-4 font-bold">كمية اللقم المنتجة</th>
                    <th className="py-3 px-4 font-bold">سعر الـ 1000</th>
                    <th className="py-3 px-4 font-bold">إجمالي الأجر</th>
                    <th className="py-3 px-4 font-bold">السلفة المرفقة باليومية</th>
                    <th className="py-3 px-4 font-bold">الحالة الإدارية</th>
                    <th className="py-3 px-4 font-bold">الملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredLogs.map((log) => {
                    const thousands = (log.piecesCount / 1000).toFixed(2);
                    return (
                      <tr key={log.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-stone-900 whitespace-nowrap">
                          {log.date}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            log.shift === 'morning'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-indigo-100 text-indigo-900'
                          }`}>
                            {log.shift === 'morning' ? 'صباحية' : 'مسائية'}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono font-black text-stone-900 text-sm">
                            {log.piecesCount.toLocaleString('ar-EG')}
                          </span>
                          <span className="text-[10px] text-stone-400 block font-mono">
                            ({thousands} ألف لقمة)
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-700 whitespace-nowrap">
                          {log.ratePer1000} {settings.currency}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono font-black text-emerald-700 text-sm">
                            {log.grossAmount.toLocaleString('ar-EG', {
                              minimumFractionDigits: 1,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          <span className="text-[10px] text-stone-500 mr-1">{settings.currency}</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {log.advanceAmount && log.advanceAmount > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-mono font-bold text-xs inline-flex items-center gap-1">
                              <Wallet className="w-3 h-3" />
                              <span>{log.advanceAmount} {settings.currency}</span>
                            </span>
                          ) : (
                            <span className="text-stone-400 text-[11px]">بدون سلفة</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {log.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>معتمدة</span>
                            </span>
                          )}
                          {log.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                              <Clock className="w-3.5 h-3.5" />
                              <span>بانتظار المراجعة</span>
                            </span>
                          )}
                          {log.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[11px]">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>مرفوضة</span>
                            </span>
                          )}
                          {log.settledInId && (
                            <span className="text-[10px] text-stone-400 block mt-0.5">
                              (تمت التصفية النهائية)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-stone-600 max-w-xs truncate">
                          {log.notes || '-'}
                          {log.rejectionReason && (
                            <p className="text-red-600 text-[11px] font-semibold">
                              سبب الرفض: {log.rejectionReason}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: DETAILED ADVANCES TABLE */}
      {(activeTab === 'all' || activeTab === 'advances') && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-red-600" />
              <h3 className="text-sm font-extrabold text-stone-900">
                سجل السلف والمصروفات اليومية المسحوبة
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdvAmount('');
                  setAdvDate(new Date().toISOString().split('T')[0]);
                  setAdvCategory('cash');
                  setAdvNotes('');
                  setAdvError('');
                  setShowAddAdvanceModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة سلفة جديدة</span>
              </button>
              <span className="text-xs text-stone-500 font-medium">
                ({filteredAdvances.length})
              </span>
            </div>
          </div>

          {filteredAdvances.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-xs">
              لا توجد سلف مسجلة لهذا العامل في هذا النطاق.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-stone-50/80 text-stone-600 border-b border-stone-200">
                    <th className="py-3 px-4 font-bold">التاريخ</th>
                    <th className="py-3 px-4 font-bold">مبلغ السلفة</th>
                    <th className="py-3 px-4 font-bold">تصنيف السلفة</th>
                    <th className="py-3 px-4 font-bold">بيان السلفة / السبب</th>
                    <th className="py-3 px-4 font-bold">حالة القيد والتصفية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredAdvances.map((adv) => (
                    <tr key={adv.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-stone-900 whitespace-nowrap">
                        {adv.date}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-black text-red-600 text-sm">
                          {adv.amount.toLocaleString('ar-EG', {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        <span className="text-[10px] text-stone-500 mr-1">{settings.currency}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-700">
                          {adv.category === 'cash' && 'نقدية (كاش)'}
                          {adv.category === 'food' && 'طعام / شاي'}
                          {adv.category === 'supplies' && 'لوازم خاصة'}
                          {adv.category === 'other' && 'أخرى'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-700">
                        {adv.notes || 'سلفة يومية'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {adv.settledInId ? (
                          <span className="text-stone-400 font-semibold text-[11px]">
                            تمت التسوية بالتصفية
                          </span>
                        ) : (
                          <span className="text-amber-800 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            مخصومة من الحساب الجاري
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Lifetime Historical Card */}
      <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 text-xs text-stone-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-stone-500" />
          <span>
            <strong>إحصائيات كلية للعامل منذ الالتحاق:</strong> أنتج إجمالياً{' '}
            <strong className="text-stone-900">{lifetimePieces.toLocaleString('ar-EG')}</strong> لقمة،
            بإجمالي مستحقات تاريخية <strong className="text-stone-900">{lifetimeGross.toFixed(1)} {settings.currency}</strong>،
            وسلف تاريخية <strong className="text-stone-900">{lifetimeAdvances.toFixed(1)} {settings.currency}</strong>.
          </span>
        </div>
      </div>

      {/* ================= MODAL 1: ADD PRODUCTION / QUANTITY ================= */}
      {showAddProductionModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 text-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    إضافة كمية إنتاج (يومية)
                  </h3>
                  <p className="text-xs text-stone-400">
                    للعامل: <span className="text-amber-300 font-bold">{worker.name}</span> ({worker.roleTitle})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProductionModal(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {prodError && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{prodError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateProduction} className="mt-4 space-y-4">
              {/* Field 1: Pieces Count */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  الكمية (عدد اللقم المنتجة): *
                </label>
                <input
                  type="number"
                  required
                  autoFocus
                  min="1"
                  step="50"
                  dir="ltr"
                  placeholder="مثال: 3500"
                  value={prodPieces}
                  onChange={(e) => {
                    setProdError('');
                    setProdPieces(e.target.value);
                  }}
                  className="w-full p-3 bg-stone-800 border border-stone-700 rounded-xl text-white font-mono text-base font-black focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-center"
                />

                {/* Quick Add Pills */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap justify-center">
                  <span className="text-[11px] text-stone-400 ml-1">تعبئة سريعة:</span>
                  {[2000, 3000, 4000, 5000, 6000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setProdPieces(String(val))}
                      className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 text-xs font-mono font-bold border border-stone-700 transition-colors"
                    >
                      {val.toLocaleString('ar-EG')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid: Rate & Shift */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Rate per 1000 */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    سعر الـ 1000 لقمة ({settings.currency}): *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.5"
                    dir="ltr"
                    value={prodRate}
                    onChange={(e) => setProdRate(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-amber-400 font-mono font-bold text-sm focus:ring-2 focus:ring-amber-500 text-center"
                  />
                  <span className="text-[10px] text-stone-500 mt-1 block">
                    (سعر العامل المعتمد: {effectiveRate} {settings.currency})
                  </span>
                </div>

                {/* Shift */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    الوردية:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setProdShift('morning')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        prodShift === 'morning'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'
                      }`}
                    >
                      صباحية
                    </button>
                    <button
                      type="button"
                      onClick={() => setProdShift('evening')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        prodShift === 'evening'
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                          : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'
                      }`}
                    >
                      مسائية
                    </button>
                  </div>
                </div>
              </div>

              {/* Calculated Earnings Live Preview */}
              {Number(prodPieces) > 0 && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-amber-400 font-bold block">
                      حساب مستحق اليومية التلقائي:
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {(Number(prodPieces) / 1000).toFixed(2)} ألف لقمة × {prodRate} {settings.currency}
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="text-lg font-black text-amber-300 font-mono">
                      {((Number(prodPieces) / 1000) * prodRate).toFixed(2)}
                    </span>
                    <span className="text-xs text-stone-400 mr-1">{settings.currency}</span>
                  </div>
                </div>
              )}

              {/* Field: Date */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  تاريخ اليومية: *
                </label>
                <input
                  type="date"
                  required
                  value={prodDate}
                  onChange={(e) => setProdDate(e.target.value)}
                  className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Field: Attached Advance (السلفة المرفقة) */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  السلفة اليومية المرفقة (إجباري - تقبل أي رقم حتى 0): *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="10"
                    required
                    dir="ltr"
                    placeholder="0"
                    value={prodAdvance}
                    onChange={(e) => setProdAdvance(e.target.value)}
                    className="w-full p-2.5 pl-12 bg-stone-800 border border-stone-700 rounded-xl text-red-400 font-mono font-bold text-sm focus:ring-2 focus:ring-red-500"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-stone-500 font-bold">
                    {settings.currency}
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  * إذا أدخلت مبلغاً أكبر من 0، فسيتم تسجيل سلفة مرفقة مع اليومية تلقائياً وخصمها من الحساب.
                </p>
              </div>

              {/* Field: Notes */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  ملاحظات اليومية (اختياري):
                </label>
                <input
                  type="text"
                  placeholder="أي تفاصيل أو ملاحظات عن اليومية..."
                  value={prodNotes}
                  onChange={(e) => setProdNotes(e.target.value)}
                  className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Notice */}
              <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/70 text-[11px] text-stone-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>سيتم اعتماد هذه اليومية وإضافتها فوراً لحساب العامل وتحديث إجمالي اللقم والمستحقات.</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs shadow-lg shadow-amber-900/40 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ واعتماد اليومية فوراً</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProductionModal(false)}
                  className="py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: ADD ADVANCE ================= */}
      {showAddAdvanceModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 text-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    إضافة سلفة نقدية / مسحوبات
                  </h3>
                  <p className="text-xs text-stone-400">
                    للعامل: <span className="text-amber-300 font-bold">{worker.name}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAdvanceModal(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {advError && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{advError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateAdvance} className="mt-4 space-y-4">
              {/* Field 1: Advance Amount */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  مبلغ السلفة ({settings.currency}): *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    autoFocus
                    min="1"
                    step="10"
                    dir="ltr"
                    placeholder="مثال: 200"
                    value={advAmount}
                    onChange={(e) => {
                      setAdvError('');
                      setAdvAmount(e.target.value);
                    }}
                    className="w-full p-3 pl-12 bg-stone-800 border border-stone-700 rounded-xl text-red-400 font-mono text-xl font-black focus:ring-2 focus:ring-red-500 text-center"
                  />
                  <span className="absolute left-3 top-3.5 text-xs text-stone-500 font-bold">
                    {settings.currency}
                  </span>
                </div>

                {/* Quick Advance Pills */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap justify-center">
                  {[50, 100, 150, 200, 300, 500].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAdvAmount(String(val))}
                      className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-red-500/20 text-stone-300 hover:text-red-300 text-xs font-mono font-bold border border-stone-700 transition-colors"
                    >
                      {val} {settings.currency}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 2: Date */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  تاريخ استلام السلفة: *
                </label>
                <input
                  type="date"
                  required
                  value={advDate}
                  onChange={(e) => setAdvDate(e.target.value)}
                  className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Field 3: Category */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  بند / نوع السلفة:
                </label>
                <select
                  value={advCategory}
                  onChange={(e) => setAdvCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-red-500"
                >
                  <option value="cash">نقدية (كاش مصاريف يد)</option>
                  <option value="food">طعام / وجبات ومشروبات</option>
                  <option value="supplies">لوازم ومشتريات خاصة</option>
                  <option value="other">مصاريف أخرى</option>
                </select>
              </div>

              {/* Field 4: Notes */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  بيان السلفة / الملاحظات (اختياري):
                </label>
                <input
                  type="text"
                  placeholder="سبب السلفة (مثال: سلفة نقدية مستعجلة)..."
                  value={advNotes}
                  onChange={(e) => setAdvNotes(e.target.value)}
                  className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Notice */}
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-[11px] text-red-300 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-red-400 shrink-0" />
                <span>سيتم خصم هذه السلفة مباشرة من صافي مستحقات العامل في الحساب الجاري.</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs shadow-lg shadow-red-950/40 transition-all flex items-center justify-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>تسجيل السلفة وخصمها فوراً</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddAdvanceModal(false)}
                  className="py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
