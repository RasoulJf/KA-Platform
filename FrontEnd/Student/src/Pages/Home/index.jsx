import React, { useEffect, useRef, useState } from 'react';
// import union from '../../assets/images/Union4.png'; // اگر هنوز از این تصویر پس‌زمینه استفاده می‌کنید
import frame156 from '../../assets/images/Frame156.png'; // برای کارت جمع کل امتیازات
// import frame6 from '../../assets/images/Frame6.png'; // اگر برای کارت‌های میانی نیاز است یا پس‌زمینه جدیدی دارند

import { BiSolidSchool } from "react-icons/bi";
import { FaMedal, FaPlus } from "react-icons/fa";
import { IoNotificationsOutline } from "react-icons/io5";
import { Link } from 'react-router-dom';
import NotificationPanel from '../../Components/NotificationPanel';

// می‌توانید آیکون‌های جدید مورد نیاز را اینجا اضافه کنید
// import { SomeNewIcon } from "react-icons/fc";

export default function Home({ Open }) { // نام کامپوننت را به StudentDashboard تغییر دادم تا با محتوا همخوانی بیشتری داشته باشد
    // ... سایر state ها و توابع
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const notificationRef = useRef(null); // برای تشخیص کلیک بیرون از پنل
  
    const toggleNotificationPanel = () => {
      setIsNotificationOpen(prev => !prev);
    };
  
    const closeNotificationPanel = () => {
      setIsNotificationOpen(false);
    };
  
    // بستن پنل با کلیک بیرون از آن
    useEffect(() => {
      function handleClickOutside(event) {
        if (notificationRef.current && !notificationRef.current.contains(event.target)) {
          // بررسی اینکه کلیک روی خود آیکون زنگوله نبوده باشد
          // این بخش برای جلوگیری از بسته شدن بلافاصله پس از باز شدن است
          // اگر آیکون زنگوله خارج از ref باشد (که معمولاً هست)
          const notificationIcon = document.getElementById('notification-icon-button'); // آیدی به دکمه آیکون اضافه کنید
          if (notificationIcon && notificationIcon.contains(event.target)) {
            return; 
          }
          setIsNotificationOpen(false);
        }
      }
      if (isNotificationOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      } else {
        document.removeEventListener("mousedown", handleClickOutside);
      }
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isNotificationOpen]);
  const date = new Date();
  const month = new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(date);
  const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
  const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date);
  const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(date);

  const activityData = [
    { title: "فعالیت آموزشی", score: "۲۰۳", progress: 75, color: "purple-600", bgColor: "bg-purple-600", scoreBoxColor: "bg-purple-500" },
    { title: "فعالیت داوطلبانه و توسعه فردی", score: "۲۰۳", progress: 50, color: "pink-500", bgColor: "bg-pink-500", scoreBoxColor: "bg-pink-500" },
    { title: "فعالیت شغلی", score: "۲۰۳", progress: 60, color: "amber-500", bgColor: "bg-amber-500", scoreBoxColor: "bg-yellow-500" },
    { title: "امتیازات کسر شده", score: "-۲۰", progress: 90, color: "gray-500", bgColor: "bg-gray-500", scoreBoxColor: "bg-gray-400" },
  ];

  const topStudentsData = [
    { rank: "۱", name: "علی محمدی نیا", code: "۱۰۲", score: "۷۸۰" },
    { rank: "۲", name: "علی محمدی نیا", code: "۱۰۲", score: "۷۸۰" },
    { rank: "۳", name: "علی محمدی نیا", code: "۱۰۲", score: "۷۸۰" },
    { rank: "۴", name: "علی محمدی نیا", code: "۱۰۲", score: "۷۸۰" },
    { rank: "۵", name: "علی محمدی نیا", code: "۱۰۲", score: "۷۸۰" },
  ];

  const userRankingData = [
    { rank: "۲۱", name: "علی محمدی نیا", code: "۱۰۲", score: "۷۸۰", highlight: false },
    { rank: "۲۲", name: "علی محمدی نیا", code: "۱۰۲", score: "۷۸۰", highlight: false },
    { rank: "۲۳", name: "علی محمدی نیا", code: "۱۰۲", score: "۷۸۰", highlight: false },
    { rank: "۲۴", name: "علی محمدی نیا", code: "۱۰۲", score: "۷۸۰", highlight: true }, // ردیف هایلایت شده
    { rank: "۲۵", name: "علی محمدی نیا", code: "۱۰۲", score: "۷۸۰", highlight: false },
  ];


  return (
    <>
      {/* <img src={union} className="absolute scale-75 top-[-4rem] left-[-10rem] -z-10" alt="" /> */}

      <div className={`${!Open ? "w-[80%]" : "w-[94%]"} p-6 md:p-8 transition-all duration-500 flex-col h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100`}>

        {/* هدر بالا */}
        <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-[5vh] mb-6">
          <div className="flex justify-center items-center gap-3 sm:gap-5 mb-2 sm:mb-0">
            <h3 className="text-[#19A297] text-xs sm:text-sm">هنرستان استارتاپی رکاد</h3>
            <BiSolidSchool className="text-[#19A297] ml-[-8px] sm:ml-[-10px] text-lg sm:text-xl" />
              {/* آیکون نوتیفیکیشن و پنل */}
              <div className="relative" ref={notificationRef}> {/* ref برای تشخیص کلیک بیرون */}
              <button
                id="notification-icon-button" // آیدی برای تشخیص کلیک
                onClick={toggleNotificationPanel}
                className="w-7 h-7 sm:w-8 sm:h-8 flex justify-center items-center border border-gray-300 rounded-full cursor-pointer group relative"
                aria-label="اعلان‌ها"
              >
                <IoNotificationsOutline className="text-gray-400 text-sm sm:text-base" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span> {/* نشانگر اعلان جدید */}
              </button>
              <NotificationPanel isOpen={isNotificationOpen} onClose={closeNotificationPanel} />
            </div>
          </div>
          <div className="flex justify-center items-center gap-3 sm:gap-5">
            <p className="text-gray-400 text-xs sm:text-sm">امروز {week}، {day} {month} ماه {year}</p>
            <h1 className="text-[#19A297] font-semibold text-base sm:text-lg">داشبورد</h1>
          </div>
        </div>

        {/* بخش بالایی: جمع کل امتیازات و فعالیت‌ها */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* کارت جمع کل امتیازات */}
          <div className="relative lg:w-[35%] xl:w-[30%] h-[220px] sm:h-[250px] rounded-lg overflow-hidden p-4 flex flex-col justify-around items-center bg-gradient-to-br from-indigo-50 to-purple-100 shadow-lg">
            <img src={frame156} className="absolute z-0 h-full w-full object-cover top-0 opacity-30" alt="" />
            {/* Decorative dots - simplified */}
            <span className="absolute top-10 left-10 w-3 h-3 bg-teal-400 rounded-full opacity-50 z-10"></span>
            <span className="absolute top-1/4 right-8 w-2 h-2 bg-pink-400 rounded-full opacity-50 z-10"></span>
            <span className="absolute bottom-12 left-1/4 w-4 h-4 bg-yellow-400 rounded-full opacity-50 z-10"></span>
            <span className="absolute bottom-10 right-1/3 w-3 h-3 bg-purple-400 rounded-full opacity-50 z-10"></span>

            <div className="bg-[#202A5A] z-10 flex justify-center items-center w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-md">
              <FaMedal className="text-2xl sm:text-3xl text-white" />
            </div>
            <p className="text-[#202A5A] font-bold text-3xl sm:text-4xl z-10">۲۲,۹۵۱</p>
            <h2 className="text-[#202A5A] text-lg sm:text-xl z-10">جمع کل امتیازات</h2>
          </div>

          {/* بخش فعالیت‌ها */}
          <div className="lg:w-[65%] xl:w-[70%] bg-gray-50 p-4 rounded-lg shadow-lg h-[220px] sm:h-[250px] flex flex-col justify-center">
            {activityData.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-2 sm:gap-3 mb-2 last:mb-0">
                <div className={`w-10 h-10 sm:w-12 sm:h-8 flex-shrink-0 ${activity.scoreBoxColor} text-white text-xs sm:text-sm font-semibold rounded flex items-center justify-center`}>
                  {activity.score}
                </div>
                <div className="flex-grow text-right">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs sm:text-sm font-medium text-gray-700`}>{activity.title}</span>
                    <Link to="#" className="text-xs text-[#19A297] hover:underline">مشاهده</Link>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                    <div
                      className={`${activity.bgColor} h-2 sm:h-2.5 rounded-full`}
                      style={{ width: `${activity.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* بخش میانی: کارت‌های پاداش و توکن */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* کارت پاداش‌های پرداخت‌شده */}
          <div className="relative bg-gradient-to-r from-purple-50 via-fuchsia-50 to-pink-50 rounded-lg overflow-hidden h-[100px] sm:h-[12vh] p-4 sm:p-6 flex items-center justify-between shadow-lg">
            {/* <img src={frame6} className="absolute z-0 h-full w-full object-contain scale-125 -right-5 top-0 opacity-20" alt="" /> */}
            <div className="absolute z-0 top-0 right-0 h-full w-1/3 bg-white/30" style={{ clipPath: 'polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)' }}></div>
            <h2 className="text-[#202A5A] font-semibold text-base sm:text-lg z-10">پاداش های پرداخت شده</h2>
            <p className="text-[#202A5A] font-bold text-xl sm:text-2xl z-10">۲۳,۷۸۶</p>
          </div>

          {/* کارت توکن‌های قابل استفاده */}
          <div className="relative bg-gradient-to-r from-indigo-50 via-sky-50 to-cyan-50 rounded-lg overflow-hidden h-[100px] sm:h-[12vh] p-4 sm:p-6 flex items-center justify-between shadow-lg">
            {/* <img src={frame6} className="absolute z-0 h-full w-full object-contain scale-125 -right-5 top-0 opacity-20" alt="" /> */}
            <div className="absolute z-0 top-0 right-0 h-full w-1/3 bg-white/30" style={{ clipPath: 'polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)' }}></div>
            <h2 className="text-[#202A5A] font-semibold text-base sm:text-lg z-10">توکن های قابل استفاده</h2>
            <p className="text-[#202A5A] font-bold text-xl sm:text-2xl z-10">۲۳,۷۸۶</p>
          </div>
        </div>

        {/* بخش پایینی: جداول */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* جدول برترین های پایه */}
          <div className="lg:w-1/2 flex flex-col">
            <button className="w-full bg-purple-100 hover:bg-purple-200 text-purple-600 py-3 rounded-t-lg font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors">
              <FaPlus /> ثبت پاداش جدید
            </button>
            <div className="flex-grow overflow-hidden border-2 border-t-0 border-gray-200 rounded-b-lg shadow-lg">
              <div className="bg-[#19A297] text-white h-[5vh] sm:h-[6vh] flex items-center px-3 sm:px-4">
                <Link to="#" className="text-gray-200 hover:text-white text-xs sm:text-sm">مشاهده همه</Link>
                <h3 className="flex-grow text-center font-semibold text-sm sm:text-base">برترین های پایه</h3>
                {/* Placeholder for alignment if needed */}
                <span className="w-16"></span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <tbody>
                    {topStudentsData.map((student, i) => (
                      <tr key={i} className={`h-[5vh] sm:h-[6vh] ${i % 2 !== 0 ? "bg-gray-50" : "bg-white"} border-b border-gray-200 text-right text-xs sm:text-sm`}>
                        <td className="px-3 sm:px-4 py-2 text-left text-[#202A5A] font-semibold w-20">{student.score}</td>
                        <td className="px-3 sm:px-4 py-2 text-[#19A297] font-medium">
                          {student.name} <span className="text-gray-400">({student.code})</span>
                        </td>
                        <td className="px-3 sm:px-4 py-2 text-center text-[#202A5A] font-medium w-12">{student.rank}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* جدول رتبه شما */}
          <div className="lg:w-1/2 flex flex-col">
            <button className="w-full bg-pink-100 hover:bg-pink-200 text-pink-600 py-3 rounded-t-lg font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors">
              <FaPlus /> ثبت فعالیت جدید
            </button>
            <div className="flex-grow overflow-hidden border-2 border-t-0 border-gray-200 rounded-b-lg shadow-lg">
              <div className="bg-[#202A5A] text-white h-[5vh] sm:h-[6vh] flex items-center px-3 sm:px-4">
                <Link to="#" className="text-gray-300 hover:text-white text-xs sm:text-sm">مشاهده همه</Link>
                <h3 className="flex-grow text-center font-semibold text-sm sm:text-base">رتبه شما در جدول امتیازات</h3>
                {/* Placeholder for alignment if needed */}
                <span className="w-16"></span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <tbody>
                    {userRankingData.map((user, i) => (
                      <tr key={i} className={`h-[5vh] sm:h-[6vh] ${user.highlight ? "bg-teal-500/20" : (i % 2 !== 0 ? "bg-gray-50" : "bg-white")} border-b border-gray-200 text-right text-xs sm:text-sm`}>
                        <td className={`px-3 sm:px-4 py-2 text-left font-semibold w-20 ${user.highlight ? "text-teal-700" : "text-[#202A5A]"}`}>{user.score}</td>
                        <td className={`px-3 sm:px-4 py-2 font-medium ${user.highlight ? "text-teal-700" : "text-[#19A297]"}`}>
                          {user.name} <span className={`${user.highlight ? "text-teal-600" : "text-gray-400"}`}>({user.code})</span>
                        </td>
                        <td className={`px-3 sm:px-4 py-2 text-center font-medium w-12 ${user.highlight ? "text-teal-700" : "text-[#202A5A]"}`}>{user.rank}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}