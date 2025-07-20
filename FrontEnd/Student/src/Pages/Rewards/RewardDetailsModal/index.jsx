// components/Student/RewardDetailsModal.jsx (مسیر فرضی)

import React from 'react';
import { IoClose } from 'react-icons/io5';

// کامپوننت کوچک و قابل استفاده مجدد برای نمایش هر فیلد
const DetailField = ({ label, value }) => (
    <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
        <div className="w-full bg-gray-100 p-2.5 rounded-lg text-sm text-gray-800 break-words">
            {value || <span className="text-gray-400 italic">ثبت نشده</span>}
        </div>
    </div>
);

const RewardDetailsModal = ({ isOpen, onClose, reward }) => {
    if (!isOpen || !reward) {
        return null;
    }

    // جلوگیری از بسته شدن مودال با کلیک روی محتوای آن
    const handleModalContentClick = (e) => e.stopPropagation();

    // استایل‌دهی به وضعیت
    const statusInfo = {
        text: reward.status,
        color: reward.statusColor || 'text-gray-500' // از رنگی که قبلاً در والد محاسبه شده استفاده می‌کنیم
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity"
            onClick={onClose}
            dir="rtl"
        >
            <div 
                className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-auto transform transition-all"
                onClick={handleModalContentClick}
            >
                <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">جزئیات درخواست پاداش</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
                        <IoClose size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DetailField label="عنوان پاداش" value={reward.title} />
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">وضعیت</label>
                            <div className={`p-2.5 rounded-lg text-sm font-semibold text-center ${statusInfo.color.replace('text-', 'bg-').replace('-500', '-100')}`}>
                                {statusInfo.text}
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DetailField label="تاریخ ثبت درخواست" value={reward.submissionDate} />
                        <DetailField label="تاریخ پرداخت / بررسی" value={reward.paymentDate} />
                    </div>

                    <DetailField label="توکن درخواستی" value={reward.tokenCost?.toLocaleString('fa-IR') || 'نامشخص'} />
                    
                    {/* این فیلدها باید از بک‌اند بیایند */}
                   

                </div>
                
                <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex justify-end">
                    <button 
                        onClick={onClose}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                        بستن
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RewardDetailsModal;