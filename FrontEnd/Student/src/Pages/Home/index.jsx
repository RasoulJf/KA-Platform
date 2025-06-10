import React, { useEffect, useRef, useState } from 'react';
import frame21 from '../../assets/images/Frame21.png'; // مسیر صحیح تصاویر
import frame22 from '../../assets/images/Frame22.png'; // مسیر صحیح تصاویر

import { BiSolidSchool } from "react-icons/bi";
import { FaMedal, FaPlus } from "react-icons/fa";
import { IoNotificationsOutline } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom'; // اضافه کردن useNavigate
import NotificationPanel from '../../Components/NotificationPanel'; // مسیر صحیح کامپوننت
import fetchData from '../../utils/fetchData';

export default function StudentDashboard({ Open }) {
    const token = localStorage.getItem("token"); // توکن اینجا خوانده می‌شود اما fetchData هم آن را می‌خواند
    const navigate = useNavigate(); // برای هدایت کاربر

    const date = new Date();
    const month = new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(date);
    const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
    const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date); // بدون تبدیل به انگلیسی
    const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(date);

    const [dashboardData, setDashboardData] = useState(null);
    const [loadingDashboard, setLoadingDashboard] = useState(true);
    const [errorDashboard, setErrorDashboard] = useState(null);

    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const notificationRef = useRef(null);

    const toggleNotificationPanel = () => setIsNotificationOpen(prev => !prev);
    const closeNotificationPanel = () => setIsNotificationOpen(false);

    useEffect(() => {
      function handleClickOutside(event) {
        if (notificationRef.current && !notificationRef.current.contains(event.target)) {
          const notificationIcon = document.getElementById('notification-icon-button');
          if (notificationIcon && notificationIcon.contains(event.target)) return;
          setIsNotificationOpen(false);
        }
      }
      if (isNotificationOpen) document.addEventListener("mousedown", handleClickOutside);
      else document.removeEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isNotificationOpen]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            // تابع fetchData خودش توکن رو از localStorage می‌خونه و در هدر Authorization قرار میده
            // پس نیازی به ارسال دستی توکن در اینجا نیست.
            if (!localStorage.getItem("token")) { // چک کردن وجود توکن قبل از درخواست
                setErrorDashboard("توکن احراز هویت یافت نشد. لطفاً دوباره وارد شوید.");
                setLoadingDashboard(false);
                // navigate('/login'); // هدایت به صفحه لاگین اگر توکن نیست
                return;
            }

            setLoadingDashboard(true);
            setErrorDashboard(null);
            try {
                // VITE_BASE_URL باید به صورت http://localhost:PORT/api/ تنظیم شده باشد
                // پس 'student-dashboard' مسیر صحیح است
                const response = await fetchData('student-dashboard',{
                  headers:{authorization:`Beraer ${token}`}
                }); // fetchData خودش توکن رو اضافه می‌کنه
                console.log("Fetched Dashboard Data (Frontend):", response.data);
                console.log("Activity Summary from API (Frontend):", JSON.stringify(response.data.activitySummary, null, 2)); // <<<< این مهمه
              
                if (response.success && response.data) {
                    setDashboardData(response.data);
                    console.log(response.data)
                } else {
                    console.error("Dashboard fetch error response:", response);
                    setErrorDashboard(response.message || "خطا در دریافت اطلاعات داشبورد.");
                    setDashboardData(null);
                    if (response.status === 401 || response.status === 403) { // خطای احراز هویت یا دسترسی
                        // navigate('/login'); // یا صفحه مناسب دیگر
                    }
                }
            } catch (err) {
                console.error("Dashboard fetch network/exception error:", err);
                setErrorDashboard("خطای شبکه یا سرور در ارتباط با داشبورد: " + (err.message || "خطای ناشناخته"));
                setDashboardData(null);
            } finally {
                setLoadingDashboard(false);
            }
        };
        fetchDashboardData();
    }, [navigate]); // اضافه کردن navigate به dependency array اگر از آن استفاده می‌شود

    const formatNumberToPersian = (num) => {
      if (num === undefined || num === null || isNaN(Number(num))) return "۰";
      return Number(num).toLocaleString('fa-IR');
    };

  return (
    <>
      <div className={`${!Open ? "w-[calc(100%-20%)]" : "w-[calc(100%-6%)]"} p-6 md:p-8 transition-all duration-500 flex-col h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100`}>
        {/* هدر بالا */}
        <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-[5vh] mb-6">
          <div className="flex justify-center items-center gap-3 sm:gap-5 mb-2 sm:mb-0">
            <h3 className="text-[#19A297] text-xs sm:text-sm">
                {dashboardData?.headerInfo?.schoolName || "هنرستان استارتاپی رکاد"}
            </h3>
            <BiSolidSchool className="text-[#19A297] ml-[-8px] sm:ml-[-10px] text-lg sm:text-xl" />
            <div className="relative" ref={notificationRef}>
              <button
                id="notification-icon-button"
                onClick={toggleNotificationPanel}
                className="w-7 h-7 sm:w-8 sm:h-8 flex justify-center items-center border border-gray-300 rounded-full cursor-pointer group relative"
                aria-label="اعلان‌ها"
              >
                <IoNotificationsOutline className="text-gray-400 text-sm sm:text-base" />
                {dashboardData?.headerInfo?.unreadNotificationsCount > 0 && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    // انیمیشن پینگ را می‌توان با کلاس‌های Tailwind اضافه کرد: animate-ping opacity-75
                )}
              </button>
              <NotificationPanel isOpen={isNotificationOpen} onClose={closeNotificationPanel} /* notifications={dashboardData?.notifications || []} */ />
            </div>
          </div>
          <div className="flex justify-center items-center gap-3 sm:gap-5">
            <p className="text-gray-400 text-xs sm:text-sm">امروز {week}، {day} {month} ماه {year}</p>
            <h1 className="text-[#19A297] font-semibold text-base sm:text-lg">
                داشبورد {dashboardData?.headerInfo?.userFullName ? `(${dashboardData.headerInfo.userFullName})` : ''}
            </h1>
          </div>
        </div>

        {loadingDashboard && <p className="text-center text-lg text-gray-600 py-10">در حال بارگذاری اطلاعات داشبورد...</p>}
        {errorDashboard && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg text-center" role="alert">
                {errorDashboard}
                {(errorDashboard.includes("توکن") || errorDashboard.includes("احراز هویت")) && (
                    <button onClick={() => navigate('/login')} className="ml-4 mt-2 sm:mt-0 bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs">
                        ورود مجدد
                    </button>
                )}
            </div>
        )}

        {dashboardData && !loadingDashboard && !errorDashboard && (
          <>
            {/* بخش بالایی: جمع کل امتیازات و فعالیت‌ها */}
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
              {/* کارت جمع کل امتیازات */}
              <div className="relative lg:w-[35%] xl:w-[30%] h-[220px] sm:h-[250px] rounded-lg overflow-hidden p-4 flex flex-col justify-around items-center shadow-lg">
                <img src={frame21} className="absolute z-0 h-full w-full object-cover scale-110 top-[-10px]" alt="" />
                {/* ... Decorative spans ... */}
                <div className="bg-[#202A5A] z-10 flex justify-center items-center w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-md">
                  <FaMedal className="text-2xl sm:text-3xl text-white" />
                </div>
                <p className="text-[#202A5A] font-bold text-3xl sm:text-4xl z-10">
                  {formatNumberToPersian(dashboardData.totalUserScore)}
                </p>
                <h2 className="text-[#202A5A] text-lg sm:text-xl z-10">جمع کل امتیازات</h2>
              </div>

              {/* بخش فعالیت‌ها */}
              <div className="lg:w-[65%] xl:w-[70%] bg-gray-50 p-4 rounded-lg shadow-lg h-[250px] lg:h-[250px] sm:h-[250px] flex flex-col justify-center">
              {(dashboardData.activitySummary && dashboardData.activitySummary.length > 0) ? (
                  dashboardData.activitySummary.map((activity) => ( // key تغییر کرد
                      <div key={activity.id || activity.parentName} className="flex items-center gap-2 sm:gap-3 mb-3.5 last:mb-0"> {/* key و mb */}
                        <div
                          className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 text-white text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center shadow-md" // rounded-lg
                          style={{ backgroundColor: activity.rawHexColor }} // <<<< استفاده از استایل inline
                        >
                          {formatNumberToPersian(activity.totalScore)}
                        </div>
                        <div className="flex-grow text-right">
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs sm:text-sm font-medium ${activity.color}`}>{activity.parentName}</span>
                            <Link to={activity.detailsLink || "/"} className={`text-xs ${activity.color} hover:underline`}>مشاهده</Link>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3 overflow-hidden"> {/* ارتفاع کمتر */}
                            <div
                              className="h-full rounded-full transition-all duration-500 ease-out" // انیمیشن اضافه شد
                              style={{
                                width: `${activity.progressPercentage}%`,
                                backgroundColor: activity.rawHexColor  // <<<< استفاده از استایل inline
                              }}
                              title={`${activity.progressPercentage}%`}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-center text-gray-500 py-8">فعالیتی ثبت نشده است.</p>
                )}
              </div>
            </div>

            {/* بخش میانی: کارت‌های پاداش و توکن */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="relative bg-gradient-to-r from-purple-50 via-pink-50 to-red-50 rounded-lg overflow-hidden h-[100px] sm:h-[12vh] p-4 sm:p-6 flex items-center justify-between shadow-lg">
                <img src={frame22} className="absolute z-0 h-full w-full object-contain scale-150 -right-0 top-0 opacity-70" alt="" />
                <div className="absolute z-0 top-0 right-0 h-full w-1/3 bg-white/20" style={{ clipPath: 'polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)' }}></div>
                <h2 className="text-[#202A5A] font-semibold text-base sm:text-lg z-10">توکن‌های خرج شده (پاداش)</h2>
                <p className="text-[#202A5A] font-bold text-xl sm:text-2xl z-10">
                  {formatNumberToPersian(dashboardData.paidRewardsTokenValue)}
                </p>
              </div>
              <div className="relative bg-gradient-to-l from-teal-50 via-cyan-50 to-sky-50 rounded-lg overflow-hidden h-[100px] sm:h-[12vh] p-4 sm:p-6 flex items-center justify-between shadow-lg">
                <img src={frame22} className="absolute z-0 h-full w-full object-contain scale-150 -right-0 top-0 opacity-70" alt="" />
                <div className="absolute z-0 top-0 right-0 h-full w-1/3 bg-white/20" style={{ clipPath: 'polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)' }}></div>
                <h2 className="text-[#202A5A] font-semibold text-base sm:text-lg z-10">توکن های قابل استفاده</h2>
                <p className="text-[#202A5A] font-bold text-xl sm:text-2xl z-10">
                  {formatNumberToPersian(dashboardData.availableTokens)}
                </p>
              </div>
            </div>

            {/* بخش پایینی: جداول */}
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
              {/* جدول برترین های پایه */}
              <div className="lg:w-1/2 flex flex-col">
                <div className="w-full bg-[#F5E8FF] text-purple-600 py-3 rounded-t-lg font-semibold text-sm sm:text-base flex items-center justify-center gap-2">
                  برترین‌های پایه {dashboardData.headerInfo?.grade || ''}
                </div>
                <div className="flex-grow overflow-hidden border-2 border-t-0 border-gray-200 rounded-b-lg shadow-lg bg-white">
                  <div className="bg-[#19A297] text-white h-[5vh] sm:h-[6vh] flex items-center px-3 sm:px-4">
                    <Link to="/rankings/grade" className="text-gray-200 hover:text-white text-xs sm:text-sm">مشاهده همه</Link>
                    <h3 className="flex-grow text-center font-semibold text-sm sm:text-base">برترین های پایه</h3>
                    <span className="w-16"></span> {/* Placeholder */}
                  </div>
                  <div className="overflow-x-auto">
                    {(dashboardData.topStudentsInMyGrade && dashboardData.topStudentsInMyGrade.length > 0) ? (
                      <table className="w-full min-w-max">
                        <tbody>
                          {dashboardData.topStudentsInMyGrade.map((student, i) => (
                            <tr key={student.userId || i} className={`h-[5vh] sm:h-[6vh] ${i % 2 !== 0 ? "bg-gray-50/70" : "bg-white"} border-b border-gray-200/80 text-right text-xs sm:text-sm`}>
                              <td className="px-3 sm:px-4 py-2 text-left text-[#202A5A] font-semibold w-20">{formatNumberToPersian(student.score)}</td>
                              <td className="px-3 sm:px-4 py-2 text-[#19A297] font-medium">
                                {student.fullName} <span className="text-gray-400">({student.classNum || student.class || 'N/A'})</span>
                              </td>
                              <td className="px-3 sm:px-4 py-2 text-center text-[#202A5A] font-medium w-12">{student.rank}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-center text-gray-500 p-4">اطلاعات رتبه‌بندی پایه در دسترس نیست.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* جدول رتبه شما */}
              <div className="lg:w-1/2 flex flex-col">
                <Link to="/activities" className="w-full bg-[#FFE8F0] hover:bg-pink-200 text-pink-600 py-3 rounded-t-lg font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors no-underline">
                  <FaPlus /> ثبت فعالیت جدید توسط دانش آموز
                </Link>
                <div className="flex-grow overflow-hidden border-2 border-t-0 border-gray-200 rounded-b-lg shadow-lg bg-white">
                  <div className="bg-[#202A5A] text-white h-[5vh] sm:h-[6vh] flex items-center px-3 sm:px-4">
                    <Link to="/rankings/all" className="text-gray-300 hover:text-white text-xs sm:text-sm">مشاهده همه</Link>
                    <h3 className="flex-grow text-center font-semibold text-sm sm:text-base">رتبه شما در جدول امتیازات</h3>
                    <span className="w-16"></span> {/* Placeholder */}
                  </div>
                  <div className="overflow-x-auto">
                    {(dashboardData.userRankingInfo?.rankingTableData && dashboardData.userRankingInfo.rankingTableData.length > 0) ? (
                      <table className="w-full min-w-max">
                        <tbody>
                          {dashboardData.userRankingInfo.rankingTableData.map((user, i) => (
                            <tr key={user.userId || i} className={`h-[5vh] sm:h-[6vh] ${user.highlight ? "bg-teal-500/20" : (i % 2 !== 0 ? "bg-gray-50/70" : "bg-white")} border-b border-gray-200/80 text-right text-xs sm:text-sm`}>
                              <td className={`px-3 sm:px-4 py-2 text-left font-semibold w-20 ${user.highlight ? "text-teal-700" : "text-[#202A5A]"}`}>{formatNumberToPersian(user.score)}</td>
                              <td className={`px-3 sm:px-4 py-2 font-medium ${user.highlight ? "text-teal-700" : "text-[#19A297]"}`}>
                                {user.name} <span className={`${user.highlight ? "text-teal-600" : "text-gray-400"}`}>({user.code || 'N/A'})</span>
                              </td>
                              <td className={`px-3 sm:px-4 py-2 text-center font-medium w-12 ${user.highlight ? "text-teal-700" : "text-[#202A5A]"}`}>{user.rank}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-center text-gray-500 p-4">اطلاعات رتبه‌بندی شما در دسترس نیست.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        <div className="pb-10"></div> {/* Padding at bottom */}
      </div>
    </>
  );
}