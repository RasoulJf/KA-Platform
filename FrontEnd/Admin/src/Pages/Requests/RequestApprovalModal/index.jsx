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
    console.log("Request Data in Modal:", JSON.stringify(requestData, null, 2));
    useEffect(() => {
        if (isOpen && requestData) {
            const scoreDef = requestData.activityDefinition?.scoreDefinition;
            const valueDef = requestData.activityDefinition?.valueInput;
            let initialPoints = '';

            if (scoreDef?.inputType === 'fixed_from_enum_single' && scoreDef.enumOptions?.length > 0) {
                initialPoints = String(scoreDef.enumOptions[0]);
            } else if (scoreDef?.inputType === 'calculated_from_value' && valueDef?.type === 'number') {
                const detailsNum = parseFloat(requestData.details);
                if (!isNaN(detailsNum) && scoreDef.multiplier != null) {
                    let calcScore = detailsNum * scoreDef.multiplier;
                    if (scoreDef.min != null) calcScore = Math.max(scoreDef.min, calcScore);
                    if (scoreDef.max != null) calcScore = Math.min(scoreDef.max, calcScore);
                    initialPoints = String(calcScore);
                } else {
                    // اگر محاسبه خودکار ممکن نیست، با امتیاز قبلی (اگر هست) یا خالی شروع کن
                    initialPoints = requestData.scoreAwarded != null ? String(requestData.scoreAwarded) : '';
                }
            } else if (requestData.scoreAwarded != null) {
                // برای انواع دیگر، اگر امتیاز قبلی هست، آن را بگذار
                initialPoints = String(requestData.scoreAwarded);
            }
            setPoints(initialPoints);
            setAdminComment(requestData.adminComment || '');
            setError('');
        } else if (!isOpen) {
            setPoints('');
            setAdminComment('');
            setError('');
        }
    }, [isOpen, requestData]);

    if (!isOpen || !requestData) {
        return null;
    }

    const handleApproveClick = () => {
        setError('');
        const scoreDef = requestData.activityDefinition?.scoreDefinition;
        const scoreToAward = parseFloat(points);

        // امتیاز همیشه باید توسط ادمین وارد یا انتخاب شود (مگر اینکه از قبل مقدار داشته باشد)
        if (points === '' || isNaN(scoreToAward)) {
            setError('لطفاً امتیاز معتبری را وارد یا انتخاب کنید.');
            return;
        }

        // اعتبارسنجی بر اساس تعریف فعالیت، حتی اگر ادمین دستی وارد می‌کند
        if (scoreDef) {
            if (scoreDef.inputType === 'select_from_enum') {
                if (!scoreDef.enumOptions || !scoreDef.enumOptions.includes(scoreToAward)) {
                    setError(`امتیاز ${scoreToAward} در لیست مجاز فعالیت (${scoreDef.enumOptions?.join(', ')}) نیست. لطفاً یک گزینه معتبر انتخاب کنید یا امتیاز را دستی وارد کنید (اگر این فعالیت چنین اجازه‌ای می‌دهد).`);
                    // اگر می‌خواهید ادمین بتواند خارج از enum هم امتیاز دهد، این return را بردارید یا شرط را تغییر دهید.
                    // فعلاً برای select_from_enum، انتخاب از لیست الزامی است.
                    return;
                }
            } else if (scoreDef.inputType === 'number_in_range' || scoreDef.inputType === 'manual_number_entry' || scoreDef.inputType === 'calculated_from_value' || scoreDef.inputType === 'fixed_from_enum_single') {
                // برای همه انواع دیگر که به عدد ختم می‌شوند، min/max را چک می‌کنیم اگر تعریف شده باشند
                if ((scoreDef.min != null && scoreToAward < scoreDef.min) || (scoreDef.max != null && scoreToAward > scoreDef.max)) {
                    let rangeMessage = '';
                    if (scoreDef.min != null && scoreDef.max != null) rangeMessage = `بین ${scoreDef.min} و ${scoreDef.max}`;
                    else if (scoreDef.min != null) rangeMessage = `بزرگتر یا مساوی ${scoreDef.min}`;
                    else if (scoreDef.max != null) rangeMessage = `کوچکتر یا مساوی ${scoreDef.max}`;

                    setError(rangeMessage ? `امتیاز وارد شده باید ${rangeMessage} باشد.` : 'امتیاز وارد شده خارج از محدوده مجاز است.');
                    return;
                }
            }
        }
        onApprove(requestData._id, scoreToAward, adminComment);
    };

    const handleRejectClick = () => {
        setError('');
        onReject(requestData._id, adminComment);
    };

    const handleModalContentClick = (e) => e.stopPropagation();

    const scoreDef = requestData.activityDefinition?.scoreDefinition;
    const valueDef = requestData.activityDefinition?.valueInput;

    // امتیاز پیشنهادی برای نمایش (اگر محاسبه ای یا ثابت است)
    let suggestedScore = '';
    if (scoreDef?.inputType === 'fixed_from_enum_single' && scoreDef.enumOptions?.length > 0) {
        suggestedScore = `پیشنهاد سیستم (ثابت): ${scoreDef.enumOptions[0]}`;
    } else if (scoreDef?.inputType === 'calculated_from_value') {
        const detailsNum = parseFloat(requestData.details);
        if (valueDef?.type === 'number' && !isNaN(detailsNum) && scoreDef.multiplier != null) {
            let calcScore = detailsNum * scoreDef.multiplier;
            if (scoreDef.min != null) calcScore = Math.max(scoreDef.min, calcScore);
            if (scoreDef.max != null) calcScore = Math.min(scoreDef.max, calcScore);
            suggestedScore = `امتیاز محاسبه شده پیشنهادی: ${calcScore}`;
        } else {
            suggestedScore = "محاسبه خودکار ممکن نیست (جزئیات عددی نیست یا ضریب تعریف نشده).";
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300 ease-in-out" onClick={onClose} dir="rtl">
            <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-lg mx-4 transform transition-all duration-300 ease-in-out" onClick={handleModalContentClick}>
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-[#202A5A] text-right">بررسی درخواست فعالیت</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors" aria-label="بستن">
                        <IoClose className="w-6 h-6" />
                    </button>
                </div>

                {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md mb-4 text-center">{error}</p>}

                <div className="space-y-4 text-right mb-6 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-0.5">دانش آموز</label>
                            <div className="bg-gray-50 border rounded p-2 text-sm text-gray-800">{requestData.studentName || '-'} ({requestData.studentGrade || ''} {requestData.studentClass || ''})</div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-0.5">تاریخ ثبت توسط دانش آموز</label>
                            <div className="bg-gray-50 border rounded p-2 text-sm text-gray-800">{requestData.submissionDate ? new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(requestData.submissionDate)) : '-'}</div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-0.5">عنوان فعالیت</label>
                        <div className="bg-gray-50 border rounded p-2 text-sm text-gray-800 font-medium">{requestData.activityTitle || '-'}</div>
                    </div>
                    {requestData.activityDefinition?.description && (
                         <p className="text-xs text-gray-500 bg-blue-50 p-2 rounded-md border border-blue-200">
                            <strong>راهنمای فعالیت:</strong> {requestData.activityDefinition.description}
                        </p>
                    )}
                    {requestData.details !== undefined && requestData.details !== null && String(requestData.details).trim() !== '' && (
                        <div>
                            <label className="block text-xs text-gray-500 mb-0.5">{valueDef?.label || 'جزئیات ثبت شده توسط دانش آموز'}</label>
                            <div className="bg-gray-50 border rounded p-2.5 text-sm text-gray-800 min-h-[60px] leading-relaxed whitespace-pre-wrap">
                                {requestData.details}
                            </div>
                        </div>
                    )}

                    {/* فیلد امتیاز داینامیک */}
                    {scoreDef && (
                        <div className="relative">
                            <label htmlFor="pointsModal" className="block text-xs font-medium text-gray-500 mb-1">
                                امتیاز تخصیصی <span className="text-red-500">*</span>
                                {scoreDef.inputType === 'select_from_enum' && " (انتخاب از لیست)"}
                                {(scoreDef.inputType === 'number_in_range' || scoreDef.inputType === 'manual_number_entry') && ` (محدوده مجاز: ${scoreDef.min ?? 0} تا ${scoreDef.max ?? '∞'})`}
                            </label>
                            {scoreDef.inputType === 'select_from_enum' ? (
                                <div className="relative">
                                    <select
                                        id="pointsModal"
                                        value={points}
                                        onChange={(e) => setPoints(e.target.value)}
                                        className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#19A297] focus:border-[#19A297] text-[#202A5A] text-sm text-right appearance-none"
                                    >
                                        <option value="" disabled={points !== ''}>انتخاب امتیاز...</option>
                                        {(scoreDef.enumOptions || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <IoChevronDown className="text-gray-400" />
                                    </div>
                                </div>
                            ) : ( // calculated_from_value, fixed_from_enum_single, number_in_range, manual_number_entry
                                <input
                                    type="number"
                                    id="pointsModal"
                                    value={points} // ادمین همیشه می‌تواند تغییر دهد
                                    onChange={(e) => setPoints(e.target.value)}
                                    min={(scoreDef.inputType === 'number_in_range' || scoreDef.inputType === 'manual_number_entry') ? scoreDef.min : undefined}
                                    max={(scoreDef.inputType === 'number_in_range' || scoreDef.inputType === 'manual_number_entry') ? scoreDef.max : undefined}
                                    step="any"
                                    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#19A297] focus:border-[#19A297] text-[#202A5A] text-sm text-right`}
                                    placeholder="امتیاز را وارد کنید"
                                />
                            )}
                            {suggestedScore && (
                                <p className="mt-1 text-xs text-blue-600 text-right">{suggestedScore}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <label htmlFor="adminComment" className="block text-xs font-medium text-gray-500 mb-1">کامنت ادمین</label>
                        <textarea id="adminComment" value={adminComment} onChange={(e) => setAdminComment(e.target.value)}
                            rows="5" // افزایش ارتفاع
                            placeholder="نظر خود را بنویسید (اختیاری برای تایید، می‌تواند برای رد الزامی باشد)..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#19A297] focus:border-[#19A297] text-[#202A5A] text-sm text-right placeholder-gray-400 resize-none"
                        ></textarea>
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    <button type="button" onClick={onClose} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 px-6 rounded-md transition-colors">انصراف</button>
                    <button onClick={handleRejectClick} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors">رد درخواست</button>
                    <button onClick={handleApproveClick} className="flex-1 bg-[#19A297] hover:bg-[#14857d] text-white font-medium py-2.5 px-6 rounded-md transition-colors">تایید و ثبت امتیاز</button>
                </div>
            </div>
        </div>
    );
}