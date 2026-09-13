import React, { useState, useEffect } from 'react';
import { useBakery } from '../../../context/BakeryContext';
import {
  X,
  Wheat,
  Calendar,
  Layers,
  Coins,
  CheckCircle2,
  AlertCircle,
  Truck,
  FileText,
  User,
  Plus,
} from 'lucide-react';

interface AddFlourDeliveryModalProps {
  initialSupplierId?: string;
  onClose: () => void;
  onOpenNewSupplierModal?: () => void;
}

export const AddFlourDeliveryModal: React.FC<AddFlourDeliveryModalProps> = ({
  initialSupplierId,
  onClose,
  onOpenNewSupplierModal,
}) => {
  const { suppliers, addFlourDelivery, settings } = useBakery();

  const [supplierId, setSupplierId] = useState<string>(() => {
    if (initialSupplierId && suppliers.some((s) => s.id === initialSupplierId)) {
      return initialSupplierId;
    }
    return suppliers[0]?.id || '';
  });

  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [tons, setTons] = useState<string>('5');
  const [pricePerTon, setPricePerTon] = useState<string>('16000');
  const [customBags, setCustomBags] = useState<string>('100');
  const [isManualBags, setIsManualBags] = useState<boolean>(false);
  const [driverName, setDriverName] = useState<string>('');
  const [truckNumber, setTruckNumber] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Auto calculate bags when tons changes, unless manual
  useEffect(() => {
    const tonsNum = Number(tons);
    if (!isManualBags && !isNaN(tonsNum) && tonsNum > 0) {
      setCustomBags(String(Math.round(tonsNum * 20)));
    }
  }, [tons, isManualBags]);

  const tonsNum = Number(tons) || 0;
  const priceNum = Number(pricePerTon) || 0;
  const totalCost = tonsNum * priceNum;
  const bagsNum = Number(customBags) || Math.round(tonsNum * 20);

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!supplierId) {
      setError('يرجى اختيار المورد أو المطحن المسجل');
      return;
    }

    if (tonsNum <= 0) {
      setError('يرجى إدخال عدد الأطنان بشكل صحيح (أكبر من 0)');
      return;
    }

    if (priceNum <= 0) {
      setError('يرجى إدخال سعر الطن بشكل صحيح');
      return;
    }

    addFlourDelivery({
      supplierId,
      date,
      tons: tonsNum,
      bagsCount: bagsNum,
      pricePerTon: priceNum,
      driverName: driverName.trim() || undefined,
      truckNumber: truckNumber.trim() || undefined,
      invoiceNumber: invoiceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 text-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-5 sm:p-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Wheat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                تسجيل تنزيل دقيق (شحنة توريد جديدة)
              </h3>
              <p className="text-xs text-stone-400">
                إدخال كمية الأطنان المستلمة وحساب إجمالي الفاتورة آلياً
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Supplier Select */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-300">
                المورد / المطحن: *
              </label>
              {onOpenNewSupplierModal && (
                <button
                  type="button"
                  onClick={onOpenNewSupplierModal}
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة مورد جديد</span>
                </button>
              )}
            </div>
            {suppliers.length === 0 ? (
              <div className="p-3 bg-stone-800 rounded-xl text-xs text-amber-300">
                لا يوجد موردين مسجلين بعد. اضغط «إضافة مورد جديد» أولاً.
              </div>
            ) : (
              <select
                required
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs font-bold focus:ring-2 focus:ring-amber-500"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code}) {s.flourType ? `• ${s.flourType}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Grid: Quantity (Tons) & Price Per Ton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tons */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                الكمية المنزلة (بالطن): *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  autoFocus
                  min="0.1"
                  step="0.1"
                  dir="ltr"
                  placeholder="مثال: 5"
                  value={tons}
                  onChange={(e) => {
                    setError('');
                    setTons(e.target.value);
                  }}
                  className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-amber-400 font-mono text-base font-black focus:ring-2 focus:ring-amber-500 text-center"
                />
                <span className="absolute left-3 top-3 text-xs text-stone-500 font-bold">
                  طن
                </span>
              </div>

              {/* Quick Tons Pills */}
              <div className="flex items-center gap-1 mt-1.5 flex-wrap justify-center">
                {[2, 3, 5, 8, 10, 15].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setTons(String(val));
                      setIsManualBags(false);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold border transition-colors ${
                      Number(tons) === val
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-white'
                    }`}
                  >
                    {val} طن
                  </button>
                ))}
              </div>
            </div>

            {/* Price Per Ton */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                سعر الطن الواحد ({settings.currency}): *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  step="50"
                  dir="ltr"
                  placeholder="مثال: 16000"
                  value={pricePerTon}
                  onChange={(e) => {
                    setError('');
                    setPricePerTon(e.target.value);
                  }}
                  className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white font-mono text-base font-black focus:ring-2 focus:ring-amber-500 text-center"
                />
                <span className="absolute left-3 top-3 text-xs text-stone-500 font-bold">
                  {settings.currency}
                </span>
              </div>

              {/* Quick Price Pills */}
              <div className="flex items-center gap-1 mt-1.5 flex-wrap justify-center">
                {[15000, 15500, 16000, 16500, 17000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPricePerTon(String(val))}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition-colors ${
                      Number(pricePerTon) === val
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-white'
                    }`}
                  >
                    {val.toLocaleString('ar-EG')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Automatic Live Calculation Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-transparent border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-400 font-black block">
                الحساب الآلي لإجمالي التوريدة:
              </span>
              <span className="text-[11px] text-stone-400 font-mono mt-0.5 block">
                {tonsNum} طن × {priceNum.toLocaleString('ar-EG')} {settings.currency}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                ~ يعادل {bagsNum} شكارة زنة 50 كجم
              </span>
            </div>
            <div className="text-left">
              <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                {totalCost.toLocaleString('ar-EG')}
              </span>
              <span className="text-xs text-stone-400 mr-1 font-bold">{settings.currency}</span>
            </div>
          </div>

          {/* Grid: Date & Estimated Bags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                تاريخ وصول وتنزيل الشحنة: *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                عدد الشكاير الفعلي (50 كجم):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  dir="ltr"
                  value={customBags}
                  onChange={(e) => {
                    setIsManualBags(true);
                    setCustomBags(e.target.value);
                  }}
                  className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white font-mono text-xs font-bold text-center"
                />
                <span className="absolute left-3 top-2.5 text-[11px] text-stone-500">
                  شكارة
                </span>
              </div>
            </div>
          </div>

          {/* Grid: Invoice Number, Truck & Driver */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <label className="block font-semibold text-stone-300 mb-1">
                رقم الفاتورة / الإذن:
              </label>
              <input
                type="text"
                placeholder="INV-001"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full p-2 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-300 mb-1">
                رقم السيارة:
              </label>
              <input
                type="text"
                placeholder="مثال: ط ر ج ٤١٩"
                value={truckNumber}
                onChange={(e) => setTruckNumber(e.target.value)}
                className="w-full p-2 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-300 mb-1">
                اسم السائق:
              </label>
              <input
                type="text"
                placeholder="اسم السائق"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full p-2 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              ملاحظات الشحنة والتفريغ (اختياري):
            </label>
            <input
              type="text"
              placeholder="مثال: دقيق فاخر استخراج 72% درجة أولى..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              id="submit-flour-delivery-btn"
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs shadow-lg shadow-amber-900/30 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>حفظ واعتماد التنزيل في الحساب فوراً</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition-colors"
            >
              إلغاء
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
