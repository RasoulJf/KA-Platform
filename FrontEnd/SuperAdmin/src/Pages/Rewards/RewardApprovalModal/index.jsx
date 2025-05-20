// PaymentModal.js
import React from 'react';
import { IoClose } from 'react-icons/io5';

// کامپوننت کوچک برای نمایش فیلدهای فرم
const DisplayField = ({ label, value, fullWidth = false }) => (
    <div className={`mb-5 ${fullWidth ? 'col-span-2' : ''}`}>
        <label className="block text-xs text-gray-500 text-right mb-1">{label}</label>
        <div className="bg-white p-3 rounded-md border-b-2 border-gray-200 text-right">
            <span className="text-indigo-800 font-semibold text-sm">{value}</span>
        </div>
    </div>
);

export default function RewardApprovalModal({ isOpen, onClose, rewardData, onConfirm }) {
    if (!isOpen || !rewardData) return null;

    // فرض میکنیم 'grade' در rewardData وجود دارد یا بخشی از نام است
    // برای مثال ساده، فعلا آن را از نام جدا نمیکنیم
    const displayName = `${rewardData.name} (${rewardData.grade || 'دهم'})`; // اضافه کردن پایه اگر موجود باشد

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative animate-modalShow">
                {/* دکمه بستن */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="بستن"
                >
                    <IoClose size={28} />
                </button>

                {/* عنوان مودال */}
                <h2 className="text-2xl font-bold text-center text-indigo-800 mb-8">
                    فرم پرداخت پاداش
                </h2>

                {/* فیلدهای فرم */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                    <DisplayField label="تاریخ ثبت پاداش" value={rewardData.submissionDate || 'نامشخص'} />
                    <DisplayField label="نام و نام‌خانوادگی" value={displayName} />
                    <DisplayField label="عنوان" value={rewardData.title || 'نامشخص'} fullWidth={true} />
                    <DisplayField label="شرح" value={rewardData.description || rewardData.title || 'نامشخص'} fullWidth={true} /> {/* اگر description نبود از title استفاده کن */}
                    <DisplayField label="تاریخ پرداخت پاداش" value={rewardData.paymentDate || '۲۷ اردیبهشت ۱۴۰۳'} /> {/* یا تاریخ روز */}
                    <DisplayField label="تعداد توکن پرداختی" value={rewardData.tokenAmount || '۸۷۵ K'} /> {/* یا یک فیلد واقعی از rewardData */}
                </div>

                {/* دکمه تایید */}
                <button
                    onClick={() => onConfirm(rewardData.id)}
                    className="w-full mt-8 bg-[#19A297] hover:bg-[#148A7F] text-white font-semibold py-3 px-4 rounded-lg transition duration-150 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-[#19A297] focus:ring-opacity-50"
                >
                    تایید
                </button>
            </div>
        </div>
    );
}