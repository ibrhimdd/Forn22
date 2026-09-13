import React, { useState } from 'react';
import { useBakery } from '../../context/BakeryContext';
import { FlourSupplier, FlourDelivery, FlourPayment } from '../../types';
import { SupplierStatementModal } from './flour/SupplierStatementModal';
import { AddFlourDeliveryModal } from './flour/AddFlourDeliveryModal';
import { AddFlourPaymentModal } from './flour/AddFlourPaymentModal';
import { SupplierModal } from './flour/SupplierModal';
import {
  Wheat,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Receipt,
  Building2,
  Phone,
  Calendar,
  Layers,
  Search,
  Filter,
  FileSpreadsheet,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  Coins,
  Truck,
  FileText,
} from 'lucide-react';

export type FlourSubTab = 'suppliers' | 'deliveries' | 'payments';

export const FlourManagement: React.FC = () => {
  const {
    suppliers,
    flourDeliveries,
    flourPayments,
    deleteFlourDelivery,
    deleteFlourPayment,
    deleteSupplier,
    getSupplierFinancials,
    getTotalFlourFinancials,
    settings,
  } = useBakery();

  const [activeSubTab, setActiveSubTab] = useState<FlourSubTab>('suppliers');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState<string>('all');

  // Modals state
  const [statementSupplier, setStatementSupplier] = useState<FlourSupplier | null>(null);
  const [deliveryModalSupplierId, setDeliveryModalSupplierId] = useState<string | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState<boolean>(false);
  const [paymentModalSupplierId, setPaymentModalSupplierId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [supplierToEdit, setSupplierToEdit] = useState<FlourSupplier | null>(null);
  const [showSupplierModal, setShowSupplierModal] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'supplier' | 'delivery' | 'payment';
    id: string;
    title: string;
  } | null>(null);

  const totalFinancials = getTotalFlourFinancials();

  // Filtered deliveries
  const filteredDeliveries = flourDeliveries.filter((del) => {
    const matchesSupplier =
      selectedSupplierFilter === 'all' || del.supplierId === selectedSupplierFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      del.supplierName.toLowerCase().includes(q) ||
      (del.invoiceNumber && del.invoiceNumber.toLowerCase().includes(q)) ||
      (del.truckNumber && del.truckNumber.toLowerCase().includes(q)) ||
      (del.driverName && del.driverName.toLowerCase().includes(q)) ||
      del.date.includes(q);
    return matchesSupplier && matchesQuery;
  });

  // Filtered payments
  const filteredPayments = flourPayments.filter((pay) => {
    const matchesSupplier =
      selectedSupplierFilter === 'all' || pay.supplierId === selectedSupplierFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      pay.supplierName.toLowerCase().includes(q) ||
      (pay.receiptNumber && pay.receiptNumber.toLowerCase().includes(q)) ||
      (pay.notes && pay.notes.toLowerCase().includes(q)) ||
      pay.date.includes(q);
    return matchesSupplier && matchesQuery;
  });

  // Filtered suppliers
  const filteredSuppliers = suppliers.filter((sup) => {
    const q = searchQuery.trim().toLowerCase();
    return (
      !q ||
      sup.name.toLowerCase().includes(q) ||
      sup.code.toLowerCase().includes(q) ||
      (sup.phone && sup.phone.includes(q)) ||
      (sup.flourType && sup.flourType.toLowerCase().includes(q))
    );
  });

  const handleDeleteConfirm = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'supplier') {
      deleteSupplier(deleteConfirm.id);
    } else if (deleteConfirm.type === 'delivery') {
      deleteFlourDelivery(deleteConfirm.id);
    } else if (deleteConfirm.type === 'payment') {
      deleteFlourPayment(deleteConfirm.id);
    }
    setDeleteConfirm(null);
  };

  const openAddDeliveryForSupplier = (supplierId?: string) => {
    setDeliveryModalSupplierId(supplierId || suppliers[0]?.id || null);
    setShowDeliveryModal(true);
  };

  const openAddPaymentForSupplier = (supplierId?: string) => {
    setPaymentModalSupplierId(supplierId || suppliers[0]?.id || null);
    setShowPaymentModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Banner & Flour KPI Cards */}
      <div className="bg-gradient-to-br from-amber-900 via-stone-900 to-stone-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-amber-800/40 relative overflow-hidden">
        {/* Subtle decorative background wheat element */}
        <div className="absolute left-4 -bottom-6 opacity-10 pointer-events-none">
          <Wheat className="w-56 h-56 text-amber-500" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-1.5">
                <Wheat className="w-3.5 h-3.5" />
                <span>إدارة التوريد والمشتريات</span>
              </span>
              <span className="text-stone-400 text-xs">•</span>
              <span className="text-xs text-stone-400">
                {suppliers.length} موردين ومطاحن مسجلين
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
              بند الدقيق وتوريدات المطاحن
            </h2>
            <p className="text-xs text-stone-300 max-w-2xl mt-1 leading-relaxed">
              تسجيل عمليات تنزيل الدقيق بالطن، حساب تكلفة الفواتير آلياً، تسجيل دفعات السداد المالية، ومتابعة كشف الحساب والمديونية لكل مورد على حدة.
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <button
              id="btn-add-flour-delivery"
              onClick={() => openAddDeliveryForSupplier()}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-black transition-all shadow-md flex items-center justify-center gap-2"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>تنزيل دقيق (شحنة جديدة)</span>
            </button>

            <button
              id="btn-add-flour-payment"
              onClick={() => openAddPaymentForSupplier()}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>دفع دفعة من الأموال</span>
            </button>

            <button
              id="btn-add-new-supplier"
              onClick={() => {
                setSupplierToEdit(null);
                setShowSupplierModal(true);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مورد جديد</span>
            </button>
          </div>
        </div>

        {/* 4 Core Financial Summary Cards */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-6">
          
          {/* Total Tons */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 backdrop-blur-xs">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>إجمالي الدقيق المستلم</span>
              <Wheat className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                {totalFinancials.totalTons.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-stone-400">طن</span>
            </div>
            <div className="mt-1 text-[11px] text-stone-400 font-mono">
              ~ {totalFinancials.totalBags.toLocaleString('ar-EG')} شكارة (50كجم)
            </div>
          </div>

          {/* Total Cost of Deliveries */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 backdrop-blur-xs">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>إجمالي قيمة التوريدات</span>
              <Coins className="w-4 h-4 text-stone-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {totalFinancials.totalCost.toLocaleString('ar-EG')}
              </span>
              <span className="text-xs font-bold text-stone-400">{settings.currency}</span>
            </div>
            <div className="mt-1 text-[11px] text-stone-400">
              إجمالي فواتير شحنات الدقيق
            </div>
          </div>

          {/* Total Paid */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 backdrop-blur-xs">
            <div className="flex items-center justify-between text-emerald-400 text-xs">
              <span>إجمالي الدفعات المسددة</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {totalFinancials.totalPaid.toLocaleString('ar-EG')}
              </span>
              <span className="text-xs font-bold text-stone-400">{settings.currency}</span>
            </div>
            <div className="mt-1 text-[11px] text-stone-400">
              دفعات نقدية وتحويلات وشيكات
            </div>
          </div>

          {/* Net Remaining Balance / Debt */}
          <div className="bg-amber-950/40 border border-amber-600/50 rounded-2xl p-4 backdrop-blur-xs">
            <div className="flex items-center justify-between text-amber-300 text-xs">
              <span className="font-bold">صافي المديونية المتبقية</span>
              <Receipt className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                {totalFinancials.totalBalanceRemaining.toLocaleString('ar-EG')}
              </span>
              <span className="text-xs font-bold text-stone-400">{settings.currency}</span>
            </div>
            <div className="mt-1 text-[11px] text-amber-200/80">
              {totalFinancials.totalBalanceRemaining > 0
                ? 'مستحقة للموردين والمطاحن'
                : 'كافة الحسابات مسددة بالكامل'}
            </div>
          </div>

        </div>

      </div>

      {/* Sub Navigation Bar & Search Filters */}
      <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto p-1 bg-stone-100 rounded-xl">
          <button
            id="subtab-suppliers"
            onClick={() => setActiveSubTab('suppliers')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'suppliers'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>حسابات الموردين والمطاحن ({suppliers.length})</span>
          </button>

          <button
            id="subtab-deliveries"
            onClick={() => setActiveSubTab('deliveries')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'deliveries'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>سجل تنزيل الدقيق ({flourDeliveries.length})</span>
          </button>

          <button
            id="subtab-payments"
            onClick={() => setActiveSubTab('payments')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'payments'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>سجل الدفعات والمسددات ({flourPayments.length})</span>
          </button>
        </div>

        {/* Search & Supplier Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Supplier dropdown filter for deliveries/payments */}
          {activeSubTab !== 'suppliers' && (
            <select
              value={selectedSupplierFilter}
              onChange={(e) => setSelectedSupplierFilter(e.target.value)}
              className="p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-700"
            >
              <option value="all">جميع الموردين</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              placeholder="بحث بالاسم، الفاتورة، التاريخ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:bg-white"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: SUPPLIERS LIST & ACCOUNTS SUMMARY                                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'suppliers' && (
        <div className="space-y-4">
          
          {filteredSuppliers.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
              <Wheat className="w-12 h-12 text-amber-500/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-800">لا يوجد موردين دقيق مطابقين</h3>
              <p className="text-xs text-stone-500 mt-1 mb-4">
                يمكنك تسجيل مورد جديد للبدء في تتبع شحنات الدقيق وكشوف الحسابات.
              </p>
              <button
                onClick={() => {
                  setSupplierToEdit(null);
                  setShowSupplierModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                إضافة مورد دقيق الآن
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuppliers.map((supplier) => {
                const fin = getSupplierFinancials(supplier.id);
                return (
                  <div
                    key={supplier.id}
                    className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    {/* Supplier Header */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-black">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-black text-sm text-stone-900 leading-snug">
                              {supplier.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-stone-100 text-stone-600">
                                {supplier.code}
                              </span>
                              {supplier.flourType && (
                                <span className="text-[11px] text-amber-800 font-medium truncate max-w-[150px]">
                                  {supplier.flourType}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Edit & Delete Action Menu */}
                        <div className="flex items-center gap-1">
                          <button
                            title="تعديل بيانات المورد"
                            onClick={() => {
                              setSupplierToEdit(supplier);
                              setShowSupplierModal(true);
                            }}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="حذف المورد"
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'supplier',
                                id: supplier.id,
                                title: `المورد ${supplier.name}`,
                              })
                            }
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Contact details */}
                      <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          <span dir="ltr" className="font-mono text-[11px] text-stone-700 font-semibold">
                            {supplier.phone || 'بدون هاتف'}
                          </span>
                        </div>
                        {supplier.contactPerson && (
                          <span className="text-[11px] text-stone-500">
                            المسؤول: {supplier.contactPerson}
                          </span>
                        )}
                      </div>

                      {/* Balance & Statistics Card */}
                      <div className="mt-4 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-500">إجمالي التوريدات ({fin.deliveriesCount}):</span>
                          <span className="font-bold text-stone-900 font-mono">
                            {fin.totalTons.toFixed(1)} طن ({fin.totalCost.toLocaleString('ar-EG')} {settings.currency})
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-500">إجمالي المسدد ({fin.paymentsCount}):</span>
                          <span className="font-bold text-emerald-700 font-mono">
                            {fin.totalPaid.toLocaleString('ar-EG')} {settings.currency}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                          <span className="text-xs font-black text-stone-800">
                            الرصيد المتبقي له:
                          </span>
                          <span
                            className={`text-sm font-black font-mono px-2 py-0.5 rounded-lg ${
                              fin.balanceRemaining > 0
                                ? 'bg-amber-100 text-amber-950 border border-amber-300'
                                : fin.balanceRemaining < 0
                                ? 'bg-blue-100 text-blue-900'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {fin.balanceRemaining.toLocaleString('ar-EG')} {settings.currency}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons for this supplier */}
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-1.5">
                      <button
                        onClick={() => setStatementSupplier(supplier)}
                        className="flex-1 py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                        <span>كشف الحساب وطباعة</span>
                      </button>

                      <button
                        title="تنزيل دقيق من هذا المورد"
                        onClick={() => openAddDeliveryForSupplier(supplier.id)}
                        className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
                      >
                        <ArrowDownLeft className="w-4 h-4" />
                      </button>

                      <button
                        title="سداد دفعة لهذا المورد"
                        onClick={() => openAddPaymentForSupplier(supplier.id)}
                        className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition-colors"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: FLOUR DELIVERIES (UNLOADING) LOG TABLE                             */}
      {/* ========================================================================= */}
      {activeSubTab === 'deliveries' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          
          <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-50/60">
            <div>
              <h3 className="font-black text-sm sm:text-base text-stone-900 flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-amber-600" />
                <span>سجل عمليات تنزيل الدقيق (شحنات التوريد)</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                متابعة عدد الأطنان المستلمة في كل عملية مع سعر الطن والتكلفة المحسوبة
              </p>
            </div>

            <button
              onClick={() => openAddDeliveryForSupplier()}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>تنزيل دقيق جديد</span>
            </button>
          </div>

          {filteredDeliveries.length === 0 ? (
            <div className="p-12 text-center text-stone-400 text-xs">
              لا توجد عمليات تنزيل دقيق مطابقة للبحث.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200 text-[11px]">
                  <tr>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">المورد / المطحن</th>
                    <th className="p-3 text-center">الكمية المنزلة</th>
                    <th className="p-3 text-center">سعر الطن</th>
                    <th className="p-3 text-left">إجمالي الفاتورة</th>
                    <th className="p-3">رقم الإذن / الفاتورة</th>
                    <th className="p-3">السيارة / السائق</th>
                    <th className="p-3">ملاحظات</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {filteredDeliveries.map((del) => (
                    <tr key={del.id} className="hover:bg-stone-50/80 transition-colors">
                      {/* Date */}
                      <td className="p-3 font-mono text-stone-600 whitespace-nowrap">
                        {del.date}
                      </td>

                      {/* Supplier */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-bold text-stone-900">{del.supplierName}</div>
                      </td>

                      {/* Tons & Bags */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className="font-black text-amber-900 text-sm font-mono">
                          {del.tons} طن
                        </span>
                        <span className="text-[10px] text-stone-400 block font-mono">
                          ~ {del.bagsCount || Math.round(del.tons * 20)} شكارة
                        </span>
                      </td>

                      {/* Price Per Ton */}
                      <td className="p-3 text-center font-mono font-bold text-stone-700 whitespace-nowrap">
                        {del.pricePerTon.toLocaleString('ar-EG')} {settings.currency}
                      </td>

                      {/* Total Cost */}
                      <td className="p-3 text-left font-mono font-black text-amber-950 text-sm whitespace-nowrap">
                        {del.totalCost.toLocaleString('ar-EG')} {settings.currency}
                      </td>

                      {/* Invoice */}
                      <td className="p-3 font-mono text-stone-600 whitespace-nowrap">
                        {del.invoiceNumber ? (
                          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 text-[10px] font-bold">
                            {del.invoiceNumber}
                          </span>
                        ) : (
                          <span className="text-stone-300">-</span>
                        )}
                      </td>

                      {/* Truck & Driver */}
                      <td className="p-3 text-stone-600 whitespace-nowrap">
                        {del.truckNumber || del.driverName ? (
                          <div className="text-[11px]">
                            {del.truckNumber && <div>سيارة: {del.truckNumber}</div>}
                            {del.driverName && <div className="text-stone-400">سائق: {del.driverName}</div>}
                          </div>
                        ) : (
                          <span className="text-stone-300">-</span>
                        )}
                      </td>

                      {/* Notes */}
                      <td className="p-3 text-stone-500 max-w-xs truncate">
                        {del.notes || '-'}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <button
                          title="حذف عملية التنزيل"
                          onClick={() =>
                            setDeleteConfirm({
                              type: 'delivery',
                              id: del.id,
                              title: `شحنة ${del.tons} طن من ${del.supplierName} بتاريخ ${del.date}`,
                            })
                          }
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: FLOUR PAYMENTS LOG TABLE                                           */}
      {/* ========================================================================= */}
      {activeSubTab === 'payments' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          
          <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-50/60">
            <div>
              <h3 className="font-black text-sm sm:text-base text-stone-900 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                <span>سجل الدفعات المالية المسددة للمطاحن</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                توثيق الدفعات النقدية والشيكات والتحويلات المخصومة من رصيد كل مورد
              </p>
            </div>

            <button
              onClick={() => openAddPaymentForSupplier()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>دفع دفعة جديدة</span>
            </button>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center text-stone-400 text-xs">
              لا توجد دفعات مالية مسجلة مطابقة للبحث.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200 text-[11px]">
                  <tr>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">المورد / المستفيد</th>
                    <th className="p-3 text-left">مبلغ الدفعة</th>
                    <th className="p-3">طريقة السداد</th>
                    <th className="p-3">رقم الإيصال / السند</th>
                    <th className="p-3">البيان والملاحظات</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {filteredPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-stone-50/80 transition-colors">
                      {/* Date */}
                      <td className="p-3 font-mono text-stone-600 whitespace-nowrap">
                        {pay.date}
                      </td>

                      {/* Supplier */}
                      <td className="p-3 whitespace-nowrap font-bold text-stone-900">
                        {pay.supplierName}
                      </td>

                      {/* Amount */}
                      <td className="p-3 text-left font-mono font-black text-emerald-800 text-sm whitespace-nowrap">
                        {pay.amount.toLocaleString('ar-EG')} {settings.currency}
                      </td>

                      {/* Payment Method */}
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            pay.paymentMethod === 'cash'
                              ? 'bg-emerald-100 text-emerald-800'
                              : pay.paymentMethod === 'transfer'
                              ? 'bg-blue-100 text-blue-800'
                              : pay.paymentMethod === 'cheque'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-stone-100 text-stone-800'
                          }`}
                        >
                          {pay.paymentMethod === 'cash'
                            ? 'نقدي (كاش)'
                            : pay.paymentMethod === 'transfer'
                            ? 'تحويل بنكي / إنستاباي'
                            : pay.paymentMethod === 'cheque'
                            ? 'شيك مصرفي'
                            : pay.paymentMethod === 'vodafone_cash'
                            ? 'محفظة إلكترونية'
                            : 'أخرى'}
                        </span>
                      </td>

                      {/* Receipt */}
                      <td className="p-3 font-mono text-stone-600 whitespace-nowrap">
                        {pay.receiptNumber ? (
                          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 text-[10px] font-bold">
                            {pay.receiptNumber}
                          </span>
                        ) : (
                          <span className="text-stone-300">-</span>
                        )}
                      </td>

                      {/* Notes */}
                      <td className="p-3 text-stone-500 max-w-sm truncate">
                        {pay.notes || '-'}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <button
                          title="حذف الدفعة"
                          onClick={() =>
                            setDeleteConfirm({
                              type: 'payment',
                              id: pay.id,
                              title: `دفعة ${pay.amount.toLocaleString('ar-EG')} ${settings.currency} للمورد ${pay.supplierName}`,
                            })
                          }
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS                                                                    */}
      {/* ========================================================================= */}

      {/* 1. Supplier Detailed Statement & Print Modal */}
      {statementSupplier && (
        <SupplierStatementModal
          supplier={statementSupplier}
          onClose={() => setStatementSupplier(null)}
          onAddDelivery={() => {
            setDeliveryModalSupplierId(statementSupplier.id);
            setShowDeliveryModal(true);
          }}
          onAddPayment={() => {
            setPaymentModalSupplierId(statementSupplier.id);
            setShowPaymentModal(true);
          }}
        />
      )}

      {/* 2. Add Flour Delivery Modal */}
      {showDeliveryModal && (
        <AddFlourDeliveryModal
          initialSupplierId={deliveryModalSupplierId || undefined}
          onClose={() => {
            setShowDeliveryModal(false);
            setDeliveryModalSupplierId(null);
          }}
          onOpenNewSupplierModal={() => {
            setShowDeliveryModal(false);
            setSupplierToEdit(null);
            setShowSupplierModal(true);
          }}
        />
      )}

      {/* 3. Add Flour Payment Modal */}
      {showPaymentModal && (
        <AddFlourPaymentModal
          initialSupplierId={paymentModalSupplierId || undefined}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentModalSupplierId(null);
          }}
        />
      )}

      {/* 4. Add / Edit Supplier Modal */}
      {showSupplierModal && (
        <SupplierModal
          supplier={supplierToEdit}
          onClose={() => {
            setShowSupplierModal(false);
            setSupplierToEdit(null);
          }}
        />
      )}

      {/* 5. Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-sm w-full text-right shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800 text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white text-center mb-2">
              تأكيد الحذف النهائي
            </h3>
            <p className="text-xs text-stone-300 text-center mb-6 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف {deleteConfirm.title}؟ لا يمكن التراجع عن هذه الخطوة.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
