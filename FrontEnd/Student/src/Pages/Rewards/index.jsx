import React, { useState, useEffect } from 'react';
import { BiSolidSchool } from "react-icons/bi";
import { FaPlus } from 'react-icons/fa';
import { IoNotificationsOutline, IoChevronDown } from "react-icons/io5";
import { SiBasicattentiontoken } from 'react-icons/si';
import { Link } from 'react-router-dom';

import Frame25 from '../../assets/images/Frame25.png';
import Frame26 from '../../assets/images/Frame26.png';
import fetchData from '../../Utils/fetchData';

// کامپوننت کوچک و بهینه برای کارت‌های آماری
const StatCard = React.memo(({ title, value, decorative, imageSrc }) => (
    <div className="relative bg-purple-50 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center text-center min-h-[150px] overflow-hidden">
        <img src={imageSrc} className="absolute z-0 h-full w-full object-cover scale-110 top-0" alt="" />
        {decorative && (
            <>
                <div className="absolute top-4 left-6 w-3 h-3 bg-blue-400 rounded-full opacity-70"></div>
                <div className="absolute top-8 right-8 w-2.5 h-2.5 bg-yellow-400 rounded-full opacity-70"></div>
                <div className="absolute bottom-20 right-10 w-2 h-2 bg-white rounded-full opacity-90"></div>
                <div className="absolute top-20 left-20 w-2.5 h-2.5 bg-yellow-400 rounded-full opacity-70"></div>
                <div className="absolute bottom-6 left-10 w-2 h-2 bg-white rounded-full opacity-90"></div>
                <div className="absolute bottom-4 right-6 w-4 h-4 bg-blue-500 rounded-full opacity-70"></div>
            </>
        )}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full opacity-50"></div>
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/10 rounded-full opacity-50"></div>
        <h2 className="text-md font-semibold text-[#652D90] mb-2 z-10">{title}</h2>
        <p className="text-3xl font-bold text-[#652D90] z-10">{value}</p>
    </div>
));

export default function Rewards({ Open }) {
    // ==================== FIX: حذف استیت‌های غیرضروری isReady و sidebarOpen ====================
    const [rewardsList, setRewardsList] = useState([]);
    const [isMounted, setIsMounted] = useState(false);
      const [visibility, setVisibility] = useState(false);
    
    useEffect(() => {
        // این useEffect فقط یک بار اجرا می‌شود و به کامپوننت می‌گوید که "نصب شده" است.
        setIsMounted(true);
    }, []);

    const [statsData, setStatsData] = useState({
        rewardsPendingValue: "۰",
        rewardsPaidValue: "۰",
        rewardsTotalRegisteredValue: "۰",
        userAvailableTokens: "۰",
        userUsedTokens: "۰",
        userOverallTotalTokens: "۰",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");

    const formatNumberToPersian = (num) => {
        if (num === undefined || num === null || isNaN(Number(num))) return "۰";
        return Number(num).toLocaleString('fa-IR');
    };

    const formatDateToPersian = (dateString) => {
        if (!dateString) return "نامشخص";
        try {
            return new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateString));
        } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return "تاریخ نامعتبر";
        }
    };

    const getStatusDetails = (status) => {
        switch (status) {
            case 'pending': return { text: "در انتظار تایید", color: "text-yellow-500" };
            case 'approved': return { text: "تایید شده", color: "text-green-500" };
            case 'rejected': return { text: "رد شده", color: "text-red-500" };
            default: return { text: status || "نامشخص", color: "text-gray-500" };
        }
    };

    useEffect(() => {
        const loadRewardsData = async () => {
            setLoading(true);
            setError(null);
            try {
                const commonGetOptions = { method: 'GET', headers: { authorization: `Bearer ${token}` } };
                
                // اجرای همزمان دو درخواست برای سرعت بیشتر
                const [rewardsResponse, statsResponse] = await Promise.all([
                    fetchData('student-reward', commonGetOptions),
                    fetchData('student-reward/my-stats', commonGetOptions)
                ]);

                if (rewardsResponse && rewardsResponse.success) {
                    setRewardsList(rewardsResponse.data.map(reward => {
                        const statusDetails = getStatusDetails(reward.status);
                        return {
                            id: reward._id,
                            name: reward.userId?.name || "نامشخص",
                            title: reward.rewardId?.name || "بدون عنوان",
                            submissionDate: formatDateToPersian(reward.createdAt),
                            paymentDate: reward.status === 'approved' && reward.updatedAt ? formatDateToPersian(reward.updatedAt) : "نامشخص",
                            status: statusDetails.text,
                            statusColor: statusDetails.color,
                        };
                    }));
                } else {
                    throw new Error(rewardsResponse?.message || "خطا در دریافت لیست پاداش‌ها");
                }

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
                    throw new Error(statsResponse?.message || "خطا در دریافت آمار پاداش‌ها");
                }

            } catch (err) {
                setError(err.message || "یک خطای ناشناخته رخ داد.");
            } finally {
                setLoading(false);
                setTimeout(() => {
                  setVisibility(true)
                }, 1);
            }
        };

        if (token) {
            loadRewardsData();
        } else {
            setError("شما وارد سیستم نشده‌اید. لطفا ابتدا وارد شوید.");
            setLoading(false);
        }
    }, [token]);

    const date = new Date();
    const dateInfo = {
        month: new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(date),
        day: new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date),
        year: new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date),
        week: new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(date),
    };

    if (loading) {
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
        { title: "پاداش‌های در انتظار پرداخت", value: statsData.rewardsPendingValue },
        { title: "پاداش‌های پرداخت‌شده", value: statsData.rewardsPaidValue },
        { title: "کل پاداش‌های ثبت‌شده", value: statsData.rewardsTotalRegisteredValue, decorative: true },
        { title: "توکن‌های قابل استفاده", value: statsData.userAvailableTokens },
        { title: "توکن‌های استفاده‌شده", value: statsData.userUsedTokens },
        { title: "جمع کل توکن‌های کسب‌شده", value: statsData.userOverallTotalTokens },
    ];

    return (
        // ==================== FIX: استفاده مستقیم از پراپ Open برای تعیین عرض ====================
        <div className={` ${!visibility ? "hidden opacity-0": ""} p-6 md:p-8 flex-col h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 ${
            Open
                ? 'w-full md:w-[calc(100%-22%)]'
                : 'w-full md:w-[calc(100%-6%)]'
        } ${isMounted ? 'transition-all duration-500' : ''}`}> {/* <<<<<< فقط این قسمت تغییر می‌کند */}
        {/* =================================================================================== */}
        
            {/* هدر بالا */}
            <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-[5vh] mb-6">
                <div className="flex justify-center items-center gap-3 sm:gap-5 mb-2 sm:mb-0">
                    <h3 className="text-[#19A297] text-xs sm:text-sm">هنرستان استارتاپی رکاد</h3>
                    <BiSolidSchool className="text-[#19A297] ml-[-8px] sm:ml-[-10px] text-lg sm:text-xl" />
                    <div className="w-7 h-7 sm:w-8 sm:h-8 flex justify-center items-center border border-gray-300 rounded-full relative cursor-pointer group">
                        <IoNotificationsOutline className="text-gray-400 text-sm sm:text-base" />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                    </div>
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
                    <p className="text-[#652D90] text-xs sm:text-sm font-medium z-10">برای ثبت فعالیت جدید کلیک کنید</p>
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
                <div className="flex flex-wrap gap-3">
                    {['عنوان', 'وضعیت', 'تاریخ'].map(filterName => (
                        <button key={filterName} className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm flex items-center justify-between min-w-[120px] hover:border-gray-400 transition-colors">
                            <span>{filterName}</span>
                            <IoChevronDown className="text-gray-500" />
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <p className="text-gray-500 text-xs sm:text-sm order-1 sm:order-2">در اینجا سوابق آخرین پاداش ها را مشاهده می کنید</p>
                    <h2 className="text-lg font-semibold text-[#19A297] order-2 sm:order-1">آخرین پاداش ها</h2>
                </div>
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
                            {rewardsList.length > 0 ? (
                                rewardsList.map((reward, idx) => (
                                    <tr key={reward.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-gray-100 transition-colors`}>
                                        <td className="px-4 py-3 text-center whitespace-nowrap text-gray-800 font-medium">{reward.name}</td>
                                        <td className="px-4 py-3 text-center whitespace-nowrap text-gray-600">{reward.title}</td>
                                        <td className="px-4 py-3 text-center whitespace-nowrap text-gray-600">{reward.submissionDate}</td>
                                        <td className="px-4 py-3 text-center whitespace-nowrap text-gray-600">{reward.paymentDate}</td>
                                        <td className={`px-4 py-3 text-center whitespace-nowrap font-semibold ${reward.statusColor}`}>{reward.status}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center py-10 text-gray-500">موردی برای نمایش یافت نشد.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="pb-10"></div>
        </div>
    );
}