// AddActivityModal.jsx
import React, { useState, useEffect, useMemo } from 'react'; // useMemo اضافه شد
import fetchData from '../../../utils/fetchData'; // مسیر صحیح
import { IoClose, IoChevronDown } from "react-icons/io5";

// INITIAL_FORM_DATA را بیرون از کامپوننت تعریف کنید تا رفرنس ثابت داشته باشد
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
    // activityCategories, // اگر قرار است از والد بیاید و همیشه آپدیت باشد، نیازی به فچ داخلی نیست
    // loadingActivityCategories
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

    // ۱. لود دسته‌بندی‌ها
    useEffect(() => {
        const fetchCategories = async () => {
            // اگر activityCategories از props آمده و معتبر است، از آن استفاده کن
            // if (activityCategories && activityCategories.length > 0) {
            //     setInternalActivityCategories(activityCategories);
            //     setLoadingInternalCategories(loadingActivityCategories || false); // وضعیت لودینگ والد
            //     return;
            // }
            // در غیر این صورت، اگر توکن داریم و لیست داخلی خالی است، فچ کن
            if (token && internalActivityCategories.length === 0) {
                setLoadingInternalCategories(true); setError('');
                try {
                    // مطمئن شوید که Berear به Bearer اصلاح شده
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
    }, [isOpen, token, internalActivityCategories.length/*, activityCategories, loadingActivityCategories*/]); // dependency ها بر اساس اینکه از props می‌آید یا نه


    // ۲. لود عناوین فعالیت با تغییر دسته‌بندی
    useEffect(() => {
        const fetchTitles = async () => {
            if (formData.activityCategory && token) {
                setLoadingActivityTitles(true); setError('');
                setAvailableActivityTitles([]); setSelectedActivityFullDetails(null);
                // وقتی دسته‌بندی عوض میشه، فیلدهای وابسته رو ریست می‌کنیم
                setFormData(prev => ({ ...prev, activityTitle: '', details: '' }));
                try {
                    const response = await fetchData(`activity/by-parent?parent=${encodeURIComponent(formData.activityCategory)}`, { headers: { authorization: `Bearer ${token}` } }); // Bearer اصلاح شده
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


    // ۴. ریست فرم وقتی مودال بسته یا باز می‌شود
    useEffect(() => {
        if (isOpen) {
            setFormData(INITIAL_FORM_DATA);
            setSelectedActivityFullDetails(null);
            setAvailableActivityTitles([]);
            // اگر internalActivityCategories هم باید با هر بار باز شدن ریست و فچ شود، length آن را از dependency useEffect اول بردارید
            // setInternalActivityCategories([]); // این خط باعث فچ مجدد دسته بندی‌ها می‌شود
            setError('');
            setSubmitting(false);
        }
    }, [isOpen]); // فقط به isOpen وابسته است


    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prevFormData => {
            const newState = { ...prevFormData, [name]: value };

            // اگر عنوان فعالیت تغییر کرده (یعنی یک _id جدید انتخاب شده)
            if (name === "activityTitle") {
                const foundActivity = availableActivityTitles.find(act => act._id === value);
                setSelectedActivityFullDetails(foundActivity || null);
                // با انتخاب عنوان جدید، فیلد details باید ریست شود تا کاربر مقدار جدید وارد کند
                newState.details = '';
                // اگر fixed_from_enum_single است، scoreAwarded (که در مودال دانش آموز استفاده نمی‌شود) و details را می‌توانستیم ست کنیم
                // اما چون این مودال دانش آموز است و امتیاز ست نمی‌شود، فقط details ریست می‌شود.
            }
            return newState;
        });
    };


    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.activityCategory || !formData.activityTitle) { setError("لطفاً دسته‌بندی و عنوان فعالیت را انتخاب کنید."); return; }
        if (selectedActivityFullDetails?.valueInput?.required && selectedActivityFullDetails?.valueInput?.type !== 'none' && !formData.details.trim()) {
            setError(`فیلد '${selectedActivityFullDetails.valueInput.label || "جزئیات/مقدار"}' الزامی است.`); return;
        }
        if (!token) { setError("توکن احراز هویت یافت نشد."); return; }

        setSubmitting(true); setError('');
        const payload = {
            activityId: formData.activityTitle,
            details: (selectedActivityFullDetails?.valueInput?.type !== 'none' && formData.details.trim() !== '') ? formData.details.trim() : undefined,
            description: formData.studentDescription.trim() || undefined,
        };
        try {
            const response = await fetchData('student-activity', { method: 'POST', headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }); // Bearer اصلاح شده
            if (response.success) {
                if (onSubmit) onSubmit(response.data); // onSubmit از والد برای رفرش لیست
                onClose(); // بستن مودال
            } else { setError(response.message || "خطا در ثبت فعالیت."); }
        } catch (err) { setError("خطای شبکه یا سرور: " + (err.message || "خطای ناشناخته")); }
        finally { setSubmitting(false); }
    };

    const renderDynamicValueInputField = () => {
        if (!selectedActivityFullDetails || !selectedActivityFullDetails.valueInput || selectedActivityFullDetails.valueInput.type === 'none') {
            return null;
        }
        const { type, label, required, numberMin, numberMax } = selectedActivityFullDetails.valueInput;
        // گزینه‌های select از scoreDefinition.enumOptions خوانده می‌شوند چون در مدل جدید Activity،
        // فیلد valueInput.options حذف شده و گزینه‌ها برای select_from_enum در scoreDefinition هستند.
        const optionsForSelect = selectedActivityFullDetails.scoreDefinition?.inputType === 'select_from_enum'
                               ? selectedActivityFullDetails.scoreDefinition.enumOptions
                               : []; // اگر نوع دیگری از select دارید، valueInput.options قدیمی را اینجا بخوانید (که در مدل جدید نیست)

        return (
            <div>
                <label htmlFor="details" className="block text-xs font-medium text-gray-500 mb-1 text-right">
                    {label || 'جزئیات/مقدار'} {required && <span className="text-red-500">*</span>}
                </label>
                {type === 'select' ? ( // این select مربوط به valueInput.type است
                    <div className="relative">
                        <select
                            id="details" name="details" value={formData.details} onChange={handleChange} required={required}
                            className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#19A297] focus:border-[#19A297] text-[#202A5A] text-sm text-right appearance-none"
                        >
                            <option value="" disabled>-- {label || "یک گزینه انتخاب کنید"} --</option>
                            {/* این بخش باید با ساختار enumOptions مدل Activity (که [{label, value}]) هماهنگ باشد */}
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

    if (!isOpen) return null; // این خط باید بعد از تمام هوک‌ها باشد

    // JSX اصلی مودال (بدون تغییر در ساختار کلی شما، فقط فراخوانی handleChange صحیح و اصلاح Bearer)
    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out" dir="rtl">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg relative transform transition-all duration-300 ease-in-out scale-100">
                <button onClick={onClose} className="absolute top-4 left-4 text-red-400 hover:text-red-600 transition-colors z-10 p-1" aria-label="بستن">
                    <IoClose size={26} />
                </button>
                <h2 className="text-xl sm:text-2xl font-semibold text-center text-[#202A5A] mb-6 sm:mb-8">
                    فرم ثبت فعالیت {/* عنوان مودال شما */}
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