import React, { useState } from 'react';
import { useBakery } from '../../context/BakeryContext';
import {
  Wheat,
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Coins,
  ChevronLeft,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AuthPortal: React.FC = () => {
  const { workers, settings, loginAdmin, loginWorker } = useBakery();

  // Mode: 'choose' | 'admin' | 'worker'
  const [authMode, setAuthMode] = useState<'choose' | 'admin' | 'worker'>('choose');
  
  // Admin password
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  // Worker login credentials: username & password
  const activeWorkers = workers.filter((w) => w.status === 'active');
  const [workerUsername, setWorkerUsername] = useState('');
  const [workerPassword, setWorkerPassword] = useState('');
  const [showWorkerPassword, setShowWorkerPassword] = useState(false);
  const [workerError, setWorkerError] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    if (!adminPassword.trim()) {
      setAdminError('يرجى إدخال كلمة المرور للمدير');
      return;
    }
    const success = loginAdmin(adminPassword);
    if (!success) {
      setAdminError('كلمة المرور غير صحيحة');
    }
  };

  const handleWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWorkerError('');
    if (!workerUsername.trim()) {
      setWorkerError('يرجى إدخال اسم المستخدم الخاص بك');
      return;
    }
    if (!workerPassword.trim()) {
      setWorkerError('يرجى إدخال الباسورد (كلمة المرور)');
      return;
    }

    const success = loginWorker(workerUsername.trim(), workerPassword.trim());
    if (!success) {
      setWorkerError('اسم المستخدم أو كلمة المرور غير صحيحة، يرجى مراجعة إدارة المخبز');
    }
  };

  const handleSelectWorkerQuick = (w: typeof activeWorkers[0]) => {
    setWorkerUsername(w.username || w.code);
    setWorkerPassword(w.password || '123');
    setWorkerError('');
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col justify-center items-center px-4 py-10 selection:bg-amber-500 selection:text-white relative overflow-hidden">
      
      {/* Background Ambience / Glow */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Center Container */}
      <div className="max-w-md w-full relative z-10 text-right">
        
        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-xl shadow-amber-900/40 mb-4 border border-amber-400/20">
            <Wheat className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {settings.bakeryName}
          </h1>
          <p className="text-xs text-stone-400 mt-1.5 max-w-xs mx-auto">
            منصة إدارة تشغيل العيش السوري والشامي، متابعة اليوميات، واحتساب أجر اللقم والسلف
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          
          {/* View 1: Choose Role */}
          {authMode === 'choose' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-base font-bold text-stone-100">
                  تسجيل الدخول إلى نظام المخبز
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  اختر نوع الحساب الذي تود الدخول به:
                </p>
              </div>

              {/* Admin Button */}
              <button
                type="button"
                onClick={() => setAuthMode('admin')}
                className="w-full group p-4 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/80 hover:border-amber-500/50 transition-all text-right flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white group-hover:text-amber-300 transition-colors">
                      دخول مدير المخبز (الأدمين)
                    </h3>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      اعتماد اليوميات، تقارير العمال الشاملة، سعر الألف، والتصفية
                    </p>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-stone-500 group-hover:text-amber-400 transition-colors" />
              </button>

              {/* Worker Button */}
              <button
                type="button"
                onClick={() => setAuthMode('worker')}
                className="w-full group p-4 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/80 hover:border-amber-500/50 transition-all text-right flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white group-hover:text-amber-300 transition-colors">
                      دخول طاقم العمال
                    </h3>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      تسجيل اليومية اليومية مع السلفة المرفقة ومتابعة كشف الحساب
                    </p>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-stone-500 group-hover:text-amber-400 transition-colors" />
              </button>

              {/* Quick info */}
              <div className="pt-4 mt-2 border-t border-stone-800/80 text-center">
                <span className="text-[11px] text-stone-500">
                  سعر الـ 1000 لقمة المعتمد بالمخبز: {settings.defaultRatePer1000} {settings.currency}
                </span>
              </div>
            </div>
          )}

          {/* View 2: Admin Login Form */}
          {authMode === 'admin' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  <h2 className="text-sm font-bold text-white">
                    تسجيل دخول مدير المخبز
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('choose');
                    setAdminError('');
                  }}
                  className="text-xs text-stone-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                >
                  <span>تغيير الحساب</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {adminError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              <form onSubmit={handleAdminSubmit} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    اسم المسؤول:
                  </label>
                  <input
                    type="text"
                    disabled
                    value={settings.ownerName || 'مدير المخبز (الأدمين)'}
                    className="w-full p-3 bg-stone-800/50 border border-stone-700 rounded-xl text-stone-300 text-xs font-medium cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    كلمة المرور الإدارية: *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      autoFocus
                      required
                      placeholder="أدخل كلمة المرور (افتراضي: admin أو 123456)"
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminError('');
                        setAdminPassword(e.target.value);
                      }}
                      className="w-full p-3 pl-10 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-mono"
                    />
                    <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-3.5" />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-stone-500">
                    <span>للتجربة السريعة: اكتب <strong>admin</strong> أو اضغط دخول</span>
                    <button
                      type="button"
                      onClick={() => setAdminPassword('admin')}
                      className="text-amber-400 hover:underline"
                    >
                      تعبئة تلقائية
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs shadow-lg shadow-amber-900/40 transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>تسجيل الدخول للوحة التحكم</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* View 3: Worker Login Form */}
          {authMode === 'worker' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-500" />
                  <h2 className="text-sm font-bold text-white">
                    تسجيل دخول العامل
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('choose');
                    setWorkerError('');
                  }}
                  className="text-xs text-stone-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                >
                  <span>تغيير الحساب</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {workerError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{workerError}</span>
                </div>
              )}

              <form onSubmit={handleWorkerSubmit} className="space-y-4 pt-1">
                {/* Username input */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    اسم المستخدم: *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      required
                      dir="ltr"
                      placeholder="أدخل اسم المستخدم (مثال: worker1)"
                      value={workerUsername}
                      onChange={(e) => {
                        setWorkerError('');
                        setWorkerUsername(e.target.value);
                      }}
                      className="w-full p-3 pl-10 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-mono"
                    />
                    <User className="w-4 h-4 text-stone-500 absolute left-3 top-3.5" />
                  </div>
                </div>

                {/* Password input */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    الباسورد (كلمة المرور): *
                  </label>
                  <div className="relative">
                    <input
                      type={showWorkerPassword ? 'text' : 'password'}
                      required
                      dir="ltr"
                      placeholder="أدخل كلمة المرور (افتراضي: 123)"
                      value={workerPassword}
                      onChange={(e) => {
                        setWorkerError('');
                        setWorkerPassword(e.target.value);
                      }}
                      className="w-full p-3 pl-10 pr-3 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWorkerPassword(!showWorkerPassword)}
                      className="absolute left-3 top-3.5 text-stone-400 hover:text-white"
                      tabIndex={-1}
                    >
                      {showWorkerPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick select pills */}
                {activeWorkers.length > 0 && (
                  <div className="pt-2 border-t border-stone-800/80">
                    <span className="text-[11px] text-stone-400 block mb-2 font-medium">
                      أو اختر اسمك للتعبئة التلقائية السريعة:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-0.5">
                      {activeWorkers.map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => handleSelectWorkerQuick(w)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                            workerUsername === w.username || workerUsername === w.code
                              ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 font-bold'
                              : 'bg-stone-800/80 hover:bg-stone-800 border-stone-700/80 text-stone-300'
                          }`}
                        >
                          {w.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs shadow-lg shadow-amber-900/40 transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>تسجيل الدخول إلى حساب العامل</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-stone-500 text-xs">
          نظام محاسبي وتشغيلي متخصص لمخابز العيش السوري والشامي © {new Date().getFullYear()}
        </div>

      </div>

    </div>
  );
};
