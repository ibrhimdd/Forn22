import React, { useState } from 'react';
import { useBakery } from '../../context/BakeryContext';
import { ProductionLog, ProductionStatus } from '../../types';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  AlertTriangle,
  FileCheck2,
  Calendar,
  Layers,
  Sparkles,
  Wallet,
} from 'lucide-react';

export const ProductionReview: React.FC = () => {
  const {
    productionLogs,
    approveProductionLog,
    rejectProductionLog,
    settings,
  } = useBakery();

  const [statusFilter, setStatusFilter] = useState<'all' | ProductionStatus>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingLogId, setRejectingLogId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [editingLog, setEditingLog] = useState<ProductionLog | null>(null);
  const [adjustedPieces, setAdjustedPieces] = useState<number>(0);
  const [adjustedRate, setAdjustedRate] = useState<number>(0);

  // Filter logs
  const filteredLogs = productionLogs.filter((log) => {
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesSearch =
      log.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.date.includes(searchQuery) ||
      (log.notes && log.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const pendingCount = productionLogs.filter((l) => l.status === 'pending').length;

  const handleOpenReject = (id: string) => {
    setRejectingLogId(id);
    setRejectionReason('');
  };

  const handleConfirmReject = () => {
    if (rejectingLogId) {
      rejectProductionLog(rejectingLogId, rejectionReason.trim() || 'لم يتم استيفاء شروط الجودة أو العدد');
      setRejectingLogId(null);
      setRejectionReason('');
    }
  };

  const handleOpenEdit = (log: ProductionLog) => {
    setEditingLog(log);
    setAdjustedPieces(log.piecesCount);
    setAdjustedRate(log.ratePer1000);
  };

  const handleConfirmApproveWithAdjust = () => {
    if (editingLog) {
      approveProductionLog(editingLog.id, adjustedPieces, adjustedRate);
      setEditingLog(null);
    }
  };

  const handleBatchApprovePending = () => {
    const pendingLogs = productionLogs.filter((l) => l.status === 'pending');
    pendingLogs.forEach((l) => {
      approveProductionLog(l.id);
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Actions */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <h2 className="text-lg font-bold text-stone-900">
              مراجعة واعتماد يوميات إنتاج اللقم
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            تدقيق عدد اللقم والأرغفة المنتجة واحتساب أجر الـ 1000 لقمة تلقائياً واعتماد اليومية للعامل
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <button
              onClick={handleBatchApprovePending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>اعتماد كل المعلق ({pendingCount}) دفعة واحدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Status Filter Tabs */}
        <div className="flex bg-stone-200/80 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'pending'
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>بانتظار الاعتماد</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setStatusFilter('approved')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'approved'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>معتمدة</span>
          </button>

          <button
            onClick={() => setStatusFilter('rejected')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'rejected'
                ? 'bg-white text-red-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>مرفوضة</span>
          </button>

          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>الكل ({productionLogs.length})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute right-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="بحث باسم العامل أو التاريخ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Logs Table / Cards */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-stone-300">
          <Layers className="w-10 h-10 text-stone-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-700 mb-1">
            لا توجد يوميات إنتاج مطابقة لهذا الفلتر
          </h3>
          <p className="text-xs text-stone-500">
            يمكن للعامل تسجيل كميات جديدة من بوابة العامل لتظهر هنا للاعتماد.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-100/80 border-b border-stone-200 text-stone-700 font-bold">
                <tr>
                  <th className="py-3.5 px-4">العامل</th>
                  <th className="py-3.5 px-4">التاريخ والوردية</th>
                  <th className="py-3.5 px-4">عدد اللقم المنتجة</th>
                  <th className="py-3.5 px-4">سعر الـ 1000</th>
                  <th className="py-3.5 px-4">إجمالي المستحق</th>
                  <th className="py-3.5 px-4">الملاحظات</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredLogs.map((log) => {
                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-amber-50/40 transition-colors ${
                        log.status === 'pending' ? 'bg-amber-50/20 font-medium' : ''
                      }`}
                    >
                      {/* Worker */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900">{log.workerName}</div>
                        <div className="text-[11px] text-stone-500">كود: {log.workerId}</div>
                      </td>

                      {/* Date & Shift */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-stone-800">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>{log.date}</span>
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {log.shift === 'morning' ? 'وردية صباحية (باكر)' : 'وردية مسائية'}
                        </div>
                      </td>

                      {/* Pieces Count */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-stone-900 text-sm">
                          {log.piecesCount.toLocaleString('ar-EG')}{' '}
                          <span className="text-xs font-normal text-stone-500">لقمة</span>
                        </div>
                        <div className="text-[10px] text-stone-400">
                          ({(log.piecesCount / 1000).toFixed(2)} ألف)
                        </div>
                      </td>

                      {/* Rate */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-700 font-semibold font-mono">
                          {log.ratePer1000} {settings.currency}
                        </span>
                      </td>

                      {/* Gross Amount & Linked Advance */}
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-amber-700 text-sm">
                          {log.grossAmount.toLocaleString('ar-EG', {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 2,
                          })}{' '}
                          {settings.currency}
                        </span>
                        {log.advanceAmount && log.advanceAmount > 0 && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md w-fit">
                            <Wallet className="w-3 h-3 text-red-500" />
                            <span>سلفة مرفقة: -{log.advanceAmount} {settings.currency}</span>
                          </div>
                        )}
                      </td>

                      {/* Notes / Rejection Reason */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {log.notes && (
                          <div className="text-stone-700 truncate" title={log.notes}>
                            {log.notes}
                          </div>
                        )}
                        {log.status === 'rejected' && log.rejectionReason && (
                          <div className="text-red-700 bg-red-50 p-1.5 rounded text-[11px] mt-1 border border-red-200">
                            <strong>سبب الرفض:</strong> {log.rejectionReason}
                          </div>
                        )}
                        {log.settledInId && (
                          <div className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] inline-block mt-1">
                            تمت تصفيته في سند نهائي
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {log.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                            <span>بانتظار الاعتماد</span>
                          </span>
                        )}
                        {log.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>معتمد ✓</span>
                          </span>
                        )}
                        {log.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>مرفوض ✕</span>
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {log.status === 'pending' ? (
                            <>
                              {/* Direct Approve */}
                              <button
                                onClick={() => approveProductionLog(log.id)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                                title="تأكيد واعتماد اليومية بالسعر والكمية الحالية"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>تأكيد واعتماد</span>
                              </button>

                              {/* Reject button */}
                              <button
                                onClick={() => handleOpenReject(log.id)}
                                className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                                title="رفض اليومية وتدوين السبب"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>

                              {/* Edit pieces/rate before approving */}
                              <button
                                onClick={() => handleOpenEdit(log)}
                                className="px-2 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium"
                                title="تعديل الكمية أو السعر ثم الاعتماد"
                              >
                                تعديل
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-1">
                              {log.status === 'approved' && (
                                <button
                                  onClick={() => handleOpenReject(log.id)}
                                  className="text-stone-400 hover:text-red-600 text-[11px] px-2 py-1 rounded hover:bg-red-50"
                                >
                                  إلغاء الاعتماد
                                </button>
                              )}
                              {log.status === 'rejected' && (
                                <button
                                  onClick={() => approveProductionLog(log.id)}
                                  className="text-stone-400 hover:text-emerald-600 text-[11px] px-2 py-1 rounded hover:bg-emerald-50 font-medium"
                                >
                                  إعادة اعتماد
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingLogId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-md w-full text-right shadow-2xl">
            <div className="flex items-center gap-2 text-red-600 mb-3">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-stone-900">
                رفض يومية الإنتاج
              </h3>
            </div>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              يرجى كتابة سبب رفض هذه الوجبة أو اليومية حتى يتمكن العامل من معرفة السبب وتصحيحه (مثلاً: عجين محروق، خطأ في العد، عدم الالتزام بالوزن).
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                سبب الرفض:
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="اكتب سبب الرفض هنا..."
                rows={3}
                className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRejectingLogId(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-200"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit & Approve Modal */}
      {editingLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-md w-full text-right shadow-2xl">
            <h3 className="text-base font-bold text-stone-900 mb-2">
              تعديل بيانات اليومية واعتمادها
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              العامل: <span className="font-bold text-stone-800">{editingLog.workerName}</span> | التاريخ: {editingLog.date}
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  عدد اللقم الفعلي بعد الجرد:
                </label>
                <input
                  type="number"
                  value={adjustedPieces}
                  onChange={(e) => setAdjustedPieces(Number(e.target.value))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold text-stone-800 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  سعر الـ 1000 لقمة ({settings.currency}):
                </label>
                <input
                  type="number"
                  value={adjustedRate}
                  onChange={(e) => setAdjustedRate(Number(e.target.value))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold text-stone-800 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex justify-between items-center text-xs">
                <span className="text-amber-800 font-medium">المستحق المحسوب بعد التعديل:</span>
                <span className="font-extrabold text-amber-900 text-sm font-mono">
                  {((adjustedPieces / 1000) * adjustedRate).toFixed(2)} {settings.currency}
                </span>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditingLog(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-200"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmApproveWithAdjust}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                حفظ واعتماد اليومية
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
