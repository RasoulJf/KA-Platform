// components/Student/ActivityDetailsModal.jsx (مسیر فرضی)

import React from 'react';
import { IoClose, IoChatboxEllipsesOutline, IoChatbubbleEllipsesOutline } from 'react-icons/io5';

const ActivityDetailsModal = ({ isOpen, onClose, activity }) => {
    if (!isOpen || !activity) {
        return null;
    }

    const handleModalContentClick = (e) => e.stopPropagation();

    // تابع برای نمایش متن یا پیام "ثبت نشده"
    const renderField = (label, value, isTextArea = false) => (
        <div>
            <label className="block text-xs text-gray-500 mb-1">{label}</label>
            {isTextArea ? (
                <div className="bg-gray-100 p-3 rounded-lg text-sm text-gray-800 min-h-[80px] whitespace-pre-wrap">
                    {value || <span className="text-gray-400 italic">ثبت نشده</span>}
                </div>
            ) : (
                <div className="bg-gray-100 p-2.5 rounded-lg text-sm text-gray-800">
                    {value || <span className="text-gray-400 italic">ثبت نشده</span>}
                </div>
            )}
        </div>
    );
    
    // تابع برای استایل‌دهی به وضعیت
    const getStatusInfo = (status) => {
        switch (status) {
            case 'approved': return { text: 'تایید شده', color: 'bg-green-100 text-green-800' };
            case 'rejected': return { text: 'تایید نشده', color: 'bg-red-100 text-red-800' };
            case 'pending': return { text: 'در انتظار بررسی', color: 'bg-yellow-100 text-yellow-800' };
            default: return { text: status, color: 'bg-gray-100 text-gray-800' };
        }
    };
    const statusInfo = getStatusInfo(activity.status);

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
                    <h2 className="text-lg font-semibold text-gray-800">جزئیات فعالیت</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
                        <IoClose size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderField("عنوان فعالیت", activity.activityName)}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">وضعیت</label>
                            <div className={`p-2.5 rounded-lg text-sm font-semibold text-center ${statusInfo.color}`}>
                                {statusInfo.text}
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderField("تاریخ ثبت", activity.submissionDate ? new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date(activity.submissionDate)) : '-')}
                        {renderField("تاریخ بررسی", activity.reviewDate ? new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date(activity.reviewDate)) : '-')}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {/* {renderField("شرح/مقدار ثبت شده", activity.details)} */}
                         {renderField("امتیاز تخصیص یافته", activity.scoreAwarded?.toLocaleString('fa-IR'))}
                    </div>

                    {/* بخش کامنت‌ها */}
                    <div className="pt-2">
                        {renderField("توضیحات شما", activity.description, true)}
                    </div>
                    
                    <div className="pt-2">
                        {renderField("کامنت ادمین", activity.adminComment, true)}
                    </div>

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

export default ActivityDetailsModal;