import React, { useState } from 'react';
import { BiSolidSchool } from "react-icons/bi";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaPlus } from "react-icons/fa"; // FaRegCommentDots دیگر لازم نیست اگر فقط برای آیکون دکمه بود
import { BsChatDots, BsChatFill, BsChatText } from "react-icons/bs"; // BsPlusCircle هم اگر استفاده نمی‌شود، حذف کنید
import { IoChevronDown } from "react-icons/io5";
import AddActivityModal from './AddActivityModal'; // مسیر صحیح به کامپوننت مودال
import Frame23 from '../../assets/images/Frame23.png'
import Frame24 from '../../assets/images/Frame24.png'

// Sample data for the table
const activitiesData = [
    {
        id: 1, // اضافه کردن id برای key در map
        title: "طراحی پست استوری",
        description: "شرکت در جشنواره ممد نبودی",
        submissionDate: "۲۲ دی ۱۴۰۳",
        reviewDate: "۲۲ دی ۱۴۰۳",
        status: "تایید شده",
        statusColor: "text-green-500"
    },
    {
        id: 2,
        title: "طراحی پست استوری",
        description: "شرکت در جشنواره ممد نبودی",
        submissionDate: "۲۲ دی ۱۴۰۳",
        reviewDate: "۲۲ دی ۱۴۰۳",
        status: "تایید نشده",
        statusColor: "text-red-500"
    },
    {
        id: 3,
        title: "طراحی پست استوری",
        description: "شرکت در جشنواره ممد نبودی",
        submissionDate: "۲۲ دی ۱۴۰۳",
        reviewDate: "۲۲ دی ۱۴۰۳",
        status: "تایید شده",
        statusColor: "text-green-500"
    },
    {
        id: 4,
        title: "طراحی پست استوری",
        description: "شرکت در جشنواره ممد نبودی",
        submissionDate: "۲۲ دی ۱۴۰۳",
        reviewDate: "۲۲ دی ۱۴۰۳",
        status: "تایید نشده",
        statusColor: "text-red-500"
    },
];

// Data for stat cards
const statCardsData = [
    { title: "فعالیت های در انتظار بررسی", count: "۴۴۶", Icon: BsChatDots, bgColor: "bg-pink-50", iconBgColor: "bg-[#D41A54]", textColor: "text-[#D41A54]" },
    { title: "فعالیت های تایید شده", count: "۴۴۶", Icon: BsChatFill, bgColor: "bg-pink-50", iconBgColor: "bg-[#D41A54]", textColor: "text-[#D41A54]" },
    { title: "همه فعالیت ها", count: "۴۴۶", Icon: BsChatText, bgColor: "bg-pink-50", iconBgColor: "bg-[#D41A54]", textColor: "text-[#D41A54]" },
];


export default function Activities({ Open }) {
    const date = new Date();
    const month = new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(date);
    const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
    const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date).replace(/([۰-۹])/g, token => String.fromCharCode(token.charCodeAt(0) - 1728 + 48));
    const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(date);

    // State برای کنترل باز و بسته بودن مودال
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleActivitySubmit = (data) => {
        console.log("Activity Data Submitted:", data);
        // اینجا می‌توانید منطق ارسال داده به API یا به‌روزرسانی لیست فعالیت‌ها را پیاده‌سازی کنید
        // برای مثال، می‌توانید داده جدید را به activitiesData اضافه کنید:
        // setActivities(prevActivities => [...prevActivities, { ...data, id: Date.now(), status: "در انتظار بررسی", statusColor: "text-yellow-500" }]);
        // توجه: برای اینکه activitiesData قابل تغییر باشد، باید آن را به state منتقل کنید.
        handleCloseModal(); // بستن مودال پس از ثبت
    };


    return (
        <>
            <div className={`${!Open ? "w-[calc(100%-20%)]" : "w-[calc(100%-6%)]"} lg:w-[${!Open ? "80%" : "94%"}] p-6 md:p-8 transition-all duration-500 flex-col h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}>

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
                        <p className="text-gray-400 text-xs sm:text-sm">امروز {week}، {day} {month} ماه {year}</p>
                        <h1 className="text-[#19A297] font-semibold text-base sm:text-lg">فعالیت ها</h1>
                    </div>
                </div>

                {/* کارت‌های آماری بالا */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {statCardsData.map((card, idx) => (
                        <div key={idx} className={`relative ${card.bgColor} p-6 rounded-xl shadow-lg flex flex-col items-center justify-center text-center min-h-[180px] overflow-hidden`}>
                            <img src={Frame23} className="absolute z-0 h-full w-full object-cover scale-110 top-[10px]" alt="" />

                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/30 rounded-full opacity-50"></div>
                            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/20 rounded-full opacity-50"></div>

                            <div className={`w-16 h-16 rounded-full ${card.iconBgColor} flex items-center justify-center mb-3 z-10`}>
                                <card.Icon className="text-white text-3xl" />
                            </div>
                            <h2 className={`text-md font-semibold ${card.textColor} mb-1 z-10`}>{card.title}</h2>
                            <p className={`text-3xl font-bold ${card.textColor} z-10`}>{card.count}</p>
                        </div>
                    ))}
                </div>

                {/* بنر ثبت فعالیت جدید */}
                <div className="bg-pink-50 p-4 sm:p-6 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between mb-8 relative overflow-hidden">
                    {/* <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/40 rounded-full opacity-70"></div>
                    <div className="absolute -bottom-5 -right-5 w-20 h-20 bg-white/30 rounded-full opacity-70"></div> */}

                    <div className="flex items-center gap-70 z-10 mb-3 sm:mb-0"> {/* تغییر gap و text-right برای چیدمان بهتر */}
                    <img src={Frame24} className="absolute z-0 h-full w-full object-cover scale-" alt="" />

                        <button
                            onClick={handleOpenModal} // اتصال تابع باز کردن مودال
                            className="bg-white cursor-pointer text-[#D41A54] z-10 hover:scale-110 duration-100  transition-transform px-4 py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5"
                        >
                            <FaPlus />
                            اضافه کردن
                        </button>
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

                    <div className="flex flex-wrap gap-3">
                        {['عنوان', 'وضعیت', 'تاریخ'].map(filterName => (
                            <button key={filterName} className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm flex items-center justify-between min-w-[120px] hover:border-gray-400 transition-colors">
                                <span>{filterName}</span>
                                <IoChevronDown className="text-gray-500" />
                            </button>
                        ))}
                    </div>
                    <p className="text-gray-500 text-xs sm:text-sm">در اینجا سوابق آخرین فعالیت ها را مشاهده می کنید</p>


                    <h2 className="text-lg font-semibold text-[#19A297] mb-2 sm:mb-0">آخرین فعالیت ها</h2>

                </div>


                {/* جدول فعالیت‌ها */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    {["وضعیت", "تاریخ بررسی", "تاریخ ثبت", "شرح", "عنوان",].map(header => (
                                        <th key={header} className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {activitiesData.map((activity, idx) => (
                                    <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-gray-100 transition-colors`}>
                                        <td className={`px-4 text-center  py-3 whitespace-nowrap font-semibold ${activity.statusColor}`}>{activity.status}</td>
                                        <td className="px-4 text-center  py-3 whitespace-nowrap text-gray-600">{activity.reviewDate}</td>
                                        <td className="px-4 text-center  py-3 whitespace-nowrap text-gray-600">{activity.submissionDate}</td>
                                        <td className="px-4 text-center  py-3 whitespace-nowrap text-gray-600">{activity.description}</td>
                                        <td className="px-4 text-center  py-3 whitespace-nowrap text-gray-800 font-medium">{activity.title}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Padding at the bottom */}
                <div className="h-16"></div>
            </div>

            {/* رندر کردن مودال */}
            <AddActivityModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleActivitySubmit}
            />
        </>
    );
}