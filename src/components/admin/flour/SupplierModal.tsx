import React, { useState } from 'react';
import { FlourSupplier } from '../../../types';
import { useBakery } from '../../../context/BakeryContext';
import {
  X,
  Building2,
  Phone,
  MapPin,
  FileText,
  Wheat,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface SupplierModalProps {
  supplier?: FlourSupplier | null; // null if adding new
  onClose: () => void;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  supplier,
  onClose,
}) => {
  const { suppliers, addSupplier, updateSupplier } = useBakery();

  const isEditing = !!supplier;

  const [name, setName] = useState<string>(supplier?.name || '');
  const [code, setCode] = useState<string>(
    supplier?.code || `SUP-${suppliers.length + 101}`
  );
  const [contactPerson, setContactPerson] = useState<string>(supplier?.contactPerson || '');
  const [phone, setPhone] = useState<string>(supplier?.phone || '');
  const [address, setAddress] = useState<string>(supplier?.address || '');
  const [flourType, setFlourType] = useState<string>(
    supplier?.flourType || 'دقيق فاخر استخراج 72%'
  );
  const [notes, setNotes] = useState<string>(supplier?.notes || '');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('يرجى إدخال اسم المورد أو المطحن أو التاجر');
      return;
    }

    if (isEditing && supplier) {
      updateSupplier(supplier.id, {
        name: name.trim(),
        code: code.trim(),
        contactPerson: contactPerson.trim() || undefined,
        phone: phone.trim(),
        address: address.trim() || undefined,
        flourType: flourType.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addSupplier({
        name: name.trim(),
        code: code.trim(),
        contactPerson: contactPerson.trim() || undefined,
        phone: phone.trim(),
        address: address.trim() || undefined,
        flourType: flourType.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 text-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-5 sm:p-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {isEditing ? 'تعديل بيانات مورد الدقيق' : 'إضافة مورد / مطحن دقيق جديد'}
              </h3>
              <p className="text-xs text-stone-400">
                تسجيل بيانات التاجر لفتح كشف حساب ومتابعة تنزيل الدقيق
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
          
          {/* Supplier Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              اسم المورد / المطحن / التاجر: *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="مثال: مطاحن الأهرام أو الحاج مصطفى للغلال"
              value={name}
              onChange={(e) => {
                setError('');
                setName(e.target.value);
              }}
              className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs font-bold focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Grid: Code & Contact Person */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                كود المورد:
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-amber-400 font-mono text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                المسؤول أو المندوب:
              </label>
              <input
                type="text"
                placeholder="اسم الشخص المسؤول"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          {/* Grid: Phone & Flour Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                رقم التليفون:
              </label>
              <input
                type="tel"
                dir="ltr"
                placeholder="010xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                نوع الدقيق الأساسي:
              </label>
              <input
                type="text"
                placeholder="فاخر 72% / شامي"
                value={flourType}
                onChange={(e) => setFlourType(e.target.value)}
                className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              العنوان / المقر:
            </label>
            <input
              type="text"
              placeholder="مثال: طريق قليوب أو المنطقة الصناعية"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              ملاحظات إضافية:
            </label>
            <input
              type="text"
              placeholder="شروط السداد، مواعيد التوريد، إلخ..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              id="save-supplier-btn"
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? 'حفظ التعديلات' : 'إضافة المورد وفتح الحساب'}</span>
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
