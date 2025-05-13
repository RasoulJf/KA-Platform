import React from 'react';
import { BiSolidSchool } from "react-icons/bi";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaGraduationCap, FaPercentage, FaPlayCircle, FaDollarSign, FaGift, FaLandmark } from "react-icons/fa"; // آیکون‌های مختلف برای کارت‌ها

// داده‌های نمونه برای کارت‌های پاداش
const rewardOptionsData = [
  {
    id: 1,
    title: "تخفیف شهریه فوق برنامه مدرسه",
    amount: "۳۰۰-۵۰۰ هزار",
    Icon: FaGraduationCap,
    themeColor: "red",
    bgColor: "bg-red-50",
    iconBgColor: "bg-red-500",
    buttonBgColor: "bg-red-600",
    buttonHoverColor: "hover:bg-red-700",
    textColor: "text-red-700", // برای متن "۳۰۰-۵۰۰ هزار" اگر بخواهیم رنگی باشد
  },
  {
    id: 2,
    title: "تخفیف هزینه اردو و رویدادها",
    amount: "۳۰۰-۵۰۰ هزار",
    Icon: FaPercentage,
    themeColor: "blue",
    bgColor: "bg-blue-50",
    iconBgColor: "bg-blue-500",
    buttonBgColor: "bg-blue-500",
    buttonHoverColor: "hover:bg-blue-600",
    textColor: "text-blue-700",
  },
  {
    id: 3,
    title: "کمک هزینه خرید اشتراک",
    amount: "۳۰۰-۵۰۰ هزار",
    Icon: FaPlayCircle, // یا FaTicketAlt
    themeColor: "purple",
    bgColor: "bg-purple-50",
    iconBgColor: "bg-purple-600",
    buttonBgColor: "bg-purple-600",
    buttonHoverColor: "hover:bg-purple-700",
    textColor: "text-purple-700",
  },
  {
    id: 4,
    title: "سرمایه‌گذاری روی ایده‌ها",
    amount: "۳۰۰-۵۰۰ هزار",
    Icon: FaDollarSign,
    themeColor: "green",
    bgColor: "bg-green-50",
    iconBgColor: "bg-green-500",
    buttonBgColor: "bg-green-500",
    buttonHoverColor: "hover:bg-green-600",
    textColor: "text-green-700",
  },
  {
    id: 5,
    title: "کمک هزینه خرید بازی فکری",
    amount: "۳۰۰-۵۰۰ هزار",
    Icon: FaGift, // یا FaPuzzlePiece
    themeColor: "pink",
    bgColor: "bg-pink-50",
    iconBgColor: "bg-pink-500",
    buttonBgColor: "bg-pink-500",
    buttonHoverColor: "hover:bg-pink-600",
    textColor: "text-pink-700",
  },
  // می‌توانید کارت‌های بیشتری با همین الگو اضافه کنید
];

export default function RequestRewardPage({ Open }) {
  const date = new Date();
  const month = new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(date);
  const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
  const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date).replace(/([۰-۹])/g, token => String.fromCharCode(token.charCodeAt(0) - 1728 + 48));
  const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(date);

  const handleRequestReward = (reward) => {
    // در اینجا می‌توانید منطق مربوط به ثبت درخواست پاداش را پیاده‌سازی کنید
    // مثلاً باز کردن یک مودال دیگر برای جزئیات بیشتر یا ارسال مستقیم درخواست
    console.log("درخواست پاداش برای:", reward.title);
    alert(`درخواست برای "${reward.title}" ثبت شد (نمایشی).`);
  };

  return (
    <>
      <div className={`${!Open ? "w-[calc(100%-20%)]" : "w-[calc(100%-6%)]"} p-6 md:p-8 transition-all duration-500 flex-col h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}>

        {/* هدر بالا */}
        <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-[5vh] mb-8">
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
            <h1 className="text-[#19A297] font-semibold text-base sm:text-lg">ثبت پاداش ها</h1>
          </div>
        </div>

        {/* گرید کارت‌های پاداش */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {rewardOptionsData.map((reward) => (
            <div 
              key={reward.id} 
              className={`relative ${reward.bgColor} p-6 rounded-xl shadow-lg flex flex-col justify-between text-right min-h-[180px] sm:min-h-[200px] overflow-hidden`}
            >
              {/* دایره‌های تزئینی پس‌زمینه */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/20 rounded-full opacity-50 z-0"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full opacity-50 z-0"></div>
              
              <div className="flex justify-between items-start z-10">
                <div className="flex-1">
                  <h3 className="text-md sm:text-lg font-semibold text-gray-800">{reward.title}</h3>
                  <div className="flex items-center justify-end mt-1 text-xs sm:text-sm text-gray-600">
                    <span>{reward.amount}</span>
                    <FaLandmark className="mr-1 text-gray-500" /> {/* آیکون کنار مبلغ */}
                  </div>
                </div>
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${reward.iconBgColor} flex items-center justify-center text-white text-2xl sm:text-3xl ml-4`}>
                  <reward.Icon />
                </div>
              </div>
              <button 
                onClick={() => handleRequestReward(reward)}
                className={`mt-4 w-full ${reward.buttonBgColor} ${reward.buttonHoverColor} text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm sm:text-base z-10`}
              >
                ثبت درخواست
              </button>
            </div>
          ))}
        </div>

        {/* Padding at the bottom */}
        <div className="h-16"></div>
      </div>
    </>
  );
}