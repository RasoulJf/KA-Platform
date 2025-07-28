import React, { useEffect, useRef, useState } from 'react';
import frame21 from '../../assets/images/Frame21.png'; // مسیر صحیح تصاویر
import frame22 from '../../assets/images/Frame22.png'; // مسیر صحیح تصاویر
import frame200 from '../../assets/images/frame200.png'
import { BiSolidSchool } from "react-icons/bi";
// آیکون FaVenus برای تطابق با نماد ♀ در تصویر جایگزین FaMedal شد
import { FaVenus, FaPlus, FaMedal } from "react-icons/fa";
import { IoNotificationsOutline } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom'; // اضافه کردن useNavigate
import NotificationPanel from '../../Components/NotificationPanel'; // مسیر صحیح کامپوننت
import fetchData from '../../Utils/fetchData';

export default function StudentDashboard({ Open }) {

  const MOCKET_ACTIVITY_DATA = [
    {
      "parentName": "فعالیت‌های آموزشی",
      "totalScore": 0,
      "progressPercentage": 0,
      "color": "text-[#652D90]",
      "rawHexColor": "#652D90"
    },
    {
      "parentName": "فعالیت‌های داوطلبانه و توسعه فردی",
      "totalScore": 0,
      "progressPercentage": 0,
      "color": "text-[#E0195B]",
      "rawHexColor": "#E0195B"
    },
    {
      "parentName": "فعالیت‌های شغلی",
      "totalScore": 0,
      "progressPercentage": 0,
      "color": "text-[#F8A41D]",
      "rawHexColor": "#F8A41D"
    },
    {
      "parentName": "موارد کسر امتیاز",
      "totalScore": 0,
      "progressPercentage": 0,
      "color": "text-[#787674]",
      "rawHexColor": "#787674"
    }
  ]
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const navigate = useNavigate();

  const date = new Date();
  const month = new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(date);
  const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
  const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date);
  const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(date);

  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [errorDashboard, setErrorDashboard] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0); // استیت برای نگهداری تعداد اعلان‌ها


  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  const refreshUnreadCount = async () => {
    if (!token) return;
    try {
      const response = await fetchData('notifications?filter=unread', {
        headers: { authorization: `Bearer ${token}` }
      });
      if (response.success) {
        setUnreadCount(response.totalCount || 0);
      }
    } catch (error) {
      console.error("Failed to refresh unread count:", error);
    }
  };

  const toggleNotificationPanel = () => setIsNotificationOpen(prev => !prev);
  const closeNotificationPanel = () => {
    setIsNotificationOpen(false);
    refreshUnreadCount(); // این خط را برای اطمینان از به‌روز بودن عدد اضافه کنید
  };
  useEffect(() => {
    refreshUnreadCount(); // این خط را برای اطمینان از به‌روز بودن عدد اضافه کنید

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
      if (!localStorage.getItem("token")) {
        setErrorDashboard("توکن احراز هویت یافت نشد. لطفاً دوباره وارد شوید.");
        setLoadingDashboard(false);
        return;
      }

      setLoadingDashboard(true);
      setErrorDashboard(null);
      try {
        const response = await fetchData('student-dashboard', {
          headers: { authorization: `Bearer ${token}` }
        });
        console.log("Fetched Dashboard Data (Frontend):", response.data);
        console.log("Activity Summary from API (Frontend):", JSON.stringify(response.data.activitySummary, null, 2));

        if (response.success && response.data) {
          setDashboardData(response.data);
          console.log(response.data)
        } else {
          console.error("Dashboard fetch error response:", response);
          setErrorDashboard(response.message || "خطا در دریافت اطلاعات داشبورد.");
          setDashboardData(null);
          if (response.status === 401 || response.status === 403) {
            // navigate('/login');
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
  }, [navigate]);

  const formatNumberToPersian = (num) => {
    if (num === undefined || num === null || isNaN(Number(num))) return "۰";
    return Number(num).toLocaleString('fa-IR');
  };

  return (
    <>
      <div className={`${!Open ? "w-[calc(100%-6%)]" : "w-[calc(100%-22%)]"} p-6 md:p-8 transition-all duration-500 flex-col h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100`}>
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
                {unreadCount > 0 && ( // <<<< اینجا از unreadCount استفاده می‌کنیم
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              <NotificationPanel
                isOpen={isNotificationOpen}
                onClose={closeNotificationPanel}
                token={token}
              />
            </div>
          </div>
          <div className="flex justify-center items-center gap-3 sm:gap-5">
            <p className="text-gray-400 text-xs sm:text-sm">امروز {week}، {day} {month} ماه {year}</p>
            <h1 className="text-[#19A297] font-semibold text-base sm:text-lg">
              داشبورد
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
            <div className="flex flex-col lg:flex-row gap-3 mb-3">
              {/* کارت جمع کل امتیازات */}
              <div className="relative lg:w-1/2 bg-[#E8ECFF] rounded-lg p-4 flex flex-col justify-around items-center" style={{ height: '250px' }}>
                <img src={frame200} className="absolute z-0 h-full w-full object-cover top-0 left-0" alt="" />

                <div className=" z-10 flex justify-center items-center w-16 h-16 rounded-full shadow-md">
                  {/* Icon changed to FaVenus to match the image */}
                  <FaMedal className="text-4xl text-white mt-10" />
                </div>
                <p className="text-[#202A5A] font-bold mt-10 text-[42px] z-10">
                  {formatNumberToPersian(dashboardData.totalUserScore)}
                </p>
                <h2 className="text-[#202A5A] text-[24px] font-bold z-10">جمع کل امتیازات</h2>
              </div>

              {/* بخش فعالیت‌ها */}
              <div className="lg:w-1/2 bg-white p-6 rounded-lg shadow-sm flex flex-col justify-center" style={{ height: '250px' }}>
                {(dashboardData.activitySummary && dashboardData.activitySummary.length > 0) ? (
                  dashboardData.activitySummary.map((activity) => {
                    // ✅ FIX: یک متغیر برای تشخیص موارد کسر امتیاز
                    const isDeduction = activity.parentName === 'موارد کسر امتیاز';

                    return (
                      <div key={activity.id || activity.parentName} className="flex items-center gap-3 mb-4 last:mb-0">
                        <div
                          className="w-12 h-10 flex-shrink-0 text-white text-sm font-semibold rounded-md flex items-center justify-center"
                          style={{ backgroundColor: activity.rawHexColor }}
                        >
                          {activity.totalScore < 0 ? `-${formatNumberToPersian(Math.abs(activity.totalScore))}` : formatNumberToPersian(activity.totalScore)}
                        </div>
                        <div className="flex-grow text-right">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className={`text-sm font-medium text-gray-700`}>{activity.parentName}</span>
                            <Link to={activity.detailsLink || "/my-activities"} className={`text-xs text-gray-500 hover:underline`}>مشاهده</Link>
                          </div>
                          {/* ✅ FIX: تغییر در div والد نوار پیشرفت */}
                          <div
                            className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"
                            // اگر کسر امتیاز بود، جهت را برعکس می‌کنیم
                            dir={isDeduction ? 'rtl' : 'ltr'}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${isDeduction ? (activity.totalScore * -0.25) : activity.progressPercentage}%`,
                                backgroundColor: activity.rawHexColor
                              }}
                              title={`${activity.progressPercentage}%`}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  MOCKET_ACTIVITY_DATA.map((activity) => {
                    // ✅ FIX: یک متغیر برای تشخیص موارد کسر امتیاز
                    const isDeduction = activity.parentName === 'موارد کسر امتیاز';

                    return (
                      <div key={activity.id || activity.parentName} className="flex items-center gap-3 mb-4 last:mb-0">
                        <div
                          className="w-12 h-10 flex-shrink-0 text-white text-sm font-semibold rounded-md flex items-center justify-center"
                          style={{ backgroundColor: activity.rawHexColor }}
                        >
                          {activity.totalScore < 0 ? `-${formatNumberToPersian(Math.abs(activity.totalScore))}` : formatNumberToPersian(activity.totalScore)}
                        </div>
                        <div className="flex-grow text-right">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className={`text-sm font-medium text-gray-700`}>{activity.parentName}</span>
                            <Link to={activity.detailsLink || "/my-activities"} className={`text-xs text-gray-500 hover:underline`}>مشاهده</Link>
                          </div>
                          {/* ✅ FIX: تغییر در div والد نوار پیشرفت */}
                          <div
                            className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"
                            // اگر کسر امتیاز بود، جهت را برعکس می‌کنیم
                            dir={isDeduction ? 'rtl' : 'ltr'}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${isDeduction ? (activity.totalScore * -0.25) : activity.progressPercentage}%`,
                                backgroundColor: activity.rawHexColor
                              }}
                              title={`${activity.progressPercentage}%`}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  }))}
              </div>

            </div>

            {/* بخش میانی: کارت‌های توکن */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="bg-[#F8F7FF] rounded-lg h-[110px] p-6 flex items-center relative">
                <img src={frame22} className="absolute z-0 h-full w-full object-cover top-0 left-0" alt="" />
                <div className='lg:w-2/3 px-10 z-100'>
                  <h2 className="text-[#202A5A] font-semibold text-[22px] z-10">توکن‌های استفاده‌شده</h2>
                </div>
                <div className='lg:w-1/3 text-center z-100'>
                  <p className="text-[#202A5A] font-bold text-4xl z-10">
                    {formatNumberToPersian(dashboardData.paidRewardsTokenValue)}
                  </p>
                </div>
              </div>
              <div className="bg-[#F8F7FF] rounded-lg h-[110px] p-6 flex items-center  relative">
                <img src={frame22} className="absolute z-0 h-full w-full object-cover top-0 left-0" alt="" />
                <div className='lg:w-2/3 px-10 z-100'>
                  <h2 className="text-[#202A5A] font-semibold text-[22px] z-10">توکن‌های قابل‌استفاده</h2>
                </div>
                <div className='lg:w-1/3 text-center z-100'>
                  <p className="text-[#202A5A] font-bold text-4xl z-10">
                    {formatNumberToPersian(dashboardData.availableTokens)}
                  </p>
                </div>
              </div>
            </div>

            {/* بخش پایینی: جداول */}
            <div className="flex flex-col lg:flex-row gap-3 mb-3">
              {/* جدول برترین های پایه */}
              <div className="lg:w-1/2 gap-3 flex flex-col">
                {/* Header changed to match the image */}
                <Link to="/rewards" className="w-full h-[60px] bg-[#F5E8FF] hover:bg-purple-200 transition-colors text-purple-700 py-3 rounded-lg font-bold text-base flex items-center justify-center gap-2 no-underline">
                  ثبت پاداش جدید <FaPlus />
                </Link>
                <div className="flex-grow overflow-hidden rounded-b-lg bg-white border border-gray-200 border-t-0">
                  <div className="bg-[#19A297] text-white h-12 flex items-center px-4">
                    <Link to="/results" className="text-gray-200 hover:text-white text-[10px]">مشاهدۀ همه</Link>
                    <h3 className="flex-grow text-right font-bold text-base">برترین‌های پایه</h3>
                  </div>
                  <div className="overflow-x-auto">
                    {(dashboardData.topStudentsInMyGrade && dashboardData.topStudentsInMyGrade.length > 0) ? (
                      <table className="w-full min-w-max">
                        <tbody>
                          {dashboardData.topStudentsInMyGrade.slice(0, 5).map((student, i) => (
                            <tr key={student.userId || i} className={`h-12 border-b ${student.userId == user.id ? "bg-[#D4F3F1]" : "bg-white"} border-gray-200/80 last:border-b-0 text-right text-sm`}>
                              <td className={`px-4 py-2 text-left ${student.userId == user.id ? "text-[#046A60] font-bold" : "text-[#202A5A]"} w-24 `}>{formatNumberToPersian(student.score)}</td>
                              <td className={`px-4 py-2 ${student.userId == user.id ? " text-[#046A60] " : "text-[#202A5A]"} ${student.userId == user.id ? " font-bold " : "font-medium"}`}>
                                {student.fullName} <span className={`font-medium ${student.userId == user.id ? "text-[#046A60]/80" : "text-gray-400"}`}>({student.classNum || student.class || 'N/A'})</span>
                              </td>
                              <td className={`px-4 py-2 text-center ${student.userId == user.id ? "text-[#046A60]" : "text-[#202A5A]"} font-medium w-12`}>{student.rank}</td>
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
              <div className="lg:w-1/2 gap-3 flex flex-col">
                <Link to="/activities" className="w-full h-[60px] bg-[#FFE8F0] hover:bg-pink-200 transition-colors text-pink-600 py-3 rounded-lg font-bold text-base flex items-center justify-center gap-2 no-underline">
                  ثبت فعالیت جدید   <FaPlus />
                </Link>
                <div className="flex-grow overflow-hidden rounded-b-lg bg-white border border-gray-200 border-t-0">
                  <div className="bg-[#202A5A] text-white h-12 flex items-center px-4">
                    <Link to="/results" className="text-gray-300 hover:text-white text-[10px]">مشاهدۀ همه</Link>
                    <h3 className="flex-grow text-right font-bold text-base">رتبۀ شما در جدول امتیازات</h3>
                  </div>
                  <div className="overflow-x-auto">
                    {(dashboardData.userRankingInfo?.rankingTableData && dashboardData.userRankingInfo.rankingTableData.length > 0) ? (
                      <table className="w-full min-w-max">
                        <tbody>
                          {dashboardData.userRankingInfo.rankingTableData.slice(0, 5).map((user, i) => (
                            <tr key={user.userId || i} className={`h-12 ${user.highlight ? "bg-[#D4F3F1]" : "bg-white"} border-b border-gray-200/80 last:border-b-0 text-right text-sm`}>
                              <td className={`px-4 py-2 text-left w-24 ${user.highlight ? "text-[#046A60] font-bold" : "text-[#202A5A]"}`}>{formatNumberToPersian(user.score)}</td>
                              <td className={`px-4 py-2 ${user.highlight ? " text-[#046A60] " : "text-[#202A5A]"} ${user.highlight ? " font-bold " : "font-medium"}`}>
                                {user.name} <span className={` font-medium ${user.highlight ? "text-[#046A60]/80" : "text-gray-400"}`}>({user.code || 'N/A'})</span>
                              </td>
                              <td className={`px-4 py-2 text-center font-medium w-12 ${user.highlight ? "text-[#046A60]" : "text-[#202A5A]"}`}>{user.rank}</td>
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
        <div className="pb-10"></div>
      </div>
    </>
  );
}