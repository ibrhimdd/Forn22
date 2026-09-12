import React, { useState } from 'react';
import { useBakery } from '../../context/BakeryContext';
import { AddProductionModal } from './AddProductionModal';
import { AddAdvanceModal } from './AddAdvanceModal';
import {
  Layers,
  Wallet,
  Coins,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  PlusCircle,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  UserCheck,
  ShieldAlert,
  Info,
} from 'lucide-react';

export const WorkerPortal: React.FC = () => {
  const {
    currentWorker,
    currentWorkerId,
    setCurrentWorkerId,
    workers,
    productionLogs,
    advances,
    settings,
    getWorkerFinancials,
  } = useBakery();

  const [showAddProduction, setShowAddProduction] = useState(false);
  const [showAddAdvance, setShowAddAdvance] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'production' | 'advances' | 'statement'>('production');

  const activeWorkers = workers.filter((w) => w.status === 'active');
  const worker = currentWorker || activeWorkers[0];

  if (!worker) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 shadow-xs">
        <h3 className="text-base font-bold text-stone-800 mb-2">
          لا يوجد حساب عامل متاح حالياً
        </h3>
        <p className="text-xs text-stone-500">
          يرجى الانتقال إلى لوحة الأدمين لإنشاء حساب عامل جديد أولاً.
        </p>
      </div>
    );
  }

  const financials = getWorkerFinancials(worker.id);
  const effectiveRate = worker.customRatePer1000 ?? settings.defaultRatePer1000;

  // Filter worker's own logs & advances
  const myLogs = productionLogs.filter((l) => l.workerId === worker.id);
  const myAdvances = advances.filter((a) => a.workerId === worker.id);

  // Grouped daily ledger statement (dates present in logs or advances)
  const uniqueDates = Array.from(
    new Set([...myLogs.map((l) => l.date), ...myAdvances.map((a) => a.date)])
  ).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      
      {/* Worker Greeting & Rate Bar */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 rounded-2xl p-6 text-white shadow-md border border-stone-700/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xl">
            {worker.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-stone-800 border border-stone-700 text-stone-300">
                {worker.code}
              </span>
              <h2 className="text-xl font-extrabold text-white">
                أهلاً بك، {worker.name}
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs text-stone-300 mt-1">
              <span className="font-semibold text-amber-300">{worker.roleTitle}</span>
              <span>•</span>
              <span className="text-stone-400">تاريخ الانضمام: {worker.joinDate}</span>
            </div>
          </div>
        </div>

        {/* Worker's Rate Badge & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Rate Badge */}
          <div className="px-4 py-2 rounded-xl bg-stone-800/90 border border-amber-500/30 text-right">
            <span className="text-[11px] text-stone-400 block">سعر الـ 1000 لقمة المعتمد لك:</span>
            <span className="text-base font-black text-amber-400 font-mono">
              {effectiveRate} {settings.currency}
            </span>
          </div>

          {/* Add Production Button */}
          <button
            onClick={() => setShowAddProduction(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-md transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-stone-950" />
            <span>إضافة كمية الإنتاج اليومي</span>
          </button>

          {/* Add Advance Button */}
          <button
            onClick={() => setShowAddAdvance(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-red-300 border border-red-500/30 font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            <Wallet className="w-4 h-4 text-red-400" />
            <span>تسجيل سلفة يومية</span>
          </button>

        </div>
      </div>

      {/* THREE CORE METRIC CARDS (رؤية حسابه اليومي) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. Total Gross Earnings (إجمالي المستحقات) */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600">
              إجمالي المستحقات (المعتمدة)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700 font-mono">
              {financials.approvedGross.toLocaleString('ar-EG', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs font-bold text-stone-500">{settings.currency}</span>
          </div>
          <div className="mt-2 text-xs text-stone-500 flex items-center justify-between">
            <span>
              عن إنتاج {financials.totalPiecesApproved.toLocaleString('ar-EG')} لقمة
            </span>
            {financials.pendingGross > 0 && (
              <span className="text-amber-700 text-[11px] font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                +{financials.pendingGross.toFixed(1)} بانتظار الاعتماد
              </span>
            )}
          </div>
        </div>

        {/* 2. Total Advances & Expenses (إجمالي المصروفات والسلف) */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600">
              إجمالي المصروفات والسلف
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-red-600 font-mono">
              -{financials.totalAdvances.toLocaleString('ar-EG', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs font-bold text-stone-500">{settings.currency}</span>
          </div>
          <div className="mt-2 text-xs text-stone-500 flex items-center justify-between">
            <span>عدد السلف المسجلة: {financials.unsettledAdvances.length}</span>
            <span className="text-[11px] text-stone-400">تخصم من صافي الرصيد</span>
          </div>
        </div>

        {/* 3. Net Profit / Net Payable (صافي الربح / المستحق الصافي) */}
        <div
          className={`rounded-2xl p-5 border shadow-xs transition-all ${
            financials.netPayable >= 0
              ? 'bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-300 ring-2 ring-amber-400/30'
              : 'bg-red-50 border-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-950">
              صافي الربح والمستحق الصافي
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-3xl font-black font-mono ${
                financials.netPayable >= 0 ? 'text-amber-950' : 'text-red-700'
              }`}
            >
              {financials.netPayable.toLocaleString('ar-EG', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs font-bold text-stone-700">{settings.currency}</span>
          </div>
          <div className="mt-2 text-xs text-stone-600 flex items-center justify-between">
            <span>المبلغ الصافي القابل للصرف</span>
            <span className="text-[11px] font-bold text-amber-900">
              (المستحقات - السلف)
            </span>
          </div>
        </div>

      </div>

      {/* Sub-tabs Navigation */}
      <div className="bg-white rounded-2xl p-1.5 border border-stone-200 shadow-xs flex items-center gap-1">
        
        <button
          onClick={() => setActiveSubTab('production')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'production'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>يوميات الإنتاج ({myLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('advances')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'advances'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>السلف والمصروفات ({myAdvances.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('statement')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'statement'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>كشف الحساب اليومي المجمع</span>
        </button>

      </div>

      {/* Sub-tab 1: Production Logs Table */}
      {activeSubTab === 'production' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-800">
              سجل يوميات الإنتاج المدخلة وحالة الاعتماد من الإدارة
            </h3>
            <button
              onClick={() => setShowAddProduction(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>إضافة يومية جديدة</span>
            </button>
          </div>

          {myLogs.length === 0 ? (
            <div className="p-10 text-center text-stone-500 text-xs">
              لم تقم بتسجيل أي إنتاج حتى الآن. اضغط على زر "إضافة كمية الإنتاج اليومي" للبدء.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3">التاريخ والوردية</th>
                    <th className="p-3">عدد اللقم المنتجة</th>
                    <th className="p-3">سعر الـ 1000</th>
                    <th className="p-3">أجر اليومية</th>
                    <th className="p-3">الملاحظات</th>
                    <th className="p-3">حالة اليومية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {myLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50">
                      <td className="p-3">
                        <div className="font-bold text-stone-900">{log.date}</div>
                        <div className="text-[11px] text-stone-500">
                          {log.shift === 'morning' ? 'وردية صباحية' : 'وردية مسائية'}
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="font-black text-stone-900 text-sm">
                          {log.piecesCount.toLocaleString('ar-EG')}
                        </span>
                        <span className="text-[11px] text-stone-500 mr-1">لقمة</span>
                      </td>

                      <td className="p-3 font-mono font-bold text-stone-700">
                        {log.ratePer1000} {settings.currency}
                      </td>

                      <td className="p-3 font-bold text-amber-900 text-sm">
                        {log.grossAmount.toLocaleString('ar-EG', {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 2,
                        })}{' '}
                        {settings.currency}
                      </td>

                      <td className="p-3 text-stone-600 max-w-xs">
                        {log.notes || '-'}
                        {log.status === 'rejected' && log.rejectionReason && (
                          <div className="text-red-700 bg-red-50 p-1 rounded text-[11px] mt-1 border border-red-200">
                            <strong>سبب الرفض:</strong> {log.rejectionReason}
                          </div>
                        )}
                        {log.settledInId && (
                          <div className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded text-[10px] inline-block mt-1 font-semibold">
                            تم صرفه في تصفية نهائية
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        {log.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                            <span>بانتظار المدير</span>
                          </span>
                        )}
                        {log.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>معتمد ✓</span>
                          </span>
                        )}
                        {log.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>مرفوض ✕</span>
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

      {/* Sub-tab 2: Advances Table */}
      {activeSubTab === 'advances' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-800">
              سجل السلف والمصروفات المسجلة عليك
            </h3>
            <button
              onClick={() => setShowAddAdvance(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>تسجيل سلفة جديدة</span>
            </button>
          </div>

          {myAdvances.length === 0 ? (
            <div className="p-10 text-center text-stone-500 text-xs">
              لا توجد أي سلف أو استقطاعات مسجلة عليك حالياً.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">مبلغ السلفة</th>
                    <th className="p-3">نوع السلفة</th>
                    <th className="p-3">البيان والتفاصيل</th>
                    <th className="p-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {myAdvances.map((adv) => (
                    <tr key={adv.id} className="hover:bg-stone-50">
                      <td className="p-3 font-medium text-stone-900">{adv.date}</td>
                      <td className="p-3 font-extrabold text-red-600 text-sm">
                        -{adv.amount.toLocaleString('ar-EG')} {settings.currency}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                          {adv.category === 'cash'
                            ? 'نقدية (كاش)'
                            : adv.category === 'food'
                            ? 'غداء وطعام'
                            : adv.category === 'supplies'
                            ? 'شاي ودخان'
                            : 'أخرى'}
                        </span>
                      </td>
                      <td className="p-3 text-stone-700">{adv.notes || '-'}</td>
                      <td className="p-3">
                        {adv.settledInId ? (
                          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                            تمت تسويتها في السند النهائي
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-medium">
                            سارية / مخصومة من الرصيد
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

      {/* Sub-tab 3: Daily Statement Ledger */}
      {activeSubTab === 'statement' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              كشف الحساب اليومي وتطور الأرباح (يوم بيوم)
            </h3>
            <p className="text-xs text-stone-500">
              مقارنة كميات الإنتاج والمستحقات المعتمدة مقابل السلف المصروفة لكل يوم عمل
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-3">اليوم والتاريخ</th>
                  <th className="p-3">إنتاج اللقم</th>
                  <th className="p-3">المستحق المعتمد</th>
                  <th className="p-3">السلف والمصروفات</th>
                  <th className="p-3 font-black">صافي ربح اليومية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {uniqueDates.map((d) => {
                  const dayLogs = myLogs.filter((l) => l.date === d && l.status === 'approved');
                  const dayAdvances = myAdvances.filter((a) => a.date === d);

                  const dayPieces = dayLogs.reduce((s, l) => s + l.piecesCount, 0);
                  const dayGross = dayLogs.reduce((s, l) => s + l.grossAmount, 0);
                  const dayAdv = dayAdvances.reduce((s, a) => s + a.amount, 0);
                  const dayNet = dayGross - dayAdv;

                  return (
                    <tr key={d} className="hover:bg-stone-50">
                      <td className="p-3 font-bold text-stone-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{d}</span>
                      </td>

                      <td className="p-3 font-medium text-stone-800">
                        {dayPieces > 0 ? (
                          <span>{dayPieces.toLocaleString('ar-EG')} لقمة</span>
                        ) : (
                          <span className="text-stone-400">-</span>
                        )}
                      </td>

                      <td className="p-3 font-bold text-emerald-700">
                        {dayGross > 0 ? (
                          <span>+{dayGross.toFixed(1)} {settings.currency}</span>
                        ) : (
                          <span className="text-stone-400">0.0 {settings.currency}</span>
                        )}
                      </td>

                      <td className="p-3 font-bold text-red-600">
                        {dayAdv > 0 ? (
                          <span>-{dayAdv.toFixed(1)} {settings.currency}</span>
                        ) : (
                          <span className="text-stone-400">0.0 {settings.currency}</span>
                        )}
                      </td>

                      <td className="p-3 font-black text-sm">
                        <span
                          className={dayNet >= 0 ? 'text-amber-900' : 'text-red-700'}
                        >
                          {dayNet.toFixed(1)} {settings.currency}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddProduction && (
        <AddProductionModal
          worker={worker}
          onClose={() => setShowAddProduction(false)}
        />
      )}

      {showAddAdvance && (
        <AddAdvanceModal
          worker={worker}
          onClose={() => setShowAddAdvance(false)}
        />
      )}

    </div>
  );
};
