import React, { useState } from 'react'; // useState اضافه شد
import union from '../../assets/images/Union4.png';
import Frame20 from '../../assets/images/Frame20.png';

import { BiSolidSchool } from "react-icons/bi";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import RewardApprovalModal from './RewardApprovalModal';

export default function Rewards({ Open }) {
    const date = new Date();
    const month = new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(date);
    const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
    const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date);
    const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(date);

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedRewardForPayment, setSelectedRewardForPayment] = useState(null);

    // داده‌های نمونه - مطمئن شوید فیلدهای مورد نیاز مودال را دارند
    // (مثلا grade, description, tokenAmount اگر از مقادیر پیش فرض مودال استفاده نمیکنید)
    const initialRewardsData = [
        { id: 1, name: 'امیرعلی جهدی', grade: 'دهم', image:Frame20, title: 'خرید دوره آموزشی', description: 'شرح کامل خرید دوره آموزشی شماره ۱۲۳', submissionDate: '۲۷ اردیبهشت ۱۴۰۳', paymentDate: '۲۷ اردیبهشت ۱۴۰۳', status: 'تایید نشده', tokenAmount: '۸۷۵ K', isOdd: false },
        { id: 2, name: 'علی هاشمی', grade: 'یازدهم', image:Frame20, title: 'طراحی پست استوری', submissionDate: '۲۲ دی ۱۴۰۳', paymentDate: '۲۲ دی ۱۴۰۳', status: 'تایید شده', tokenAmount: '۱۲۰ K', isOdd: true },
        { id: 3, name: 'سارا محمدی', grade: 'دهم', image:Frame20, title: 'جایزه مسابقه علمی', submissionDate: '۱۵ بهمن ۱۴۰۲', paymentDate: '۱۸ بهمن ۱۴۰۲', status: 'تایید نشده', tokenAmount: '۵۰۰ K', isOdd: false },
        // ... سایر ردیف ها
    ];
    const [rewardsData, setRewardsData] = useState(initialRewardsData);


    const handleRowClick = (reward) => {
        if (reward.status === 'تایید نشده') {
            setSelectedRewardForPayment(reward);
            setIsPaymentModalOpen(true);
        }
        // اگر روی ردیف های تایید شده کلیک شد، میتوانید کار دیگری انجام دهید یا هیچ کاری نکنید
    };

    const handleClosePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setSelectedRewardForPayment(null);
    };

    const handleConfirmPayment = (rewardId) => {
        console.log(`پرداخت برای پاداش با شناسه ${rewardId} تایید شد.`);
        // در اینجا میتوانید:
        // 1. یک API کال برای ثبت پرداخت ارسال کنید.
        // 2. وضعیت پاداش را در rewardsData به 'تایید شده' تغییر دهید.
        setRewardsData(prevData =>
            prevData.map(reward =>
                reward.id === rewardId ? { ...reward, status: 'تایید شده' } : reward
            )
        );
        handleClosePaymentModal();
    };


    const getStatusClass = (status) => {
        switch (status) {
            case 'تایید شده': return 'text-green-600';
            case 'تایید نشده': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const statCards = [
        { title: "پاداش‌های در انتظار پرداخت", value: "۱۲,۳۰۰" },
        { title: "پاداش‌های پرداخت‌شده", value: "۱۲,۳۰۰" },
        { title: "کل پاداش‌ها", value: "۱۲,۳۰۰", decorated: true },
        { title: "توکن‌های قابل استفاده", value: "۱۲,۳۰۰" },
        { title: "توکن‌های استفاده‌شده", value: "۱۲,۳۰۰" },
        { title: "جمع کل توکن‌ها", value: "۱۲,۳۰۰" },
    ];

    return (
        <>
            <img src={union} className='absolute scale-75 top-[-4rem] left-[-10rem] z-0' alt="" />
            <div className={`${!Open ? "w-[80%]" : "w-[94%]"} p-8 transition-all duration-500 flex flex-col h-screen relative z-10`}>
                <div className="flex justify-between items-center h-[5vh] mb-6">
                    <div className="flex justify-center items-center gap-5">
                        <h3 className='text-[#19A297] text-xs'>هنرستان استارتاپی رکاد</h3>
                        <BiSolidSchool className='text-[#19A297] ml-[-10px] scale-150' />
                        <div className='w-8 flex justify-center items-center border border-gray-400 h-8 rounded-full'>
                            <IoNotificationsOutline className='text-gray-400 scale-100' />
                        </div>
                    </div>
                    <div className="flex justify-center items-center gap-5">
                        <p className='text-gray-400 text-xs'> امروز {week} {day} {month} ماه، {year}</p>
                        <h1 className='text-[#19A297] font-semibold text-lg'>پاداش ها</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                    {statCards.map((card, index) => (
                        <div
                            key={index}
                            className="relative bg-[#EBEBFF] rounded-lg p-5 flex flex-col items-center justify-center text-center shadow-sm border border-gray-200 min-h-[120px]"
                        >
                            <img src={Frame20} className='absolute z-0 h-full w-full object-cover top-0 left-0 opacity-100 rounded-lg' alt="" />
                            <div className="absolute inset-0 opacity-30 bg-gradient-radial from-purple-300/30 via-transparent to-transparent rounded-lg"></div>
                            {card.decorated && (
                                <>
                                    {/* تزئینات حذف شده برای سادگی، در صورت نیاز برگردانید */}
                                </>
                            )}
                            <h2 className='text-indigo-700 font-semibold text-md mb-1 z-10'>{card.title}</h2>
                            <p className='text-indigo-700 font-bold text-3xl z-10'>{card.value}</p>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center w-full mb-3 mt-8">
                    <div className="flex gap-2">
                        {/* فیلترها */}
                        <div className="relative bg-white border border-gray-300 rounded px-3 py-1.5 flex items-center justify-between text-xs text-gray-600 cursor-pointer min-w-[100px]">
                            <span>عنوان</span>
                            <IoIosArrowDown className="text-gray-400 ml-2" />
                        </div>
                        <div className="relative bg-white border border-gray-300 rounded px-3 py-1.5 flex items-center justify-between text-xs text-gray-600 cursor-pointer min-w-[90px]">
                            <span>وضعیت</span>
                            <IoIosArrowDown className="text-gray-400 ml-2" />
                        </div>
                        <div className="relative bg-white border border-gray-300 rounded px-3 py-1.5 flex items-center justify-between text-xs text-gray-600 cursor-pointer min-w-[80px]">
                            <span>تاریخ</span>
                            <IoIosArrowDown className="text-gray-400 ml-2" />
                        </div>
                    </div>
                    <div className="flex items-center w-[50%] justify-between gap-4">
                        <p className='text-gray-400 text-xs '>در اینجا سوابق آخرین پاداش ها را مشاهده می کنید</p>
                        <h3 className='text-[#19A297] font-semibold text-lg'>آخرین پاداش ها</h3>
                    </div>
                </div>

                <div className="flex-grow overflow-auto">
                    <table className='w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100'>
                        <thead className='bg-gray-50 text-sm text-[#202A5A]'>
                            <tr>
                                <th className='font-medium text-center px-4 py-3 border border-gray-200'>وضعیت</th>
                                <th className='font-medium text-center px-4 py-3 border border-gray-200'>تاریخ پرداخت</th>
                                <th className='font-medium text-center px-4 py-3 border border-gray-200'>تاریخ ثبت</th>
                                <th className='font-medium text-center px-4 py-3 border border-gray-200'>عنوان</th>
                                <th className='font-medium text-center px-4 py-3 border border-gray-200'>نام و نام خانوادگی</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rewardsData.map((row) => (
                                <tr key={row.id}
                                    className={`${row.isOdd ? 'bg-gray-50' : 'bg-white'} text-sm hover:bg-gray-100 transition-colors ${row.status === 'تایید نشده' ? 'cursor-pointer' : 'cursor-default'}`}
                                    onClick={() => handleRowClick(row)} // فقط روی ردیف های تایید نشده عمل میکند
                                >
                                    <td className={`px-4 py-3 text-center whitespace-nowrap border border-gray-200 font-medium ${getStatusClass(row.status)}`}>{row.status}</td>
                                    <td className='px-4 py-3 rtl text-center whitespace-nowrap border border-gray-200 text-[#202A5A]'>{row.paymentDate}</td>
                                    <td className='px-4 py-3 rtl text-center whitespace-nowrap border border-gray-200 text-[#202A5A]'>{row.submissionDate}</td>
                                    <td className='px-4 py-3 text-center whitespace-nowrap border border-gray-200 text-[#202A5A]'>{row.title}</td>
                                    <td className='px-4 py-3 text-center whitespace-nowrap border border-gray-200 text-[#202A5A]'>{row.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* رندر مودال */}
            <RewardApprovalModal
                isOpen={isPaymentModalOpen}
                onClose={handleClosePaymentModal}
                rewardData={selectedRewardForPayment}
                onConfirm={handleConfirmPayment}
            />
        </>
    );
}