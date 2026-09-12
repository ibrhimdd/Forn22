import React, { useState } from 'react';
import { useBakery } from '../../context/BakeryContext';
import { WorkerProfile, SettlementRecord } from '../../types';
import { PrintableSettlementModal } from './PrintableSettlementModal';
import {
  Archive,
  RotateCcw,
  Receipt,
  FileCheck2,
  Calendar,
  Phone,
  Coins,
  AlertCircle,
  Clock,
  Printer,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const ArchivedSettlement: React.FC = () => {
  const {
    workers,
    unarchiveWorker,
    getWorkerFinancials,
    executeFinalSettlement,
    settlements,
    settings,
  } = useBakery();

  const [selectedWorkerForSettlement, setSelectedWorkerForSettlement] =
    useState<WorkerProfile | null>(null);
  const [settlementNotes, setSettlementNotes] = useState(
    'تسليم كامل المستحقات المتبقية نقداً مع إخلاء طرف نهائي'
  );
  const [activeReceipt, setActiveReceipt] = useState<SettlementRecord | null>(null);

  const archivedWorkers = workers.filter((w) => w.status === 'archived');

  const handleOpenSettlement = (worker: WorkerProfile) => {
    setSelectedWorkerForSettlement(worker);
    setSettlementNotes('تسليم كامل المستحقات المتبقية نقداً مع إخلاء طرف نهائي');
  };

  const handleConfirmSettlement = () => {
    if (!selectedWorkerForSettlement) return;
    const record = executeFinalSettlement(
      selectedWorkerForSettlement.id,
      settlementNotes.trim()
    );
    setSelectedWorkerForSettlement(null);
    setActiveReceipt(record);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Archive className="w-5 h-5 text-stone-700" />
            <h2 className="text-lg font-bold text-stone-900">
              الحسابات المؤرشفة والتصفية النهائية للعمال
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            إدارة حسابات العمال المنتهية خدماتهم، مراجعة الأرصدة المتبقية، واستخدام زر التصفية النهائي لإصدار السند وصرف المستحقات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-xs font-bold text-stone-700">
            {archivedWorkers.length} عامل في الأرشيف
          </span>
        </div>
      </div>

      {/* Archived Workers List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
          <span>قائمة العمال المؤرشفين والمستحقات المعلقة:</span>
        </h3>

        {archivedWorkers.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-stone-300">
            <Archive className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-stone-600">
              لا يوجد أي عمال مؤرشفين حالياً في النظام
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {archivedWorkers.map((worker) => {
              const fin = getWorkerFinancials(worker.id);
              const hasPendingBalance = fin.netPayable !== 0 || fin.unsettledApprovedLogs.length > 0;

              return (
                <div
                  key={worker.id}
                  className={`bg-white rounded-2xl p-5 border shadow-xs transition-all ${
                    hasPendingBalance
                      ? 'border-amber-300 ring-1 ring-amber-200'
                      : 'border-stone-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-bold">
                          {worker.code}
                        </span>
                        <h4 className="font-extrabold text-stone-900 text-base">
                          {worker.name}
                        </h4>
                      </div>
                      <p className="text-xs text-amber-800 font-semibold mt-0.5">
                        {worker.roleTitle}
                      </p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600">
                      مؤرشف
                    </span>
                  </div>

                  {/* Archive reason and dates */}
                  <div className="bg-stone-50 rounded-xl p-3 text-xs space-y-1 text-stone-600 mb-3 border border-stone-100">
                    <div className="flex justify-between">
                      <span className="text-stone-500">تاريخ الأرشفة:</span>
                      <span className="font-medium text-stone-800">
                        {worker.archivedDate || '-'}
                      </span>
                    </div>
                    {worker.archivedReason && (
                      <div className="text-stone-700">
                        <span className="text-stone-500">السبب:</span> {worker.archivedReason}
                      </div>
                    )}
                  </div>

                  {/* Unsettled Financials */}
                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 mb-4 space-y-1.5 text-xs">
                    <div className="flex justify-between text-stone-700">
                      <span>يوميات إنتاج معتمدة غير مصفاة:</span>
                      <span className="font-bold text-stone-900">
                        {fin.unsettledApprovedLogs.length} يومية (
                        {fin.totalPiecesApproved.toLocaleString('ar-EG')} لقمة)
                      </span>
                    </div>

                    <div className="flex justify-between text-stone-700">
                      <span>إجمالي المستحقات المتبقية:</span>
                      <span className="font-bold text-emerald-700">
                        {fin.approvedGross.toLocaleString('ar-EG')} {settings.currency}
                      </span>
                    </div>

                    <div className="flex justify-between text-stone-700">
                      <span>إجمالي السلف غير المصفاة:</span>
                      <span className="font-bold text-red-600">
                        -{fin.totalAdvances.toLocaleString('ar-EG')} {settings.currency}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-amber-200 flex justify-between items-center">
                      <span className="font-extrabold text-stone-900">
                        صافي الرصيد المستحق النهائي:
                      </span>
                      <span
                        className={`text-base font-black ${
                          fin.netPayable > 0 ? 'text-emerald-700' : 'text-stone-700'
                        }`}
                      >
                        {fin.netPayable.toLocaleString('ar-EG')} {settings.currency}
                      </span>
                    </div>
                  </div>

                  {/* Actions including the prominent Final Settlement button */}
                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                    
                    {/* Primary Final Settlement Button */}
                    <button
                      id={`btn-settle-${worker.id}`}
                      onClick={() => handleOpenSettlement(worker)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-extrabold shadow-sm transition-all"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>تصفية نهائية للحساب</span>
                    </button>

                    {/* Restore / Unarchive */}
                    <button
                      onClick={() => unarchiveWorker(worker.id)}
                      className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                      title="إلغاء الأرشفة وإعادة العامل للنشطين"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historic Settlements List */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-stone-900">
              سجل سندات التصفية والمخالصات المنفذة ({settlements.length})
            </h3>
          </div>
        </div>

        {settlements.length === 0 ? (
          <p className="text-xs text-stone-500 py-4 text-center">
            لم يتم تنفيذ أي تصفيات سابقة حتى الآن
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-bold">
                <tr>
                  <th className="py-2.5 px-3">رقم السند</th>
                  <th className="py-2.5 px-3">العامل</th>
                  <th className="py-2.5 px-3">تاريخ التصفية</th>
                  <th className="py-2.5 px-3">الإنتاج المصفى</th>
                  <th className="py-2.5 px-3">إجمالي المستحق</th>
                  <th className="py-2.5 px-3">السلف المخصومة</th>
                  <th className="py-2.5 px-3">الصافي المسلم</th>
                  <th className="py-2.5 px-3 text-center">عرض وطباعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {settlements.map((st) => (
                  <tr key={st.id} className="hover:bg-stone-50/80">
                    <td className="py-3 px-3 font-mono font-bold text-stone-800">
                      {st.id}
                    </td>
                    <td className="py-3 px-3 font-bold text-stone-900">
                      {st.workerName}
                    </td>
                    <td className="py-3 px-3 text-stone-600">{st.settlementDate}</td>
                    <td className="py-3 px-3">
                      {st.totalPieces.toLocaleString('ar-EG')} لقمة
                    </td>
                    <td className="py-3 px-3 text-emerald-700 font-bold">
                      {st.totalGross.toLocaleString('ar-EG')} {settings.currency}
                    </td>
                    <td className="py-3 px-3 text-red-600 font-bold">
                      -{st.totalAdvances.toLocaleString('ar-EG')} {settings.currency}
                    </td>
                    <td className="py-3 px-3 text-amber-900 font-black text-sm">
                      {st.netPaid.toLocaleString('ar-EG')} {settings.currency}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setActiveReceipt(st)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-[11px] transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5 text-stone-600" />
                        <span>سند التصفية</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Final Settlement Execution Modal */}
      {selectedWorkerForSettlement && (() => {
        const fin = getWorkerFinancials(selectedWorkerForSettlement.id);

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-lg w-full text-right shadow-2xl">
              <div className="flex items-center gap-2 text-emerald-700 mb-1">
                <Receipt className="w-5 h-5" />
                <h3 className="text-base font-bold text-stone-900">
                  تصفية الحساب النهائي وإخلاء الطرف
                </h3>
              </div>
              <p className="text-xs text-stone-500 mb-4">
                العامل: <strong>{selectedWorkerForSettlement.name}</strong> ({selectedWorkerForSettlement.roleTitle})
              </p>

              {/* Settlement Breakdown */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2.5 text-xs mb-4">
                <div className="flex justify-between text-stone-700">
                  <span>عدد يوميات الإنتاج المعتمدة للتصفية:</span>
                  <span className="font-bold text-stone-900">
                    {fin.unsettledApprovedLogs.length} يومية
                  </span>
                </div>

                <div className="flex justify-between text-stone-700">
                  <span>إجمالي اللقم المنتجة:</span>
                  <span className="font-bold text-stone-900">
                    {fin.totalPiecesApproved.toLocaleString('ar-EG')} لقمة
                  </span>
                </div>

                <div className="flex justify-between text-stone-700">
                  <span>إجمالي المستحقات:</span>
                  <span className="font-bold text-emerald-700">
                    +{fin.approvedGross.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} {settings.currency}
                  </span>
                </div>

                <div className="flex justify-between text-stone-700">
                  <span>إجمالي السلف والخصميات المسجلة ({fin.unsettledAdvances.length} سلفة):</span>
                  <span className="font-bold text-red-600">
                    -{fin.totalAdvances.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} {settings.currency}
                  </span>
                </div>

                <div className="pt-2.5 border-t border-stone-300 flex justify-between items-center text-sm font-black">
                  <span className="text-stone-900">المبلغ الصافي المستحق للتسليم نقداً:</span>
                  <span className="text-lg text-emerald-700 font-mono">
                    {fin.netPayable.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}{' '}
                    {settings.currency}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ملاحظات السند والمخالصة النهائية:
                </label>
                <textarea
                  rows={2}
                  value={settlementNotes}
                  onChange={(e) => setSettlementNotes(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedWorkerForSettlement(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-200"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSettlement}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد التصفية وصرف المبلغ نقداً</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Printable Receipt Modal */}
      {activeReceipt && (
        <PrintableSettlementModal
          settlement={activeReceipt}
          worker={workers.find((w) => w.id === activeReceipt.workerId)}
          settings={settings}
          onClose={() => setActiveReceipt(null)}
        />
      )}

    </div>
  );
};
