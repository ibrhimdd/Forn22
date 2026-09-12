import React, { useState } from 'react';
import { useBakery } from '../../context/BakeryContext';
import { Coins, Check, Calculator, Building, Phone, MapPin, Sparkles } from 'lucide-react';

export const BakeryPricingSettings: React.FC = () => {
  const { settings, updateSettings } = useBakery();

  const [formData, setFormData] = useState({
    bakeryName: settings.bakeryName,
    ownerName: settings.ownerName,
    defaultRatePer1000: settings.defaultRatePer1000,
    currency: settings.currency,
    phone: settings.phone,
    address: settings.address,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [simulationPieces, setSimulationPieces] = useState<number>(5000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...formData,
      defaultRatePer1000: Number(formData.defaultRatePer1000),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Calculation simulation
  const simThousands = simulationPieces / 1000;
  const simTotal = simThousands * formData.defaultRatePer1000;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Coins className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-bold text-stone-900">
            تحديد سعر الـ 1000 لقمة وإعدادات المخبز
          </h2>
        </div>
        <p className="text-xs text-stone-500">
          تعديل سعر الألف لقمة الافتراضي المعتمد في احتساب أجور اليوميات لعمال مخبز العيش السوري
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Highlighted Price Setting */}
            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-2">
              <label className="block text-sm font-extrabold text-amber-900">
                سعر الـ 1000 لقمة الافتراضي للمخبز: *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  required
                  min="1"
                  step="0.5"
                  value={formData.defaultRatePer1000}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defaultRatePer1000: Number(e.target.value),
                    })
                  }
                  className="w-40 p-3 bg-white border border-amber-300 rounded-xl text-lg font-black text-amber-950 text-center focus:ring-2 focus:ring-amber-500 shadow-xs"
                />
                <span className="text-sm font-bold text-amber-800">
                  {formData.currency} لكل 1000 لقمة / رغيف
                </span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                هذا السعر يطبق تلقائياً على كل يومية إنتاج جديدة لأي عامل ليس لديه سعر خاص مخصص في ملفه الشخصي.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  اسم المخبز:
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute right-3 top-3 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={formData.bakeryName}
                    onChange={(e) =>
                      setFormData({ ...formData, bakeryName: e.target.value })
                    }
                    className="w-full pl-3 pr-9 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  اسم المعلم / مدير المخبز:
                </label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerName: e.target.value })
                  }
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  العملة المستخدمة:
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                >
                  <option value="ج.م">جنيه مصري (ج.م)</option>
                  <option value="ل.س">ليرة سورية (ل.س)</option>
                  <option value="ر.س">ريال سعودي (ر.س)</option>
                  <option value="د.أ">دينار أردني (د.أ)</option>
                  <option value="$">دولار ($)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  رقم الهاتف للتواصل:
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute right-3 top-3 text-stone-400" />
                  <input
                    type="tel"
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full pl-3 pr-9 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-right"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                عنوان المخبز:
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute right-3 top-3 text-stone-400" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full pl-3 pr-9 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
              {savedSuccess ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <Check className="w-4 h-4" />
                  تم حفظ السعر والإعدادات بنجاح
                </span>
              ) : (
                <span></span>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs transition-colors"
              >
                حفظ التغييرات والسعر
              </button>
            </div>
          </form>
        </div>

        {/* Live Interactive Pricing Calculator Preview */}
        <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 border border-stone-800 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-amber-400">
              <Calculator className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white">
                حاسبة أجور اللقم التقديرية
              </h3>
            </div>
            <p className="text-xs text-stone-400 mb-5 leading-relaxed">
              جرّب احتساب مستحقات الإنتاج بناءً على سعر الـ 1000 لقمة المحدد حالياً:
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-300 mb-1">
                  كمية الإنتاج التجريبية (لقمة):
                </label>
                <input
                  type="number"
                  step="500"
                  min="0"
                  value={simulationPieces}
                  onChange={(e) => setSimulationPieces(Number(e.target.value))}
                  className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white font-bold"
                />
              </div>

              {/* Quick Pills */}
              <div className="flex gap-1.5 flex-wrap">
                {[2000, 3500, 5000, 7000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSimulationPieces(val)}
                    className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors ${
                      simulationPieces === val
                        ? 'bg-amber-600 text-white'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    {val.toLocaleString('ar-EG')}
                  </button>
                ))}
              </div>

              <div className="bg-stone-800/80 rounded-xl p-4 border border-stone-700 space-y-2 mt-4">
                <div className="flex justify-between text-stone-300">
                  <span>عدد الألف لقمة:</span>
                  <span className="font-mono font-bold text-white">
                    {simThousands.toFixed(2)} ألف
                  </span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>سعر الألف المعتمد:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {formData.defaultRatePer1000} {formData.currency}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-700 flex justify-between items-center">
                  <span className="font-bold text-stone-200">أجر العامل المحسوب:</span>
                  <span className="text-lg font-black text-amber-400 font-mono">
                    {simTotal.toFixed(2)} {formData.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-stone-800 text-[11px] text-stone-400">
            معادلة الحساب: (عدد اللقم ÷ 1000) × سعر الـ 1000
          </div>
        </div>

      </div>

    </div>
  );
};
