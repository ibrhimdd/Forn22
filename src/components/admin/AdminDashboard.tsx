import React, { useState } from 'react';
import { useBakery } from '../../context/BakeryContext';
import { ProductionReview } from './ProductionReview';
import { WorkerManagement } from './WorkerManagement';
import { ArchivedSettlement } from './ArchivedSettlement';
import { BakeryPricingSettings } from './BakeryPricingSettings';
import { FlourManagement } from './FlourManagement';
import {
  FileCheck2,
  Users,
  Archive,
  Coins,
  Clock,
  TrendingUp,
  Wallet,
  AlertCircle,
  Layers,
  Sparkles,
  Wheat,
  ArrowDownLeft,
} from 'lucide-react';

export type AdminTab = 'flour' | 'review' | 'workers' | 'archived' | 'pricing';

export const AdminDashboard: React.FC = () => {
  const {
    productionLogs,
    workers,
    advances,
    settings,
    getWorkerFinancials,
    getTotalFlourFinancials,
  } = useBakery();

  const [activeTab, setActiveTab] = useState<AdminTab>('flour');

  const today = new Date().toISOString().split('T')[0];

  // Flour financials summary
  const flourFin = getTotalFlourFinancials();

  // Pending reviews
  const pendingLogs = productionLogs.filter((l) => l.status === 'pending');
  const pendingCount = pendingLogs.length;

  // Today's total pieces
  const todayPieces = productionLogs
    .filter((l) => l.date === today && l.status === 'approved')
    .reduce((sum, l) => sum + l.piecesCount, 0);

  // Today's advances
  const todayAdvances = advances
    .filter((a) => a.date === today)
    .reduce((sum, a) => sum + a.amount, 0);

  // Total active workers unpaid balance
  const activeWorkers = workers.filter((w) => w.status === 'active');
  const totalNetPayable = activeWorkers.reduce((sum, w) => {
    const fin = getWorkerFinancials(w.id);
    return sum + (fin.netPayable > 0 ? fin.netPayable : 0);
  }, 0);

  const archivedCount = workers.filter((w) => w.status === 'archived').length;

  return (
    <div className="space-y-6">
      
      {/* Top Main Section Switcher: العمال vs الدقيق */}
      <div className="bg-stone-900 rounded-2xl p-2 border border-stone-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3 px-3 py-1">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black">
            <Wheat className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">
              منظومة المخبز المتكاملة (العمال & الدقيق)
            </h2>
            <p className="text-[11px] text-stone-400">
              اختر البند المطلوب للمتابعة وإدارة الحسابات
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-stone-950 p-1.5 rounded-xl border border-stone-800">
          <button
            id="main-section-flour-btn"
            type="button"
            onClick={() => setActiveTab('flour')}
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-black transition-all ${
              activeTab === 'flour'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-md ring-1 ring-amber-400'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Wheat className="w-4 h-4" />
            <span>بند الدقيق وتوريدات المطاحن</span>
          </button>

          <button
            id="main-section-workers-btn"
            type="button"
            onClick={() => {
              if (activeTab === 'flour') {
                setActiveTab(pendingCount > 0 ? 'review' : 'workers');
              }
            }}
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-black transition-all ${
              activeTab !== 'flour'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-md ring-1 ring-amber-400'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>بند العمال والإنتاج ({activeWorkers.length})</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (5 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* Flour Overview Card */}
        <div
          onClick={() => setActiveTab('flour')}
          className={`cursor-pointer bg-white rounded-2xl p-4 border transition-all ${
            activeTab === 'flour'
              ? 'border-amber-500 ring-2 ring-amber-300/80 shadow-md'
              : 'border-stone-200 shadow-xs hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600">
              الدقيق المستلم
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-900 font-mono">
              {flourFin.totalTons.toFixed(1)}
            </span>
            <span className="text-xs text-stone-500 font-bold">طن</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-700 font-medium">
            متبقي للمطاحن: {flourFin.totalBalanceRemaining.toLocaleString('ar-EG')} {settings.currency}
          </div>
        </div>

        {/* Pending Approval Metric */}
        <div
          onClick={() => setActiveTab('review')}
          className={`cursor-pointer bg-white rounded-2xl p-4 border transition-all ${
            pendingCount > 0
              ? 'border-amber-400/80 ring-2 ring-amber-200/60 shadow-xs'
              : 'border-stone-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600">
              يوميات بالاعتماد
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-900">
              {pendingCount}
            </span>
            <span className="text-xs text-stone-500">يومية</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-700 font-medium">
            {pendingCount > 0 ? 'اضغط للمراجعة' : 'معتمدة بالكامل'}
          </div>
        </div>

        {/* Today's Production */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600">
              إنتاج اليوم المعتمد
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-stone-900 font-mono">
              {todayPieces.toLocaleString('ar-EG')}
            </span>
            <span className="text-xs text-stone-500">لقمة</span>
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            ~ {(todayPieces / 1000).toFixed(1)} ألف رغيف
          </div>
        </div>

        {/* Today's Advances */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600">
              سلف اليوم
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-stone-900 font-mono">
              {todayAdvances.toLocaleString('ar-EG')}
            </span>
            <span className="text-xs text-stone-500">{settings.currency}</span>
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            سلف عمال المخبز
          </div>
        </div>

        {/* Total Net Unpaid Wages */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600">
              صافي أجور العمال
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-900 font-mono">
              {totalNetPayable.toLocaleString('ar-EG', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-stone-500">{settings.currency}</span>
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            لـ {activeWorkers.length} عامل نشط
          </div>
        </div>

      </div>

      {/* Admin Navigation Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-stone-200 shadow-xs flex items-center gap-1 overflow-x-auto">
        
        {/* Flour Management Tab */}
        <button
          id="tab-flour"
          onClick={() => setActiveTab('flour')}
          className={`flex-1 min-w-[190px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'flour'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Wheat className="w-4 h-4" />
          <span>بند الدقيق وتوريدات المطاحن</span>
        </button>

        <button
          id="tab-review"
          onClick={() => setActiveTab('review')}
          className={`flex-1 min-w-[170px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'review'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>مراجعة واعتماد اليوميات</span>
          {pendingCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'review'
                  ? 'bg-white text-amber-700'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {pendingCount}
            </span>
          )}
        </button>

        <button
          id="tab-workers"
          onClick={() => setActiveTab('workers')}
          className={`flex-1 min-w-[170px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'workers'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>إدارة ملفات العمال ({activeWorkers.length})</span>
        </button>

        <button
          id="tab-archived"
          onClick={() => setActiveTab('archived')}
          className={`flex-1 min-w-[170px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'archived'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>تصفية المؤرشفين</span>
          {archivedCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'archived'
                  ? 'bg-white text-amber-700'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              {archivedCount}
            </span>
          )}
        </button>

        <button
          id="tab-pricing"
          onClick={() => setActiveTab('pricing')}
          className={`flex-1 min-w-[170px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'pricing'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>سعر الـ 1000 والمخبز</span>
        </button>

      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'flour' && <FlourManagement />}
        {activeTab === 'review' && <ProductionReview />}
        {activeTab === 'workers' && <WorkerManagement />}
        {activeTab === 'archived' && <ArchivedSettlement />}
        {activeTab === 'pricing' && <BakeryPricingSettings />}
      </div>

    </div>
  );
};
