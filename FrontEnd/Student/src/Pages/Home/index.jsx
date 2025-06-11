import React, { useEffect, useRef, useState } from 'react';
import frame21 from '../../assets/images/Frame21.png'; // مسیر صحیح تصاویر
import frame22 from '../../assets/images/Frame22.png'; // مسیر صحیح تصاویر

import { BiSolidSchool } from "react-icons/bi";
// آیکون FaVenus برای تطابق با نماد ♀ در تصویر جایگزین FaMedal شد
import { FaVenus, FaPlus } from "react-icons/fa";
import { IoNotificationsOutline } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom'; // اضافه کردن useNavigate
import NotificationPanel from '../../Components/NotificationPanel'; // مسیر صحیح کامپوننت
import fetchData from '../../utils/fetchData';

export default function StudentDashboard({ Open }) {
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const date = new Date();
    const month = new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(date);
    const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
    const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date);
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
            if (!localStorage.getItem("token")) {
                setErrorDashboard("توکن احراز هویت یافت نشد. لطفاً دوباره وارد شوید.");
                setLoadingDashboard(false);
                return;
            }

            setLoadingDashboard(true);
            setErrorDashboard(null);
            try {
                const response = await fetchData('student-dashboard',{
                  headers:{authorization:`Beraer ${token}`}
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
      <div className={`${!Open ? "w-[calc(100%-6%)]" : "w-[calc(100%-22%)]" } p-6 md:p-8 transition-all duration-500 flex-col h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100`}>
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
                )}
              </button>
              <NotificationPanel isOpen={isNotificationOpen} onClose={closeNotificationPanel} />
            </div>
          </div>
          <div className="flex justify-center items-center gap-3 sm:gap-5">
            <p className="text-gray-400 text-xs sm:text-sm">امروز {week}، {day} {month} ماه، {year}</p>
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
              <div className="relative lg:w-1/2 bg-[#F8F7FF] rounded-lg p-4 flex flex-col justify-around items-center" style={{height: '250px'}}>
                {/* Decorative dots from image */}
                <span className="absolute top-[15%] right-[15%] w-2 h-2 bg-blue-300 rounded-full"></span>
                <span className="absolute top-[20%] left-[10%] w-3 h-3 bg-purple-400 rounded-full"></span>
                <span className="absolute top-[35%] right-[8%] w-2.5 h-2.5 bg-orange-300 rounded-full"></span>
                <span className="absolute bottom-[15%] right-[20%] w-3 h-3 bg-purple-600 rounded-full"></span>
                <span className="absolute bottom-[25%] left-[15%] w-2 h-2 bg-teal-300 rounded-full"></span>
                <span className="absolute top-[60%] left-[8%] w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                <span className="absolute bottom-[40%] right-[30%] w-1.5 h-1.5 bg-teal-400 rounded-full"></span>
                <span className="absolute top-[70%] right-[10%] w-1.5 h-1.5 bg-red-400 rounded-full"></span>

                <div className="bg-[#202A5A] z-10 flex justify-center items-center w-16 h-16 rounded-full shadow-md">
                   {/* Icon changed to FaVenus to match the image */}
                  <FaVenus className="text-3xl text-white" />
                </div>
                <p className="text-[#202A5A] font-bold text-4xl z-10">
                  {formatNumberToPersian(dashboardData.totalUserScore)}
                </p>
                <h2 className="text-[#202A5A] text-xl z-10">جمع کل امتیازات</h2>
              </div>

              {/* بخش فعالیت‌ها */}
              <div className="lg:w-1/2 bg-white p-6 rounded-lg shadow-sm flex flex-col justify-center" style={{height: '250px'}}>
              {(dashboardData.activitySummary && dashboardData.activitySummary.length > 0) ? (
                  dashboardData.activitySummary.map((activity) => (
                      <div key={activity.id || activity.parentName} className="flex items-center gap-3 mb-4 last:mb-0">
                        <div
                          className="w-12 h-10 flex-shrink-0 text-white text-sm font-semibold rounded-md flex items-center justify-center"
                          style={{ backgroundColor: activity.rawHexColor }}
                        >
                          {activity.totalScore < 0 ? `-${formatNumberToPersian(Math.abs(activity.totalScore))}` : formatNumberToPersian(activity.totalScore) }
                        </div>
                        <div className="flex-grow text-right">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className={`text-sm font-medium text-gray-700`}>{activity.parentName}</span>
                            <Link to={activity.detailsLink || "/"} className={`text-xs text-gray-500 hover:underline`}>مشاهده</Link>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${activity.progressPercentage}%`,
                                backgroundColor: activity.rawHexColor
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

            {/* بخش میانی: کارت‌های توکن */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="bg-[#F8F7FF] rounded-lg h-[110px] p-6 flex items-center justify-between">
                <h2 className="text-[#202A5A] font-semibold text-lg z-10">توکن‌های خرج شده (پاداش)</h2>
                <p className="text-[#202A5A] font-bold text-2xl z-10">
                  {formatNumberToPersian(dashboardData.paidRewardsTokenValue)}
                </p>
              </div>
              <div className="bg-[#F8F7FF] rounded-lg h-[110px] p-6 flex items-center justify-between">
                <h2 className="text-[#202A5A] font-semibold text-lg z-10">توکن های قابل استفاده</h2>
                <p className="text-[#202A5A] font-bold text-2xl z-10">
                  {formatNumberToPersian(dashboardData.availableTokens)}
                </p>
              </div>
            </div>

            {/* بخش پایینی: جداول */}
            <div className="flex flex-col lg:flex-row gap-3 mb-3">
              {/* جدول برترین های پایه */}
              <div className="lg:w-1/2 gap-3 flex flex-col">
                {/* Header changed to match the image */}
                <Link to="/rewards" className="w-full h-[60px] bg-[#F5E8FF] hover:bg-purple-200 transition-colors text-purple-700 py-3 rounded-lg font-semibold text-base flex items-center justify-center gap-2 no-underline">
                  <FaPlus /> ثبت پاداش جدید
                </Link>
                <div className="flex-grow overflow-hidden rounded-b-lg bg-white border border-gray-200 border-t-0">
                  <div className="bg-[#19A297] text-white h-12 flex items-center px-4">
                    <Link to="/rankings/grade" className="text-gray-200 hover:text-white text-sm">مشاهده همه</Link>
                    <h3 className="flex-grow text-center font-semibold text-base">برترین های پایه</h3>
                    <span className="w-16"></span>
                  </div>
                  <div className="overflow-x-auto">
                    {(dashboardData.topStudentsInMyGrade && dashboardData.topStudentsInMyGrade.length > 0) ? (
                      <table className="w-full min-w-max">
                        <tbody>
                          {dashboardData.topStudentsInMyGrade.slice(0, 5).map((student, i) => (
                            <tr key={student.userId || i} className={`h-12 bg-white border-b border-gray-200/80 last:border-b-0 text-right text-sm`}>
                              <td className="px-4 py-2 text-left text-[#202A5A] font-semibold w-24">{formatNumberToPersian(student.score)}</td>
                              <td className="px-4 py-2 text-[#202A5A] font-medium">
                                {student.fullName} <span className="text-gray-400">({student.classNum || student.class || 'N/A'})</span>
                              </td>
                              <td className="px-4 py-2 text-center text-[#202A5A] font-medium w-12">{student.rank}</td>
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
                <Link to="/activities" className="w-full h-[60px] bg-[#FFE8F0] hover:bg-pink-200 transition-colors text-pink-600 py-3 rounded-lg font-semibold text-base flex items-center justify-center gap-2 no-underline">
                  <FaPlus /> ثبت فعالیت جدید
                </Link>
                <div className="flex-grow overflow-hidden rounded-b-lg bg-white border border-gray-200 border-t-0">
                  <div className="bg-[#202A5A] text-white h-12 flex items-center px-4">
                    <Link to="/rankings/all" className="text-gray-300 hover:text-white text-sm">مشاهده همه</Link>
                    <h3 className="flex-grow mr-[-60px] text-right font-semibold text-base">رتبه شما در جدول امتیازات</h3>
                    <span className="w-16"></span>
                  </div>
                  <div className="overflow-x-auto">
                    {(dashboardData.userRankingInfo?.rankingTableData && dashboardData.userRankingInfo.rankingTableData.length > 0) ? (
                      <table className="w-full min-w-max">
                        <tbody>
                          {dashboardData.userRankingInfo.rankingTableData.slice(0, 5).map((user, i) => (
                            <tr key={user.userId || i} className={`h-12 ${user.highlight ? "bg-[#D4F3F1]" : "bg-white"} border-b border-gray-200/80 last:border-b-0 text-right text-sm`}>
                              <td className={`px-4 py-2 text-left font-semibold w-24 ${user.highlight ? "text-[#046A60]" : "text-[#202A5A]"}`}>{formatNumberToPersian(user.score)}</td>
                              <td className={`px-4 py-2 font-medium ${user.highlight ? "text-[#046A60]" : "text-[#202A5A]"}`}>
                                {user.name} <span className={`${user.highlight ? "text-[#046A60]/80" : "text-gray-400"}`}>({user.code || 'N/A'})</span>
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