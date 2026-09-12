import React from 'react';
import { SettlementRecord, BakerySettings, WorkerProfile } from '../../types';
import { Printer, X, FileCheck, CheckCircle2, ShieldCheck, Wheat } from 'lucide-react';

interface Props {
  settlement: SettlementRecord;
  worker?: WorkerProfile;
  settings: BakerySettings;
  onClose: () => void;
}

export const PrintableSettlementModal: React.FC<Props> = ({
  settlement,
  worker,
  settings,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full text-right overflow-hidden border border-stone-300">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-stone-900 text-stone-200 px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">سند تصفية نهائي ومخالصة مالية رسمية</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة السند / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 bg-white print:p-0 text-stone-900" id="printable-voucher">
          
          {/* Bakery Header */}
          <div className="border-b-2 border-stone-800 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
                    <Wheat className="w-5 h-5" />
                  </div>
                  <h1 className="text-xl font-black text-stone-900 tracking-tight">
                    {settings.bakeryName}
                  </h1>
                </div>
                <p className="text-xs text-stone-600">
                  إدارة المخبز والإنتاج | عيش سوري وشامي آلي ونصف آلي
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  العنوان: {settings.address} | هاتف: {settings.phone}
                </p>
              </div>

              <div className="text-left" dir="ltr">
                <div className="inline-block bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-mono font-bold text-stone-800">
                  REF: {settlement.id}
                </div>
                <div className="text-xs text-stone-500 mt-1">
                  تاريخ السند: {settlement.settlementDate}
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <span className="inline-block px-6 py-1.5 bg-stone-900 text-white font-extrabold text-sm rounded-full tracking-wide">
                سند تصفية حساب نهائي ومخالصة طرف
              </span>
            </div>
          </div>

          {/* Worker Info Card */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-6">
            <div>
              <span className="text-stone-500 block">اسم العامل المكرم:</span>
              <span className="font-extrabold text-stone-900 text-sm">
                {settlement.workerName}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block">المهنة في المخبز:</span>
              <span className="font-bold text-stone-800">
                {worker?.roleTitle || 'عامل مخبز'}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block">كود العامل:</span>
              <span className="font-mono font-bold text-stone-800">
                {worker?.code || settlement.workerId}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block">الرقم القومي / الإثبات:</span>
              <span className="font-mono text-stone-700">
                {worker?.nationalId || 'مسجل بالأرشيف'}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block">تاريخ بدء العمل:</span>
              <span className="text-stone-700">{worker?.joinDate || '-'}</span>
            </div>
            <div>
              <span className="text-stone-500 block">تاريخ إنهاء العمل / الأرشفة:</span>
              <span className="text-stone-700">
                {worker?.archivedDate || settlement.settlementDate}
              </span>
            </div>
          </div>

          {/* Statement Breakdown Table */}
          <div className="mb-6">
            <h4 className="font-bold text-xs text-stone-800 mb-2">
              تفاصيل التصفية المالية للإنتاج والسلف المسجلة:
            </h4>
            <table className="w-full text-xs text-right border border-stone-200">
              <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-2.5">البند والبيان</th>
                  <th className="p-2.5 text-center">الكمية / العدد</th>
                  <th className="p-2.5 text-left">المبلغ ({settings.currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                <tr>
                  <td className="p-2.5 font-medium">
                    إجمالي إنتاج اللقم والأرغفة المعتمدة في الوردية
                  </td>
                  <td className="p-2.5 text-center font-bold">
                    {settlement.totalPieces.toLocaleString('ar-EG')} لقمة
                  </td>
                  <td className="p-2.5 text-left font-bold text-emerald-700">
                    +{settlement.totalGross.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                <tr>
                  <td className="p-2.5 font-medium">
                    إجمالي السلف اليومية والمصروفات النقدية والوجبات
                  </td>
                  <td className="p-2.5 text-center font-bold">
                    {settlement.clearedAdvancesCount} سلفة مسجلة
                  </td>
                  <td className="p-2.5 text-left font-bold text-red-600">
                    -{settlement.totalAdvances.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                <tr className="bg-amber-50/80 font-black text-sm">
                  <td className="p-3 text-stone-900">
                    صافي المستحق المسلم نقداً للعامل (التصفية النهائية)
                  </td>
                  <td className="p-3 text-center text-xs font-normal text-stone-600">
                    تم إقفال {settlement.clearedLogsCount} يومية
                  </td>
                  <td className="p-3 text-left text-amber-900 font-extrabold text-base">
                    {settlement.netPaid.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}{' '}
                    {settings.currency}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notes & Declaration */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-xs text-stone-700 mb-8 space-y-2">
            <p className="font-semibold text-stone-800">
              <strong>ملاحظات التصفية:</strong> {settlement.notes}
            </p>
            <p className="text-stone-500 leading-relaxed text-[11px]">
              إقرار واستلام: يقر العامل المذكور أعلاه بأنه استلم كامل مستحقاته المالية المترتبة على إنتاج العيش السوري والشامي، وأنه لا يحق له المطالبة بأي مبالغ أخرى عن هذه الفترة، ويعتبر هذا السند إخلاء طرف نهائي ومخالصة شاملة لكلا الطرفين.
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t-2 border-dashed border-stone-300 text-xs">
            <div className="text-center">
              <span className="block text-stone-500 mb-10">
                توقيع واستلام العامل:
              </span>
              <div className="border-b border-stone-400 max-w-[180px] mx-auto"></div>
              <span className="block font-bold text-stone-800 mt-1">
                {settlement.workerName}
              </span>
            </div>

            <div className="text-center">
              <span className="block text-stone-500 mb-10">
                مدير المخبز ومسؤول الصرف:
              </span>
              <div className="border-b border-stone-400 max-w-[180px] mx-auto"></div>
              <span className="block font-bold text-stone-800 mt-1">
                {settlement.settledBy}
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
