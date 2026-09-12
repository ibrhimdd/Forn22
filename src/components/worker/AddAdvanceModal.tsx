import React, { useState } from 'react';
import { useBakery } from '../../context/BakeryContext';
import { WorkerProfile, AdvanceCategory } from '../../types';
import { Wallet, X, Check, Utensils, Coffee, DollarSign, HelpCircle, AlertCircle } from 'lucide-react';

interface Props {
  worker: WorkerProfile;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddAdvanceModal: React.FC<Props> = ({ worker, onClose, onSuccess }) => {
  const { addAdvance, settings } = useBakery();

  const today = new Date().toISOString().split('T')[0];
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<AdvanceCategory>('cash');
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const categories: { id: AdvanceCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'cash', label: 'سلفة نقدية (كاش)', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'food', label: 'غداء وطعام', icon: <Utensils className="w-4 h-4" /> },
    { id: 'supplies', label: 'شاي ودخان ومشروبات', icon: <Coffee className="w-4 h-4" /> },
    { id: 'other', label: 'مصروفات أخرى', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = typeof amount === 'number' ? amount : 0;
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('يرجى كتابة مبلغ سلفة صحيح أكبر من الصفر');
      return;
    }

    addAdvance({
      workerId: worker.id,
      date,
      amount: numAmount,
      category,
      notes: notes.trim() || 'سلفة يومية نقدية',
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-md w-full text-right shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-red-600">
            <Wallet className="w-5 h-5" />
            <h3 className="text-base font-bold text-stone-900">
              تسجيل سلفة أو مصروف يومي
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-stone-500 mb-4">
          العامل: <strong className="text-stone-800">{worker.name}</strong> ({worker.roleTitle})
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Amount */}
          <div>
            <label className="block font-bold text-stone-800 mb-1">
              قيمة السلفة ({settings.currency}): *
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="5"
                step="5"
                placeholder="مثال: 100"
                value={amount}
                onChange={(e) => {
                  setErrorMsg('');
                  setAmount(e.target.value === '' ? '' : Number(e.target.value));
                }}
                className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-950 text-lg font-black focus:ring-2 focus:ring-red-500"
              />
              <span className="absolute left-3 top-3.5 text-xs text-stone-500 font-bold">
                {settings.currency}
              </span>
            </div>

            {/* Quick buttons */}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {[20, 50, 100, 150, 200].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 rounded-lg text-[11px] font-mono transition-colors"
                >
                  +{val} {settings.currency}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block font-bold text-stone-700 mb-2">
              نوع السلفة / المصروف:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    category === cat.id
                      ? 'border-red-500 bg-red-50 text-red-800 ring-1 ring-red-400'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span className={category === cat.id ? 'text-red-600' : 'text-stone-400'}>
                    {cat.icon}
                  </span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              تاريخ السلفة:
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              سبب السلفة / تفاصيل إضافية:
            </label>
            <input
              type="text"
              placeholder="مثال: سلفة غداء من كافتيريا، نقدية للمنزل..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-600 font-semibold hover:bg-stone-200"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>تأكيد تسجيل السلفة</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
