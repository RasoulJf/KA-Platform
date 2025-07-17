// AddActivityModal.jsx (نسخه کامل و اصلاح شده)

import React, { useState, useEffect, useMemo } from 'react';
import fetchData from '../../../Utils/fetchData';
import { IoClose, IoChevronDown } from "react-icons/io5";

const INITIAL_FORM_DATA = {
    activityCategory: '',
    activityTitle: '',
    details: '',
    studentDescription: '',
};

export default function AddActivityModal({
    isOpen,
    onClose,
    onSubmit,
    token,
}) {
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [internalActivityCategories, setInternalActivityCategories] = useState([]);
    const [loadingInternalCategories, setLoadingInternalCategories] = useState(false);
    const [availableActivityTitles, setAvailableActivityTitles] = useState([]);
    const [loadingActivityTitles, setLoadingActivityTitles] = useState(false);
    const [selectedActivityFullDetails, setSelectedActivityFullDetails] = useState(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submissionDate = useMemo(() =>
        new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date())
    , []);

    // ۱. لود دسته‌بندی‌ها (بدون تغییر)
    useEffect(() => {
        const fetchCategories = async () => {
            if (token && internalActivityCategories.length === 0) {
                setLoadingInternalCategories(true); setError('');
                try {
                    const response = await fetchData('admin-activity/distinct/parents', { headers: { authorization: `Bearer ${token}` } });
                    if (response.success) {
                        setInternalActivityCategories(response.data || []);
                    } else {
                        setError("خطا در دریافت دسته‌بندی‌ها: " + (response.message || "خطای ناشناخته"));
                    }
                } catch (err) { setError("خطای شبکه (دسته‌بندی): " + (err.message || "خطای ناشناخته")); }
                finally { setLoadingInternalCategories(false); }
            }
        };
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen, token, internalActivityCategories.length]);

    // ۲. لود عناوین فعالیت با تغییر دسته‌بندی (بدون تغییر)
    useEffect(() => {
        const fetchTitles = async () => {
            if (formData.activityCategory && token) {
                setLoadingActivityTitles(true); setError('');
                setAvailableActivityTitles([]); setSelectedActivityFullDetails(null);
                setFormData(prev => ({ ...prev, activityTitle: '', details: '' }));
                try {
                    const response = await fetchData(`activity/by-parent?parent=${encodeURIComponent(formData.activityCategory)}`, { headers: { authorization: `Bearer ${token}` } });
                    if (response.success) {
                        setAvailableActivityTitles(response.data || []);
                        if (!response.data || response.data.length === 0) setError("عنوانی برای این دسته‌بندی یافت نشد.");
                    } else { setError("خطا در دریافت عناوین: " + (response.message || "خطای ناشناخته")); }
                } catch (err) { setError("خطای شبکه (عناوین): " + (err.message || "خطای ناشناخته")); }
                finally { setLoadingActivityTitles(false); }
            } else {
                setAvailableActivityTitles([]); setSelectedActivityFullDetails(null);
            }
        };
        if (isOpen) fetchTitles();
    }, [isOpen, formData.activityCategory, token]);

    // ۴. ریست فرم (بدون تغییر)
    useEffect(() => {
        if (isOpen) {
            setFormData(INITIAL_FORM_DATA);
            setSelectedActivityFullDetails(null);
            setAvailableActivityTitles([]);
            setError('');
            setSubmitting(false);
        }
    }, [isOpen]);

    // تابع handleChange (بدون تغییر)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => {
            const newState = { ...prevFormData, [name]: value };
            if (name === "activityTitle") {
                const foundActivity = availableActivityTitles.find(act => act._id === value);
                setSelectedActivityFullDetails(foundActivity || null);
                newState.details = '';
            }
            return newState;
        });
    };

    // <<< تغییر کلیدی ۱: اصلاح منطق handleFormSubmit >>>
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.activityCategory || !formData.activityTitle) { setError("لطفاً دسته‌بندی و عنوان فعالیت را انتخاب کنید."); return; }
        if (!token) { setError("توکن احراز هویت یافت نشد."); return; }

        // تشخیص می‌دهیم که آیا انتخاب سطح با ادمین است یا خیر
        const isLevelSelectByAdmin =
            selectedActivityFullDetails?.valueInput?.type === 'select' &&
            selectedActivityFullDetails?.valueInput?.label?.includes('سطح');

        // اعتبارسنجی را فقط برای مواردی اجرا می‌کنیم که انتخاب سطح با دانش‌آموز است
        if (!isLevelSelectByAdmin && selectedActivityFullDetails?.valueInput?.required && !formData.details.trim()) {
            setError(`فیلد '${selectedActivityFullDetails.valueInput.label || "جزئیات/مقدار"}' الزامی است.`);
            return;
        }

        setSubmitting(true); setError('');

        const payload = {
            activityId: formData.activityTitle,
            // اگر انتخاب با ادمین بود، details را ارسال نکن
            details: isLevelSelectByAdmin
                ? undefined
                : ((selectedActivityFullDetails?.valueInput?.type !== 'none' && formData.details.trim() !== '') ? formData.details.trim() : undefined),
            description: formData.studentDescription.trim() || undefined,
        };

        try {
            const response = await fetchData('student-activity', { method: 'POST', headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
            if (response.success) {
                if (onSubmit) onSubmit(response.data);
                onClose();
            } else { setError(response.message || "خطا در ثبت فعالیت."); }
        } catch (err) { setError("خطای شبکه یا سرور: " + (err.message || "خطای ناشناخته")); }
        finally { setSubmitting(false); }
    };

    // <<< تغییر کلیدی ۲: اصلاح منطق renderDynamicValueInputField >>>
    const renderDynamicValueInputField = () => {
        if (!selectedActivityFullDetails || !selectedActivityFullDetails.valueInput || selectedActivityFullDetails.valueInput.type === 'none') {
            return null;
        }

        // تشخیص می‌دهیم که آیا انتخاب سطح با ادمین است یا خیر
        const isLevelSelectByAdmin =
            selectedActivityFullDetails.valueInput.type === 'select' &&
            selectedActivityFullDetails.valueInput.label?.includes('سطح');

        // اگر انتخاب سطح با ادمین است، یک پیام راهنما نشان بده و فیلد را نمایش نده
        if (isLevelSelectByAdmin) {
            return (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm p-3 rounded-lg text-right">
                    <p>برای این فعالیت، سطح‌بندی توسط ادمین انجام می‌شود. لطفاً توضیحات لازم را در کادر پایین وارد کنید.</p>
                </div>
            );
        }

        // در غیر این صورت، فیلد را طبق معمول نمایش بده
        const { type, label, required, numberMin, numberMax } = selectedActivityFullDetails.valueInput;
        const optionsForSelect = selectedActivityFullDetails.scoreDefinition?.inputType === 'select_from_enum'
            ? selectedActivityFullDetails.scoreDefinition.enumOptions
            : [];

        return (
            <div>
                <label htmlFor="details" className="block text-xs font-medium text-gray-500 mb-1 text-right">
                    {label || 'جزئیات/مقدار'} {required && <span className="text-red-500">*</span>}
                </label>
                {type === 'select' ? (
                    <div className="relative">
                        <select
                            id="details" name="details" value={formData.details} onChange={handleChange} required={required}
                            className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#19A297] focus:border-[#19A297] text-[#202A5A] text-sm text-right appearance-none"
                        >
                            <option value="" disabled>-- {label || "یک گزینه انتخاب کنید"} --</option>
                            {Array.isArray(optionsForSelect) && optionsForSelect.map((opt, idx) => (
                                <option key={opt.label + '-' + idx} value={opt.label}>{opt.label}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IoChevronDown className="text-gray-400" /></div>
                    </div>
                ) : (
                    <input
                        type={type === 'number' ? 'number' : 'text'}
                        id="details" name="details" value={formData.details} onChange={handleChange}
                        placeholder={label || "مقدار را وارد کنید..."} required={required}
                        min={type === 'number' && numberMin !== undefined ? numberMin : undefined}
                        max={type === 'number' && numberMax !== undefined ? numberMax : undefined}
                        step={type === 'number' ? (label && label.toLowerCase().includes('معدل') ? "0.01" : "any") : undefined}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#19A297] focus:border-[#19A297] text-[#202A5A] text-sm text-right placeholder-gray-400"
                    />
                )}
                {selectedActivityFullDetails.description && !type.includes('select') && (
                    <p className="mt-1 text-xs text-gray-500 text-right">{selectedActivityFullDetails.description}</p>
                )}
            </div>
        );
    };

    if (!isOpen) return null;

    // JSX اصلی مودال (کاملاً بدون تغییر)
    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out" dir="rtl">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg relative transform transition-all duration-300 ease-in-out scale-100">
                <button onClick={onClose} className="absolute top-4 left-4 text-red-400 hover:text-red-600 transition-colors z-10 p-1" aria-label="بستن">
                    <IoClose size={26} />
                </button>
                <h2 className="text-xl sm:text-2xl font-semibold text-center text-[#202A5A] mb-6 sm:mb-8">
                    فرم ثبت فعالیت
                </h2>

                {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md mb-4 text-center">{error}</p>}

                <form onSubmit={handleFormSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 text-right">تاریخ ثبت درخواست</label>
                        <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-[#202A5A] text-sm text-right">{submissionDate}</div>
                    </div>

                    <div className="relative">
                        <label htmlFor="activityCategory" className="block text-xs font-medium text-gray-500 mb-1 text-right">دسته‌بندی فعالیت <span className="text-red-500">*</span></label>
                        <select id="activityCategory" name="activityCategory" value={formData.activityCategory} onChange={handleChange} required disabled={loadingInternalCategories || internalActivityCategories.length === 0} className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#19A297] focus:border-[#19A297] text-[#202A5A] text-sm text-right appearance-none cursor-pointer">
                            <option value="" disabled>{loadingInternalCategories ? "بارگذاری..." : "انتخاب دسته‌بندی..."}</option>
                            {internalActivityCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none top-[25px]"><IoChevronDown className="text-gray-400" /></div>
                    </div>

                    <div className="relative">
                        <label htmlFor="activityTitle" className="block text-xs font-medium text-gray-500 mb-1 text-right">عنوان فعالیت <span className="text-red-500">*</span></label>
                        <select id="activityTitle" name="activityTitle" value={formData.activityTitle} onChange={handleChange} required disabled={!formData.activityCategory || loadingActivityTitles || availableActivityTitles.length === 0} className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#19A297] focus:border-[#19A297] text-[#202A5A] text-sm text-right appearance-none cursor-pointer">
                            <option value="" disabled>{loadingActivityTitles ? "بارگذاری..." : !formData.activityCategory ? "ابتدا دسته‌بندی" : availableActivityTitles.length === 0 ? "عنوانی یافت نشد" : "انتخاب عنوان..."}</option>
                            {availableActivityTitles.map(act => <option key={act._id} value={act._id}>{act.name}</option>)}
                        </select>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none top-[25px]"><IoChevronDown className="text-gray-400" /></div>
                    </div>

                    {renderDynamicValueInputField()}

                    <div>
                        <label htmlFor="studentDescription" className="block text-xs font-medium text-gray-500 mb-1 text-right">توضیحات شما (اختیاری)</label>
                        <textarea id="studentDescription" name="studentDescription" value={formData.studentDescription} onChange={handleChange} rows="3" placeholder="اگر توضیحات بیشتری دارید..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#19A297] focus:border-[#19A297] text-[#202A5A] text-sm text-right placeholder-gray-400 resize-none"></textarea>
                    </div>

                    <button type="submit" disabled={submitting} className="w-full bg-[#19A297] hover:bg-[#158a80] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#19A297] focus:ring-opacity-50 disabled:bg-gray-400">
                        {submitting ? "در حال ارسال..." : "ثبت فعالیت"}
                    </button>
                </form>
            </div>
        </div>
    );
}