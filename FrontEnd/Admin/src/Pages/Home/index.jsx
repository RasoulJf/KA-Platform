import React, { useState,useRef, useEffect } from 'react';
import fetchData from '../../Utils/fetchData'; // مسیر صحیح به ابزار fetchData شما
import union from '../../assets/images/Union4.png';
import frame156 from '../../assets/images/Frame156.png';
import frame6 from '../../assets/images/Frame6.png';
import { BiSolidSchool } from "react-icons/bi";
import { FaMedal } from "react-icons/fa";
import { IoNotificationsOutline } from "react-icons/io5";
import { Link } from 'react-router-dom';
import NotificationPanel from '../../Components/NotificationPanel';

export default function Home({ Open }) {
  const token = localStorage.getItem("token");

  const [dashboardSummary, setDashboardSummary] = useState({
    usedTokens: 0,
    availableTokens: 0,
    paidRewardsCount: 0,
    approvedRequestsCount: 0,
    totalScore: 0,
    pendingRequestsCount: 0,
    totalStudents: 0,
  });

  // ۱. State برای نگهداری تمام درخواست‌های جدید
  const [allNewRequests, setAllNewRequests] = useState([]);

  const [topStudentsByGrade, setTopStudentsByGrade] = useState({
    'دهم': [], 'یازدهم': [], 'دوازدهم': [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ... بعد از تعریف token

  // --- شروع بخش کد برای نوتیفیکیشن ---

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // این state تعداد اعلان‌ها رو نگه می‌داره
  const notificationRef = useRef(null);

  const toggleNotificationPanel = () => setIsNotificationOpen((prev) => !prev);
  const closeNotificationPanel = () => setIsNotificationOpen(false);

  // --- پایان بخش کد برای نوتیفیکیشن ---

  // ... بقیه state های شما مثل dashboardSummary و ...

  const date = new Date();
  const dateInfo = {
    month: new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(date),
    day: new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date),
    year: new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date),
    week: new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(date),
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!token) {
        setError("توکن احراز هویت یافت نشد. لطفاً دوباره وارد شوید.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const headers = { authorization: `Bearer ${token}` };

        // ۲. اندپوینت درخواست‌ها را به اندپوینت جدید تغییر می‌دهیم
        const [summaryResponse, newRequestsResponse, topStudentsResponse] = await Promise.all([
          fetchData('dashboard/summary', { headers }),
          fetchData('dashboard/recent-pending-requests?limit=6', { headers }), // دریافت ۶ مورد برای تقسیم بین دو جدول
          fetchData('users/top-students-by-all-grades?limit=4', { headers })
        ]);

        if (summaryResponse.success) setDashboardSummary(summaryResponse.data || {});
        else throw new Error(summaryResponse.message || 'خطا در دریافت خلاصه داشبورد');

        if (newRequestsResponse.success) setAllNewRequests(newRequestsResponse.data || []);
        else throw new Error(newRequestsResponse.message || 'خطا در دریافت درخواست‌های جدید');

        if (topStudentsResponse.success) setTopStudentsByGrade(topStudentsResponse.data || {});
        else throw new Error(topStudentsResponse.message || 'خطا در دریافت دانش‌آموزان برتر');

      } catch (err) {
        setError(err.message || 'خطا در برقراری ارتباط با سرور');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [token]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!token) {
        setError("توکن احراز هویت یافت نشد. لطفاً دوباره وارد شوید.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const headers = { authorization: `Bearer ${token}` };

        // <<< تغییر: اندپوینت نوتیفیکیشن به Promise.all اضافه می‌شود >>>
        const [summaryResponse, newRequestsResponse, topStudentsResponse, notificationCountResponse] = await Promise.all([
          fetchData('dashboard/summary', { headers }),
          fetchData('dashboard/recent-pending-requests?limit=6', { headers }),
          fetchData('users/top-students-by-all-grades?limit=4', { headers }),
          fetchData('notifications?filter=unread', { headers }) // <<<< این خط جدید است
        ]);

        if (summaryResponse.success) setDashboardSummary(summaryResponse.data || {});
        else throw new Error(summaryResponse.message || 'خطا در دریافت خلاصه داشبورد');

        if (newRequestsResponse.success) setAllNewRequests(newRequestsResponse.data || []);
        else throw new Error(newRequestsResponse.message || 'خطا در دریافت درخواست‌های جدید');

        if (topStudentsResponse.success) setTopStudentsByGrade(topStudentsResponse.data || {});
        else throw new Error(topStudentsResponse.message || 'خطا در دریافت دانش‌آموزان برتر');

        // <<< تغییر: ذخیره کردن تعداد اعلان‌ها در state >>>
        if (notificationCountResponse.success) {
          setUnreadCount(notificationCountResponse.totalCount || 0);
        }
        // اگر هم خطا بدهد، مهم نیست. فقط عدد روی آیکون نمایش داده نمی‌شود.

      } catch (err) {
        setError(err.message || 'خطا در برقراری ارتباط با سرور');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();

    // <<< تغییر: اضافه کردن منطق بستن پنل با کلیک بیرون >>>
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        const notificationIcon = document.getElementById("admin-notification-icon");
        if (notificationIcon && notificationIcon.contains(event.target)) return;
        closeNotificationPanel();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, [token]); // <<<< وابستگی به isNotificationOpen لازم نیست

  // ۳. تقسیم کردن درخواست‌ها به دو لیست مجزا
  const newActivityRequests = allNewRequests.filter(req => req.requestType === 'activity');
  const newRewardRequests = allNewRequests.filter(req => req.requestType === 'reward');

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-screen ${!Open ? "w-[80%]" : "w-[94%]"} p-8`}>
        <p className="text-xl text-[#19A297]">در حال بارگذاری داده‌های داشبورد...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col justify-center items-center h-screen ${!Open ? "w-[80%]" : "w-[94%]"} p-8`}>
        <p className="text-xl text-red-500">خطا در بارگذاری داشبورد</p>
        <p className="text-md text-gray-600 mt-2 whitespace-pre-line">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-[#19A297] text-white px-4 py-2 rounded hover:bg-[#157a70]"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  const summaryCards = [
    { title: "توکن‌ استفاده‌شده", value: dashboardSummary.usedTokens },
    { title: "توکن‌ قابل‌ استفاده", value: dashboardSummary.availableTokens },
    { title: "پاداش‌ پرداخت‌شده", value: dashboardSummary.paidRewardsCount },
    { title: "درخواست‌ تأییدشده", value: dashboardSummary.approvedRequestsCount },
  ];

  const grades = ['دوازدهم', 'یازدهم', 'دهم'];
  const gradeTablesData = grades.map(gradeName => {
    const gradeTitleMap = { 'دوازدهم': 'پایــه دوازدهــم', 'یازدهم': 'پایــه یازدهــم', 'دهم': 'پایــه دهــم' };
    const gradeCodeMap = { 'دوازدهم': 301, 'یازدهم': 201, 'دهم': 101 };

    return {
      gradeKey: gradeName,
      gradeTitle: gradeTitleMap[gradeName],
      code: gradeCodeMap[gradeName],
      students: (topStudentsByGrade && Array.isArray(topStudentsByGrade[gradeName])) ? topStudentsByGrade[gradeName] : []
    };
  });

  return (
    <>
      <img src={union} className="absolute scale-75 top-[-4rem] left-[-10rem] z-0" alt="" />
      <div className={`${Open ? "w-[80%]" : "w-[94%]"} p-8 transition-all duration-500 flex-col h-screen relative z-10 overflow-y-auto`}>

        {/* هدر بالا (بدون تغییر) */}
        <div className="flex justify-between items-center h-[5vh] mb-4">
          <div className="flex justify-center items-center gap-5">
            <h3 className="text-[#19A297] text-xs">هنرستان استارتاپی رکاد</h3>
            <BiSolidSchool className="text-[#19A297] ml-[-10px] scale-150" />
            {/* --- کد جدید برای آیکون و پنل نوتیفیکیشن --- */}
            <div className="relative" ref={notificationRef}>
              <button
                id="admin-notification-icon"
                onClick={toggleNotificationPanel}
                className="w-8 h-8 flex justify-center items-center border border-gray-400 rounded-full cursor-pointer relative group"
                aria-label="اعلان‌ها"
              >
                <IoNotificationsOutline className="text-gray-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount > 9 ? '۹+' : unreadCount.toLocaleString('fa-IR')}
                  </span>
                )}
              </button>
              <NotificationPanel
                isOpen={isNotificationOpen}
                onClose={closeNotificationPanel}
                token={token}
                userType="admin" // <<<< این prop کامپوننت را برای ادمین تنظیم می‌کند
              />
            </div>
            {/* --- پایان کد جدید --- */}
          </div>
          <div className="flex justify-center items-center gap-5">
            <p className="text-gray-400 text-xs">امروز {dateInfo.week} {dateInfo.day} {dateInfo.month} ماه، {dateInfo.year}</p>
            <h1 className="text-[#19A297] font-semibold text-lg">داشبورد</h1>
          </div>
        </div>

        {/* بخش کارت‌های آماری (بدون تغییر) */}
        <div className="h-auto md:h-[20vh] mb-4 flex flex-col md:flex-row gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[2vh] h-full w-full md:w-[70%]">
            {summaryCards.map((item, idx) => (
              <div key={idx} className="relative bg-orange-300 rounded-lg overflow-hidden h-[9vh] p-4 sm:p-8 flex items-center justify-between sm:justify-center gap-4 sm:gap-8 shadow-md">
                <img src={frame6} className="absolute z-0 h-full w-full object-cover top-0" alt="" />
                <h2 className="text-[#202A5A] font-semibold text-base sm:text-xl z-10 text-right">{item.title}</h2>
                <p className="text-[#202A5A] font-bold text-xl sm:text-2xl z-10">
                  {typeof item.value === 'number' ? item.value.toLocaleString('fa-IR') : '0'}
                </p>
              </div>
            ))}
          </div>
          <div className="relative h-[20vh] md:h-full w-full md:w-[30%] rounded-lg overflow-hidden p-4 flex flex-col justify-between items-center shadow-md mt-4 md:mt-0">
            <img src={frame156} className="absolute z-0 h-full w-full object-cover top-0" alt="" />
            <div className="bg-[#202A5A] z-10 flex justify-center items-center w-12 h-12 sm:w-14 sm:h-14 rounded-full">
              <FaMedal className="scale-125 sm:scale-150 text-white" />
            </div>
            <p className="text-[#202A5A] font-bold text-2xl sm:text-3xl z-10">
              {typeof dashboardSummary.totalScore === 'number' ? dashboardSummary.totalScore.toLocaleString('fa-IR') : '0'}
            </p>
            <h2 className="text-[#202A5A] text-lg sm:text-xl z-10">جمع کل امتیازات</h2>
          </div>
        </div>

        {/* ۴. جایگزینی این بخش با دو جدول مجزا */}
        <div className="w-full mb-4 flex flex-col md:flex-row gap-[2vh] h-auto md:h-[20vh]">
          {/* جدول اول: درخواست‌های فعالیت */}
          <table className="w-full md:w-1/2 h-full border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm mb-4 md:mb-0">
            <thead className="bg-[#19A297] text-white h-[5vh]">
              <tr>
                <th className="text-right pr-2 py-2 w-1/4 text-sm sm:text-base"></th>
                <th className="text-right pr-2 py-2 w-1/4 text-sm sm:text-base"></th>
                <th className="text-right pr-2 py-2 w-2/4 text-sm sm:text-base">درخواست های فعالیت</th>
              </tr>
            </thead>
            <tbody>
              {newActivityRequests.length > 0 ? (
                newActivityRequests.slice(0, 3).map((request, i) => (
                  <tr key={request._id} className={`w-full h-[5vh] ${i % 2 !== 0 ? "bg-gray-50" : "bg-white"} border-b border-gray-200 text-right`}>
                    <td className="text-left pl-2 py-2">
                      <Link to={`/requests`} className="text-[#19A297] hover:underline text-xs sm:text-sm">مشاهده</Link>
                    </td>
                    <td className="text-gray-500 text-xs sm:text-sm py-2">{new Date(request.createdAt).toLocaleDateString('fa-IR', { day: 'numeric', month: 'short' })}</td>
                    <td className="pr-2 text-[#202A5A] text-xs sm:text-sm py-2">{request.userFullName}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" className="text-center py-4 text-gray-500 text-sm">درخواست فعالیتی یافت نشد.</td></tr>
              )}
            </tbody>
          </table>

          {/* جدول دوم: درخواست‌های پاداش */}
          <table className="w-full md:w-1/2 h-full border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm mb-4 md:mb-0">
            <thead className="bg-[#19A297] text-white h-[5vh]">
              <tr>
                <th className="text-right pr-2 py-2 w-1/4 text-sm sm:text-base"></th>
                <th className="text-right pr-2 py-2 w-1/4 text-sm sm:text-base"></th>
                <th className="text-right pr-2 py-2 w-2/4 text-sm sm:text-base">درخواست های پاداش</th>
              </tr>
            </thead>
            <tbody>
              {newRewardRequests.length > 0 ? (
                newRewardRequests.slice(0, 3).map((request, i) => (
                  <tr key={request._id} className={`w-full h-[5vh] ${i % 2 !== 0 ? "bg-gray-50" : "bg-white"} border-b border-gray-200 text-right`}>
                    <td className="text-left pl-2 py-2">
                      <Link to={`/rewards`} className="text-[#19A297] hover:underline text-xs sm:text-sm">مشاهده</Link>
                    </td>
                    <td className="text-gray-500 text-xs sm:text-sm py-2">{new Date(request.createdAt).toLocaleDateString('fa-IR', { day: 'numeric', month: 'short' })}</td>
                    <td className="pr-2 text-[#202A5A] text-xs sm:text-sm py-2">{request.userFullName}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" className="text-center py-4 text-gray-500 text-sm">درخواست پاداشی یافت نشد.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* جدول پایه‌های مختلف (بدون تغییر) */}
        <div className="w-full flex flex-col md:flex-row gap-[2vh] mb-4 h-auto md:h-[30vh]">
          {gradeTablesData.map((item, idx) => (
            <table key={idx} className="w-full md:w-1/3 h-[25vh] border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm mb-4 md:mb-0">
              <thead className="bg-[#202A5A] text-white h-[5vh]">
                <tr>
                  <th className='text-left pl-2 py-2 w-2/6'>
                    <Link to={`results`} className="text-gray-300 text-xs hover:text-white hover:underline">مشاهده همه</Link>
                  </th>
                  <th className="text-right w-1/6 text-sm sm:text-base"></th>
                  <th className="text-right pr-2 py-2 w-3/6 text-sm sm:text-base">
                    {item.gradeTitle}
                  </th>
                </tr>
              </thead>
              <tbody>
                {item.students && item.students.length > 0 ? (
                  item.students.slice(0, 4).map((student, i) => (
                    <tr key={student._id || i} className={`w-full h-[5vh] ${i % 2 !== 0 ? "bg-gray-50" : "bg-white"} border-b border-gray-200 text-right`}>
                      <td className="text-left w-1/5 pl-2 text-xs sm:text-sm py-2">
                        <Link to={`/admin/profile/${student._id}`} className="text-[#19A297] hover:underline">{student.score?.toLocaleString('fa-IR') || '0'}</Link>
                      </td>
                      <td className="text-gray-500 w-1/5 text-xs sm:text-sm py-2">({item.code})</td>
                      <td className="pr-2 text-[#19A297] w-3/5 text-xs sm:text-sm py-2">{student.fullName}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" className="text-center py-4 text-gray-500 text-sm">موردی برای نمایش یافت نشد.</td></tr>
                )}
              </tbody>
            </table>
          ))}
        </div>

        {/* میانگین امتیازات (بدون تغییر) */}
        <div className="w-full flex flex-col md:flex-row gap-[2vh] h-auto md:h-[10vh] items-start mb-8">
          {["دوازدهم", "یازدهم", "دهم"].map((grade, i) => (
            <div key={i} className="w-full md:w-1/3 h-[7vh] px-3 flex justify-between items-center border-2 border-[#202A5A] rounded-lg bg-white shadow-sm mb-2 md:mb-0">
              <p className="text-[#202A5A] font-semibold">
                {(typeof dashboardSummary[`avgScore${grade}`] === 'number'
                  ? dashboardSummary[`avgScore${grade}`].toLocaleString('fa-IR')
                  : '۰')}
              </p>
              <h4 className="text-[#202A5A] text-xs sm:text-sm">میانگین امتیازات {grade}</h4>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}