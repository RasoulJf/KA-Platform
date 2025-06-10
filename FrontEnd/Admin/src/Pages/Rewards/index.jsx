// =========================================================================
// RewardsAdminPage.jsx (کامل با اتصال به مودال و بک‌اند)
// =========================================================================
import React, { useState, useEffect, useMemo } from 'react';
import union from '../../assets/images/Union4.png'; // مسیر صحیح
import Frame20 from '../../assets/images/Frame20.png'; // مسیر صحیح

import { BiSolidSchool } from "react-icons/bi";
import { IoNotificationsOutline } from "react-icons/io5"; // از io5
import { IoIosArrowDown } from 'react-icons/io';
import RewardApprovalModal from './RewardApprovalModal'; // <<<< مسیر ایمپورت مودال (اگر در همین پوشه است)
// یا مثلا: import RewardApprovalModal from '../../components/modals/RewardApprovalModal';
import fetchData from '../../Utils/fetchData'; // <<<< مسیر صحیح به fetchData
// import { useNavigate } from 'react-router-dom'; // اگر برای هدایت در صورت خطا لازم است

export default function RewardsAdminPage({ Open }) {
    const date = new Date();
    const month = new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(date);
    const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
    const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date)
    const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(date);
    // const navigate = useNavigate(); // در صورت نیاز

    const [rewardsData, setRewardsData] = useState([]);
    const [statCardsDisplayData, setStatCardsDisplayData] = useState([
        { title: "پاداش‌های در انتظار پرداخت", value: "۰" },
        { title: "پاداش‌های پرداخت‌شده", value: "۰" },
        { title: "کل توکن‌های درخواستی", value: "۰", decorated: true },
        { title: "توکن‌های قابل استفاده (کل)", value: "۰" },
        { title: "توکن‌های پرداخت شده (کل)", value: "۰" },
        { title: "جمع کل توکن‌های کاربران", value: "۰" },
    ]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedRewardForPayment, setSelectedRewardForPayment] = useState(null);

    const formatNumberToPersian = (num) => {
        if (num === undefined || num === null || isNaN(Number(num))) return "۰";
        return Number(num).toLocaleString('fa-IR');
    };
    const formatDateToPersian = (dateString) => {
        if (!dateString) return "نامشخص";
        try { return new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateString)); }
        catch (e) { console.error("Date format error:", dateString, e); return "تاریخ نامعتبر"; }
    };
    const getStatusDetailsAdmin = (status) => {
        switch (status) {
            case 'pending': return { text: "تایید نشده", class: 'text-red-600', isPending: true };
            case 'approved': return { text: "تایید شده", class: 'text-green-600', isPending: false };
            case 'rejected': return { text: "رد شده", class: 'text-orange-600', isPending: false };
            default: return { text: status || "نامشخص", class: 'text-gray-600', isPending: false };
        }
    };

    const fetchAllAdminData = async (page = 1) => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
            setError("توکن احراز هویت یافت نشد. لطفا ابتدا وارد شوید.");
            setLoading(false);
            // navigate('/login');
            return;
        }

        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const [rewardsResponse, statsResponse] = await Promise.all([
                fetchData(`student-reward/all-for-admin?page=${page}&limit=10`, { method: 'GET', headers }),
                fetchData('student-reward/admin-stats', { method: 'GET', headers })
            ]);

            // پردازش لیست StudentReward ها
            if (rewardsResponse && rewardsResponse.success && Array.isArray(rewardsResponse.data)) {
                const formattedRewards = rewardsResponse.data.map((reward, index) => {
                    const statusDetails = getStatusDetailsAdmin(reward.status);
                    return {
                        id: reward._id, // این _id از StudentReward است
                        name: reward.userId && reward.userId.fullName ? reward.userId.fullName : "نامشخص",
                        grade: reward.userId && reward.userId.grade ? reward.userId.grade : "نامشخص",
                        image: reward.userId && reward.userId.image ? `${import.meta.env.VITE_BASE_FILE}${reward.userId.image}` : Frame20,
                        title: reward.rewardId && (reward.rewardId.name || reward.rewardId.description) ? (reward.rewardId.name || reward.rewardId.description) : "بدون عنوان",
                        description: reward.rewardId && reward.rewardId.description ? reward.rewardId.description : "بدون توضیحات",
                        submissionDate: formatDateToPersian(reward.createdAt),
                        paymentDate: reward.status === 'approved' && reward.updatedAt ? formatDateToPersian(reward.updatedAt) : "نامشخص",
                        status: statusDetails.text,
                        statusClass: statusDetails.class,
                        isPending: statusDetails.isPending,
                        tokenAmount: reward.token, // توکن ثبت شده در StudentReward
                        isOdd: index % 2 !== 0,
                    };
                });
                setRewardsData(formattedRewards);
                setCurrentPage(page);
                setTotalResults(rewardsResponse.totalCount || 0);
                setTotalPages(Math.ceil((rewardsResponse.totalCount || 0) / 10));
            } else {
                throw new Error(rewardsResponse?.message || "خطا در دریافت لیست پاداش‌ها از سرور.");
            }

            // پردازش آمار ادمین
            if (statsResponse && statsResponse.success && statsResponse.data) {
                const apiStats = statsResponse.data;
                setStatCardsDisplayData([
                    { title: "پاداش‌های در انتظار پرداخت", value: formatNumberToPersian(apiStats.rewardsPendingValue) },
                    { title: "پاداش‌های پرداخت‌شده", value: formatNumberToPersian(apiStats.rewardsPaidValue) },
                    { title: "کل توکن‌های درخواستی", value: formatNumberToPersian(apiStats.rewardsTotalRegisteredValue), decorated: true },
                    { title: "توکن‌های قابل استفاده (کل)", value: formatNumberToPersian(apiStats.systemTotalAvailableTokens) },
                    { title: "توکن‌های پرداخت شده (کل)", value: formatNumberToPersian(apiStats.systemTotalUsedOrPaidTokens) },
                    { title: "جمع کل توکن‌های کاربران", value: formatNumberToPersian(apiStats.systemOverallStudentTokens) },
                ]);
            } else {
                 console.warn("Could not fetch admin stats:", statsResponse?.message);
                 // می‌توانید مقادیر پیش‌فرض یا پیام خطا برای کارت‌های آماری ست کنید
            }
        } catch (err) {
            console.error("Error loading admin rewards data:", err);
            setError(err.message || "خطایی در بارگذاری اطلاعات رخ داد.");
            setRewardsData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllAdminData(currentPage);
    }, [currentPage]); // توکن را از اینجا حذف کردم چون در خود تابع گرفته می‌شود، اما اگر لاگین/لاگ‌اوت دارید، بهتر است باشد


    const handleRowClick = (rewardClicked) => {
        // شرط if (rewardClicked.isPending) حذف شد
        // حالا برای همه ردیف‌ها (صرف نظر از وضعیت فعلی) مودال باز می‌شود
        setSelectedRewardForPayment({
            studentRewardId: rewardClicked.id,
            userName: rewardClicked.name,
            userGrade: rewardClicked.grade,
            rewardTitle: rewardClicked.title,
            rewardDescription: rewardClicked.description,
            tokenAmountRequired: rewardClicked.tokenAmount,
            submissionDate: rewardClicked.submissionDate,
            currentStatus: rewardClicked.status, // <<<< اضافه کردن وضعیت فعلی برای نمایش در مودال (اختیاری)
            // paymentDate اگر لازم است برای نمایش در مودال
        });
        setIsPaymentModalOpen(true);
    };

    const handleClosePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setSelectedRewardForPayment(null);
    };

    const handleConfirmPayment = async (studentRewardId, newStatus) => {
        if (!studentRewardId || !newStatus) {
            alert("اطلاعات لازم برای تغییر وضعیت ارسال نشده است.");
            return;
        }
        const token = localStorage.getItem("token");
        if (!token) {
            alert("توکن برای انجام عملیات یافت نشد. لطفاً دوباره وارد شوید.");
            return;
        }

        console.log(`Admin: Attempting to change status of StudentReward ID ${studentRewardId} to ${newStatus}`);

        try {
            const response = await fetchData(`student-reward/${studentRewardId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response && response.success) {
                alert(`وضعیت پاداش با موفقیت به '${newStatus === 'approved' ? 'تایید شده' : (newStatus === 'rejected' ? 'رد شده' : newStatus)}' تغییر کرد.`);
                handleClosePaymentModal();
                await fetchAllAdminData(currentPage); // رفرش داده‌های جدول و آمار
            } else {
                throw new Error(response?.message || `خطا در تغییر وضعیت پاداش.`);
            }
        } catch (err) {
            console.error("Error in handleConfirmPayment (Admin):", err);
            alert(`خطا هنگام تغییر وضعیت: ${err.message}`);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && !loading) { // اضافه کردن !loading
            setCurrentPage(newPage);
        }
    };


    if (loading && rewardsData.length === 0) {
        return <div className="flex justify-center items-center h-screen w-full"><p className="text-xl text-gray-600">در حال بارگذاری...</p></div>;
    }
    if (error && rewardsData.length === 0) {
        return <div className="flex flex-col justify-center items-center h-screen w-full p-6 text-center">
            <p className="text-xl text-red-500 mb-4">خطا: {error}</p>
            <button onClick={() => fetchAllAdminData(1)} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">تلاش مجدد</button>
        </div>;
    }

    return (
        <>
            <img src={union} className='absolute scale-75 top-[-4rem] left-[-10rem] z-0 opacity-30' alt="" />
            <div className={`${!Open ? "w-[calc(100%-1rem)] md:w-[80%]" : "w-[calc(100%-1rem)] md:w-[94%]"} p-4 md:p-8 transition-all duration-500 flex flex-col h-screen relative z-10 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}>
                {/* هدر */}
                <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-[5vh] mb-6">
                    <div className="flex items-center gap-3 sm:gap-5 mb-2 sm:mb-0">
                        <h3 className='text-[#19A297] text-xs sm:text-sm'>هنرستان استارتاپی رکاد</h3>
                        <BiSolidSchool className='text-[#19A297] ml-[-8px] sm:ml-[-10px] text-lg sm:text-xl' />
                        <div className='w-7 h-7 sm:w-8 sm:h-8 flex justify-center items-center border border-gray-300 rounded-full cursor-pointer'>
                            <IoNotificationsOutline className='text-gray-400 text-sm sm:text-base' />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-5">
                        <p className='text-gray-400 text-xs sm:text-sm'> امروز {week} {day} {month}، {year}</p>
                        <h1 className='text-[#19A297] font-semibold text-base sm:text-lg'>مدیریت پاداش‌ها</h1>
                    </div>
                </div>

                {/* کارت‌های آماری */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {statCardsDisplayData.map((card, index) => (
                        <div key={index} className="relative bg-purple-50 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center text-center min-h-[150px] overflow-hidden">
                            <img src={Frame20} className="absolute z-0 h-full w-full object-cover scale-105 top-0 left-0 rounded-xl" alt="" />
                            <div className="absolute inset-0 bg-black/10 rounded-xl"></div>
                            {card.decorated && (
                                <>
                                    <div className="absolute top-4 left-6 w-3 h-3 bg-blue-400/70 rounded-full opacity-70"></div>
                                    <div className="absolute top-8 right-8 w-2.5 h-2.5 bg-yellow-400/70 rounded-full opacity-70"></div>
                                    <div className="absolute bottom-4 right-6 w-4 h-4 bg-pink-500/70 rounded-full opacity-70"></div>
                                </>
                            )}
                            <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/10 rounded-full opacity-40 filter blur-sm"></div>
                            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-white/5 rounded-full opacity-30 filter blur-md"></div>
                            <h2 className="text-md font-semibold text-white drop-shadow-sm mb-2 z-10">{card.title}</h2>
                            <p className="text-3xl font-bold text-white drop-shadow-md z-10">{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* فیلترها و عنوان جدول */}
                <div className="flex flex-col md:flex-row justify-between items-center w-full mb-4 mt-8">
                    <div className="flex flex-wrap gap-2 mb-3 md:mb-0">
                        {['عنوان', 'وضعیت', 'تاریخ'].map(filterName => (
                             <button key={filterName} className="bg-white border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg text-xs flex items-center justify-between min-w-[90px] hover:border-gray-400 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-300">
                                <span>{filterName}</span>
                                <IoIosArrowDown className="text-gray-400 ml-2" />
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 text-right md:text-left">
                        <p className='text-gray-500 text-xs'>سوابق آخرین درخواست‌های پاداش</p>
                        <h3 className='text-[#19A297] font-semibold text-lg'>درخواست‌های پاداش</h3>
                    </div>
                </div>

                {/* جدول */}
                {loading && rewardsData.length > 0 && <p className="text-center text-sm text-gray-500 py-2">در حال به‌روزرسانی جدول...</p>}
                {error && rewardsData.length > 0 && !loading && <p className="text-center text-sm text-red-500 py-2">خطا در بارگذاری داده‌ها: {error}</p>}

                <div className="flex-grow overflow-x-auto bg-white rounded-xl shadow-xl border border-gray-200/80 mb-6">
                    <table className='w-full min-w-[850px] border-collapse'>
                        <thead className='bg-gray-100 text-xs text-gray-600 uppercase'>
                            <tr>
                            <th className='font-medium text-center px-3 py-3 border-b border-gray-200'>وضعیت</th>
                            <th className='font-medium text-center px-3 py-3 border-b border-gray-200'>تاریخ پرداخت</th>
                            <th className='font-medium text-center px-3 py-3 border-b border-gray-200'>تاریخ ثبت</th>
                            <th className='font-medium text-center px-3 py-3 border-b border-gray-200'>توکن درخواستی</th>
                            <th className='font-medium text-center px-3 py-3 border-b border-gray-200'>عنوان پاداش</th>

                                <th className='font-medium text-center px-3 py-3 border-b border-gray-200'>دانش‌آموز</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200/70'>
                            {rewardsData.length > 0 ? rewardsData.map((row) => (
                                <tr key={row.id}
                                    className={`${row.isOdd ? 'bg-gray-50/40' : 'bg-white'} text-xs hover:bg-indigo-50/50 transition-colors ${row.isPending ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}`}
                                    onClick={() => handleRowClick(row)}
                                >
                                                                        <td className={`px-3 py-3 text-center whitespace-nowrap font-semibold`}>
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs leading-tight ${row.statusClass} ${row.statusClass.replace('text-', 'bg-').replace('-600', '-100')}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className='px-3 py-3 text-center whitespace-nowrap text-gray-500'>{row.paymentDate}</td>
                                    <td className='px-3 py-3 text-center whitespace-nowrap text-gray-500 rtl'>{row.submissionDate}</td>
                                    <td className='px-3 py-3 text-center whitespace-nowrap text-gray-700 '>{(row.tokenAmount)}</td>
                                    <td className='px-3 py-3 text-center whitespace-nowrap text-gray-600'>{row.title || 'نامشخص'}</td>

                                    <td className='px-3 py-3 text-center whitespace-nowrap text-gray-700 font-medium'>{row.name || 'نامشخص'}</td>

                                </tr>
                            )) : (
                                !loading && <tr><td colSpan="6" className="text-center py-10 text-gray-500">موردی برای نمایش وجود ندارد.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* کامپوننت صفحه‌بندی */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 space-x-reverse mt-4 mb-8">
                        {/* ... (کد صفحه‌بندی مثل قبل) ... */}
                    </div>
                )}

            </div>

            <RewardApprovalModal
                isOpen={isPaymentModalOpen}
                onClose={handleClosePaymentModal}
                rewardData={selectedRewardForPayment}
                onConfirm={handleConfirmPayment}
            />
        </>
    );
}