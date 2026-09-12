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
  } = useBakery();

  const [activeTab, setActiveTab] = useState<'all' | 'production' | 'advances'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'unsettled' | 'settled'>('all');

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

  const effectiveRate = worker.customRatePer1000 ?? settings.defaultRatePer1000;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
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
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير الكامل</span>
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
          <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-extrabold text-stone-900">
                سجل يوميات وكميات الإنتاج (تفاصيل كل يوم)
              </h3>
            </div>
            <span className="text-xs text-stone-500 font-medium">
              عدد اليوميات: {filteredLogs.length}
            </span>
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
          <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-red-600" />
              <h3 className="text-sm font-extrabold text-stone-900">
                سجل السلف والمصروفات اليومية المسحوبة
              </h3>
            </div>
            <span className="text-xs text-stone-500 font-medium">
              عدد السلف: {filteredAdvances.length}
            </span>
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

    </div>
  );
};
