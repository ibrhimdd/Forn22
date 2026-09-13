import React from 'react';
import { FlourSupplier, SupplierFinancials } from '../../../types';
import { useBakery } from '../../../context/BakeryContext';
import {
  X,
  Printer,
  Wheat,
  Phone,
  MapPin,
  Calendar,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Building2,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface SupplierStatementModalProps {
  supplier: FlourSupplier;
  onClose: () => void;
  onAddDelivery: () => void;
  onAddPayment: () => void;
}

export const SupplierStatementModal: React.FC<SupplierStatementModalProps> = ({
  supplier,
  onClose,
  onAddDelivery,
  onAddPayment,
}) => {
  const {
    settings,
    flourDeliveries,
    flourPayments,
    getSupplierFinancials,
  } = useBakery();

  const financials: SupplierFinancials = getSupplierFinancials(supplier.id);

  // Deliveries and payments for this supplier
  const supDeliveries = flourDeliveries
    .filter((d) => d.supplierId === supplier.id)
    .map((d) => ({
      id: d.id,
      date: d.date,
      type: 'delivery' as const,
      tons: d.tons,
      bags: d.bagsCount || Math.round(d.tons * 20),
      rate: d.pricePerTon,
      charge: d.totalCost, // استحقاق / وارد
      paid: 0,
      ref: d.invoiceNumber || (d.truckNumber ? `سيارة ${d.truckNumber}` : 'إذن تنزيل'),
      notes: d.notes || `تنزيل ${d.tons} طن دقيق`,
      driver: d.driverName,
      truck: d.truckNumber,
      createdAt: d.createdAt,
    }));

  const supPayments = flourPayments
    .filter((p) => p.supplierId === supplier.id)
    .map((p) => ({
      id: p.id,
      date: p.date,
      type: 'payment' as const,
      tons: 0,
      bags: 0,
      rate: 0,
      charge: 0,
      paid: p.amount, // مسدد
      ref: p.receiptNumber || 'إيصال دفع',
      notes: p.notes || (p.paymentMethod === 'cash' ? 'سداد نقدي كاش' : `سداد (${p.paymentMethod})`),
      driver: undefined,
      truck: undefined,
      createdAt: p.createdAt,
    }));

  // Combine and sort chronologically (oldest to newest for running balance)
  const combinedChronological = [...supDeliveries, ...supPayments].sort((a, b) => {
    const cmp = a.date.localeCompare(b.date);
    if (cmp !== 0) return cmp;
    return a.createdAt.localeCompare(b.createdAt);
  });

  // Calculate running balances
  let running = 0;
  const ledgerWithBalance = combinedChronological.map((item) => {
    running += item.charge - item.paid;
    return {
      ...item,
      runningBalance: running,
    };
  });

  // Reverse for display (most recent on top) or keep chronologic?
  // In accounting statements, chronological or reverse with initial balance works.
  // We'll show chronological order with total footer.

  const handlePrint = () => {
    window.print();
  };

  const getMethodBadge = (item: typeof supPayments[0]) => {
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
        سداد دفعة
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar (Hidden in Print) */}
        <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
              <Wheat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  كشف حساب مورد دقيق: {supplier.name}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-stone-800 text-amber-400 font-mono text-xs font-bold border border-stone-700">
                  {supplier.code}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                متابعة حركة تنزيل الأطنان وفواتير الدقيق والمسددات وصافي الرصيد
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="print-supplier-statement-btn"
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة كشف الحساب</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Shortcuts Bar (Hidden in Print) */}
        <div className="px-4 sm:px-6 py-2.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between gap-2 flex-wrap no-print">
          <div className="text-xs text-stone-600 flex items-center gap-2">
            <span>إجمالي الحركات:</span>
            <span className="font-bold text-stone-900">{ledgerWithBalance.length} عملية</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAddDelivery}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>تنزيل دقيق جديد</span>
            </button>
            <button
              type="button"
              onClick={onAddPayment}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>سداد دفعة للمورد</span>
            </button>
          </div>
        </div>

        {/* Scrollable Printable Statement Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 text-stone-900 bg-white">
          
          {/* Printable Invoice-style Header */}
          <div className="border-b-2 border-amber-600 pb-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Wheat className="w-6 h-6 text-amber-600" />
                  <h1 className="text-xl font-black text-stone-900">
                    {settings.bakeryName}
                  </h1>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  إدارة المشتريات وتوريد دقيق العيش السوري والشامي
                </p>
                <div className="flex items-center gap-3 text-xs text-stone-600 mt-1.5 font-mono">
                  <span>هاتف المخبز: {settings.phone}</span>
                  <span>•</span>
                  <span>{settings.address}</span>
                </div>
              </div>

              <div className="text-right sm:text-left bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <span className="text-[11px] font-bold text-stone-500 block uppercase tracking-wider">
                  كشف حساب مورد دقيق رسمي
                </span>
                <span className="text-xs text-stone-700 block font-mono mt-0.5">
                  تاريخ الاستخراج: {new Date().toLocaleDateString('ar-EG')}
                </span>
                <span className="text-xs font-bold text-amber-700 block mt-0.5">
                  كود المورد: {supplier.code}
                </span>
              </div>
            </div>

            {/* Supplier Info Card */}
            <div className="mt-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-600/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-stone-500 block">اسم المورد / المطحن:</span>
                <span className="font-black text-stone-900 text-sm mt-0.5 block">
                  {supplier.name}
                </span>
                {supplier.contactPerson && (
                  <span className="text-stone-600 block text-[11px] mt-0.5">
                    المسؤول: {supplier.contactPerson}
                  </span>
                )}
              </div>

              <div>
                <span className="text-stone-500 block">رقم الهاتف والتواصل:</span>
                <span className="font-bold font-mono text-stone-900 mt-0.5 block" dir="ltr">
                  {supplier.phone || 'غير مسجل'}
                </span>
                {supplier.address && (
                  <span className="text-stone-600 block text-[11px] mt-0.5">
                    المقر: {supplier.address}
                  </span>
                )}
              </div>

              <div>
                <span className="text-stone-500 block">نوع الدقيق المعتمد:</span>
                <span className="font-bold text-amber-800 mt-0.5 block">
                  {supplier.flourType || 'دقيق فاخر استخراج 72%'}
                </span>
                {supplier.notes && (
                  <span className="text-stone-500 block text-[11px] mt-0.5 italic">
                    {supplier.notes}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-semibold text-stone-500 block">
                إجمالي الدقيق المستلم
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-black text-stone-900 font-mono">
                  {financials.totalTons.toFixed(2)}
                </span>
                <span className="text-xs text-stone-500 font-bold">طن</span>
              </div>
              <span className="text-[10px] text-stone-400 mt-0.5 block font-mono">
                ~ {financials.totalBags.toLocaleString('ar-EG')} شكارة (50كجم)
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-semibold text-stone-500 block">
                إجمالي ثمن التوريدات
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-black text-stone-900 font-mono">
                  {financials.totalCost.toLocaleString('ar-EG')}
                </span>
                <span className="text-xs text-stone-500">{settings.currency}</span>
              </div>
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                {financials.deliveriesCount} شحنات تنزيل
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[11px] font-semibold text-emerald-700 block">
                إجمالي الدفعات المسددة
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-black text-emerald-800 font-mono">
                  {financials.totalPaid.toLocaleString('ar-EG')}
                </span>
                <span className="text-xs text-emerald-600">{settings.currency}</span>
              </div>
              <span className="text-[10px] text-emerald-600 mt-0.5 block">
                {financials.paymentsCount} دفعات مدفوعة
              </span>
            </div>

            <div
              className={`p-3 rounded-2xl border ${
                financials.balanceRemaining > 0
                  ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300'
                  : financials.balanceRemaining < 0
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-emerald-50 border-emerald-300'
              }`}
            >
              <span className="text-[11px] font-bold block">
                {financials.balanceRemaining > 0
                  ? 'الرصيد المتبقي له (مستحق)'
                  : financials.balanceRemaining < 0
                  ? 'رصيد زائد / دفعات مقدمة'
                  : 'الحساب خالص بالكامل'}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span
                  className={`text-lg sm:text-xl font-black font-mono ${
                    financials.balanceRemaining > 0
                      ? 'text-amber-900'
                      : financials.balanceRemaining < 0
                      ? 'text-blue-900'
                      : 'text-emerald-700'
                  }`}
                >
                  {Math.abs(financials.balanceRemaining).toLocaleString('ar-EG')}
                </span>
                <span className="text-xs font-bold">{settings.currency}</span>
              </div>
              <span className="text-[10px] text-stone-500 mt-0.5 block">
                {financials.balanceRemaining === 0 ? 'لا توجد مديونية' : 'حتى تاريخ اليوم'}
              </span>
            </div>
          </div>

          {/* Detailed Combined Ledger Table */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-stone-50 px-4 py-3 border-b border-stone-200 flex items-center justify-between">
              <h3 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-600" />
                <span>جدول حركة كشف الحساب التراكمي (التوريدات والمسددات)</span>
              </h3>
              <span className="text-[11px] text-stone-500 font-mono">
                عملة الحساب: {settings.currency}
              </span>
            </div>

            {ledgerWithBalance.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs">
                لا توجد عمليات مسجلة لهذا المورد حتى الآن.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200 text-[11px]">
                    <tr>
                      <th className="p-2.5">التاريخ</th>
                      <th className="p-2.5">نوع الحركة</th>
                      <th className="p-2.5">البيان والتفاصيل</th>
                      <th className="p-2.5 text-center">الكمية</th>
                      <th className="p-2.5 text-center">سعر الطن</th>
                      <th className="p-2.5 text-left text-amber-900">وارد / استحقاق (+)</th>
                      <th className="p-2.5 text-left text-emerald-800">منصرف / مسدد (-)</th>
                      <th className="p-2.5 text-left font-mono">الرصيد التراكمي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {ledgerWithBalance.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-stone-50/80 transition-colors ${
                          item.type === 'delivery' ? 'bg-white' : 'bg-emerald-50/20'
                        }`}
                      >
                        {/* Date */}
                        <td className="p-2.5 font-mono text-stone-600 whitespace-nowrap">
                          {item.date}
                        </td>

                        {/* Movement Type */}
                        <td className="p-2.5 whitespace-nowrap">
                          {item.type === 'delivery' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <ArrowDownLeft className="w-3 h-3 text-amber-700" />
                              <span>تنزيل دقيق</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <ArrowUpRight className="w-3 h-3 text-emerald-700" />
                              <span>دفعة سداد</span>
                            </span>
                          )}
                        </td>

                        {/* Details */}
                        <td className="p-2.5">
                          <div className="font-semibold text-stone-900">{item.notes}</div>
                          <div className="text-[10px] text-stone-500 flex items-center gap-2 mt-0.5">
                            {item.ref && <span>مستند: {item.ref}</span>}
                            {item.driver && <span>• السائق: {item.driver}</span>}
                            {item.truck && <span>• سيارة: {item.truck}</span>}
                          </div>
                        </td>

                        {/* Quantity */}
                        <td className="p-2.5 text-center font-mono whitespace-nowrap">
                          {item.type === 'delivery' ? (
                            <div>
                              <span className="font-bold text-stone-900">{item.tons} طن</span>
                              <span className="text-[10px] text-stone-500 block font-mono">
                                ({item.bags} ش)
                              </span>
                            </div>
                          ) : (
                            <span className="text-stone-300">-</span>
                          )}
                        </td>

                        {/* Rate */}
                        <td className="p-2.5 text-center font-mono whitespace-nowrap">
                          {item.type === 'delivery' ? (
                            <span className="font-bold text-stone-700">
                              {item.rate.toLocaleString('ar-EG')}
                            </span>
                          ) : (
                            <span className="text-stone-300">-</span>
                          )}
                        </td>

                        {/* Charge (Delivery Cost) */}
                        <td className="p-2.5 text-left font-mono font-bold text-amber-900 whitespace-nowrap">
                          {item.charge > 0 ? item.charge.toLocaleString('ar-EG') : '-'}
                        </td>

                        {/* Paid */}
                        <td className="p-2.5 text-left font-mono font-bold text-emerald-700 whitespace-nowrap">
                          {item.paid > 0 ? item.paid.toLocaleString('ar-EG') : '-'}
                        </td>

                        {/* Running Balance */}
                        <td className="p-2.5 text-left font-mono font-black text-stone-900 whitespace-nowrap bg-stone-50/50">
                          {item.runningBalance.toLocaleString('ar-EG')} {settings.currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Totals Footer */}
                  <tfoot className="bg-stone-100 font-black text-xs border-t-2 border-stone-300 text-stone-900">
                    <tr>
                      <td colSpan={3} className="p-3 text-right">
                        الإجماليات الكلية:
                      </td>
                      <td className="p-3 text-center font-mono">
                        {financials.totalTons.toFixed(2)} طن
                      </td>
                      <td className="p-3 text-center">-</td>
                      <td className="p-3 text-left font-mono text-amber-950">
                        {financials.totalCost.toLocaleString('ar-EG')}
                      </td>
                      <td className="p-3 text-left font-mono text-emerald-800">
                        {financials.totalPaid.toLocaleString('ar-EG')}
                      </td>
                      <td className="p-3 text-left font-mono text-stone-950 bg-stone-200/70">
                        {financials.balanceRemaining.toLocaleString('ar-EG')} {settings.currency}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Legal / Signatures Section for Official Paperwork */}
          <div className="pt-8 border-t border-stone-200 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-stone-600">
            <div>
              <p className="font-bold text-stone-800 mb-6">توقيع المستلم / مسؤول المخبز:</p>
              <div className="border-b border-stone-300 w-36"></div>
              <p className="text-[10px] text-stone-400 mt-1">{settings.ownerName || 'مدير المخبز'}</p>
            </div>

            <div>
              <p className="font-bold text-stone-800 mb-6">توقيع المورد / مندوب المطحن:</p>
              <div className="border-b border-stone-300 w-36"></div>
              <p className="text-[10px] text-stone-400 mt-1">{supplier.contactPerson || supplier.name}</p>
            </div>

            <div className="col-span-2 sm:col-span-1 text-left">
              <p className="font-bold text-stone-800 mb-1">خاتم واعتماد الإدارة:</p>
              <div className="w-24 h-16 border border-dashed border-stone-300 rounded-xl flex items-center justify-center text-[10px] text-stone-400">
                خاتم المخبز
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
