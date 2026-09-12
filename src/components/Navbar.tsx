import React, { useState } from 'react';
import { useBakery } from '../context/BakeryContext';
import {
  Wheat,
  ShieldCheck,
  User,
  RotateCcw,
  Coins,
  ChevronDown,
  Bell,
  Clock,
  Sparkles,
  LogOut,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    currentWorkerId,
    setCurrentWorkerId,
    workers,
    settings,
    productionLogs,
    resetToDefaults,
    currentUser,
    logout,
  } = useBakery();

  const [showWorkerDropdown, setShowWorkerDropdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Active workers
  const activeWorkers = workers.filter((w) => w.status === 'active');
  const currentWorker = workers.find((w) => w.id === currentWorkerId);

  // Count pending reviews
  const pendingCount = productionLogs.filter((l) => l.status === 'pending').length;

  return (
    <header className="bg-stone-900 text-stone-100 sticky top-0 z-40 shadow-md border-b border-amber-900/40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Bakery Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/30 text-white">
              <Wheat className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                  {settings.bakeryName}
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  عيش سوري & شامي
                </span>
              </div>
              <p className="text-xs text-stone-400">
                منصة التشغيل واليوميات وحسابات العمال
              </p>
            </div>
          </div>

          {/* Quick Rate Display & Rate Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-800/80 border border-stone-700 text-xs">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-stone-400">سعر الـ 1000 لقمة الافتراضي:</span>
            <span className="font-bold text-amber-400 text-sm">
              {settings.defaultRatePer1000} {settings.currency}
            </span>
          </div>

          {/* Role Switcher & Controls */}
          <div className="flex items-center gap-3">
            
            {/* Role Switcher Toggle */}
            <div className="bg-stone-800 p-1 rounded-xl flex items-center border border-stone-700">
              <button
                id="role-btn-admin"
                onClick={() => setCurrentRole('admin')}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  currentRole === 'admin'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>لوحة الأدمين</span>
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse shadow">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                id="role-btn-worker"
                onClick={() => setCurrentRole('worker')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  currentRole === 'worker'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
                }`}
              >
                <User className="w-4 h-4" />
                <span>بوابة العامل</span>
              </button>
            </div>

            {/* If in worker role, show worker picker */}
            {currentRole === 'worker' && (
              <div className="relative">
                <button
                  onClick={() => setShowWorkerDropdown(!showWorkerDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs sm:text-sm transition-colors"
                  title="تغيير العامل الحالي"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-medium max-w-[110px] sm:max-w-none truncate">
                    {currentWorker?.name || 'اختر العامل'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {showWorkerDropdown && (
                  <div className="absolute left-0 mt-2 w-56 bg-stone-800 rounded-xl shadow-2xl border border-stone-700 py-1.5 z-50 text-right">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-stone-400 border-b border-stone-700/80">
                      تبديل حساب العامل المسجل:
                    </div>
                    {activeWorkers.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => {
                          setCurrentWorkerId(w.id);
                          setShowWorkerDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-stone-700/80 transition-colors ${
                          w.id === currentWorkerId
                            ? 'bg-amber-600/20 text-amber-300 font-bold'
                            : 'text-stone-200'
                        }`}
                      >
                        <div className="text-right">
                          <p className="font-semibold">{w.name}</p>
                          <p className="text-[10px] text-stone-400">{w.roleTitle}</p>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-700 text-stone-300 font-mono">
                          {w.code}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Demo Reset button */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors"
              title="إعادة ضبط البيانات التجريبية"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Logout / Switch Session button */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-red-950/80 text-stone-300 hover:text-red-300 border border-stone-700 text-xs font-bold transition-colors"
              title="تسجيل الخروج والعودة لصفحة تسجيل الدخول"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تسجيل خروج</span>
            </button>
          </div>

        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 max-w-sm w-full text-right shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">
              إعادة تهيئة البيانات التجريبية؟
            </h3>
            <p className="text-xs text-stone-300 mb-6 leading-relaxed">
              سيتم استعادة سجل العمال واليوميات والسلف الافتراضية الخاصة بمخبز العيش السوري.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 text-xs font-semibold hover:bg-stone-700"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  resetToDefaults();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                تأكيد الاستعادة
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
