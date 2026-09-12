import React, { useState } from 'react';
import { useBakery } from '../../context/BakeryContext';
import { ProductionReview } from './ProductionReview';
import { WorkerManagement } from './WorkerManagement';
import { ArchivedSettlement } from './ArchivedSettlement';
import { BakeryPricingSettings } from './BakeryPricingSettings';
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
} from 'lucide-react';

export type AdminTab = 'review' | 'workers' | 'archived' | 'pricing';

export const AdminDashboard: React.FC = () => {
  const {
    productionLogs,
    workers,
    advances,
    settings,
    getWorkerFinancials,
  } = useBakery();

  const [activeTab, setActiveTab] = useState<AdminTab>('review');

  const today = new Date().toISOString().split('T')[0];

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
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
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
              يوميات بانتظار الاعتماد
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-900">
              {pendingCount}
            </span>
            <span className="text-xs text-stone-500">يومية جديدة</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-700 font-medium">
            {pendingCount > 0 ? 'اضغط للمراجعة والاعتماد' : 'جميع اليوميات معتمدة'}
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
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-stone-900">
              {todayPieces.toLocaleString('ar-EG')}
            </span>
            <span className="text-xs text-stone-500">لقمة</span>
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            ما يعادل {(todayPieces / 1000).toFixed(1)} ألف رغيف سوري
          </div>
        </div>

        {/* Today's Advances */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600">
              سلف ومصروفات اليوم
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-stone-900">
              {todayAdvances.toLocaleString('ar-EG')}
            </span>
            <span className="text-xs text-stone-500">{settings.currency}</span>
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            مسجلة لعمال المخبز اليوم
          </div>
        </div>

        {/* Total Net Unpaid Wages */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600">
              صافي الأجور المستحقة حالياً
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-900">
              {totalNetPayable.toLocaleString('ar-EG', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-stone-500">{settings.currency}</span>
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            لإجمالي {activeWorkers.length} عامل نشط
          </div>
        </div>

      </div>

      {/* Admin Navigation Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-stone-200 shadow-xs flex items-center gap-1 overflow-x-auto">
        
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
          <span>تصفية الحسابات المؤرشفة</span>
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
          <span>سعر الـ 1000 لقمة والمخبز</span>
        </button>

      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'review' && <ProductionReview />}
        {activeTab === 'workers' && <WorkerManagement />}
        {activeTab === 'archived' && <ArchivedSettlement />}
        {activeTab === 'pricing' && <BakeryPricingSettings />}
      </div>

    </div>
  );
};
