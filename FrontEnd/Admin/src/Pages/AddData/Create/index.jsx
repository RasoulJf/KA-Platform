// src/pages/admin/CreateNewData.jsx (یا مسیر کامپوننت شما)
import React, { useState, useEffect, useCallback } from 'react';
import fetchData from '../../../Utils/fetchData'; // مسیر صحیح به fetchData
import union from '../../../assets/images/Union4.png'; // مسیرهای صحیح تصاویر
import frame7 from '../../../assets/images/frame7.png';
import frame72 from '../../../assets/images/frame72.png';

import { BiSolidSchool } from "react-icons/bi";
import { IoNotificationsOutline } from "react-icons/io5";
import { TbPencilPlus } from "react-icons/tb";
import { IoDocumentTextOutline } from "react-icons/io5";
import { BsGrid1X2 } from "react-icons/bs";
import { IoIosArrowDown } from "react-icons/io";
import { FiUploadCloud, FiDownloadCloud } from "react-icons/fi";
// import { Link } from 'react-router-dom'; // اگر لازم است

export default function CreateNewData({ Open }) {
    const token = localStorage.getItem("token");
    const date = new Date();
    const month = new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(date);
    const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
    const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date);
    const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(date);

    const [activeTab, setActiveTab] = useState('فردی');

    const [totalUserScore, setTotalUserScore] = useState(0);
    const [totalAdminActivitiesCount, setTotalAdminActivitiesCount] = useState(0);
    const [loadingStats, setLoadingStats] = useState(true);
    const [errorStats, setErrorStats] = useState(null);

    const initialIndividualFormData = {
        base: '', classNum: '', studentId: '', activityCategory: '',
        activityTitle: '', // این _id فعالیت خواهد بود
        details: '',       // برای select_from_enum، این لیبل گزینه انتخابی خواهد بود
        scoreAwarded: '',  // امتیاز نهایی
        description: '',   // توضیحات ادمین
    };
    const [individualFormData, setIndividualFormData] = useState(initialIndividualFormData);

    const [studentsInClass, setStudentsInClass] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [errorStudents, setErrorStudents] = useState(null);

    const [activityCategories, setActivityCategories] = useState([]);
    const [availableActivityTitles, setAvailableActivityTitles] = useState([]); // آرایه‌ای از آبجکت‌های کامل Activity (با ترتیب order)
    const [loadingActivityTitles, setLoadingActivityTitles] = useState(false);
    const [errorActivityTitles, setErrorActivityTitles] = useState(null);

    const [selectedActivityFullDetails, setSelectedActivityFullDetails] = useState(null);

    const [submittingIndividual, setSubmittingIndividual] = useState(false);
    const [submitIndividualMessage, setSubmitIndividualMessage] = useState({ type: '', text: '' });

    const [groupFormData, setGroupFormData] = useState({ parentActivityForExcel: '', excelFile: null });
    const [submittingGroup, setSubmittingGroup] = useState(false);
    const [submitGroupMessage, setSubmitGroupMessage] = useState({ type: '', text: '', errors: [] });

    const baseOptions = ["دهم", "یازدهم", "دوازدهم"];
    const classOptions = { "دهم": [101, 102, 103], "یازدهم": [201, 202], "دوازدهم": [301, 302] };

    // ۱. لود اولیه آمارها و دسته‌بندی‌های فعالیت
    useEffect(() => {
        const loadInitialData = async () => {
            if (!token) { setErrorStats("توکن احراز هویت یافت نشد."); setLoadingStats(false); return; }
            setLoadingStats(true); setErrorStats(null);
            try {
                const userStatsPromise = fetchData('users/summary-stats', { headers: { authorization: `Bearer ${token}` } });
                const adminActivityCountPromise = fetchData('admin-activity/stats/count', { headers: { authorization: `Bearer ${token}` } });
                const categoriesPromise = fetchData('admin-activity/distinct/parents', { headers: { authorization: `Bearer ${token}` } }); // این روت باید لیست parent ها را برگرداند

                const [userStats, adminCount, categoriesRes] = await Promise.all([userStatsPromise, adminActivityCountPromise, categoriesPromise]);
                if (userStats.success) setTotalUserScore(userStats.data.totalScore || 0); else setErrorStats(p => (p ? p + '; ' : '') + (userStats.message || 'خطا آمار امتیازات'));
                if (adminCount.success) setTotalAdminActivitiesCount(adminCount.data.count || 0); else setErrorStats(p => (p ? p + '; ' : '') + (adminCount.message || 'خطا آمار فعالیت‌ها'));
                if (categoriesRes.success) setActivityCategories(categoriesRes.data || []); else { setErrorStats(p => (p ? p + '; ' : '') + (categoriesRes.message || 'خطا دسته‌بندی‌ها')); setActivityCategories([]); }
            } catch (err) { setErrorStats(err.message || 'خطای کلی بارگذاری'); }
            finally { setLoadingStats(false); }
        };
        loadInitialData();
    }, [token]);

    // ۲. لود دانش‌آموزان
    useEffect(() => {
        const fetchStudents = async () => {
            if (individualFormData.base && individualFormData.classNum && token) {
                setLoadingStudents(true); setErrorStudents(null); setStudentsInClass([]);
                try {
                    const response = await fetchData(`users/by-grade-class?grade=${encodeURIComponent(individualFormData.base)}&classNum=${encodeURIComponent(String(individualFormData.classNum))}`, { headers: { authorization: `Bearer ${token}` } });
                    if (response.success) setStudentsInClass(response.data || []);
                    else { setErrorStudents(response.message || 'خطا دریافت دانش‌آموزان.'); setStudentsInClass([]); }
                } catch (err) { setErrorStudents('خطای سرور دانش‌آموزان.'); setStudentsInClass([]); }
                finally { setLoadingStudents(false); }
            } else {
                setStudentsInClass([]);
                if (!individualFormData.base || !individualFormData.classNum) {
                    setIndividualFormData(prev => ({ ...prev, studentId: '' }));
                }
            }
        };
        if (activeTab === 'فردی') fetchStudents();
    }, [individualFormData.base, individualFormData.classNum, token, activeTab]);

    // ۳. لود عناوین فعالیت (با ترتیب order از بک‌اند)
    useEffect(() => {
        const fetchActivityTitlesByParent = async () => {
            if (activeTab === 'فردی' && individualFormData.activityCategory && token) {
                setLoadingActivityTitles(true); setErrorActivityTitles(null);
                setAvailableActivityTitles([]); setSelectedActivityFullDetails(null);
                setIndividualFormData(prev => ({ ...prev, activityTitle: '', details: '', scoreAwarded: '' }));
                try {
                    // این روت باید از ActivityCn.js باشد و با order مرتب شده برگرداند
                    const response = await fetchData(`admin-activity/definitions/by-parent/${encodeURIComponent(individualFormData.activityCategory)}`, { headers: { authorization: `Bearer ${token}` } });                    if (response.success) {
                        setAvailableActivityTitles(response.data || []); // این حالا به ترتیب order است
                        if (!response.data || response.data.length === 0) setErrorActivityTitles("در این دسته‌بندی، فعالیتی تعریف نشده است.");
                    } else {
                        setErrorActivityTitles(response.message || 'خطا در دریافت لیست عناوین فعالیت‌ها.');
                        setAvailableActivityTitles([]);
                    }
                } catch (err) { setErrorActivityTitles('خطای سرور در دریافت عناوین فعالیت‌ها.'); setAvailableActivityTitles([]); }
                finally { setLoadingActivityTitles(false); }
            } else {
                setAvailableActivityTitles([]); setSelectedActivityFullDetails(null);
            }
        };
        if (activeTab === 'فردی') fetchActivityTitlesByParent();
    }, [individualFormData.activityCategory, token, activeTab]);

    // ۴. ست کردن selectedActivityFullDetails و امتیاز اولیه
    const handleActivityTitleChange = useCallback((selectedActivityId) => {
        const foundActivity = availableActivityTitles.find(act => act._id === selectedActivityId);
        setSelectedActivityFullDetails(foundActivity || null);
        let initialScore = ''; let initialDetails = '';
        if (foundActivity?.scoreDefinition?.inputType === 'fixed_from_enum_single' &&
            Array.isArray(foundActivity.scoreDefinition.enumOptions) &&
            foundActivity.scoreDefinition.enumOptions.length === 1) {
            initialScore = foundActivity.scoreDefinition.enumOptions[0].value.toString();
            initialDetails = (foundActivity.valueInput?.type === 'text' || foundActivity.valueInput?.type === 'select') ? (foundActivity.scoreDefinition.enumOptions[0].label || '') : '';
        }
        setIndividualFormData(prev => ({ ...prev, activityTitle: selectedActivityId, details: initialDetails, scoreAwarded: initialScore }));
    }, [availableActivityTitles]);

    // ۵. آپدیت امتیاز بر اساس تغییرات فیلد details
    useEffect(() => {
        if (!selectedActivityFullDetails || !individualFormData.activityTitle || activeTab !== 'فردی') return;
        const { scoreDefinition, valueInput } = selectedActivityFullDetails;
        const currentDetailsValue = individualFormData.details;

        if (scoreDefinition.inputType === 'select_from_enum' && valueInput.type === 'select') {
            const selectedOptionObj = scoreDefinition.enumOptions?.find(opt => opt.label === currentDetailsValue);
            if (selectedOptionObj) setIndividualFormData(prev => ({ ...prev, scoreAwarded: selectedOptionObj.value.toString() }));
            else if (currentDetailsValue === '') setIndividualFormData(prev => ({ ...prev, scoreAwarded: '' }));
        } else if (scoreDefinition.inputType === 'calculated_from_value' && valueInput.type === 'number') {
            const numericValue = parseFloat(currentDetailsValue);
            if (!isNaN(numericValue)) {
                if ((valueInput.numberMin != null && numericValue < valueInput.numberMin) || (valueInput.numberMax != null && numericValue > valueInput.numberMax)) {
                    setIndividualFormData(prev => ({ ...prev, scoreAwarded: '' })); return;
                }
                let calculatedScore = numericValue * (scoreDefinition.multiplier || 1);
                if (scoreDefinition.min != null) calculatedScore = Math.max(scoreDefinition.min, calculatedScore);
                if (scoreDefinition.max != null) calculatedScore = Math.min(scoreDefinition.max, calculatedScore);
                setIndividualFormData(prev => ({ ...prev, scoreAwarded: calculatedScore.toString() }));
            } else if (currentDetailsValue === '' || isNaN(numericValue)) {
                setIndividualFormData(prev => ({ ...prev, scoreAwarded: '' }));
            }
        }
    }, [individualFormData.details, selectedActivityFullDetails, individualFormData.activityTitle, activeTab]);

    // ۶. مدیریت تغییرات فرم فردی
    const handleIndividualFormChange = (e) => {
        const { name, value } = e.target;
        console.log(`handleIndividualFormChange - Name: ${name}, Value: ${value}, Type of Value: ${typeof value}`); // لاگ اضافه شد
        setIndividualFormData(prevState => {
            let newState = { ...prevState, [name]: value };
            if (name === "base") { newState.classNum = ''; newState.studentId = ''; setStudentsInClass([]); setSelectedActivityFullDetails(null); newState.activityCategory = ''; newState.activityTitle = ''; newState.details = ''; newState.scoreAwarded = ''; }
            else if (name === "classNum") { newState.studentId = ''; setSelectedActivityFullDetails(null); newState.activityCategory = ''; newState.activityTitle = ''; newState.details = ''; newState.scoreAwarded = ''; }
            else if (name === "studentId") { /* No reset needed here usually */ }
            else if (name === "activityCategory") { newState.activityTitle = ''; newState.details = ''; newState.scoreAwarded = ''; setSelectedActivityFullDetails(null); }
            // اگر activityTitle تغییر کرد، handleActivityTitleChange فراخوانی می‌شود و state را آپدیت می‌کند
            // اگر details تغییر کرد، useEffect مربوط به آن scoreAwarded را آپدیت می‌کند
            return newState;
        });
    };

    // ۷. تابع handleSubmitIndividual (مثل قبل، فقط Bearer اصلاح شده)
// CreateNewData.jsx -> handleSubmitIndividual
// CreateNewData.jsx -> handleSubmitIndividual
// CreateNewData.jsx
const handleSubmitIndividual = async (e) => {
    e.preventDefault();
    const { studentId, activityTitle, details, scoreAwarded, base, classNum, activityCategory, description } = individualFormData;

    console.log("handleSubmitIndividual: Current individualFormData:", JSON.stringify(individualFormData, null, 2));

    if (!base || !classNum || !studentId || !activityCategory || !activityTitle) {
        setSubmitIndividualMessage({ type: 'error', text: 'فیلدهای پایه، کلاس، دانش‌آموز، دسته‌بندی و عنوان فعالیت الزامی است.' });
        return;
    }
    if (scoreAwarded === '' || scoreAwarded === null || isNaN(Number(scoreAwarded))) {
        setSubmitIndividualMessage({ type: 'error', text: 'مقدار امتیاز معتبر نیست یا محاسبه نشده است.' });
        return;
    }
    if (selectedActivityFullDetails?.valueInput?.required && selectedActivityFullDetails?.valueInput?.type !== 'none' && (details === '' || details === null || details === undefined)) {
        setSubmitIndividualMessage({ type: 'error', text: `فیلد '${selectedActivityFullDetails.valueInput.label || "مقدار/جزئیات"}' الزامی است.` });
        return;
    }
    if (!token) {
        setSubmitIndividualMessage({ type: 'error', text: 'توکن یافت نشد.' });
        return;
    }

    setSubmittingIndividual(true);
    setSubmitIndividualMessage({ type: '', text: '' }); // ریست کردن پیام قبل از ارسال

    try {
        const payload = {
            activityId: activityTitle,
            details: (selectedActivityFullDetails?.valueInput?.type === 'none' || details === '' || details === undefined) ? undefined : details,
            scoreAwarded: Number(scoreAwarded),
            description: description || undefined,
        };
        console.log("handleSubmitIndividual: Sending create payload:", JSON.stringify(payload, null, 2));

        const createResponse = await fetchData(`admin-activity/user/${studentId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
        });
        console.log("handleSubmitIndividual: Create response received:", JSON.stringify(createResponse, null, 2));

        // <<<<<<<<<<<<<<<< مهم: اینجا success رو چک می‌کنیم >>>>>>>>>>>>>>>>>>
        if (createResponse && createResponse.success === true) { // صراحتاً === true
            console.log("handleSubmitIndividual: Activity CREATED successfully. Setting success message and resetting form...");
            setSubmitIndividualMessage({ type: 'success', text: 'فعالیت با موفقیت ثبت شد.' }); // پیام موفقیت ست میشه

            // ریست کردن فیلدها
            setIndividualFormData(initialIndividualFormData);
            setSelectedActivityFullDetails(null);
            setStudentsInClass([]);
            // setAvailableActivityTitles([]); // شاید نخوای اینو ریست کنی
            // setSelectedParent('');

            console.log("handleSubmitIndividual: Form reset. Now updating stats...");

            // آپدیت آمارها با دقت بیشتر
            try {
                console.log("handleSubmitIndividual: Fetching admin count...");
                const adminCountRes = await fetchData('admin-activity/stats/count', { headers: { authorization: `Bearer ${token}` } });
                console.log("handleSubmitIndividual: Admin count response:", JSON.stringify(adminCountRes, null, 2));

                // <<<<<<<<<<<<<<<< چک کردن دقیق پاسخ آمار >>>>>>>>>>>>>>>>>>
                if (adminCountRes && adminCountRes.success === true && adminCountRes.data && typeof adminCountRes.data.count !== 'undefined') {
                    setTotalAdminActivitiesCount(adminCountRes.data.count);
                } else {
                    console.error("handleSubmitIndividual: Failed to fetch or process admin count. Response:", adminCountRes);
                    // اینجا می‌تونید یک پیام هشدار اضافه کنید یا پیام موفقیت رو تغییر بدید
                    // setSubmitIndividualMessage(prev => ({ ...prev, text: prev.text + ' (خطا در بروزرسانی تعداد فعالیت‌ها)' }));
                }

                console.log("handleSubmitIndividual: Fetching user stats...");
                const userStatsRes = await fetchData('users/summary-stats', { headers: { authorization: `Bearer ${token}` } });
                console.log("handleSubmitIndividual: User stats response:", JSON.stringify(userStatsRes, null, 2));

                // <<<<<<<<<<<<<<<< چک کردن دقیق پاسخ آمار >>>>>>>>>>>>>>>>>>
                if (userStatsRes && userStatsRes.success === true && userStatsRes.data && typeof userStatsRes.data.totalScore !== 'undefined') {
                    setTotalUserScore(userStatsRes.data.totalScore);
                } else {
                    console.error("handleSubmitIndividual: Failed to fetch or process user stats. Response:", userStatsRes);
                    // setSubmitIndividualMessage(prev => ({ ...prev, text: prev.text + ' (خطا در بروزرسانی آمار امتیازات)' }));
                }
                console.log("handleSubmitIndividual: Stats update finished.");

            } catch (statsUpdateError) {
                // این catch فقط برای خطاهای پیش‌بینی نشده در خود کدهای جاوااسکریپت بخش آمار هست،
                // نه برای پاسخ‌های ناموفق fetchData (چون fetchData خودش catch داره و success:false برمی‌گردونه)
                console.error("handleSubmitIndividual: UNEXPECTED JS ERROR during stats update:", statsUpdateError);
                setSubmitIndividualMessage({
                    type: 'warning',
                    text: `فعالیت ثبت شد، اما در بروزرسانی آمارها خطای داخلی رخ داد: ${statsUpdateError.message}`
                });
            }

        } else { // اگر createResponse.success برابر true نبود
            console.error("handleSubmitIndividual: Activity creation FAILED. Server response:", createResponse);
            setSubmitIndividualMessage({ type: 'error', text: createResponse?.message || 'خطا در ثبت فعالیت (پاسخ سرور موفقیت‌آمیز نبود).' });
        }

    } catch (error) { // این catch بیرونی برای خطاهای پیش‌بینی نشده در کل تابع handleSubmitIndividual
                      // یا اگر یک Promise ریجکت شده (که fetchData شما این کار رو نمی‌کنه) به اینجا برسه.
        console.error("handleSubmitIndividual: OUTER CATCH - An UNEXPECTED error occurred:", error);
        setSubmitIndividualMessage({ type: 'error', text: `خطای غیرمنتظره در سرور: ${error.message}` });
    } finally {
        setSubmittingIndividual(false);
        console.log("handleSubmitIndividual: Submission process finished.");
    }
};

        
    // توابع تب گروهی (handleTabChange, handleGroupFormChange, handleSubmitGroup) مثل قبل، فقط Bearer اصلاح شود
    const handleTabChange = (tab) => { setActiveTab(tab); setSubmitIndividualMessage({ type: '', text: '' }); setSubmitGroupMessage({ type: '', text: '', errors: [] }); if (tab === 'فردی') { setGroupFormData({ parentActivityForExcel: '', excelFile: null }); } else { setIndividualFormData(initialIndividualFormData); setSelectedActivityFullDetails(null); setAvailableActivityTitles([]); setErrorActivityTitles(null); setStudentsInClass([]); setErrorStudents(null); setSelectedParent(''); } };
    const handleGroupFormChange = (e) => { const { name, value, files } = e.target; if (name === "excelFile") { setGroupFormData(prev => ({ ...prev, excelFile: files ? files[0] : null })); } else { setGroupFormData(prev => ({ ...prev, [name]: value })); } };
// src/pages/admin/CreateNewData.jsx

const handleSubmitGroup = async (e) => {
    e.preventDefault();
    const { parentActivityForExcel, excelFile } = groupFormData;
    if (!parentActivityForExcel || !excelFile) {
        setSubmitGroupMessage({ type: 'error', text: 'لطفاً دسته‌بندی والد و فایل اکسل را انتخاب کنید.', errors: [] });
        return;
    }
    if (!token) {
        setSubmitGroupMessage({ type: 'error', text: 'توکن احراز هویت یافت نشد.', errors: [] });
        return;
    }
    
    setSubmittingGroup(true);
    setSubmitGroupMessage({ type: '', text: '', errors: [] });

    // --- شروع تغییرات ---
    const formDataForExcel = new FormData();
    formDataForExcel.append('file', excelFile); // فقط فایل در FormData قرار می‌گیرد

    // ساخت URL داینامیک با پارامتر
    const url = `admin-activity/bulk-create-from-excel/${encodeURIComponent(parentActivityForExcel)}`;
    // --- پایان تغییرات ---

    try {
        const response = await fetchData(url, { // <<<< استفاده از URL جدید
            method: 'POST',
            headers: { authorization: `Bearer ${token}` },
            body: formDataForExcel
        });

        if (response.success) {
            setSubmitGroupMessage({ type: 'success', text: response.message || `${response.insertedCount || 0} فعالیت گروهی پردازش شد.`, errors: response.errors || [] });
            setGroupFormData({ parentActivityForExcel: '', excelFile: null });
            const fileInput = document.getElementById('excelUpload');
            if (fileInput) fileInput.value = '';
            // آپدیت آمارها...
            const adminCountRes = await fetchData('admin-activity/stats/count', { headers: { authorization: `Bearer ${token}` } });
            if (adminCountRes.success) setTotalAdminActivitiesCount(adminCountRes.data.count);
            const userStatsRes = await fetchData('users/summary-stats', { headers: { authorization: `Bearer ${token}` } });
            if (userStatsRes.success) setTotalUserScore(userStatsRes.data.totalScore);
        } else {
            let errorText = response.message || 'خطا در پردازش فایل اکسل.';
            if (response.errors && response.errors.length > 0) {
                errorText += ` جزئیات: ${response.errors.slice(0, 5).join('; ')} ${response.errors.length > 5 ? 'و موارد دیگر...' : ''}`;
            }
            setSubmitGroupMessage({ type: 'error', text: errorText, errors: response.errors || [] });
        }
    } catch (error) {
        setSubmitGroupMessage({ type: 'error', text: 'خطای شبکه یا سرور هنگام آپلود فایل.', errors: [error.message] });
    } finally {
        setSubmittingGroup(false);
    }
};

    // --- توابع رندرینگ فیلدهای داینامیک (مثل قبل با مدل جدید Activity) ---
    const renderValueInputField = () => { /* ... (کد از پاسخ قبلی، با استفاده از selectedActivityFullDetails.scoreDefinition.enumOptions[].label برای select) ... */  if (!selectedActivityFullDetails || !selectedActivityFullDetails.valueInput || activeTab !== 'فردی') return null; const { valueInput, scoreDefinition } = selectedActivityFullDetails; if (valueInput.type === 'none') return <div className="md:col-span-2 flex items-center justify-center bg-gray-50 p-3 rounded-md border border-gray-200 h-full"><p className="text-sm text-gray-500">برای این فعالیت نیاز به ورود {valueInput.label.toLowerCase()} نیست.</p></div>; if (valueInput.type === 'select' && scoreDefinition.inputType === 'select_from_enum') return <div className="flex items-center justify-between gap-x-3 bg-gray-50 p-3 rounded-md border border-gray-200 relative"><select id="details" name="details" value={individualFormData.details} onChange={handleIndividualFormChange} required={valueInput.required} className="flex-grow appearance-none bg-transparent border-0 focus:outline-none focus:ring-0 pr-8 pl-3 py-2 text-right text-sm cursor-pointer"><option value="">-- {valueInput.label || "یک گزینه انتخاب کنید"} --</option>{scoreDefinition.enumOptions?.map((opt, index) => <option key={opt.label + '-' + index} value={opt.label}>{opt.label}</option>)}</select><IoIosArrowDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" /><label htmlFor="details" className="flex-shrink-0 font-medium text-gray-700 text-sm whitespace-nowrap">{valueInput.label} {valueInput.required && <span className="text-red-500">*</span>}</label></div>; if (valueInput.type === 'number') return <div className="flex items-center justify-between gap-x-3 bg-gray-50 p-3 rounded-md border border-gray-200"><input type="number" id="details" name="details" value={individualFormData.details} onChange={handleIndividualFormChange} min={valueInput.numberMin} max={valueInput.numberMax} step={valueInput.label.toLowerCase().includes('معدل') ? "0.01" : "1"} required={valueInput.required} placeholder={valueInput.numberMin !== undefined && valueInput.numberMax !== undefined ? `${valueInput.numberMin}-${valueInput.numberMax}` : "مقدار عددی"} className="flex-grow bg-transparent border-0 focus:outline-none focus:ring-0 px-3 py-2 text-right text-sm" /><label htmlFor="details" className="flex-shrink-0 font-medium text-gray-700 text-sm whitespace-nowrap">{valueInput.label} {valueInput.required && <span className="text-red-500">*</span>}</label></div>; if (valueInput.type === 'text') return <div className="flex items-start justify-between gap-x-3 bg-gray-50 p-3 rounded-md border border-gray-200"><textarea id="details" name="details" rows="1" value={individualFormData.details} onChange={handleIndividualFormChange} required={valueInput.required} placeholder={valueInput.label || "جزئیات"} className="flex-grow resize-none bg-transparent border-0 focus:outline-none focus:ring-0 px-3 py-2 text-right text-sm" /><label htmlFor="details" className="flex-shrink-0 pt-2 font-medium text-gray-700 text-sm whitespace-nowrap">{valueInput.label} {valueInput.required && <span className="text-red-500">*</span>}</label></div>; return <div className="md:col-span-2">نوع ورودی جزئیات برای این فعالیت تعریف نشده است.</div>; };
    const renderScoreAwardedField = () => { /* ... (کد از پاسخ قبلی، با readOnly صحیح) ... */ if (!selectedActivityFullDetails || !selectedActivityFullDetails.scoreDefinition || activeTab !== 'فردی') return <div className="flex items-center justify-between gap-x-3 bg-gray-50 p-3 rounded-md border border-gray-200"><input type="number" id="scoreAwarded" name="scoreAwarded" value={individualFormData.scoreAwarded} onChange={handleIndividualFormChange} className="flex-grow bg-transparent border-0 focus:outline-none focus:ring-0 px-3 py-2 text-right text-sm" placeholder="امتیاز" required step="any" /><label htmlFor="scoreAwarded" className="flex-shrink-0 font-medium text-gray-700 text-sm whitespace-nowrap">امتیاز <span className="text-red-500">*</span></label></div>; const { inputType, min, max } = selectedActivityFullDetails.scoreDefinition; const isReadOnly = ['select_from_enum', 'calculated_from_value', 'fixed_from_enum_single'].includes(inputType); return <div className="flex items-center justify-between gap-x-3 bg-gray-50 p-3 rounded-md border border-gray-200 relative"><input type="number" id="scoreAwarded" name="scoreAwarded" value={individualFormData.scoreAwarded} onChange={handleIndividualFormChange} readOnly={isReadOnly} min={(inputType === 'number_in_range' || inputType === 'manual_number_entry') && min !== undefined ? min : undefined} max={(inputType === 'number_in_range' || inputType === 'manual_number_entry') && max !== undefined ? max : undefined} step="any" placeholder={isReadOnly ? "خودکار" : "امتیاز"} required className={`flex-grow bg-transparent border-0 focus:outline-none focus:ring-0 px-3 py-2 text-right text-sm ${isReadOnly ? 'text-gray-500 cursor-not-allowed' : ''}`} /><label htmlFor="scoreAwarded" className="flex-shrink-0 font-medium text-gray-700 text-sm whitespace-nowrap">امتیاز {isReadOnly && <span className="text-xs text-gray-400">(خودکار)</span>} <span className="text-red-500">*</span></label></div>; };

    // --- JSX اصلی کامپوننت (بخش زیادی مثل قبل، فقط فیلدهای داینامیک با توابع رندر جایگزین شده‌اند) ---
    return (
        <>
            {/* ... (کد JSX اصلی شما برای هدر، کارت‌های آمار، و تب‌ها مثل قبل) ... */}
            {/* من فقط بخش فرم فردی را اینجا با توابع رندر جدید نشان می‌دهم */}
            <img src={union} className='absolute scale-75 top-[-4rem] left-[-10rem] z-0 opacity-50 md:opacity-100' alt="" />
            <div className={`${!Open ? "w-[80%]" : "w-[94%]"} p-8 transition-all duration-500 flex flex-col h-screen relative z-10 overflow-y-auto`}>
                {/* Header */}
                <div className="flex justify-between items-center h-auto md:h-[5vh] mb-6"> <div className="flex justify-center items-center gap-3 md:gap-5"> <h3 className='text-[#19A297] text-xs'>هنرستان استارتاپی رکاد</h3> <BiSolidSchool className='text-[#19A297] ml-[-10px] text-lg md:text-xl' /> <div className='w-7 h-7 md:w-8 md:h-8 flex justify-center items-center border border-gray-300 rounded-full cursor-pointer relative group'><IoNotificationsOutline className='text-gray-400 text-sm' /></div> </div> <div className="flex justify-center items-center gap-3 md:gap-5 mt-2 md:mt-0"> <p className='text-gray-400 text-xs'> امروز {week} {day} {month} ماه، {year}</p> <h1 className='text-[#19A297] font-semibold text-base md:text-lg'>ثبت فعالیت توسط ادمین</h1> </div> </div>
                {/* Stats Cards */}
                <div className="flex flex-col md:flex-row gap-5 mb-6"> <div className="relative flex-1 bg-white rounded-lg overflow-hidden p-4 md:p-6 flex items-center justify-between shadow-sm border border-gray-100 min-h-[10vh] md:min-h-[unset]"> <img src={frame7} className='absolute z-0 h-full w-full object-cover scale-110 top-0 left-0' alt="" /> <div className='flex items-center gap-2 md:gap-4 z-10 ml-auto'> <h2 className='text-[#202A5A] font-semibold text-sm text-right'>جمع کل امتیازات کاربران</h2><div className="bg-[#202A5A] flex justify-center items-center w-10 h-10 rounded-full flex-shrink-0"><BsGrid1X2 className='text-xl text-white' /></div></div> {loadingStats ? <p className="z-10 text-[#202A5A] animate-pulse text-lg font-semibold mr-auto">...</p> : errorStats ? <p className="z-10 text-red-500 text-xs mr-auto">{errorStats.split(';')[0]}</p> : <p className='text-[#202A5A] font-semibold text-xl md:text-2xl z-10 mr-auto'>{totalUserScore.toLocaleString('fa-IR')}</p>} </div> <div className="relative flex-1 bg-white rounded-lg overflow-hidden p-4 md:p-6 flex items-center justify-between shadow-sm border border-gray-100 min-h-[10vh] md:min-h-[unset]"> <img src={frame7} className='absolute z-0 h-full w-full object-cover scale-110 top-0 left-0' alt="" /> <div className='flex items-center gap-2 md:gap-4 z-10 ml-auto'><h2 className='text-[#202A5A] font-semibold text-sm text-right'>کل فعالیت‌های ثبت‌شده (ادمین)</h2><div className="bg-[#202A5A] flex justify-center items-center w-10 h-10 rounded-full flex-shrink-0"><IoDocumentTextOutline className='text-xl text-white' /></div></div> {loadingStats ? <p className="z-10 text-[#202A5A] animate-pulse text-lg font-semibold mr-auto">...</p> : errorStats ? <p className="z-10 text-red-500 text-xs mr-auto">{errorStats.split(';')[1] || errorStats.split(';')[0]}</p> : <p className='text-[#202A5A] font-semibold text-xl md:text-2xl z-10 mr-auto'>{totalAdminActivitiesCount.toLocaleString('fa-IR')}</p>} </div> </div>
                {/* Form Title Section */}
                <div className="relative bg-white rounded-lg overflow-hidden mb-6 p-4 flex items-center justify-between shadow-sm border border-gray-100 min-h-[10vh] md:h-auto"> <img src={frame72} className='absolute z-0 h-full w-full object-cover top-0 left-[-10px] md:left-[-30px] opacity-100 scale-110' alt="" /> <p className='text-gray-500 text-xs md:text-sm z-10 ml-auto mr-2 md:mr-8 text-right'>برای ثبت فعالیت جدید برای دانش‌آموزان، فرم زیر را تکمیل کنید.</p> <div className='flex items-center gap-2 md:gap-4 z-10'><h2 className='text-[#202A5A] font-semibold text-base md:text-lg'>ثبت فعالیت جدید</h2><div className="bg-[#202A5A] flex justify-center items-center w-10 h-10 md:w-12 md:h-12 rounded-full"><TbPencilPlus className='text-xl md:text-2xl text-white' /></div></div> </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6 flex-grow">
                    <div className="flex mb-6 bg-gray-100 rounded-lg p-1 max-w-xs sm:max-w-sm mx-auto">
                        <button onClick={() => handleTabChange('فردی')} className={`flex-1 py-2.5 px-4 text-center rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 ${activeTab === 'فردی' ? 'bg-white shadow text-[#19A297]' : 'text-gray-600 hover:bg-gray-200'}`}>ثبت فردی</button>
                        <button onClick={() => handleTabChange('گروهی')} className={`flex-1 py-2.5 px-4 text-center rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 ${activeTab === 'گروهی' ? 'bg-white shadow text-[#19A297]' : 'text-gray-600 hover:bg-gray-200'}`}>ثبت گروهی (اکسل)</button>
                    </div>

                    {activeTab === 'فردی' && (
                        <form onSubmit={handleSubmitIndividual} className="space-y-5 mt-6">
                            {submitIndividualMessage.text && (<div className={`p-3 rounded-md text-sm text-center ${submitIndividualMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{submitIndividualMessage.text}</div>)}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                                {/* Base Select */}
                                <div className="flex items-center justify-between gap-x-3 bg-gray-50 p-3 rounded-md border border-gray-200 relative">
                                    <select id="base" name="base" value={individualFormData.base} onChange={handleIndividualFormChange} className="flex-grow appearance-none bg-transparent border-0 focus:outline-none focus:ring-0 pr-8 pl-3 py-2 text-right text-sm cursor-pointer" required>
                                        <option value="">انتخاب پایه...</option>
                                        {baseOptions.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                    <IoIosArrowDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <label htmlFor="base" className="flex-shrink-0 font-medium text-gray-700 text-sm whitespace-nowrap">پایه <span className="text-red-500">*</span></label>
                                </div>
                                {/* Class Select */}
                                <div className="flex items-center justify-between gap-x-3 bg-gray-50 p-3 rounded-md border border-gray-200 relative">
                                    <select id="classNum" name="classNum" value={individualFormData.classNum} onChange={handleIndividualFormChange} className="flex-grow appearance-none bg-transparent border-0 focus:outline-none focus:ring-0 pr-8 pl-3 py-2 text-right text-sm cursor-pointer" required disabled={!individualFormData.base}>
                                        <option value="">انتخاب کلاس...</option>
                                        {(classOptions[individualFormData.base] || []).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <IoIosArrowDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <label htmlFor="classNum" className="flex-shrink-0 font-medium text-gray-700 text-sm whitespace-nowrap">کلاس <span className="text-red-500">*</span></label>
                                </div>
                                {/* Student Select */}
                                <div className="flex items-center justify-between gap-x-3 bg-gray-50 p-3 rounded-md border border-gray-200 relative">
                                    <select id="studentId" name="studentId" value={individualFormData.studentId} onChange={handleIndividualFormChange} className="flex-grow appearance-none bg-transparent border-0 focus:outline-none focus:ring-0 pr-8 pl-3 py-2 text-right text-sm cursor-pointer" required disabled={!individualFormData.classNum || loadingStudents || (studentsInClass.length === 0 && !errorStudents)}>
                                        <option value="">{loadingStudents ? "بارگذاری..." : errorStudents ? errorStudents : !individualFormData.classNum ? "ابتدا کلاس" : (studentsInClass.length === 0 && !errorStudents && individualFormData.classNum) ? "دانش‌آموزی نیست" : "انتخاب دانش‌آموز..."}</option>
                                        {studentsInClass.map(s => <option key={s._id} value={s._id}>{s.fullName}</option>)}
                                    </select>
                                    <IoIosArrowDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <label htmlFor="studentId" className="flex-shrink-0 font-medium text-gray-700 text-sm whitespace-nowrap">دانش‌آموز <span className="text-red-500">*</span></label>
                                </div>
                            </div>
                            {errorStudents && !loadingStudents && individualFormData.classNum && (<p className="mt-[-10px] text-red-500 text-right text-xs md:col-start-3 md:pr-3">{errorStudents}</p>)}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                {/* Activity Category Select */}
                                <div className="flex items-center justify-between gap-x-3 bg-gray-50 p-3 rounded-md border border-gray-200 relative">
                                    <select id="activityCategory" name="activityCategory" value={individualFormData.activityCategory} onChange={handleIndividualFormChange} className="flex-grow appearance-none bg-transparent border-0 focus:outline-none focus:ring-0 pr-8 pl-3 py-2 text-right text-sm cursor-pointer" required disabled={activityCategories.length === 0 && !loadingStats}>
                                        <option value="">{loadingStats && activityCategories.length === 0 ? "بارگذاری..." : activityCategories.length === 0 ? "دسته‌بندی نیست" : "انتخاب دسته‌بندی..."}</option>
                                        {activityCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                    <IoIosArrowDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <label htmlFor="activityCategory" className="flex-shrink-0 font-medium text-gray-700 text-sm whitespace-nowrap">دسته‌بندی <span className="text-red-500">*</span></label>
                                </div>
                                {/* Activity Title Select */}
                                <div className="flex items-center justify-between gap-x-3 bg-gray-50 p-3 rounded-md border border-gray-200 relative">
                                    <select id="activityTitle" name="activityTitle" value={individualFormData.activityTitle} onChange={(e) => { handleIndividualFormChange(e); handleActivityTitleChange(e.target.value); }} className="flex-grow appearance-none bg-transparent border-0 focus:outline-none focus:ring-0 pr-8 pl-3 py-2 text-right text-sm cursor-pointer" required disabled={!individualFormData.activityCategory || loadingActivityTitles || (availableActivityTitles.length === 0 && !errorActivityTitles)}>
                                        <option value="">{loadingActivityTitles ? "بارگذاری..." : errorActivityTitles ? errorActivityTitles : !individualFormData.activityCategory ? "ابتدا دسته‌بندی" : (availableActivityTitles.length === 0 && !errorActivityTitles && individualFormData.activityCategory) ? "عنوانی نیست" : "انتخاب عنوان فعالیت..."}</option>
                                        {availableActivityTitles.map(act => <option key={act._id} value={act._id}>{act.name}</option>)}
                                    </select>
                                    <IoIosArrowDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <label htmlFor="activityTitle" className="flex-shrink-0 font-medium text-gray-700 text-sm whitespace-nowrap">عنوان فعالیت <span className="text-red-500">*</span></label>
                                </div>
                            </div>
                            {selectedActivityFullDetails?.description && (<p className="rounded-md border border-blue-200 bg-blue-50 p-3 text-gray-700 text-xs text-right leading-relaxed"><strong>راهنمای فعالیت "{selectedActivityFullDetails.name}":</strong> {selectedActivityFullDetails.description}</p>)}
                            {errorActivityTitles && !loadingActivityTitles && individualFormData.activityCategory && (<p className="mt-[-10px] text-red-500 text-right text-xs md:col-start-2 md:pr-3">{errorActivityTitles}</p>)}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                {renderValueInputField()}
                                {renderScoreAwardedField()}
                            </div>

                            <div className="flex items-start justify-between gap-x-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                                <textarea id="description" name="description" rows="2" value={individualFormData.description} onChange={handleIndividualFormChange} className="flex-grow resize-none bg-transparent border-0 focus:outline-none focus:ring-0 px-3 py-2 text-right text-sm" placeholder="توضیحات بیشتر توسط ادمین (اختیاری)..."></textarea>
                                <label htmlFor="description" className="flex-shrink-0 pt-2 font-medium text-gray-700 text-sm whitespace-nowrap">توضیحات ثبت</label>
                            </div>
                            <div className="pt-4"><button type="submit" disabled={submittingIndividual || loadingStudents || loadingActivityTitles || !individualFormData.studentId || !individualFormData.activityTitle} className="w-full rounded-md bg-[#19A297] px-4 py-3 font-medium text-white hover:bg-[#14857d] focus:outline-none focus:ring-2 focus:ring-[#19A297] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400">{submittingIndividual ? 'در حال ثبت...' : 'ثبت اطلاعات فردی'}</button></div>
                        </form>
                    )}

                    {activeTab === 'گروهی' && (
                        <form onSubmit={handleSubmitGroup} className="space-y-6 mt-6">
                            {/* ... (بخش آپلود گروهی مثل قبل) ... */}
                            {submitGroupMessage.text && (<div className={`p-3 rounded-md text-sm mb-4 ${submitGroupMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}> <p>{submitGroupMessage.text}</p> {submitGroupMessage.errors && submitGroupMessage.errors.length > 0 && (<ul className="mt-2 list-disc list-inside text-xs"> {submitGroupMessage.errors.map((err, idx) => <li key={idx}>{typeof err === 'object' ? JSON.stringify(err) : err}</li>)} </ul>)} </div>)} <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> <div className="relative"> <label htmlFor="groupParentActivity" className="block text-sm font-medium text-gray-700 mb-1 text-right">دسته‌بندی والد فعالیت‌ها <span className="text-red-500">*</span></label> <select id="groupParentActivity" name="parentActivityForExcel" value={groupFormData.parentActivityForExcel} onChange={handleGroupFormChange} className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#19A297] focus:border-[#19A297] text-sm text-right bg-white appearance-none" disabled={activityCategories.length === 0 && !loadingStats} required > <option value="">{loadingStats && activityCategories.length === 0 ? "بارگذاری..." : activityCategories.length === 0 ? "دسته‌بندی نیست" : "انتخاب کنید..."}</option> {activityCategories.map(category => (<option key={category} value={category}>{category}</option>))} </select> <IoIosArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-3 text-gray-400 pointer-events-none" /> </div> <div> <label htmlFor="excelStructureGuide" className="block text-sm font-medium text-gray-700 mb-1 text-right">راهنمای ستون‌های مورد نیاز اکسل</label> <input type="text" id="excelStructureGuide" readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-sm text-right" value="studentIdCode, activityName, details, scoreAwarded, adminDescription (اختیاری)" /> </div> </div> <div className="bg-[#202A5A] p-4 rounded-md flex flex-col md:flex-row justify-between items-center gap-4"> <a href="/excel-samples/admin-activity-upload-sample.xlsx" download target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-transparent border border-gray-400 text-gray-300 px-6 py-2.5 rounded-md text-sm hover:bg-gray-700 transition w-full md:w-auto no-underline"> <FiDownloadCloud className="w-5 h-5" /> دریافت فایل نمونه اکسل </a> <span className="hidden md:block text-gray-400 text-sm">|</span> <label htmlFor="excelUpload" className="flex items-center justify-center gap-2 bg-gray-100 text-[#202A5A] px-6 py-2.5 rounded-md text-sm font-medium hover:bg-gray-200 transition w-full md:w-auto cursor-pointer"> <FiUploadCloud className="w-5 h-5" /> بارگذاری فایل اکسل <span className="text-red-500">*</span> <input type="file" id="excelUpload" name="excelFile" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleGroupFormChange} required /> </label> </div> {groupFormData.excelFile && (<p className="text-sm text-gray-600 text-center">فایل انتخاب شده: {groupFormData.excelFile.name}</p>)} <div className="pt-4"> <button type="submit" disabled={submittingGroup || !groupFormData.excelFile || !groupFormData.parentActivityForExcel} className="w-full bg-[#19A297] text-white py-3 px-4 rounded-md hover:bg-[#14857d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#19A297] font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"> {submittingGroup ? 'در حال آپلود و ثبت...' : 'آپلود و ثبت گروهی'} </button> </div> <p className="text-xs text-gray-500 text-center pt-2"> توجه: نام فعالیت در فایل اکسل باید **دقیقاً** با نام‌های تعریف شده در سیستم مطابقت داشته باشد. برای فعالیت‌هایی که امتیازشان محاسبه‌ای است، ستون امتیاز در اکسل می‌تواند خالی باشد. </p> </form>
                    )}
                </div>
            </div>
        </>
    );
}