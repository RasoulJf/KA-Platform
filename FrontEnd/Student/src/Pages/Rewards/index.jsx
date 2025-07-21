import React, { useState, useEffect } from 'react';
import { BiSolidSchool } from "react-icons/bi";
import { FaPlus } from 'react-icons/fa';
import { IoNotificationsOutline, IoChevronDown } from "react-icons/io5";
import { SiBasicattentiontoken } from 'react-icons/si';
import { Link } from 'react-router-dom';

import Frame25 from '../../assets/images/Frame25.png';
import Frame26 from '../../assets/images/Frame26.png';
import fetchData from '../../Utils/fetchData';

// مودال جدید برای نمایش جزئیات را ایمپورت می‌کنیم
import RewardDetailsModal from './RewardDetailsModal';

// کامپوننت کوچک و بهینه برای کارت‌های آماری
const StatCard = React.memo(({ title, value, imageSrc }) => (
    <div className="relative bg-purple-50 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center text-center min-h-[150px] overflow-hidden">
        <img src={imageSrc} className="absolute z-0 h-full w-full object-cover scale-110 top-0" alt="" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full opacity-50"></div>
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/10 rounded-full opacity-50"></div>
        <h2 className="text-md font-semibold text-[#652D90] mb-2 z-10">{title}</h2>
        <p className="text-3xl font-bold text-[#652D90] z-10">{value}</p>
    </div>
));

export default function Rewards({ Open }) {
    const [rewardsList, setRewardsList] = useState([]);
    const [isMounted, setIsMounted] = useState(false);
    const [visibility, setVisibility] = useState(false);
    const [filters, setFilters] = useState({ status: '', rewardTitle: '' });
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0, limit: 10 });
    const [openFilterDropdowns, setOpenFilterDropdowns] = useState({ status: false });
    const [loadingList, setLoadingList] = useState(true); // یک لودینگ جدا برای لیست
    const [loadingStats, setLoadingStats] = useState(true); // <<<< این state جا افتاده بود

    // State های جدید برای مودال جزئیات
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedReward, setSelectedReward] = useState(null);

    const [statsData, setStatsData] = useState({
        rewardsPendingValue: "۰",
        rewardsPaidValue: "۰",
        rewardsTotalRegisteredValue: "۰",
        userAvailableTokens: "۰",
        userUsedTokens: "۰",
        userOverallTotalTokens: "۰",
    });
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        setIsMounted(true); // برای اعمال انیمیشن
    }, []);

    // توابع کمکی برای فرمت‌دهی
    const formatNumberToPersian = (num) => (num !== undefined && num !== null && !isNaN(Number(num))) ? Number(num).toLocaleString('fa-IR') : "۰";
    const formatDateToPersian = (dateString) => dateString ? new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateString)) : "نامشخص";
    const getStatusDetails = (status) => {
        switch (status) {
            case 'pending': return { text: "در انتظار تایید", color: "text-yellow-500" };
            case 'approved': return { text: "تایید شده", color: "text-green-500" };
            case 'rejected': return { text: "رد شده", color: "text-red-500" };
            default: return { text: status || "نامشخص", color: "text-gray-500" };
        }
    };

    // ۱. این useEffect کامل رو حذف کن:
    // useEffect(() => {
    //     const loadRewardsData = async () => { ... };
    //     loadRewardsData();
    // }, [token]);


    // ۲. این useEffect رو با کد زیر جایگزین کن:
// ... (کدهای دیگر کامپوننت مثل state ها و توابع کمکی)

    // useEffect جدید شماره ۱: فقط برای بارگذاری آمار کلی (یک بار در ابتدا اجرا می‌شود)
    useEffect(() => {
        const loadStatsData = async () => {
            if (!token) {
                setError("شما وارد سیستم نشده‌اید.");
                setLoadingStats(false);
                return;
            }
            setLoadingStats(true); // فقط لودینگ آمار را فعال می‌کنیم
            setError(null);

            try {
                const statsResponse = await fetchData('student-reward/my-stats', {
                    headers: { authorization: `Bearer ${token}` }
                });

                if (statsResponse && statsResponse.success) {
                    const apiStats = statsResponse.data;
                    setStatsData({
                        rewardsPendingValue: formatNumberToPersian(apiStats.rewardsPendingValue),
                        rewardsPaidValue: formatNumberToPersian(apiStats.rewardsPaidValue),
                        rewardsTotalRegisteredValue: formatNumberToPersian(apiStats.rewardsTotalRegisteredValue),
                        userAvailableTokens: formatNumberToPersian(apiStats.userAvailableTokens),
                        userUsedTokens: formatNumberToPersian(apiStats.userUsedTokens),
                        userOverallTotalTokens: formatNumberToPersian(apiStats.userOverallTotalTokens),
                    });
                } else {
                    throw new Error(statsResponse?.message || "خطا در دریافت آمار");
                }
            } catch (err) {
                setError(err.message || "یک خطای ناشناخته در دریافت آمار رخ داد.");
            } finally {
                setLoadingStats(false); // لودینگ آمار تمام شد
            }
        };

        loadStatsData();
    }, [token]); // <<<< فقط به توکن وابسته است


    // useEffect جدید شماره ۲: برای بارگذاری لیست پاداش‌ها (با هر تغییر فیلتر یا صفحه اجرا می‌شود)
    useEffect(() => {
        // اگر هنوز در حال بارگذاری اولیه هستیم، لیست را نیاور تا آمار لود شود
        if (loadingStats || !token) return;

        const loadListData = async () => {
            setLoadingList(true); // فقط لودینگ لیست را فعال می‌کنیم
            setError(null);

            try {
                const queryParams = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)));
                queryParams.append('page', pagination.currentPage);
                queryParams.append('limit', pagination.limit);

                const listResponse = await fetchData(`student-reward/my-list?${queryParams.toString()}`, {
                    headers: { authorization: `Bearer ${token}` }
                });

                if (listResponse && listResponse.success && Array.isArray(listResponse.data)) {
                    setRewardsList(listResponse.data);
                    setPagination(prev => ({
                        ...prev,
                        totalPages: listResponse.totalPages || 1,
                        totalCount: listResponse.totalCount || 0,
                        currentPage: listResponse.currentPage || 1
                    }));
                } else {
                     // اگر لیست خالی بود خطا ندهیم، فقط لیست را خالی کنیم
                    if (listResponse && listResponse.data && listResponse.data.length === 0) {
                         setRewardsList([]);
                         setPagination(prev => ({ ...prev, totalPages: 1, totalCount: 0, currentPage: 1 }));
                    } else {
                        throw new Error(listResponse?.message || "خطا در دریافت لیست پاداش‌ها");
                    }
                }
            } catch (err) {
                setError(err.message || "یک خطای ناشناخته در دریافت لیست رخ داد.");
            } finally {
                setLoadingList(false); // لودینگ لیست تمام شد
                setTimeout(() => setVisibility(true), 50); // انیمیشن نمایش
            }
        };

        loadListData();
    }, [token, filters, pagination.currentPage, loadingStats]); // <<<< به فیلتر، صفحه و وضعیت لودینگ آمار وابسته است

// ... (بقیه کدهای کامپوننت شما بدون تغییر باقی می‌ماند)


    // توابع جدید برای مدیریت مودال جزئیات
    const handleOpenDetailsModal = (reward) => {
        setSelectedReward(reward);
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedReward(null);
    };

    const date = new Date();
    const dateInfo = {
        month: new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(date),
        day: new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date),
        year: new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date),
        week: new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(date),
    };

    if (loadingStats) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <p className="text-xl text-[#19A297]">در حال بارگذاری اطلاعات...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen w-full p-6 text-center">
                <p className="text-xl text-red-500 mb-4">خطا: {error}</p>
                <button onClick={() => window.location.reload()} className="bg-[#19A297] text-white px-6 py-2 rounded-lg hover:bg-[#137c73] transition-colors">تلاش مجدد</button>
            </div>
        );
    }

    const dynamicStatCardsData = [
        { title: "توکن‌های قابل استفاده", value: statsData.userAvailableTokens, imageSrc: Frame25 },
        { title: "توکن‌های استفاده‌شده", value: statsData.userUsedTokens, imageSrc: Frame25 },
        { title: "جمع کل توکن‌های کسب‌شده", value: statsData.userOverallTotalTokens, imageSrc: Frame25 },
        { title: "پاداش‌های در انتظار پرداخت", value: statsData.rewardsPendingValue, imageSrc: Frame25 },
        { title: "پاداش‌های پرداخت‌شده", value: statsData.rewardsPaidValue, imageSrc: Frame25 },
        { title: "کل پاداش‌های ثبت‌شده", value: statsData.rewardsTotalRegisteredValue, imageSrc: Frame25 },
    ];

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        if (openFilterDropdowns[name] !== undefined) {
            setOpenFilterDropdowns(prev => ({ ...prev, [name]: false }));
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, currentPage: newPage }));
        }
    };

    const toggleFilterDropdown = (name) => {
        setOpenFilterDropdowns(prev => ({ ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}), [name]: !prev[name] }));
    };

    const statusOptions = [{ value: '', label: 'همه وضعیت‌ها' }, { value: 'pending', label: 'در انتظار' }, { value: 'approved', label: 'تایید شده' }, { value: 'rejected', label: 'رد شده' }];

    return (
        <>
            <div className={`p-6 md:p-8 flex-col h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 ${!visibility ? "hidden opacity-0" : ""} ${Open ? 'w-full md:w-[calc(100%-22%)]' : 'w-full md:w-[calc(100%-6%)]'} ${isMounted ? 'transition-all duration-500' : ''}`}>

                {/* هدر بالا */}
                <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-[5vh] mb-6">
                    <div className="flex justify-center items-center gap-3 sm:gap-5 mb-2 sm:mb-0">
                        <h3 className="text-[#19A297] text-xs sm:text-sm">هنرستان استارتاپی رکاد</h3>
                        <BiSolidSchool className="text-[#19A297] ml-[-8px] sm:ml-[-10px] text-lg sm:text-xl" />
                    </div>
                    <div className="flex justify-center items-center gap-3 sm:gap-5">
                        <p className="text-gray-400 text-xs sm:text-sm">امروز {dateInfo.week}، {dateInfo.day} {dateInfo.month}، {dateInfo.year}</p>
                        <h1 className="text-[#19A297] font-semibold text-base sm:text-lg">پاداش ها</h1>
                    </div>
                </div>

                {/* کارت‌های آماری */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {dynamicStatCardsData.map((card, idx) => <StatCard key={idx} {...card} />)}
                </div>

                {/* بنر ثبت پاداش جدید */}
                <div className="bg-indigo-50 p-4 sm:p-6 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between mb-8 relative overflow-hidden">
                    <img src={Frame26} className="absolute z-0 h-full w-full object-cover scale-110 top-0" alt="" />
                    <div className="flex items-center gap-4 z-10 mb-3 sm:mb-0">
                        <Link to="/request-reward" className='z-10'>
                            <button className="bg-white cursor-pointer text-[#652D90] z-10 hover:scale-110 transition-transform duration-100 px-4 py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5">
                                <FaPlus /> اضافه کردن
                            </button>
                        </Link>
                        <p className="text-[#652D90] text-xs sm:text-sm font-medium z-10">برای ثبت پاداش جدید کلیک کنید</p>
                    </div>
                    <div className="flex items-center gap-3 z-10">
                        <h2 className="text-[#652D90] font-semibold text-lg sm:text-xl">ثبت پاداش جدید</h2>
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#652D90] flex items-center justify-center">
                            <SiBasicattentiontoken className="text-white text-2xl sm:text-3xl" />
                        </div>
                    </div>
                </div>

                {/* فیلترها و عنوان جدول */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                    <div className="flex flex-wrap gap-3 mb-4 sm:mb-0">
                        <div className="relative">
                            <button onClick={() => toggleFilterDropdown('status')} className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm flex items-center justify-between min-w-[150px] hover:border-gray-400">
                                <span>وضعیت: {statusOptions.find(opt => opt.value === filters.status)?.label || "همه"}</span>
                                <IoChevronDown className={`text-gray-500 transition-transform duration-200 ${openFilterDropdowns.status ? 'rotate-180' : ''}`} />
                            </button>
                            {openFilterDropdowns.status && (
                                <div className="absolute z-20 top-full right-0 sm:left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg py-1">
                                    {statusOptions.map(opt => (
                                        <button key={opt.value} onClick={() => handleFilterChange('status', opt.value)} className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{opt.label}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <input
                            type="text"
                            placeholder="جستجو در عنوان پاداش..."
                            value={filters.rewardTitle}
                            onChange={(e) => handleFilterChange('rewardTitle', e.target.value)}
                            className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm focus:border-[#19A297] focus:ring-1 focus:ring-[#19A297] outline-none"
                        />
                    </div>
                    <h2 className="text-lg font-semibold text-[#19A297]">آخرین پاداش ها</h2>
                </div>

                {/* جدول پاداش‌ها */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">نام</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">عنوان</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">تاریخ ثبت</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">تاریخ پرداخت</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">وضعیت</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loadingList ? (
                                    <tr><td colSpan="5" className="text-center py-10 text-gray-500">در حال بارگذاری لیست پاداش‌ها...</td></tr>
                                ) : rewardsList.length > 0 ? (
                                    rewardsList.map((reward, idx) => {
                                        const statusDetails = getStatusDetails(reward.status);
                                        const formattedSubmissionDate = formatDateToPersian(reward.createdAt);
                                        const formattedPaymentDate = reward.status === 'approved' ? formatDateToPersian(reward.updatedAt) : "نامشخص";
                                        const rewardDetailsForModal = { ...reward, title: reward.rewardId?.name || "بدون عنوان", tokenCost: reward.token, submissionDate: formattedSubmissionDate, paymentDate: formattedPaymentDate, status: statusDetails.text, statusColor: statusDetails.color };
                                        return (
                                            <tr key={reward._id} onClick={() => handleOpenDetailsModal(rewardDetailsForModal)} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-gray-100 transition-colors cursor-pointer`}>
                                                <td className="px-4 py-3 text-center ...">{reward.userId?.fullName || "نامشخص"}</td>
                                                <td className="px-4 py-3 text-center ...">{reward.rewardId?.name || "بدون عنوان"}</td>
                                                <td className="px-4 py-3 text-center ...">{formattedSubmissionDate}</td>
                                                <td className="px-4 py-3 text-center ...">{formattedPaymentDate}</td>
                                                <td className={`px-4 py-3 text-center ... ${statusDetails.color}`}>{statusDetails.text}</td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr><td colSpan="5" className="text-center py-10 text-gray-500">موردی برای نمایش یافت نشد.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="pb-10"></div>
                {/* صفحه‌بندی */}
                {pagination.totalPages > 1 && !loadingList && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                        <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50">قبلی</button>
                        <span className="text-sm text-gray-700">صفحه {pagination.currentPage.toLocaleString('fa-IR')} از {pagination.totalPages.toLocaleString('fa-IR')} (کل: {pagination.totalCount.toLocaleString('fa-IR')})</span>
                        <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50">بعدی</button>
                    </div>
                )}
            </div>

            {/* رندر کردن مودال جزئیات */}
            <RewardDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={handleCloseDetailsModal}
                reward={selectedReward}
            />
        </>
    );
}