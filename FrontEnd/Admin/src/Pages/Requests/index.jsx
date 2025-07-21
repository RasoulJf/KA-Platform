import React, { useEffect, useRef, useState } from 'react';
import fetchData from '../../Utils/fetchData';
import union from '../../assets/images/Union4.png';
import Frame10 from '../../assets/images/Frame10.png';
import Frame11 from '../../assets/images/Frame11.png';

import { BiSolidSchool } from "react-icons/bi";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import { BsChatLeftText, BsClipboardCheck, BsClipboardX, BsClipboardData } from "react-icons/bs";
import RequestApprovalModal from './RequestApprovalModal';
import NotificationPanel from '../../Components/NotificationPanel';

export default function Requests({ Open }) {
    const token = localStorage.getItem("token");
    const date = new Date();
    const month = new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(date);
    const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
    const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date).replace(/[۰-۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 1728 + 48));
    const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(date);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const [statsData, setStatsData] = useState({
        pendingCount: 0,
        approvedCount: 0,
        totalRequests: 0,
    });
    const [loadingStats, setLoadingStats] = useState(true);
    const [errorStats, setErrorStats] = useState(null);

    const [requestsList, setRequestsList] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [errorRequests, setErrorRequests] = useState(null);

    const [activityCategories, setActivityCategories] = useState([]); // <--- STATE اضافه شد
    const [loadingActivityCategories, setLoadingActivityCategories] = useState(true); // <--- STATE اضافه شد

    // ... بعد از تعریف token

    // --- شروع بخش کد برای نوتیفیکیشن ---
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationRef = useRef(null); // اسم رفرنس رو ساده نگه می‌داریم

    const toggleNotificationPanel = () => setIsNotificationPanelOpen((prev) => !prev);
    const closeNotificationPanel = () => setIsNotificationPanelOpen(false);
    // --- پایان بخش کد برای نوتیفیکیشن ---

    // ... بقیه state های شما مثل isModalOpen و ...

    useEffect(() => {
        // واکشی آمار، دسته‌بندی‌ها و تعداد اعلان‌ها
        const fetchInitialAdminData = async () => {
            if (!token) { /* ... مدیریت خطا ... */ return; }
            setLoadingStats(true);
            // ... بقیه state های لودینگ

            try {
                // <<< تغییر: اندپوینت نوتیفیکیشن به Promise.all اضافه می‌شود >>>
                const [statsResponse, categoriesResponse, notificationCountResponse] = await Promise.all([
                    fetchData('admin-review/student-activity-stats', { headers: { authorization: `Bearer ${token}` } }),
                    fetchData('admin-activity/distinct/parents', { headers: { authorization: `Bearer ${token}` } }),
                    fetchData('notifications?filter=unread', { headers: { authorization: `Bearer ${token}` } }) // <<<< این خط جدید است
                ]);

                // ... (کد مربوط به statsResponse و categoriesResponse بدون تغییر)
                if (statsResponse.success) { /* ... */ }
                if (categoriesResponse.success) { /* ... */ }

                // <<< تغییر: ذخیره کردن تعداد اعلان‌ها در state >>>
                if (notificationCountResponse.success) {
                    setUnreadCount(notificationCountResponse.totalCount || 0);
                }

            } catch (err) { /* ... مدیریت خطا ... */
            } finally { /* ... ست کردن لودینگ به false ... */ }
        };

        fetchInitialAdminData();

        // <<< تغییر: اضافه کردن منطق بستن پنل با کلیک بیرون >>>
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                const notificationIcon = document.getElementById("admin-requests-notification-icon");
                if (notificationIcon && notificationIcon.contains(event.target)) return;
                closeNotificationPanel();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, [token]);

    const [filters, setFilters] = useState({
        status: '',
        activityParent: '',
        activityName: '',
        studentName: '',
    });
    const [sort, setSort] = useState({ sortBy: 'submissionDate', order: 'desc' });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 6,
    });
    const [openFilterDropdowns, setOpenFilterDropdowns] = useState({
        status: false,
        activityParent: false,
    });

    const fetchInitialAdminData = async () => {
        if (!token) {
            setErrorStats("توکن یافت نشد.");
            setLoadingStats(false);
            setLoadingActivityCategories(false);
            return;
        }
        setLoadingStats(true);
        setLoadingActivityCategories(true);
        setErrorStats(null);
        // setErrorActivityCategories(null); // اگر خطای جدا برایش دارید

        try {
            const statsPromise = fetchData('admin-review/student-activity-stats', { headers: { authorization: `Berear ${token}` } });
            const categoriesPromise = fetchData('admin-activity/distinct/parents', { headers: { authorization: `Berear ${token}` } });
            const [statsResponse, categoriesResponse] = await Promise.all([statsPromise, categoriesPromise]);

            if (statsResponse.success && statsResponse.data) {
                setStatsData(statsResponse.data);
            } else {
                setErrorStats(statsResponse.message || "خطا در دریافت آمار");
            }
            if (categoriesResponse.success && categoriesResponse.data) {
                setActivityCategories(categoriesResponse.data || []);
            } else {
                // setErrorActivityCategories(categoriesResponse.message || "خطا در دریافت دسته‌بندی‌ها");
                setActivityCategories([]);
                console.error("Failed to fetch activity categories:", categoriesResponse.message);
            }
        } catch (err) {
            setErrorStats("خطای شبکه (آمار/دسته‌بندی): " + err.message);
            // setErrorActivityCategories("خطای شبکه (دسته‌بندی): " + err.message);
        } finally {
            setLoadingStats(false);
            setLoadingActivityCategories(false);
        }
    };


    const fetchRequestsList = async () => {
        // ... (کد fetchRequestsList بدون تغییر باقی می‌ماند) ...
        if (!token) { setErrorRequests("توکن یافت نشد."); setLoadingRequests(false); return; }
        setLoadingRequests(true); setErrorRequests(null);
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.activityParent) queryParams.append('activityParent', filters.activityParent);
        if (filters.activityName) queryParams.append('activityName', filters.activityName);
        if (filters.studentName) queryParams.append('studentName', filters.studentName);
        queryParams.append('sortBy', sort.sortBy);
        queryParams.append('order', sort.order);
        queryParams.append('page', pagination.currentPage);
        queryParams.append('limit', pagination.limit);
        try {
            const response = await fetchData(`admin-review/student-activities-list?${queryParams.toString()}`, { headers: { authorization: `Berear ${token}` } });
            if (response.success && response.data) {
                setRequestsList(response.data);
                setPagination(prev => ({ ...prev, totalPages: response.totalPages || 1, totalCount: response.totalCount || 0, currentPage: response.currentPage || 1, }));
            } else { setErrorRequests(response.message || "خطا در دریافت لیست"); setRequestsList([]); }
        } catch (err) { setErrorRequests("خطای شبکه (لیست): " + err.message); setRequestsList([]); }
        finally { setLoadingRequests(false); }
    };

    useEffect(() => {
        fetchInitialAdminData(); // واکشی آمار و دسته بندی ها یک بار
    }, [token]);

    useEffect(() => {
        fetchRequestsList(); // واکشی لیست با تغییر وابستگی ها
    }, [token, filters, sort, pagination.currentPage, pagination.limit]);


    const handleRowClick = (request) => { setSelectedRequest(request); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setSelectedRequest(null); };

    const refreshDataAfterAction = async () => {
        await fetchInitialAdminData(); // رفرش آمار و دسته‌بندی‌ها (دسته‌بندی‌ها معمولاً تغییر نمی‌کنند ولی برای اطمینان)
        await fetchRequestsList();
    };

    const handleApprove = async (studentActivityId, score, adminComment, details) => { // <<< `details` اینجا اضافه شد
        if (!token || !studentActivityId) return;
        try {
            const payload = {
                scoreAwarded: score,
                adminComment: adminComment,
                details: details // <<< `details` به payload اضافه شد
            };

            const response = await fetchData(`admin-review/student-activities/${studentActivityId}/approve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', authorization: `Berear ${token}` },
                body: JSON.stringify(payload)
            });

            if (response.success) {
                await refreshDataAfterAction();
            } else {
                alert("خطا در تایید: " + (response.message || "خطای نامشخص"));
            }
        } catch (err) {
            alert("خطای شبکه: " + err.message);
        }
        handleCloseModal();
    };

    const handleReject = async (studentActivityId, adminComment) => {
        // ... (کد handleReject بدون تغییر، فقط مطمئن شوید refreshDataAfterAction را صدا می‌زند)
        if (!token || !studentActivityId) return;
        try {
            const response = await fetchData(`admin-review/student-activities/${studentActivityId}/reject`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', authorization: `Berear ${token}` }, body: JSON.stringify({ adminComment }) });
            if (response.success) { await refreshDataAfterAction(); }
            else { alert("خطا در رد: " + (response.message || "خطای نامشخص")); }
        } catch (err) { alert("خطای شبکه: " + err.message); }
        handleCloseModal();
    };

    const getStatusClassAndText = (status) => { /* ... (بدون تغییر) ... */
        switch (status) {
            case 'approved': return { text: 'تایید شده', class: 'text-green-600' };
            case 'rejected': return { text: 'رد شده', class: 'text-red-600' };
            case 'pending': return { text: 'در انتظار', class: 'text-yellow-600' };
            default: return { text: status, class: 'text-gray-600' };
        }
    };
    const handleFilterChange = (filterName, value) => { /* ... (بدون تغییر) ... */
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        if (openFilterDropdowns[filterName] !== undefined) {
            setOpenFilterDropdowns(prev => ({ ...prev, [filterName]: false }));
        }
    };
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages && !loadingRequests) {
            setPagination(prev => ({ ...prev, currentPage: newPage }));
        }
    };
    const toggleFilterDropdown = (filterName) => { /* ... (بدون تغییر) ... */
        setOpenFilterDropdowns(prev => ({
            ...Object.keys(prev).reduce((acc, key) => { acc[key] = false; return acc; }, {}),
            [filterName]: !prev[filterName]
        }));
    };

    const statusFilterOptions = [ /* ... (بدون تغییر) ... */
        { value: '', label: 'همه وضعیت‌ها' },
        { value: 'pending', label: 'در انتظار بررسی' },
        { value: 'approved', label: 'تایید شده' },
        { value: 'rejected', label: 'رد شده' },
    ];
    // حالا parentCategoryFilterOptions از state خوانده می‌شود
    const parentCategoryFilterOptions = [{ value: '', label: 'همه دسته‌بندی‌ها' }, ...(activityCategories || []).map(cat => ({ value: cat, label: cat }))];

    const statCardsDisplayData = [ /* ... (بدون تغییر، از statsData استفاده می‌کند) ... */
        { title: "درخواست های در انتظار بررسی", count: statsData.pendingCount, Icon: BsChatLeftText, iconBgColor: "bg-orange-500", textColor: "text-[#FF4F0A]" },
        { title: "درخواست های تایید شده", count: statsData.approvedCount, Icon: BsClipboardCheck, iconBgColor: "bg-green-500", textColor: "text-green-600" },
    ];

    return (
        <>
            {/* ... (img union) ... */}
            <div className={`${!Open ? "w-[80%]" : "w-[94%]"} p-6 md:p-8 transition-all duration-500 flex flex-col h-screen relative z-10 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 overflow-y-auto`}>
                {/* ... (هدر صفحه) ... */}
                <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-[5vh] mb-6">
                    <div className="flex justify-center items-center gap-3 sm:gap-5 mb-2 sm:mb-0">
                        <h3 className='text-[#19A297] text-xs sm:text-sm'>هنرستان استارتاپی رکاد</h3>
                        <BiSolidSchool className='text-[#19A297] ml-[-8px] sm:ml-[-10px] text-lg sm:text-xl' />
                    </div>
                    {/* در داخل اولین div در هدر صفحه */}
                    <div className="flex justify-center items-center gap-3 sm:gap-5 mb-2 sm:mb-0">
                        <h3 className='text-[#19A297] text-xs sm:text-sm'>هنرستان استارتاپی رکاد</h3>
                        <BiSolidSchool className='text-[#19A297] ml-[-8px] sm:ml-[-10px] text-lg sm:text-xl' />

                        {/* --- کد جدید برای آیکون و پنل نوتیفیکیشن --- */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                id="admin-requests-notification-icon"
                                onClick={toggleNotificationPanel}
                                className="w-8 h-8 flex justify-center items-center border border-gray-300 rounded-full cursor-pointer relative group"
                                aria-label="اعلان‌ها"
                            >
                                <IoNotificationsOutline className="text-gray-400" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white">
                                        {unreadCount > 9 ? '۹+' : unreadCount.toLocaleString('fa-IR')}
                                    </span>
                                )}
                            </button>
                            <NotificationPanel
                                isOpen={isNotificationOpen}
                                onClose={closeNotificationPanel}
                                token={token}
                                userType="admin" // <<<< این prop کامپوننت را برای ادمین تنظیم می‌کند
                            />
                        </div>
                        {/* --- پایان کد جدید --- */}
                    </div>
                    <div className="flex justify-center items-center gap-3 sm:gap-5">
                        <p className='text-gray-400 text-xs sm:text-sm'> امروز {week}، {day} {month} ماه {year}</p>
                        <h1 className='text-[#19A297] font-semibold text-base sm:text-lg'>بررسی درخواست ها</h1>
                    </div>
                </div>


                {/* ... (کارت‌های آماری با استفاده از statCardsDisplayData و statsData.totalRequests) ... */}
                <div className="flex flex-col lg:flex-row gap-5 mb-6 min-h-[150px] lg:h-[25vh]">
                    {loadingStats && Array(2).fill(0).map((_, i) => <div key={i} className="flex-1 bg-gray-200 animate-pulse rounded-lg"></div>)}
                    {!loadingStats && errorStats && <p className="text-red-500 lg:col-span-2 text-center bg-red-100 p-3 rounded">{errorStats}</p>}
                    {!loadingStats && !errorStats &&
                        <>
                            <div className="flex flex-col gap-4 lg:w-1/2">
                                {statCardsDisplayData.map((card, idx) => (
                                    <div key={idx} className="relative flex-1 bg-[#FFF7F0] rounded-lg overflow-hidden p-4 sm:p-6 flex items-center justify-between shadow-sm border border-gray-100">
                                        <img src={Frame11} className='absolute z-0 h-full w-full object-cover left-0 top-0 opacity-100' alt="" />
                                        <p className={`${card.textColor} font-semibold text-2xl sm:text-3xl z-10`}>{card.count?.toLocaleString('fa-IR')}</p>
                                        <div className='flex items-center gap-2 sm:gap-3 z-10'>
                                            <h2 className={`${card.textColor} font-semibold text-lg sm:text-xl md:text-2xl text-right`}>{card.title}</h2>
                                            <div className={`${card.iconBgColor} flex justify-center items-center w-10 h-10 rounded-full flex-shrink-0`}>
                                                <card.Icon className='text-white text-xl sm:text-2xl scale-75' />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="relative lg:w-1/2 bg-blue-50 rounded-lg overflow-hidden p-6 flex flex-col justify-center items-center text-center shadow-sm border border-gray-100 gap-2">
                                <img src={Frame10} className='absolute z-0 h-full w-full object-cover top-0 left-0 opacity-100' alt="" />
                                <div className="bg-blue-500 flex justify-center items-center w-12 h-12 rounded-full mb-2 z-10">
                                    <BsClipboardData className='text-white scale-100' />
                                </div>
                                <h2 className='text-blue-600 font-semibold text-2xl z-10'>کل درخواست های ثبت شده</h2>
                                <p className='text-blue-600 font-bold text-4xl z-10'>{statsData.totalRequests?.toLocaleString('fa-IR')}</p>
                            </div>
                        </>
                    }
                </div>


                {/* ... (بخش فیلترها با استفاده از activityCategories برای دراپ‌داون دسته‌بندی والد) ... */}
                <div className="flex flex-col sm:flex-row justify-between items-center w-full mb-3 mt-8">
                    <div className="flex flex-wrap gap-2 mb-4 sm:mb-0">
                        {/* Status Filter */}
                        <div className="relative">
                            <button onClick={() => toggleFilterDropdown('status')} className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-xs flex items-center justify-between min-w-[120px] hover:border-gray-400">
                                <span>{statusFilterOptions.find(o => o.value === filters.status)?.label || 'وضعیت'}</span>
                                <IoIosArrowDown className={`ml-2 transition-transform ${openFilterDropdowns.status ? 'rotate-180' : ''}`} />
                            </button>
                            {openFilterDropdowns.status && (
                                <div className="absolute z-30 top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg py-1 max-h-60 overflow-y-auto">
                                    {statusFilterOptions.map(opt => (
                                        <button key={opt.value} onClick={() => handleFilterChange('status', opt.value)} className="block w-full text-right px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100">{opt.label}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Parent Category Filter */}
                        <div className="relative">
                            <button onClick={() => toggleFilterDropdown('activityParent')} className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-xs flex items-center justify-between min-w-[150px] hover:border-gray-400"
                                disabled={loadingActivityCategories || activityCategories.length === 0}>
                                <span>{parentCategoryFilterOptions.find(o => o.value === filters.activityParent)?.label || 'دسته بندی فعالیت'}</span>
                                <IoIosArrowDown className={`ml-2 transition-transform ${openFilterDropdowns.activityParent ? 'rotate-180' : ''}`} />
                            </button>
                            {openFilterDropdowns.activityParent && !loadingActivityCategories && activityCategories.length > 0 && (
                                <div className="absolute z-30 top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg py-1 max-h-60 overflow-y-auto">
                                    {parentCategoryFilterOptions.map(opt => (
                                        <button key={opt.value} onClick={() => handleFilterChange('activityParent', opt.value)} className="block w-full text-right px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100">{opt.label}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <input type="text" placeholder="نام دانش آموز..." value={filters.studentName} onChange={(e) => handleFilterChange('studentName', e.target.value)}
                            className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#19A297] focus:border-[#19A297]" />
                        <input type="text" placeholder="عنوان فعالیت..." value={filters.activityName} onChange={(e) => handleFilterChange('activityName', e.target.value)}
                            className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#19A297] focus:border-[#19A297]" />
                    </div>
                    <div className="flex items-center justify-end sm:justify-between gap-4 w-full sm:w-auto">
                        <p className='text-gray-400 text-xs hidden sm:block'>آخرین درخواست ها را مشاهده می کنید</p>
                        <h3 className='text-[#19A297] font-semibold text-base sm:text-lg'>آخرین درخواست ها</h3>
                    </div>
                </div>


                {/* ... (جدول درخواست‌ها با استفاده از requestsList و کنترل‌های صفحه‌بندی - بدون تغییر زیاد از کد قبلی شما، فقط مطمئن شوید `key` برای `<tr>` از `request._id` باشد) ... */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    {loadingRequests && <p className="text-center py-10 text-gray-600">در حال بارگذاری درخواست‌ها...</p>}
                    {errorRequests && <p className="text-center py-10 text-red-600 bg-red-100 p-4 rounded-md">{errorRequests}</p>}
                    {!loadingRequests && !errorRequests && requestsList.length === 0 && (
                        <p className="text-center py-10 text-gray-500">درخواستی برای نمایش یافت نشد.</p>
                    )}
                    {!loadingRequests && !errorRequests && requestsList.length > 0 && (
                        <table className='w-full min-w-[700px] rtl text-xs sm:text-sm'>
                            <thead className='bg-gray-50 text-[#202A5A] sticky top-0 z-10'>
                                {/* ... (هدرهای جدول با onClick برای handleSortChange) ... */}
                                <tr>
                                    <th className='font-medium text-center px-3 py-2.5 border-b border-gray-200 cursor-pointer' onClick={() => handleSortChange('studentName')}>نام دانش آموز {sort.sortBy === 'studentName' && (sort.order === 'asc' ? '↑' : '↓')}</th>
                                    <th className='font-medium text-center px-3 py-2.5 border-b border-gray-200 cursor-pointer' onClick={() => handleSortChange('activityName')}>عنوان فعالیت {sort.sortBy === 'activityName' && (sort.order === 'asc' ? '↑' : '↓')}</th>
                                    <th className='font-medium text-center px-3 py-2.5 border-b border-gray-200 cursor-pointer' onClick={() => handleSortChange('submissionDate')}>تاریخ ثبت {sort.sortBy === 'submissionDate' && (sort.order === 'asc' ? '↑' : '↓')}</th>
                                    <th className='font-medium text-center px-3 py-2.5 border-b border-gray-200 cursor-pointer' onClick={() => handleSortChange('reviewDate')}>تاریخ بررسی {sort.sortBy === 'reviewDate' && (sort.order === 'asc' ? '↑' : '↓')}</th>
                                    <th className='font-medium text-center px-3 py-2.5 border-b border-gray-200 cursor-pointer' onClick={() => handleSortChange('status')}>وضعیت {sort.sortBy === 'status' && (sort.order === 'asc' ? '↑' : '↓')}</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100'>
                                {requestsList.map((request, idx) => {
                                    const statusInfo = getStatusClassAndText(request.status);
                                    return (
                                        <tr key={request._id} // <<--- استفاده از request._id
                                            className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'} hover:bg-gray-100 transition-colors cursor-pointer`}
                                            onClick={() => handleRowClick(request)}
                                        >
                                            <td className='px-3 py-2.5 text-center whitespace-nowrap text-[#19A297]'>{request.studentName || '-'}</td>
                                            <td className='px-3 py-2.5 text-center whitespace-nowrap text-[#202A5A] font-medium'>{request.activityTitle || '-'}</td>
                                            <td className='px-3 py-2.5 text-center whitespace-nowrap text-gray-600'>{request.submissionDate ? new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(request.submissionDate)) : '-'}</td>
                                            <td className='px-3 py-2.5 text-center whitespace-nowrap text-gray-600'>{request.reviewDate ? new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(request.reviewDate)) : '-'}</td>
                                            <td className={`px-3 py-2.5 text-center whitespace-nowrap font-medium ${statusInfo.class}`}>{statusInfo.text}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
                {/* Pagination Controls */}
                {!loadingRequests && !errorRequests && requestsList.length > 0 && pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6 p-4 bg-gray-50 rounded-b-xl border-t border-gray-200">
                        <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors">قبلی</button>
                        <span className="text-sm text-gray-700"> صفحه {pagination.currentPage.toLocaleString('fa-IR')} از {pagination.totalPages.toLocaleString('fa-IR')} (کل: {pagination.totalCount?.toLocaleString('fa-IR') || '۰'}) </span>
                        <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors">بعدی</button>
                    </div>
                )}
                <div className="h-16"></div> {/* Padding at bottom for scroll */}
            </div>

            <RequestApprovalModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                requestData={selectedRequest}
                onApprove={handleApprove}
                onReject={handleReject}
                token={token}
            />
        </>
    );
}