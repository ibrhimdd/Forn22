import React, { useState } from 'react';
import { useBakery } from '../../context/BakeryContext';
import { WorkerProfile, WorkerRoleTitle } from '../../types';
import {
  UserPlus,
  Users,
  Phone,
  Coins,
  Archive,
  Edit,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  Calendar,
  Wallet,
  ArrowUpRight,
  FileText,
  ChevronLeft,
  KeyRound,
  Lock,
} from 'lucide-react';
import { WorkerProfileReport } from './WorkerProfileReport';

const availableRoles: WorkerRoleTitle[] = [
  'فران رئيسي',
  'عجان',
  'صانع لقم / فراش',
  'قطاع عجين',
  'مساعد فرن وتعبئة',
];

export const WorkerManagement: React.FC = () => {
  const {
    workers,
    addWorker,
    updateWorker,
    archiveWorker,
    getWorkerFinancials,
    settings,
  } = useBakery();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<WorkerProfile | null>(null);
  const [archivingWorker, setArchivingWorker] = useState<WorkerProfile | null>(null);
  const [archiveReason, setArchiveReason] = useState('');
  const [viewingProfileWorker, setViewingProfileWorker] = useState<WorkerProfile | null>(null);

  // New worker form state with ONLY user requested fields:
  // اسم العامل، تاريخ بدء العمل، سعر الألف، اسم المستخدم والباسورد
  const [newWorker, setNewWorker] = useState({
    name: '',
    joinDate: new Date().toISOString().split('T')[0],
    customRatePer1000: '' as string,
    username: '',
    password: '',
  });

  const activeWorkers = workers.filter((w) => w.status === 'active');

  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorker.name.trim()) return;

    const workerIndex = workers.length + 1;
    const autoCode = `W-${100 + workerIndex}`;
    const cleanUsername =
      newWorker.username.trim() ||
      `worker_${100 + workerIndex}`;
    const cleanPassword = newWorker.password.trim() || '123456';

    addWorker({
      name: newWorker.name.trim(),
      code: autoCode,
      username: cleanUsername,
      password: cleanPassword,
      roleTitle: 'صانع لقم / فراش',
      customRatePer1000: newWorker.customRatePer1000
        ? Number(newWorker.customRatePer1000)
        : null,
      joinDate: newWorker.joinDate || new Date().toISOString().split('T')[0],
      phone: '',
      nationalId: '',
      notes: '',
    });

    setShowAddModal(false);
    setNewWorker({
      name: '',
      joinDate: new Date().toISOString().split('T')[0],
      customRatePer1000: '',
      username: '',
      password: '',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;

    updateWorker(editingWorker.id, {
      name: editingWorker.name,
      username: editingWorker.username,
      password: editingWorker.password,
      joinDate: editingWorker.joinDate,
      customRatePer1000: editingWorker.customRatePer1000,
      phone: editingWorker.phone,
      roleTitle: editingWorker.roleTitle,
      nationalId: editingWorker.nationalId,
      notes: editingWorker.notes,
    });

    setEditingWorker(null);
  };

  const handleConfirmArchive = () => {
    if (!archivingWorker) return;
    archiveWorker(
      archivingWorker.id,
      archiveReason.trim() || 'تمت الأرشفة وإيقاف النشاط مؤقتاً'
    );
    setArchivingWorker(null);
    setArchiveReason('');
  };

  // If admin is inspecting a full worker profile report
  if (viewingProfileWorker) {
    return (
      <WorkerProfileReport
        worker={viewingProfileWorker}
        onBack={() => setViewingProfileWorker(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header & Add Worker Button */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-stone-900">
              إدارة طاقم عمال المخبز ({activeWorkers.length} عامل نشط)
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            إنشاء حسابات العمال، تحديد سعر الألف لقمة لكل عامل، ومتابعة الأرصدة والمستحقات الحالية
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>إنشاء حساب عامل جديد</span>
        </button>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeWorkers.map((worker) => {
          const fin = getWorkerFinancials(worker.id);
          const effectiveRate =
            worker.customRatePer1000 ?? settings.defaultRatePer1000;

          return (
            <div
              key={worker.id}
              className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs hover:border-amber-400/60 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-bold">
                      {worker.code}
                    </span>
                    <h3 className="font-extrabold text-stone-900 text-base mt-1">
                      {worker.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold mt-0.5">
                      <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                      <span>{worker.roleTitle}</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    نشط
                  </span>
                </div>

                {/* Info row */}
                <div className="space-y-2 text-xs text-stone-600 py-3 border-y border-stone-100 my-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-stone-500">
                      <Coins className="w-3.5 h-3.5 text-amber-500" /> سعر الـ 1000 لقمة:
                    </span>
                    <span className="font-bold text-stone-900">
                      {effectiveRate} {settings.currency}
                      {worker.customRatePer1000 !== null ? (
                        <span className="text-[10px] text-amber-600 mr-1 font-normal">
                          (سعر مخصص)
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400 mr-1 font-normal">
                          (سعر المخبز)
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-stone-500">
                      <Calendar className="w-3.5 h-3.5" /> تاريخ بدء العمل:
                    </span>
                    <span className="text-stone-700 font-mono text-[11px]">{worker.joinDate}</span>
                  </div>

                  {/* Worker Login Credentials Box */}
                  <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5 space-y-1.5 mt-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                      <span className="flex items-center gap-1">
                        <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                        <span>بيانات الدخول للمنصة:</span>
                      </span>
                      <span className="text-[10px] text-amber-700 font-normal">
                        (حساب العامل)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-600">اسم المستخدم:</span>
                      <span className="font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-amber-200/60" dir="ltr">
                        {worker.username || worker.code}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-600">الباسورد:</span>
                      <span className="font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-amber-200/60" dir="ltr">
                        {worker.password || '123'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Summary Snippet */}
                <div className="bg-stone-50 rounded-xl p-3 space-y-1.5 text-xs mb-4">
                  <div className="flex justify-between text-stone-600">
                    <span>إجمالي اللقم المعتمدة:</span>
                    <span className="font-bold text-stone-900">
                      {fin.totalPiecesApproved.toLocaleString('ar-EG')} لقمة
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>المستحق المعتمد:</span>
                    <span className="font-bold text-emerald-700">
                      {fin.approvedGross.toLocaleString('ar-EG')} {settings.currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>إجمالي السلف والمصروفات:</span>
                    <span className="font-bold text-red-600">
                      -{fin.totalAdvances.toLocaleString('ar-EG')} {settings.currency}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-stone-200 text-stone-900 font-extrabold">
                    <span className="text-amber-900">صافي المستحق حالياً:</span>
                    <span
                      className={`text-sm ${
                        fin.netPayable >= 0 ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {fin.netPayable.toLocaleString('ar-EG')} {settings.currency}
                    </span>
                  </div>

                  {fin.pendingLogsCount > 0 && (
                    <div className="text-[11px] text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded text-center font-semibold">
                      يوجد {fin.pendingLogsCount} يومية بانتظار الاعتماد
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                {/* View Full Profile Report Button */}
                <button
                  type="button"
                  onClick={() => setViewingProfileWorker(worker)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs active:scale-98"
                >
                  <FileText className="w-4 h-4" />
                  <span>فتح البروفايل الكامل (اليوميات والسلف)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingWorker(worker)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>تعديل البيانات والحساب</span>
                  </button>

                  <button
                    onClick={() => {
                      setArchivingWorker(worker);
                      setArchiveReason('');
                    }}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                    title="أرشفة الحساب (نقل للتصفية النهائية)"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Worker Modal: Exactly as requested */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-md w-full text-right shadow-2xl">
            <div className="flex items-center gap-2.5 text-amber-600 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 font-bold">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  إضافة عامل جديد
                </h3>
                <p className="text-[11px] text-stone-500">
                  أدخل بيانات العامل وسعر الألف وبيانات تسجيل دخوله للمنصة
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateWorker} className="space-y-4 text-xs mt-4">
              
              {/* 1. اسم العامل */}
              <div>
                <label className="block font-bold text-stone-900 mb-1.5">
                  اسم العامل: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: يوسف الكردي (أبو علي)"
                  value={newWorker.name}
                  onChange={(e) => {
                    const nameVal = e.target.value;
                    setNewWorker((prev) => ({
                      ...prev,
                      name: nameVal,
                    }));
                  }}
                  className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-950 font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 shadow-2xs"
                />
              </div>

              {/* 2. تاريخ بدء العمل */}
              <div>
                <label className="block font-bold text-stone-900 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>تاريخ بدء العمل: *</span>
                </label>
                <input
                  type="date"
                  required
                  value={newWorker.joinDate}
                  onChange={(e) =>
                    setNewWorker({ ...newWorker, joinDate: e.target.value })
                  }
                  className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-950 font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 shadow-2xs"
                />
              </div>

              {/* 3. سعر الألف */}
              <div>
                <label className="block font-bold text-stone-900 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-600" />
                    <span>سعر الألف ({settings.currency}): *</span>
                  </span>
                  <span className="text-[11px] text-stone-500 font-normal">
                    (سعر المخبز: {settings.defaultRatePer1000} {settings.currency})
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder={`مثال: ${settings.defaultRatePer1000}`}
                    value={newWorker.customRatePer1000}
                    onChange={(e) =>
                      setNewWorker({ ...newWorker, customRatePer1000: e.target.value })
                    }
                    className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-950 font-mono font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 shadow-2xs"
                  />
                  <span className="absolute left-3 top-3 text-stone-400 font-bold">
                    {settings.currency}
                  </span>
                </div>
                <span className="text-[10px] text-stone-500 mt-1 block">
                  * في حال تركه فارغاً سيتم احتساب السعر العام للمخبز ({settings.defaultRatePer1000} {settings.currency}).
                </span>
              </div>

              {/* 4. اسم المستخدم والباسورد */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 space-y-3 pt-3">
                <div className="flex items-center gap-1.5 text-amber-950 font-bold text-xs pb-1 border-b border-amber-200/60">
                  <KeyRound className="w-4 h-4 text-amber-700" />
                  <span>بيانات تسجيل الدخول للمنصة (التي سيسجل بها العامل):</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      اسم المستخدم: *
                    </label>
                    <input
                      type="text"
                      required
                      dir="ltr"
                      placeholder="مثال: youssef"
                      value={newWorker.username}
                      onChange={(e) =>
                        setNewWorker({ ...newWorker, username: e.target.value })
                      }
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-mono font-bold text-left focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      الباسورد: *
                    </label>
                    <input
                      type="text"
                      required
                      dir="ltr"
                      placeholder="مثال: 123456"
                      value={newWorker.password}
                      onChange={(e) =>
                        setNewWorker({ ...newWorker, password: e.target.value })
                      }
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-mono font-bold text-left focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-amber-900/80 leading-relaxed">
                  * سيقوم العامل بكتابة اسم المستخدم والباسورد هذين عند الدخول لحسابه لتسجيل يومياته وسلفه.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-2 justify-end pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-600 font-semibold hover:bg-stone-200 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs transition-colors active:scale-98"
                >
                  حفظ وإضافة العامل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Worker Modal */}
      {editingWorker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-md w-full text-right shadow-2xl">
            <h3 className="text-base font-bold text-stone-900 mb-1">
              تعديل بيانات العامل: {editingWorker.name}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              يمكنك تحديث اسم العامل، تاريخ بدء العمل، سعر الألف، واسم المستخدم والباسورد
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              
              {/* اسم العامل */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  اسم العامل: *
                </label>
                <input
                  type="text"
                  required
                  value={editingWorker.name}
                  onChange={(e) =>
                    setEditingWorker({ ...editingWorker, name: e.target.value })
                  }
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* تاريخ بدء العمل */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  تاريخ بدء العمل:
                </label>
                <input
                  type="date"
                  value={editingWorker.joinDate}
                  onChange={(e) =>
                    setEditingWorker({ ...editingWorker, joinDate: e.target.value })
                  }
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* سعر الألف */}
              <div>
                <label className="block font-bold text-stone-800 mb-1 flex items-center justify-between">
                  <span>سعر الـ 1000 لقمة ({settings.currency}):</span>
                  <span className="text-[11px] text-stone-400 font-normal">
                    (سعر المخبز: {settings.defaultRatePer1000})
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="1"
                    placeholder="فارغ = السعر الافتراضي"
                    value={
                      editingWorker.customRatePer1000 !== null
                        ? editingWorker.customRatePer1000
                        : ''
                    }
                    onChange={(e) =>
                      setEditingWorker({
                        ...editingWorker,
                        customRatePer1000:
                          e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setEditingWorker({ ...editingWorker, customRatePer1000: null })
                    }
                    className="px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-[11px] whitespace-nowrap"
                  >
                    افتراضي ({settings.defaultRatePer1000})
                  </button>
                </div>
              </div>

              {/* اسم المستخدم والباسورد */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 space-y-2.5">
                <div className="flex items-center gap-1.5 text-amber-950 font-bold text-[11px]">
                  <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                  <span>بيانات الدخول للمنصة:</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-stone-700 text-[11px] mb-1">
                      اسم المستخدم:
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={editingWorker.username || ''}
                      onChange={(e) =>
                        setEditingWorker({ ...editingWorker, username: e.target.value })
                      }
                      className="w-full p-2 bg-white border border-stone-300 rounded-xl text-stone-900 font-mono text-left"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 text-[11px] mb-1">
                      الباسورد:
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={editingWorker.password || ''}
                      onChange={(e) =>
                        setEditingWorker({ ...editingWorker, password: e.target.value })
                      }
                      className="w-full p-2 bg-white border border-stone-300 rounded-xl text-stone-900 font-mono text-left"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingWorker(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-600 font-semibold hover:bg-stone-200 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs transition-colors active:scale-98"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {archivingWorker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-md w-full text-right shadow-2xl">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <Archive className="w-5 h-5" />
              <h3 className="text-base font-bold text-stone-900">
                أرشفة حساب العامل ({archivingWorker.name})
              </h3>
            </div>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              عند أرشفة حساب العامل، سيتم نقله إلى تبويب <strong>"الحسابات المؤرشفة"</strong> حيث يمكنك استخدام <strong>زر التصفية النهائي</strong> لإصدار مخالصة مالية كاملة وصرف صافي المستحقات.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                سبب الأرشفة / انتهاء العمل:
              </label>
              <textarea
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                placeholder="مثال: انتهاء فترة العمل، سفر، تصفية حساب..."
                rows={2}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setArchivingWorker(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-200"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmArchive}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                تأكيد الأرشفة
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
