import React, { useState } from 'react';
import { useBakery } from '../../../context/BakeryContext';
import { FlourPaymentMethod } from '../../../types';
import {
  X,
  Coins,
  Calendar,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Receipt,
  CreditCard,
  Building2,
  Banknote,
} from 'lucide-react';

interface AddFlourPaymentModalProps {
  initialSupplierId?: string;
  onClose: () => void;
}

export const AddFlourPaymentModal: React.FC<AddFlourPaymentModalProps> = ({
  initialSupplierId,
  onClose,
}) => {
  const {
    suppliers,
    addFlourPayment,
    getSupplierFinancials,
    settings,
  } = useBakery();

  const [supplierId, setSupplierId] = useState<string>(() => {
    if (initialSupplierId && suppliers.some((s) => s.id === initialSupplierId)) {
      return initialSupplierId;
    }
    return suppliers[0]?.id || '';
  });

  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<string>('10000');
  const [paymentMethod, setPaymentMethod] = useState<FlourPaymentMethod>('cash');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);
  const financials = selectedSupplier ? getSupplierFinancials(selectedSupplier.id) : null;
  const currentBalance = financials?.balanceRemaining ?? 0;

  const amountNum = Number(amount) || 0;
  const remainingAfterPayment = currentBalance - amountNum;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!supplierId) {
      setError('يرجى اختيار المورد أو المطحن المسدد له');
      return;
    }

    if (amountNum <= 0) {
      setError('يرجى إدخال مبلغ صحيح أكبر من صفر');
      return;
    }

    addFlourPayment({
      supplierId,
      date,
      amount: amountNum,
      paymentMethod,
      receiptNumber: receiptNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 text-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-5 sm:p-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                دفع دفعة من الأموال للمورد
              </h3>
              <p className="text-xs text-stone-400">
                تسجيل سداد نقدي أو تحويل وتحديث رصيد المطحن
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
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              المورد / المطحن المستفيد: *
            </label>
            <select
              required
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500"
            >
              {suppliers.map((s) => {
                const fin = getSupplierFinancials(s.id);
                return (
                  <option key={s.id} value={s.id}>
                    {s.name} (متبقي له: {fin.balanceRemaining.toLocaleString('ar-EG')} {settings.currency})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Current Balance Notification Box */}
          {selectedSupplier && (
            <div className="p-3 rounded-2xl bg-stone-800/90 border border-stone-700 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-400 block font-medium">
                  الرصيد المستحق الحالي للمورد:
                </span>
                <span className="text-xs text-stone-300 font-bold">
                  {selectedSupplier.name}
                </span>
              </div>
              <div className="text-left">
                <span
                  className={`text-base font-black font-mono ${
                    currentBalance > 0
                      ? 'text-amber-400'
                      : currentBalance < 0
                      ? 'text-blue-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {currentBalance.toLocaleString('ar-EG')}
                </span>
                <span className="text-[11px] text-stone-400 mr-1">{settings.currency}</span>
              </div>
            </div>
          )}

          {/* Amount Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-300">
                مبلغ الدفعة المسددة ({settings.currency}): *
              </label>
              {currentBalance > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(String(currentBalance))}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline transition-colors"
                >
                  سداد كامل الرصيد المتبقي
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                required
                autoFocus
                min="1"
                step="100"
                dir="ltr"
                placeholder="مثال: 20000"
                value={amount}
                onChange={(e) => {
                  setError('');
                  setAmount(e.target.value);
                }}
                className="w-full p-3 pl-12 bg-stone-800 border border-stone-700 rounded-xl text-emerald-400 font-mono text-xl font-black focus:ring-2 focus:ring-emerald-500 text-center"
              />
              <span className="absolute left-3 top-3.5 text-xs text-stone-500 font-bold">
                {settings.currency}
              </span>
            </div>

            {/* Quick Amount Pills */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap justify-center">
              {[5000, 10000, 20000, 50000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(String(val))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                    Number(amount) === val
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-white'
                  }`}
                >
                  {val.toLocaleString('ar-EG')}
                </button>
              ))}
            </div>
          </div>

          {/* Remaining Balance After Payment Preview */}
          {amountNum > 0 && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/50 flex items-center justify-between text-xs">
              <span className="text-emerald-300 font-medium">
                الرصيد المتبقي المتوقع بعد هذه الدفعة:
              </span>
              <span className="font-mono font-black text-white text-sm">
                {remainingAfterPayment.toLocaleString('ar-EG')} {settings.currency}
              </span>
            </div>
          )}

          {/* Grid: Payment Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                طريقة الدفع: *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as FlourPaymentMethod)}
                className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-emerald-500"
              >
                <option value="cash">نقدي (كاش باليد)</option>
                <option value="transfer">تحويل بنكي / إنستاباي</option>
                <option value="cheque">شيك مصرفي</option>
                <option value="vodafone_cash">محفظة إلكترونية / فودافون كاش</option>
                <option value="other">طريقة أخرى</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                تاريخ السداد: *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Receipt / Check Reference */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              رقم الإيصال / رقم الشيك / رقم التحويل (اختياري):
            </label>
            <input
              type="text"
              placeholder="مثال: REC-102 أو شيك رقم 482109"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              بيان وملاحظات الدفعة (اختياري):
            </label>
            <input
              type="text"
              placeholder="مثال: سلمت للمندوب الحاج فلان بإيصال استلام..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              id="submit-flour-payment-btn"
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-black text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>توثيق وخصم الدفعة من الرصيد فوراً</span>
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
