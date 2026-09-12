import React from 'react';
import { BakeryProvider, useBakery } from './context/BakeryContext';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { WorkerPortal } from './components/worker/WorkerPortal';
import { AuthPortal } from './components/auth/AuthPortal';
import { Wheat, ShieldCheck, User, Info, Sparkles } from 'lucide-react';

function BakeryAppContent() {
  const {
    isAuthenticated,
    currentRole,
    setCurrentRole,
    settings,
    workers,
    currentWorkerId,
    setCurrentWorkerId,
  } = useBakery();

  // If not authenticated, immediately display the login screen for Admin or Worker
  if (!isAuthenticated) {
    return <AuthPortal />;
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col selection:bg-amber-500 selection:text-white font-sans">
      
      {/* Top Navigation */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Quick Role Context Switcher Bar (Mobile & Desktop friendly) */}
        <div className="mb-6 bg-white rounded-2xl p-3 sm:p-4 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              {currentRole === 'admin' ? (
                <ShieldCheck className="w-5 h-5 text-amber-700" />
              ) : (
                <User className="w-5 h-5 text-amber-700" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 font-semibold">أنت تتصفح الآن بصفة:</span>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {currentRole === 'admin' ? 'مدير المخبز (الأدمين)' : 'العامل (تسجيل اليوميات والسلف)'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {currentRole === 'admin'
                  ? 'صلاحيات إنشاء حسابات العمال، تحديد سعر الألف، اعتماد أو رفض اليوميات، وتصفية الحسابات المؤرشفة'
                  : 'صلاحيات إدخال إنتاج اللقم، تسجيل السلف، ومتابعة كشف الحساب اليومي وصافي الربح'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setCurrentRole(currentRole === 'admin' ? 'worker' : 'admin')}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <span>التبديل إلى {currentRole === 'admin' ? 'بوابة العامل' : 'لوحة الأدمين'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic View by Role */}
        {currentRole === 'admin' ? <AdminDashboard /> : <WorkerPortal />}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 text-stone-500 text-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wheat className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-stone-800">{settings.bakeryName}</span>
            <span>•</span>
            <span>منصة متخصصة لتشغيل مخابز العيش السوري والشامي</span>
          </div>

          <div className="text-stone-400 text-[11px]">
            سعر الـ 1000 لقمة: {settings.defaultRatePer1000} {settings.currency} | كافة الحقوق محفوظة © {new Date().getFullYear()}
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <BakeryProvider>
      <BakeryAppContent />
    </BakeryProvider>
  );
}
