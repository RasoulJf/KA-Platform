// components/Admin/RequestApprovalModal.jsx (مسیر فرضی)
import React, { useState, useEffect } from 'react';
import { IoClose, IoChevronDown } from "react-icons/io5";

export default function RequestApprovalModal({
    isOpen,
    onClose,
    requestData,
    onApprove,
    onReject,
}) {
    const [points, setPoints] = useState('');
    const [adminComment, setAdminComment] = useState('');
    const [error, setError] = useState('');
    
    // State برای نگهداری جزئیات انتخابی توسط ادمین
    const [selectedDetails, setSelectedDetails] = useState('');

    useEffect(() => {
        if (isOpen && requestData) {
            const scoreDef = requestData.activityDefinition?.scoreDefinition;
            let initialPoints = '';
            
            // جزئیات ثبت شده توسط دانش‌آموز (اگر وجود داشته باشد) به عنوان پیش‌فرض
            let initialDetails = requestData.details || ''; 

            // اگر دانش‌آموز گزینه‌ای را انتخاب کرده بود، امتیاز و جزئیات را بر اساس آن پیدا کن
            if (scoreDef?.inputType === 'select_from_enum' && requestData.details) {
                const matchingOption = scoreDef.enumOptions.find(opt => opt.label === requestData.details);
                if (matchingOption) {
                    initialPoints = String(matchingOption.value);
                }
            } else if (requestData.scoreAwarded != null) {
                // در غیر این صورت، از امتیاز ثبت شده قبلی استفاده کن (برای حالتی که ادمین بعدا ویرایش می‌کند)
                initialPoints = String(requestData.scoreAwarded);
            }
            
            setPoints(initialPoints);
            setSelectedDetails(initialDetails); // ست کردن مقدار اولیه جزئیات
            setAdminComment(requestData.adminComment || '');
            setError('');
        }
    }, [isOpen, requestData]);

    // تابع برای تایید درخواست
    const handleApproveClick = () => {
        setError('');
        const scoreToAward = parseFloat(points);
        if (points === '' || isNaN(scoreToAward)) {
            setError('لطفاً امتیاز معتبری را وارد یا انتخاب کنید.');
            return;
        }
        
        // ارسال `details` انتخابی ادمین به تابع والد
        onApprove(requestData._id, scoreToAward, adminComment, selectedDetails);
    };

    // تابع برای رد کردن درخواست
    const handleRejectClick = () => {
        setError('');
        if (!adminComment.trim()) {
            setError('برای رد کردن درخواست، نوشتن کامنت الزامی است.');
            return;
        }
        onReject(requestData._id, adminComment);
    };

    // تابع برای مدیریت تغییر امتیاز و آپدیت کردن همزمان `details`
    const handlePointsChange = (e) => {
        const scoreValue = e.target.value;
        setPoints(scoreValue);

        // اگر نوع اینپوت `select` است، `details` را بر اساس `label` گزینه انتخابی ست کن
        const scoreDef = requestData.activityDefinition?.scoreDefinition;
        if (scoreDef?.inputType === 'select_from_enum') {
            const matchingOption = scoreDef.enumOptions.find(opt => String(opt.value) === scoreValue);
            setSelectedDetails(matchingOption ? matchingOption.label : '');
        } else {
            // برای اینپوت عددی دستی، جزئیات همان مقدار عددی است
            setSelectedDetails(scoreValue);
        }
    };
    
    // جلوگیری از بسته شدن مودال با کلیک روی محتوای آن
    const handleModalContentClick = (e) => e.stopPropagation();
    
    if (!isOpen || !requestData) return null;
    
    const scoreDef = requestData.activityDefinition?.scoreDefinition;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose} dir="rtl">
            <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-lg mx-auto" onClick={handleModalContentClick}>
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">بررسی درخواست</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors"><IoClose size={24} /></button>
                </div>

                {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md mb-4 text-center">{error}</p>}

                <div className="space-y-4 text-right mb-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500">دانش آموز:</label>
                            <div className="bg-gray-100 p-2 rounded mt-1 text-sm">{requestData.studentName}</div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500">تاریخ ثبت:</label>
                            <div className="bg-gray-100 p-2 rounded mt-1 text-sm">{new Intl.DateTimeFormat('fa-IR', {dateStyle: 'short'}).format(new Date(requestData.submissionDate))}</div>
                        </div>
                    </div>

                    <div><label className="block text-xs text-gray-500">عنوان فعالیت:</label> <div className="bg-gray-100 p-2 rounded mt-1 text-sm font-medium">{requestData.activityTitle}</div></div>
                    {/* اگر دانش‌آموز جزئیاتی وارد کرده بود نمایش داده شود */}
                    {requestData.details && <div><label className="block text-xs text-gray-500">جزئیات ثبت شده توسط دانش‌آموز:</label> <div className="bg-gray-100 p-2 rounded mt-1 text-sm whitespace-pre-wrap">{requestData.details}</div></div>}
                    {/* اگر دانش‌آموز توضیحات بیشتری نوشته بود نمایش داده شود (شما فیلدی برای این در بک‌اند نفرستادید، اما اگر داشتید اینجا اضافه می‌شد) */}
                    {requestData.studentDescription && <div><label className="block text-xs text-gray-500">توضیحات دانش‌آموز:</label> <div className="bg-gray-100 p-2 rounded mt-1 text-sm whitespace-pre-wrap">{requestData.studentDescription}</div></div>}


                    {/* بخش امتیاز */}
                    <div>
                        <label htmlFor="pointsModal" className="block text-sm font-medium text-gray-700 mb-1">
                            امتیاز/سطح تخصیصی
                        </label>
                        {scoreDef && scoreDef.inputType === 'select_from_enum' ? (
                            <div className="relative">
                                <select 
                                    id="pointsModal" 
                                    value={points} 
                                    onChange={handlePointsChange}
                                    className="w-full p-2 border border-gray-300 rounded-md appearance-none text-right"
                                >
                                    <option value="">-- انتخاب امتیاز --</option>
                                    {(scoreDef.enumOptions || []).map((opt, index) => (
                                        <option key={`${opt.value}-${index}`} value={opt.value}>
                                            {opt.label} ({opt.value.toLocaleString('fa-IR')} امتیاز)
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 left-0 flex items-center px-2 pointer-events-none">
                                    <IoChevronDown className="text-gray-400" />
                                </div>
                            </div>
                        ) : (
                            <input 
                                type="number" 
                                id="pointsModal" 
                                value={points} 
                                onChange={handlePointsChange}
                                className="w-full p-2 border border-gray-300 rounded-md text-right" 
                                placeholder="امتیاز را دستی وارد کنید"
                            />
                        )}
                    </div>
                    
                    <div>
                        <label htmlFor="adminComment" className="block text-sm font-medium text-gray-700 mb-1">کامنت ادمین (برای رد کردن الزامی است)</label>
                        <textarea 
                            id="adminComment" 
                            value={adminComment} 
                            onChange={(e) => setAdminComment(e.target.value)}
                            rows="3" 
                            className="w-full p-2 border border-gray-300 rounded-md text-right">
                        </textarea>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t mt-6">
                    <button onClick={handleRejectClick} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors">رد کردن</button>
                    <button onClick={handleApproveClick} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors">تایید کردن</button>
                </div>
            </div>
        </div>
    );
}