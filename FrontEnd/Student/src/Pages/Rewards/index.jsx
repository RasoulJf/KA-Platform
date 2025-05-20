import React from 'react';
import { BiSolidSchool } from "react-icons/bi";
import { FaPlus } from 'react-icons/fa';
import { IoNotificationsOutline } from "react-icons/io5";
import { IoChevronDown } from "react-icons/io5";
import { SiBasicattentiontoken } from 'react-icons/si';
import { Link } from 'react-router-dom';
import Frame25 from '../../assets/images/Frame25.png'
import Frame26 from '../../assets/images/Frame26.png'

// Sample data for the rewards table
const rewardsTableData = [
    {
        id: 1,
        name: "علی هاشمی",
        title: "طراحی پست استوری",
        submissionDate: "۲۲ دی ۱۴۰۳",
        paymentDate: "۲۲ دی ۱۴۰۳",
        status: "تایید شده",
        statusColor: "text-green-500"
    },
    {
        id: 2,
        name: "علی هاشمی",
        title: "طراحی پست استوری",
        submissionDate: "۲۲ دی ۱۴۰۳",
        paymentDate: "۲۲ دی ۱۴۰۳",
        status: "تایید نشده",
        statusColor: "text-red-500"
    },
    {
        id: 3,
        name: "علی هاشمی",
        title: "طراحی پست استوری",
        submissionDate: "۲۲ دی ۱۴۰۳",
        paymentDate: "۲۲ دی ۱۴۰۳",
        status: "تایید شده",
        statusColor: "text-green-500"
    },
    {
        id: 4,
        name: "علی هاشمی",
        title: "طراحی پست استوری",
        submissionDate: "۲۲ دی ۱۴۰۳",
        paymentDate: "۲۲ دی ۱۴۰۳",
        status: "تایید نشده",
        statusColor: "text-red-500"
    },
    {
        id: 5,
        name: "علی هاشمی",
        title: "طراحی پست استوری",
        submissionDate: "۲۲ دی ۱۴۰۳",
        paymentDate: "۲۲ دی ۱۴۰۳",
        status: "تایید شده",
        statusColor: "text-green-500"
    },
    {
        id: 6,
        name: "علی هاشمی",
        title: "طراحی پست استوری",
        submissionDate: "۲۲ دی ۱۴۰۳",
        paymentDate: "۲۲ دی ۱۴۰۳",
        status: "تایید نشده",
        statusColor: "text-red-500"
    },
];

// Data for stat cards
const rewardsStatCardsData = [
    { title: "پاداش‌های در انتظار پرداخت", value: "۱۲,۳۰۰" },
    { title: "پاداش‌های پرداخت‌شده", value: "۱۲,۳۰۰" },
    { title: "کل پاداش‌ها", value: "۱۲,۳۰۰", decorative: true },
    { title: "توکن‌های قابل استفاده", value: "۱۲,۳۰۰" },
    { title: "توکن‌های استفاده‌شده", value: "۱۲,۳۰۰" },
    { title: "جمع کل توکن‌ها", value: "۱۲,۳۰۰" },
];

export default function Rewards({ Open }) {
    const date = new Date();
    const month = new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(date);
    const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
    const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date).replace(/([۰-۹])/g, token => String.fromCharCode(token.charCodeAt(0) - 1728 + 48));
    const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(date);

    return (
        <>
            <div className={`${!Open ? "w-[calc(100%-20%)]" : "w-[calc(100%-6%)]"} p-6 md:p-8 transition-all duration-500 flex-col h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}>

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
                        <p className="text-gray-400 text-xs sm:text-sm">امروز {week}، {day} {month} ماه، {year}</p>
                        <h1 className="text-[#19A297] font-semibold text-base sm:text-lg">پاداش ها</h1>
                    </div>
                </div>

                {/* کارت‌های آماری بالا */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {rewardsStatCardsData.map((card, idx) => (
                        <div
                            key={idx}
                            className="relative bg-purple-50 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center text-center min-h-[150px] overflow-hidden"
                        >
                            <img src={Frame25} className="absolute z-0 h-full w-full object-cover scale-110 top-[0px] " alt="" />

                            {/* Decorative circles for "کل پاداش‌ها" card */}
                            {card.decorative && (
                                <>
                                    <div className="absolute top-4 left-6 w-3 h-3 bg-blue-400 rounded-full opacity-70"></div>
                                    <div className="absolute top-8 right-8 w-2.5 h-2.5 bg-yellow-400 rounded-full opacity-70"></div>
                                    <div className="absolute bottom-20 right-10 w-2 h-2 bg-white rounded-full opacity-90"></div>
                                    <div className="absolute top-20 left-20 w-2.5 h-2.5 bg-yellow-400 rounded-full opacity-70"></div>
                                    <div className="absolute bottom-6 left-10 w-2 h-2 bg-white rounded-full opacity-90"></div>
                                    <div className="absolute bottom-4 right-6 w-4 h-4 bg-blue-500 rounded-full opacity-70"></div>
                                </>
                            )}
                            {/* Subtle background circles - general for all cards */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full opacity-50"></div>
                            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/10 rounded-full opacity-50"></div>

                            <h2 className="text-md font-semibold text-[#652D90] mb-2 z-10">{card.title}</h2>
                            <p className="text-3xl font-bold text-[#652D90] z-10">{card.value}</p>
                        </div>
                    ))}
                </div>
                <div className="bg-indigo-50 p-4 sm:p-6 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between mb-8 relative overflow-hidden">
                    <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/40 rounded-full opacity-70"></div>
                    <div className="absolute -bottom-5 -right-5 w-20 h-20 bg-white/30 rounded-full opacity-70"></div>

                    <div className="flex items-center gap-70 z-10 mb-3 sm:mb-0"> {/* تغییر gap و text-right برای چیدمان بهتر */}
                    <img src={Frame26} className="absolute z-0 h-full w-full object-cover scale-110 top-[0px] " alt="" />

                        <Link to="/request-reward" className='z-10'> {/* مسیر به صفحه ثبت پاداش */}

                            <button
                                // اتصال تابع باز کردن مودال
                                className="bg-white cursor-pointer text-[#652D90] z-10 hover:scale-110 transition-transform duration-100 px-4 py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5"
                            >
                                <FaPlus />
                                اضافه کردن
                            </button>
                        </Link>
                        <p className="text-[#652D90] text-xs sm:text-sm font-medium z-10">برای ثبت فعالیت جدید بر روی اضافه کردن ضربه بزنید</p>
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
                    <p className="text-gray-500 text-xs sm:text-sm">در اینجا سوابق آخرین پاداش ها را مشاهده می کنید</p>
                    <h2 className="text-lg font-semibold text-[#19A297] mb-2 sm:mb-0">آخرین پاداش ها</h2>

                </div>


                {/* جدول پاداش‌ها */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    {["نام و نام‌خانوادگی", "عنوان", "تاریخ ثبت", "تاریخ پرداخت", "وضعیت"].reverse().map(header => (
                                        <th key={header} className="px-4 py-3 text-center  text-xs font-semibold text-gray-500 uppercase tracking-wider">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {rewardsTableData.map((reward, idx) => (
                                    <tr key={reward.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-gray-100 transition-colors`}>
                                        <td className={`px-4 py-3 text-center whitespace-nowrap font-semibold ${reward.statusColor}`}>{reward.status}</td>
                                        <td className="px-4 py-3 text-center whitespace-nowrap text-gray-600">{reward.paymentDate}</td>
                                        <td className="px-4 py-3 text-center whitespace-nowrap text-gray-600">{reward.submissionDate}</td>
                                        <td className="px-4 py-3 text-center whitespace-nowrap text-gray-600">{reward.title}</td>
                                        <td className="px-4 py-3 text-center whitespace-nowrap text-gray-800 font-medium">{reward.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Padding at the bottom */}
            </div>
        </>
    );
}