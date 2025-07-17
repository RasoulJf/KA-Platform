import React, { useEffect, useRef, useState } from 'react';
import fetchData from '../../Utils/fetchData';
import Frame23 from '../../assets/images/Frame23.png'; // برای کارت آمار
import Frame24 from '../../assets/images/Frame24.png'; // برای بنر فعالیت جدید

import { BiSolidSchool } from "react-icons/bi";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaPlus } from "react-icons/fa";
import { BsChatDots, BsChatFill, BsChatText } from "react-icons/bs";
import { IoChevronDown } from "react-icons/io5";
import AddActivityModal from './AddActivityModal'; // مسیر صحیح به کامپوننت مودال
// NotificationPanel را هم اگر لازم دارید import کنید
// import NotificationPanel from '../../Components/NotificationPanel';

export default function Activities({ Open }) { // نام کامپوننت را Activities نگه می‌داریم
    const token = localStorage.getItem("token");
    const date = new Date();
    const month = new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(date);
    const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
    // برای نمایش سال به صورت عدد فارسی در هدر (اختیاری)
    const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date)
    const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(date);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [statCardData, setStatCardData] = useState({
        pendingStudentActivities: 0,
        approvedStudentActivities: 0,
        totalAllActivities: 0,
    });
    const [loadingStats, setLoadingStats] = useState(true);
    const [errorStats, setErrorStats] = useState(null);

    const [activitiesList, setActivitiesList] = useState([]);
    const [loadingActivities, setLoadingActivities] = useState(true);
    const [errorActivities, setErrorActivities] = useState(null);

    const [filters, setFilters] = useState({
        status: '',
        activityTitle: '',
        // dateRange: { from: null, to: null } // برای فیلتر تاریخ اگر لازم شد
    });
    const [sort, setSort] = useState({ sortBy: 'submissionDate', order: 'desc' });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 7, // تعداد آیتم در هر صفحه
    });

    const [openFilterDropdowns, setOpenFilterDropdowns] = useState({
        status: false,
        // date: false, // اگر فیلتر تاریخ دارید
    });

    // State و توابع برای پنل نوتیفیکیشن (اگر در این صفحه هم استفاده می‌شود)
    // const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    // const notificationRef = useRef(null);
    // const toggleNotificationPanel = () => setIsNotificationOpen(prev => !prev);
    // const closeNotificationPanel = () => setIsNotificationOpen(false);
    // useEffect(() => { /* ... منطق بستن پنل نوتیفیکیشن ... */ }, [isNotificationOpen]);


    // Fetch Stat Card Data
    useEffect(() => {
        const fetchStats = async () => {
            if (!token) {
                setErrorStats("توکن احراز هویت یافت نشد.");
                setLoadingStats(false);
                return;
            }
            setLoadingStats(true);
            setErrorStats(null);
            try {
                const response = await fetchData('my-activities/my-stats', { // مسیر اندپوینت بک‌اند شما
                    headers: { authorization: `Berear ${token}` }
                });
                if (response.success && response.data) {
                    setStatCardData({
                        pendingStudentActivities: response.data.pendingStudentActivities || 0,
                        approvedStudentActivities: response.data.approvedStudentActivities || 0,
                        totalAllActivities: response.data.totalAllActivities || 0,
                    });
                } else {
                    setErrorStats(response.message || "خطا در دریافت آمار فعالیت‌ها.");
                }
            } catch (err) {
                setErrorStats("خطای شبکه یا سرور (آمار): " + err.message);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, [token]);

    // Fetch Activities List
    useEffect(() => {
        const fetchActivities = async () => {
            if (!token) {
                setErrorActivities("توکن احراز هویت یافت نشد.");
                setLoadingActivities(false);
                return;
            }
            setLoadingActivities(true);
            setErrorActivities(null);

            const queryParams = new URLSearchParams();
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.activityTitle) queryParams.append('activityTitle', filters.activityTitle);
            // if (filters.dateRange.from) queryParams.append('dateFrom', filters.dateRange.from.toISOString());
            // if (filters.dateRange.to) queryParams.append('dateTo', filters.dateRange.to.toISOString());
            queryParams.append('sortBy', sort.sortBy);
            queryParams.append('order', sort.order);
            queryParams.append('page', pagination.currentPage);
            queryParams.append('limit', pagination.limit);

            try {
                const response = await fetchData(`my-activities/my-list?${queryParams.toString()}`, {
                    headers: { authorization: `Berear ${token}` }
                });
                if (response.success && response.data) {
                    setActivitiesList(response.data);
                    setPagination(prev => ({
                        ...prev,
                        totalPages: response.totalPages || 1,
                        totalCount: response.totalCount || 0,
                        currentPage: response.currentPage || 1,
                    }));
                } else {
                    setErrorActivities(response.message || "خطا در دریافت لیست فعالیت‌ها.");
                    setActivitiesList([]);
                }
            } catch (err) {
                setErrorActivities("خطای شبکه یا سرور (لیست): " + err.message);
                setActivitiesList([]);
            } finally {
                setLoadingActivities(false);
            }
        };
        fetchActivities();
    }, [token, filters, sort, pagination.currentPage, pagination.limit]);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const refreshData = async () => {
        // رفرش کردن آمار
        if (token) {
            setLoadingStats(true);
            try {
                const statsRes = await fetchData('my-activities/my-stats', { headers: { authorization: `Berear ${token}` } });
                if (statsRes.success && statsRes.data) setStatCardData(statsRes.data);
            } catch (err) { console.error("Error refreshing stats:", err); }
            finally { setLoadingStats(false); }
        }
        // رفرش کردن لیست فعالیت ها (با برگرداندن به صفحه اول)
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        // useEffect مربوط به activitiesList با تغییر pagination.currentPage اجرا و لیست را رفرش می‌کند.
    };


    const handleActivitySubmit = (dataFromModal) => {
        // console.log("Activity Data Submitted to Parent Component:", dataFromModal);
        setIsModalOpen(false);
        // پس از ثبت موفق در مودال و ارسال به بک‌اند (که در خود مودال انجام می‌شود)
        // اینجا فقط داده‌ها را رفرش می‌کنیم
        refreshData();
    };


    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        if (filterName === 'status') { // بستن دراپ‌داون وضعیت پس از انتخاب
            setOpenFilterDropdowns(prev => ({ ...prev, status: false }));
        }
    };

    const handleSortChange = (newSortBy) => {
        setSort(prev => ({
            sortBy: newSortBy,
            order: prev.sortBy === newSortBy ? (prev.order === 'asc' ? 'desc' : 'asc') : 'desc'
        }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, currentPage: newPage }));
        }
    };

    const toggleFilterDropdown = (filterName) => {
        setOpenFilterDropdowns(prev => ({
            ...Object.keys(prev).reduce((acc, key) => { acc[key] = false; return acc; }, {}),
            [filterName]: !prev[filterName]
        }));
    };

    const statusOptions = [
        { value: '', label: 'همه وضعیت‌ها' },
        { value: 'pending', label: 'در انتظار بررسی' },
        { value: 'approved', label: 'تایید شده' },
        { value: 'rejected', label: 'تایید نشده' },
        // می‌توانید "ثبت توسط ادمین" را هم اضافه کنید اگر بک‌اند آن را به عنوان یک وضعیت برمی‌گرداند
        // { value: 'admin_approved', label: 'ثبت توسط ادمین' },
    ];

    const statCardsDisplayData = [
        { title: "فعالیت های در انتظار بررسی", count: statCardData.pendingStudentActivities, Icon: BsChatDots, bgColorClass: "bg-yellow-500", textColorClass: "text-yellow-700", iconBgColorClass: "bg-yellow-400" },
        { title: "فعالیت های تایید شده", count: statCardData.approvedStudentActivities, Icon: BsChatFill, bgColorClass: "bg-green-500", textColorClass: "text-green-700", iconBgColorClass: "bg-green-400" },
        { title: "همه فعالیت های من", count: statCardData.totalAllActivities, Icon: BsChatText, bgColorClass: "bg-blue-500", textColorClass: "text-blue-700", iconBgColorClass: "bg-blue-400" },
    ];


    return (
        <>
            <div className={`${!Open ? "w-[calc(100%-6%)]" : "w-[calc(100%-23%)]" } lg:w-[${!Open ? "80%" : "94%"}] p-6 md:p-8 transition-all duration-500 flex-col h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}>

                {/* هدر بالا */}
                <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-[5vh] mb-6">
                    <div className="flex justify-center items-center gap-3 sm:gap-5 mb-2 sm:mb-0">
                        <h3 className="text-[#19A297] text-xs sm:text-sm">هنرستان استارتاپی رکاد</h3>
                        <BiSolidSchool className="text-[#19A297] ml-[-8px] sm:ml-[-10px] text-lg sm:text-xl" />
                        {/* <div className="w-7 h-7 sm:w-8 sm:h-8 flex justify-center items-center border border-gray-300 rounded-full relative cursor-pointer group">
                            <IoNotificationsOutline className="text-gray-400 text-sm sm:text-base" />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                        </div> */}
                    </div>
                    <div className="flex justify-center items-center gap-3 sm:gap-5">
                        <p className="text-gray-400 text-xs sm:text-sm">امروز {week}، {day} {month} ماه {year}</p>
                        <h1 className="text-[#19A297] font-semibold text-base sm:text-lg">فعالیت های من</h1>
                    </div>
                </div>

                {/* کارت‌های آماری بالا */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {loadingStats && Array(3).fill(0).map((_, i) => ( // Skeleton loader
                        <div key={i} className="relative bg-gray-200 animate-pulse p-6 rounded-xl shadow-lg min-h-[180px]"></div>
                    ))}
                    {errorStats && <p className="col-span-full text-center text-red-500 bg-red-100 p-4 rounded-md">{errorStats}</p>}
                    {!loadingStats && !errorStats && statCardsDisplayData.map((card, idx) => (
                        <div key={idx} className={`relative p-6 rounded-xl shadow-lg flex flex-col items-center justify-center text-center min-h-[180px] overflow-hidden ${card.bgColorClass.replace('bg-','bg-opacity-10 ')}`}>
                            <img src={Frame23} className="absolute z-0 h-full w-full object-cover scale-110 top-[10px]" alt="" />
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/30 rounded-full opacity-50"></div>
                            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/20 rounded-full opacity-50"></div>
                            <div className={`w-16 h-16 rounded-full ${card.iconBgColorClass} flex items-center justify-center mb-3 z-10`}>
                                <card.Icon className="text-white text-3xl" />
                            </div>
                            <h2 className={`text-md font-semibold ${card.textColorClass} mb-1 z-10`}>{card.title}</h2>
                            <p className={`text-3xl font-bold ${card.textColorClass} z-10`}>{card.count?.toLocaleString('fa-IR') || '۰'}</p>
                        </div>
                    ))}
                </div>

                {/* بنر ثبت فعالیت جدید */}
                <div className="bg-pink-50 p-4 sm:p-6 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between mb-8 relative overflow-hidden">
                    <img src={Frame24} className="absolute z-0 h-full w-full object-cover scale-105 top-0 left-0" alt="" />
                    <div className="flex items-center gap-3 z-10 mb-3 sm:mb-0 text-right">
                        <button
                            onClick={handleOpenModal}
                            className="bg-white cursor-pointer text-[#D41A54] z-10 hover:scale-105 duration-100 transition-transform px-4 py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5"
                        > <FaPlus /> اضافه کردن </button>
                        <p className="text-[#FF9ABA] z-10 text-xs sm:text-sm font-medium">برای ثبت فعالیت جدید بر روی اضافه کردن ضربه بزنید</p>
                    </div>
                    <div className="flex items-center gap-3 z-10">
                        <h2 className="text-[#D41A54] font-semibold text-lg sm:text-xl">فعالیت جدید</h2>
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#D41A54] flex items-center justify-center">
                            <BsChatText className="text-white text-2xl sm:text-3xl" />
                        </div>
                    </div>
                </div>

                {/* فیلترها و عنوان جدول */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                    <div className="flex flex-wrap gap-3 mb-4 sm:mb-0">
                        {/* فیلتر وضعیت */}
                        <div className="relative">
                            <button onClick={() => toggleFilterDropdown('status')} className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm flex items-center justify-between min-w-[150px] hover:border-gray-400 transition-colors">
                                <span>وضعیت: {statusOptions.find(opt => opt.value === filters.status)?.label || "همه"}</span>
                                <IoChevronDown className={`text-gray-500 transition-transform duration-200 ${openFilterDropdowns.status ? 'rotate-180' : ''}`} />
                            </button>
                            {openFilterDropdowns.status && (
                                <div className="absolute z-20 top-full right-0 sm:left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg py-1">
                                    {statusOptions.map(opt => (
                                        <button key={opt.value} onClick={() => handleFilterChange('status', opt.value)}
                                            className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* فیلتر عنوان (یک اینپوت ساده) */}
                        <input
                            type="text"
                            placeholder="جستجو در عنوان فعالیت..."
                            value={filters.activityTitle}
                            onChange={(e) => handleFilterChange('activityTitle', e.target.value)}
                            className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm focus:border-[#19A297] focus:ring-1 focus:ring-[#19A297] outline-none"
                        />
                    </div>
                    <h2 className="text-lg font-semibold text-[#19A297]">آخرین فعالیت ها</h2>
                </div>


                {/* جدول فعالیت‌ها */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        {loadingActivities && <p className="text-center py-10 text-gray-600">در حال بارگذاری لیست فعالیت‌ها...</p>}
                        {errorActivities && <p className="text-center py-10 text-red-600 bg-red-100 p-4 rounded-md">{errorActivities}</p>}
                        {!loadingActivities && !errorActivities && activitiesList.length === 0 && (
                            <p className="text-center py-10 text-gray-500">فعالیتی برای نمایش یافت نشد.</p>
                        )}
                        {!loadingActivities && !errorActivities && activitiesList.length > 0 && (
                            <table className="w-full min-w-[700px] text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {/* برای ستون‌های قابل مرتب‌سازی، onClick اضافه کنید */}
                                        <th onClick={() => handleSortChange('status')} className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer">وضعیت {sort.sortBy === 'status' && (sort.order === 'asc' ? '↑' : '↓')}</th>
                                        <th onClick={() => handleSortChange('reviewDate')} className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer">تاریخ بررسی {sort.sortBy === 'reviewDate' && (sort.order === 'asc' ? '↑' : '↓')}</th>
                                        <th onClick={() => handleSortChange('submissionDate')} className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer">تاریخ ثبت {sort.sortBy === 'submissionDate' && (sort.order === 'asc' ? '↑' : '↓')}</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">شرح</th>
                                        <th onClick={() => handleSortChange('activityName')} className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer">عنوان {sort.sortBy === 'activityName' && (sort.order === 'asc' ? '↑' : '↓')}</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">امتیاز</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">نوع ثبت</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y rtl divide-gray-200">
                                    {activitiesList.map((activity, idx) => {
                                        let statusText = activity.status;
                                        let statusColor = "text-gray-500";
                                        if (activity.status === "approved") { statusText = "تایید شده"; statusColor = "text-green-500"; }
                                        else if (activity.status === "rejected") { statusText = "تایید نشده"; statusColor = "text-red-500"; }
                                        else if (activity.status === "pending") { statusText = "در انتظار"; statusColor = "text-yellow-500"; }
                                        else if (activity.status === "ثبت توسط ادمین") { statusColor = "text-blue-500"; }

                                        return (
                                            <tr key={activity._id || idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-gray-100 transition-colors`}>
                                                <td className={`px-4 text-center py-3 whitespace-nowrap font-semibold ${statusColor}`}>{statusText}</td>
                                                <td className="px-4 text-center py-3 whitespace-nowrap text-gray-600">{activity.reviewDate ? new Intl.DateTimeFormat('fa-IR', {year: 'numeric', month: 'short', day: 'numeric'}).format(new Date(activity.reviewDate)) : '-'}</td>
                                                <td className="px-4 text-center py-3 whitespace-nowrap text-gray-600">{activity.submissionDate ? new Intl.DateTimeFormat('fa-IR', {year: 'numeric', month: 'short', day: 'numeric'}).format(new Date(activity.submissionDate)) : '-'}</td>
                                                <td className="px-4 text-center py-3 whitespace-nowrap text-gray-600 max-w-[200px] truncate" title={activity.descriptionFromEntry}>{activity.descriptionFromEntry || '-'}</td>
                                                <td className="px-4 text-center py-3 whitespace-nowrap text-gray-800 font-medium">{activity.activityName || 'نامشخص'}</td>
                                                <td className="px-4 text-center py-3 whitespace-nowrap text-gray-600 font-semibold">{activity.scoreAwarded?.toLocaleString('fa-IR') ?? '-'}</td>
                                                <td className="px-4 text-center py-3 whitespace-nowrap text-gray-500">{activity.type || '-'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                     {/* Pagination Controls */}
                    {!loadingActivities && !errorActivities && activitiesList.length > 0 && pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6 p-4 bg-gray-50 rounded-b-xl border-t border-gray-200">
                            <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors">قبلی</button>
                            <span className="text-sm text-gray-700">
                                صفحه {pagination.currentPage.toLocaleString('fa-IR')} از {pagination.totalPages.toLocaleString('fa-IR')} (کل: {pagination.totalCount?.toLocaleString('fa-IR') || '۰'})
                            </span>
                            <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors">بعدی</button>
                        </div>
                    )}
                </div>
                <div className="h-16"></div> {/* Padding at bottom */}
            </div>

            <AddActivityModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleActivitySubmit} // این تابع باید لیست را رفرش کند
                token={token}
                // پاس دادن activityCategories به مودال اگر لازم است
                // activityCategories={activityCategories}
                // loadingActivityCategories={loadingStats && activityCategories.length === 0}
            />
        </>
    );
}