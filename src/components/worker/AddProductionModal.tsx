import React, { useState } from 'react';
import { useBakery } from '../../context/BakeryContext';
import { WorkerProfile } from '../../types';
import {
  Layers,
  Calendar,
  Sparkles,
  Check,
  X,
  AlertCircle,
  Wallet,
  FileText,
} from 'lucide-react';

interface Props {
  worker: WorkerProfile;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddProductionModal: React.FC<Props> = ({ worker, onClose, onSuccess }) => {
  const { addProductionLog, settings } = useBakery();

  const today = new Date().toISOString().split('T')[0];
  const [piecesCount, setPiecesCount] = useState<number | ''>(4000);
  const [date, setDate] = useState(today);
  // السلفة اليومية إجباري وبتقبل أي رقم حتى الصفر (الافتراضي 0)
  const [dailyAdvance, setDailyAdvance] = useState<number | ''>(0);
  const [notes, setNotes] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');

  const ratePer1000 = worker.customRatePer1000 ?? settings.defaultRatePer1000;
  const numPieces = typeof piecesCount === 'number' ? piecesCount : 0;
  const thousands = numPieces / 1000;
  const grossAmount = thousands * ratePer1000;

  const advanceNum = typeof dailyAdvance === 'number' ? dailyAdvance : 0;
  const netDue = grossAmount - advanceNum;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (piecesCount === '' || numPieces <= 0) {
      setErrorMsg('يرجى إدخال كمية لقم صالحة أكبر من صفر');
      return;
    }

    if (!date) {
      setErrorMsg('يرجى تحديد تاريخ اليومية');
      return;
    }

    if (dailyAdvance === '' || isNaN(advanceNum) || advanceNum < 0) {
      setErrorMsg('حقل السلفة اليومية إجباري (يمكنك إدخال 0 إذا لم تكن هناك سلفة)');
      return;
    }

    addProductionLog({
      workerId: worker.id,
      date,
      shift: 'morning', // default
      piecesCount: numPieces,
      notes: notes.trim(),
      advanceAmount: advanceNum > 0 ? advanceNum : 0,
      advanceCategory: 'cash',
      advanceNotes: advanceNum > 0 ? `سلفة نقدية يومية مع اليومية (${advanceNum} ${settings.currency})` : undefined,
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 max-w-md w-full text-right shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5 text-amber-700">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                تسجيل يومية الإنتاج والسلفة
              </h3>
              <p className="text-[11px] text-stone-500">
                مخبز أبو ريان للعيش السوري
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Worker & Rate Info Badge */}
        <div className="flex items-center justify-between text-xs bg-stone-50 px-3.5 py-2.5 rounded-xl border border-stone-200/80 mb-4">
          <span className="text-stone-700">
            العامل: <strong className="text-stone-950 font-bold">{worker.name}</strong>
          </span>
          <span className="font-mono text-amber-800 font-bold text-[11px] bg-amber-100/70 px-2 py-0.5 rounded">
            سعر الألف: {ratePer1000} {settings.currency}
          </span>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* المربع الأول: الكمية */}
          <div>
            <label className="block font-bold text-stone-900 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>الكمية (عدد اللقم المنتجة) *</span>
              </span>
              <span className="text-[11px] text-stone-400 font-normal">باللقمة</span>
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="100"
                step="50"
                placeholder="مثال: 4500"
                value={piecesCount}
                onChange={(e) => {
                  setErrorMsg('');
                  setPiecesCount(e.target.value === '' ? '' : Number(e.target.value));
                }}
                className="w-full p-3 bg-white border border-stone-300 rounded-xl text-stone-950 text-base font-black focus:ring-2 focus:ring-amber-500 shadow-2xs font-mono"
              />
              <span className="absolute left-3 top-3.5 text-xs text-stone-400 font-bold">
                لقمة عيش
              </span>
            </div>

            {/* Quick preset buttons */}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {[2500, 3500, 4000, 4500, 5000, 6000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPiecesCount(val)}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 rounded-lg text-[11px] font-mono transition-colors font-semibold"
                >
                  +{val.toLocaleString('ar-EG')}
                </button>
              ))}
            </div>
          </div>

          {/* المربع الثاني: التاريخ */}
          <div>
            <label className="block font-bold text-stone-900 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>التاريخ *</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => {
                setErrorMsg('');
                setDate(e.target.value);
              }}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 text-xs font-semibold"
            />
          </div>

          {/* المربع الثالث: السلفة اليومية (إجباري وتقبل أي رقم حتى الصفر) */}
          <div>
            <label className="block font-bold text-stone-900 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-red-500" />
                <span>السلفة اليومية *</span>
              </span>
              <span className="text-[11px] font-bold text-stone-500">
                (إجباري - اكتب 0 إن لم تكن هناك سلفة)
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="0"
                step="5"
                placeholder="أدخل مبلغ السلفة أو 0"
                value={dailyAdvance}
                onChange={(e) => {
                  setErrorMsg('');
                  setDailyAdvance(e.target.value === '' ? '' : Number(e.target.value));
                }}
                className={`w-full p-2.5 bg-white border rounded-xl font-mono font-bold text-sm focus:ring-2 ${
                  advanceNum > 0
                    ? 'border-red-300 text-red-950 focus:ring-red-400 bg-red-50/30'
                    : 'border-stone-300 text-stone-900 focus:ring-amber-500'
                }`}
              />
              <span className="absolute left-3 top-2.5 text-xs font-bold text-stone-400">
                {settings.currency}
              </span>
            </div>

            {/* Quick advance presets */}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {[0, 50, 100, 150, 200].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDailyAdvance(amt)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-semibold transition-colors border ${
                    dailyAdvance === amt
                      ? 'bg-red-500 text-white border-red-600'
                      : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {amt === 0 ? 'بدون سلفة (0)' : `${amt} ${settings.currency}`}
                </button>
              ))}
            </div>
          </div>

          {/* المربع الرابع: الملاحظات */}
          <div>
            <label className="block font-bold text-stone-900 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-stone-500" />
              <span>الملاحظات</span>
            </label>
            <input
              type="text"
              placeholder="أي ملاحظات حول إنتاج اليوم أو السلفة (اختياري)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 text-xs"
            />
          </div>

          {/* خلاصة الحساب المباشرة */}
          <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex justify-between items-center text-xs text-stone-600">
              <span>أجر الإنتاج ({thousands.toFixed(2)} ألف × {ratePer1000}):</span>
              <span className="font-bold text-stone-900 font-mono">
                {grossAmount.toLocaleString('ar-EG', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 2,
                })} {settings.currency}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-stone-600">
              <span>السلفة اليومية:</span>
              <span className={`font-bold font-mono ${advanceNum > 0 ? 'text-red-600' : 'text-stone-500'}`}>
                {advanceNum > 0 ? `- ${advanceNum.toLocaleString('ar-EG')} ${settings.currency}` : `0 ${settings.currency}`}
              </span>
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-xs">
              <span className="font-bold text-stone-900">صافي المستحق لليوم:</span>
              <span className={`text-base font-black font-mono ${
                netDue < 0 ? 'text-red-600' : 'text-amber-800'
              }`}>
                {netDue.toLocaleString('ar-EG', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 2,
                })} {settings.currency}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-600 font-semibold hover:bg-stone-200 transition-colors text-xs"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm transition-colors flex items-center gap-1.5 text-xs active:scale-98"
            >
              <Check className="w-4 h-4" />
              <span>حفظ وإرسال اليومية</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
