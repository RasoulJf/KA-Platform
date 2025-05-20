import React, { useState, useEffect } from 'react';
import { IoIosArrowDown } from "react-icons/io";
import { HiX } from "react-icons/hi"; // آیکون بستن

// کامپوننت مودال تأیید درخواست
export default function RequestApprovalModal({ isOpen, onClose, requestData, onApprove, onReject }) {
    // State برای نگهداری امتیاز وارد شده/انتخاب شده
    const [points, setPoints] = useState('');

    // وقتی requestData تغییر می‌کند (کاربر روی درخواست دیگری کلیک می‌کند)
    // امتیاز را ریست می‌کنیم یا مقدار پیش‌فرض را قرار می‌دهیم
    useEffect(() => {
        if (requestData) {
            // می‌توانید امتیاز پیش‌فرض را از requestData بگیرید اگر وجود دارد
            // setPoints(requestData.defaultPoints || '');
            setPoints(''); // یا همیشه خالی شروع شود
        }
    }, [requestData]);

    // اگر مودال باز نیست، چیزی رندر نکن
    if (!isOpen || !requestData) {
        return null;
    }

    const handleApproveClick = () => {
        // اینجا می‌توانید اعتبارسنجی برای امتیاز انجام دهید
        if (!points && points !== 0) { // اگر امتیاز الزامی است
            alert('لطفا امتیاز را مشخص کنید.');
            return;
        }
        onApprove(requestData.id, Number(points)); // ارسال ID درخواست و امتیاز
    };

    const handleRejectClick = () => {
        onReject(requestData.id); // ارسال ID درخواست
    };

    // تابع برای جلوگیری از بسته شدن مودال هنگام کلیک داخل آن
    const handleModalContentClick = (e) => {
        e.stopPropagation();
    };


    return (
        // Backdrop (پس‌زمینه تیره)
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20  bg-opacity-60 transition-opacity duration-300 ease-in-out"
            onClick={onClose} // بستن مودال با کلیک روی پس‌زمینه
        >
            {/* Modal Content */}
            <div
                className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg mx-4 transform transition-all duration-300 ease-in-out"
                onClick={handleModalContentClick} // جلوگیری از بسته شدن هنگام کلیک داخلی
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-[#202A5A] text-right">فرم تأیید درخواست</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 transition-colors"
                        aria-label="بستن"
                    >
                        <HiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Request Details */}
                <div className="space-y-4 text-right mb-6">
                    {/* Row 1: Name & Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">تاریخ ثبت درخواست</label>
                            <div className="bg-gray-50 border border-gray-200 rounded p-2.5 text-sm text-gray-800">{requestData.submissionDate || '۲۷ اردیبهشت ۱۴۰۳'}</div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">نام و نام خانوادگی <span className='text-gray-400'>({requestData.grade || 'دهم'})</span></label>
                            <div className="bg-gray-50 border border-gray-200 rounded p-2.5 text-sm text-gray-800">{requestData.name || 'امیرعلی جهدی'}</div>
                        </div>
                    </div>

                    {/* Row 2: Title */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">عنوان</label>
                        <div className="bg-gray-50 border border-gray-200 rounded p-2.5 text-sm text-gray-800">{requestData.title || 'دوره‌های آموزشی برون مدرسه‌ای'}</div>
                    </div>

                    {/* Row 3: Description */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">شرح</label>
                        <div className="bg-gray-50 border border-gray-200 rounded p-2.5 text-sm text-gray-800 min-h-[80px] leading-relaxed">
                            {requestData.description || 'دوره‌های آموزشی برون مدرسه‌ای دوره‌های آموزشی برون مدرسه‌ای دوره‌های آموزشی برون مدرسه‌ای دوره‌های آموزشی برون مدرسه‌ای.'}
                        </div>
                    </div>
                </div>

                {/* Action Area */}
                <div className="flex flex-col sm:flex-row-reverse gap-3 pt-4 border-t border-gray-200">
                    {/* Points Input/Select */}
                    <div className="flex items-center relative justify-between gap-x-2 bg-gray-50 p-2 rounded-md border border-gray-200 sm:flex-grow-0 sm:w-40"> {/* Width adjusted */}
                        <IoIosArrowDown className="text-gray-400 flex-shrink-0 order-1" /> {/* Order changed */}
                        <input
                            type="number"
                            id="points"
                            name="points"
                            value={points}
                            onChange={(e) => setPoints(e.target.value)}
                            className="flex-grow px-2 absolute left-[-30px] py-1 border-0 focus:ring-0 focus:outline-none text-sm text-right bg-transparent order-2" // Order changed
                            min="0" // Optional: minimum points
                        />
                        <label htmlFor="points" className="absolute text-sm font-medium text-gray-700 flex-shrink-0 whitespace-nowrap order-3 right-10">امتیاز</label> {/* Order changed */}
                    </div>
                    {/* Approve Button */}
                    <button
                        onClick={handleApproveClick}
                        className="flex-1 bg-[#19A297] hover:bg-[#14857d] text-white font-medium py-2.5 px-6 rounded-md transition-colors"
                    >
                        تأیید
                    </button>
                    {/* Reject Button */}
                    <button
                        onClick={handleRejectClick}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors"
                    >
                        عدم تأیید
                    </button>

                    
                </div>
            </div>
        </div>
    );
}