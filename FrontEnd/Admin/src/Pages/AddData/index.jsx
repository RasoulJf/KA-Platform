import React, { useState, useEffect, useCallback, useRef } from 'react';
import fetchData from '../../Utils/fetchData'; // مسیر صحیح به ابزار fetchData شما
import union from '../../assets/images/Union4.png';
import frame7 from '../../assets/images/frame7.png';
import frame72 from '../../assets/images/frame72.png';

import { BiSolidSchool } from "react-icons/bi";
import { IoNotificationsOutline } from "react-icons/io5";
import { TbPencilPlus } from "react-icons/tb";
import { IoDocumentTextOutline } from "react-icons/io5";
import { BsGrid1X2 } from "react-icons/bs";
import { IoIosArrowDown } from "react-icons/io";
import { Link } from 'react-router-dom';
import NotificationPanel from '../../Components/NotificationPanel';


const formatDate = (dateString) => {
  // اگر ورودی معتبر نیست، "نامشخص" برگردان
  if (!dateString || new Date(dateString).toString() === 'Invalid Date') {
    return 'نامشخص';
  }
  return new Date(dateString).toLocaleDateString('fa-IR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
// کامپوننت داخلی برای فرمت‌دهی اعداد به فارسی
const formatNumber = (num) => (num !== undefined && num !== null) ? Number(num).toLocaleString('fa-IR') : "۰";

export default function AddData({ Open }) {
  const token = localStorage.getItem("token");



  // --- State های جدید برای فیلتر و صفحه‌بندی ---
  const [filters, setFilters] = useState({
    studentName: '',
    category: '',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  const [openDropdown, setOpenDropdown] = useState(false);
  const debounceTimer = useRef(null); // برای بهینه‌سازی جستجو

  // --- State های اصلی ---
  const [stats, setStats] = useState({ totalUserScore: 0, totalAdminActivitiesCount: 0 });
  const [adminActivitiesList, setAdminActivitiesList] = useState([]);
  const [loading, setLoading] = useState({ stats: true, list: true });
  const [error, setError] = useState({ stats: null, list: null });
  // ... بعد از تعریف token

  // --- شروع بخش کد برای نوتیفیکیشن ---
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRefForThisPage = useRef(null); // << اسم متغیر رو عوض کردم تا با debounceTimer تداخل نکنه

  const toggleNotificationPanel = () => setIsNotificationOpen((prev) => !prev);
  const closeNotificationPanel = () => setIsNotificationOpen(false);
  // --- پایان بخش کد برای نوتیفیکیشن ---

  // ... بقیه state های شما مثل filters و pagination

  // useEffect جداگانه برای آمارها
  useEffect(() => {
    const loadStatsAndNotifications = async () => { // اسم تابع رو عوض کردم
      if (!token) return;
      setLoading(prev => ({ ...prev, stats: true }));
      setError(prev => ({ ...prev, stats: null }));
      try {
        // <<< تغییر: اندپوینت نوتیفیکیشن به Promise.all اضافه می‌شود >>>
        const [userStats, activityCount, notificationCountResponse] = await Promise.all([
          fetchData('users/summary-stats', { headers: { authorization: `Bearer ${token}` } }),
          fetchData('admin-activity/stats/count', { headers: { authorization: `Bearer ${token}` } }),
          fetchData('notifications?filter=unread', { headers: { authorization: `Bearer ${token}` } }) // <<<< این خط جدید است
        ]);

        const newStats = {};
        if (userStats.success) newStats.totalUserScore = userStats.data.totalScore;
        if (activityCount.success) newStats.totalAdminActivitiesCount = activityCount.data.count;
        setStats(newStats);

        // <<< تغییر: ذخیره کردن تعداد اعلان‌ها در state >>>
        if (notificationCountResponse.success) {
          setUnreadCount(notificationCountResponse.totalCount || 0);
        }

      } catch (err) {
        setError(prev => ({ ...prev, stats: err.message || 'خطا در بارگذاری آمار' }));
      } finally {
        setLoading(prev => ({ ...prev, stats: false }));
      }
    };
    loadStatsAndNotifications(); // << اسم تابع رو عوض کردم

    // <<< تغییر: اضافه کردن منطق بستن پنل با کلیک بیرون >>>
    function handleClickOutside(event) {
      if (notificationRefForThisPage.current && !notificationRefForThisPage.current.contains(event.target)) {
        const notificationIcon = document.getElementById("admin-adddata-notification-icon");
        if (notificationIcon && notificationIcon.contains(event.target)) return;
        closeNotificationPanel();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, [token]);

  // --- منطق تاریخ (بدون تغییر) ---
  const date = new Date();
  const month = new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(date);
  const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
  const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date);
  const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(date);

  // دسته‌بندی‌های ثابت برای فیلتر
  const categories = ['فعالیت‌های آموزشی', 'فعالیت‌های داوطلبانه و توسعه فردی', 'فعالیت‌های شغلی', 'موارد کسر امتیاز'];

  // --- useEffect بهینه‌شده برای بارگذاری تمام داده‌ها ---
  const loadPageData = useCallback(async () => {
    if (!token) {
      setError({ stats: "توکن یافت نشد.", list: "توکن یافت نشد." });
      setLoading({ stats: false, list: false });
      return;
    }

    setLoading(prev => ({ ...prev, list: true }));
    setError(prev => ({ ...prev, list: null }));

    try {
      const queryParams = new URLSearchParams({
        sort: '-createdAt',
        page: pagination.currentPage,
        limit: pagination.limit,
        populate: 'activityId,userId',
      });

      // افزودن فیلترها به کوئری
      if (filters.studentName) queryParams.append('studentName', filters.studentName);
      if (filters.category) queryParams.append('category', filters.category);

      const activitiesListResponse = await fetchData(`admin-activity?${queryParams.toString()}`, {
        headers: { authorization: `Bearer ${token}` }
      });

      if (activitiesListResponse.success && activitiesListResponse.data) {
        setAdminActivitiesList(activitiesListResponse.data);
        setPagination(prev => ({
          ...prev,
          totalPages: activitiesListResponse.totalPages || 1,
          totalCount: activitiesListResponse.totalCount || 0,
          currentPage: activitiesListResponse.currentPage || 1
        }));
      } else {
        throw new Error(activitiesListResponse.message || 'خطا در دریافت لیست فعالیت‌ها');
      }
    } catch (err) {
      setError(prev => ({ ...prev, list: err.message || 'خطای سرور در بارگذاری لیست' }));
      setAdminActivitiesList([]);
    } finally {
      setLoading(prev => ({ ...prev, list: false }));
    }
  }, [token, pagination.currentPage, pagination.limit, filters]);


  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  // useEffect جداگانه برای آمارها که فقط یکبار لود شوند
  useEffect(() => {
    const loadStats = async () => {
      if (!token) return;
      setLoading(prev => ({ ...prev, stats: true }));
      setError(prev => ({ ...prev, stats: null }));
      try {
        const [userStats, activityCount] = await Promise.all([
          fetchData('users/summary-stats', { headers: { authorization: `Bearer ${token}` } }),
          fetchData('admin-activity/stats/count', { headers: { authorization: `Bearer ${token}` } })
        ]);

        const newStats = {};
        if (userStats.success) newStats.totalUserScore = userStats.data.totalScore;
        if (activityCount.success) newStats.totalAdminActivitiesCount = activityCount.data.count;
        setStats(newStats);

      } catch (err) {
        setError(prev => ({ ...prev, stats: err.message || 'خطا در بارگذاری آمار' }));
      } finally {
        setLoading(prev => ({ ...prev, stats: false }));
      }
    };
    loadStats();
  }, [token]);

  // --- Handlers برای فیلتر و صفحه‌بندی ---
  const handleFilterChange = (filterName, value) => {
    // برای جستجو از debounce استفاده می‌کنیم
    if (filterName === 'studentName') {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 })); // ریست صفحه به ۱
      }, 500); // تاخیر نیم ثانیه‌ای
    } else {
      setFilters(prev => ({ ...prev, [filterName]: value }));
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      if (filterName === 'category') setOpenDropdown(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && !loading.list) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  // --- نمایش حالت لودینگ کلی یا خطای کلی ---
  if (loading.stats && adminActivitiesList.length === 0) {
    return <div className="flex justify-center items-center h-screen w-full"><p>در حال بارگذاری...</p></div>;
  }
  if ((error.stats || error.list) && adminActivitiesList.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen w-full p-8">
        <p className="text-xl text-red-500">خطا در بارگذاری صفحه</p>
        <button onClick={() => window.location.reload()} className="mt-4 bg-[#19A297] text-white px-4 py-2 rounded">تلاش مجدد</button>
      </div>
    );
  }

  return (
    <>
      <img src={union} className='absolute scale-75 top-[-4rem] left-[-10rem] z-0 opacity-50' alt="" />
      <div className={`${!Open ? "w-[calc(100%-1rem)] md:w-[80%]" : "w-[calc(100%-1rem)] md:w-[94%]"} p-4 md:p-8 transition-all duration-500 flex flex-col relative z-10`}>

        {/* هدر صفحه (بدون تغییر) */}
        <div className="flex justify-between items-center h-[5vh] mb-6">
          <div className="flex justify-center items-center gap-5">
            <h3 className='text-[#19A297] text-xs'>هنرستان استارتاپی رکاد</h3>
            <BiSolidSchool className='text-[#19A297] ml-[-10px] scale-150' />
            {/* --- کد جدید برای آیکون و پنل نوتیفیکیشن --- */}
            <div className="relative" ref={notificationRefForThisPage}>
              <button
                id="admin-adddata-notification-icon"
                onClick={toggleNotificationPanel}
                className="w-8 h-8 flex justify-center items-center border-gray-400 h-8 border rounded-full cursor-pointer relative group"
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
            <p className='text-gray-400 text-xs'> امروز {week} {day} {month} ماه، {year}</p>
            <h1 className='text-[#19A297] font-semibold text-lg'>ثبت اطلاعات توسط ادمین</h1>
          </div>
        </div>

        {/* کارت‌های بالا (اصلاح شده برای خوانایی) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {[
            { title: 'جمع کل امتیازات کاربران', value: stats.totalUserScore, icon: <BsGrid1X2 className='scale-150 text-white' /> },
            { title: 'کل فعالیت‌های ثبت‌شده (ادمین)', value: stats.totalAdminActivitiesCount, icon: <IoDocumentTextOutline className='scale-150 text-white' /> }
          ].map((card, index) => (
            <div key={index} className="relative bg-white rounded-lg overflow-hidden p-6 flex items-center justify-between shadow-sm border border-gray-100 min-h-[12vh]">
              <img src={frame7} className='absolute z-0 h-full w-full object-cover scale-110 top-0 left-0' alt="" />
              {loading.stats ? <p className="z-10 animate-pulse">...</p> : <p className='text-[#202A5A] font-semibold text-2xl z-10'>{formatNumber(card.value)}</p>}
              <div className='flex items-center gap-4 z-10'>
                <h2 className='text-[#202A5A] font-semibold text-lg'>{card.title}</h2>
                <div className="bg-[#202A5A] flex justify-center items-center w-12 h-12 rounded-full">{card.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* بخش ثبت اطلاعات جدید (بدون تغییر) */}
        <div className="relative bg-white rounded-lg overflow-hidden mb-6 p-4 flex items-center justify-between shadow-sm border border-gray-100 h-auto md:h-[12vh]">
          <img src={frame72} className='absolute z-0 h-full w-full object-cover top-0 left-[-30px] opacity-100 scale-110' alt="" />
          <Link to={"create"} className='bg-white cursor-pointer text-[#202A5A] px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 z-10 hover:bg-gray-100 transition-colors shadow'>
            اضافه کردن<span className="text-lg">+</span>
          </Link>
          <p className='text-gray-500 text-xs md:text-sm z-10 hidden md:block'>برای ثبت فعالیت جدید برای دانش‌آموزان بر روی اضافه کردن کلیک کنید</p>
          <div className='flex items-center gap-2 md:gap-4 z-10'>
            <h2 className='text-[#202A5A] font-semibold text-base md:text-lg'>ثبت فعالیت جدید (ادمین)</h2>
            <div className="bg-[#202A5A] flex justify-center items-center w-10 h-10 md:w-12 md:h-12 rounded-full">
              <TbPencilPlus className='scale-125 md:scale-150 text-white' />
            </div>
          </div>
        </div>

        {/* بخش فیلترها و عنوان جدول - کاملاً جدید و کاربردی */}
        <div className="flex flex-col md:flex-row justify-between items-center w-full mb-4 mt-6">
          <div className="flex flex-wrap gap-3 mb-3 md:mb-0">
            {/* فیلتر دسته‌بندی */}
            <div className="relative">
              <button onClick={() => setOpenDropdown(!openDropdown)} className="bg-white border border-gray-300 rounded-md px-4 py-2 flex items-center justify-between text-xs text-gray-700 min-w-[150px] shadow-sm hover:border-gray-400">
                <span>{filters.category || "همه دسته‌بندی‌ها"}</span>
                <IoIosArrowDown className={`text-gray-400 transition-transform ${openDropdown ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown && (
                <div className="absolute z-20 top-full mt-1 w-full bg-white border rounded-md shadow-lg py-1">
                  <button onClick={() => handleFilterChange('category', '')} className="block w-full text-right px-4 py-2 text-xs text-gray-700 hover:bg-gray-100">همه دسته‌بندی‌ها</button>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => handleFilterChange('category', cat)} className="block w-full text-right px-4 py-2 text-xs text-gray-700 hover:bg-gray-100">{cat}</button>
                  ))}
                </div>
              )}
            </div>
            {/* فیلتر جستجو */}
            <input
              type="text"
              placeholder="جستجوی نام دانش‌آموز..."
              onChange={(e) => handleFilterChange('studentName', e.target.value)}
              className="bg-white border border-gray-300 rounded-md px-4 py-2 text-xs text-gray-700 shadow-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none"
            />
          </div>
          <h3 className='text-[#19A297] font-semibold text-lg'>آخرین فعالیت‌های ثبت‌شده</h3>
        </div>

        {/* جدول اطلاعات */}
        <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200/80">
          <table className='w-full min-w-[700px]'>
            <thead className='bg-gray-100 text-sm text-[#202A5A]'>
              <tr>
                <th className='font-medium text-center px-3 py-3'>دانش‌آموز</th>
                <th className='font-medium text-center px-3 py-3'>امتیاز</th>
                <th className='font-medium text-center px-3 py-3'>دسته‌بندی</th>
                <th className='font-medium text-center px-3 py-3'>عنوان/جزئیات</th>
                <th className='font-medium text-center px-3 py-3'>تاریخ ثبت</th>
                <th className='font-medium text-center px-3 py-3'>نوع</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {loading.list ? (
                <tr><td colSpan="6" className="text-center py-10 text-gray-500 animate-pulse">در حال به‌روزرسانی لیست...</td></tr>
              ) : adminActivitiesList.length > 0 ? (
                adminActivitiesList.map((row, index) => (
                  <tr key={row._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'} text-sm hover:bg-gray-100 transition-colors`}>
                    <td className='px-3 py-3 text-center text-gray-800 font-medium'>{row.userId?.fullName || 'نامشخص'}</td>
                    <td className='px-3 py-3 text-center text-green-600 font-semibold'>{formatNumber(row.scoreAwarded)}</td>
                    <td className='px-3 py-3 text-center text-gray-600'>{row.activityId?.parent || 'نامشخص'}</td>
                    <td className='px-3 py-3 text-center text-gray-600 max-w-xs truncate' title={row.activityId?.name || row.details}>{row.activityId?.name || row.details}</td>
                    <td className='px-3 py-3 text-center text-gray-500 rtl'>{formatDate(row.createdAt)}</td>
                    <td className='px-3 py-3 text-center text-[#19A297] font-medium'>{row?.type || 'نامشخص'}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-10 text-gray-500">موردی مطابق با فیلترها یافت نشد.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* بخش صفحه‌بندی */}
        {pagination.totalPages > 1 && !loading.list && (
          <div className="flex justify-between items-center w-full mt-4 px-2">
            <p className="text-sm text-gray-600">
              نمایش صفحه <span className="font-semibold">{formatNumber(pagination.currentPage)}</span> از <span className="font-semibold">{formatNumber(pagination.totalPages)}</span> (کل: {formatNumber(pagination.totalCount)} مورد)
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="px-3 py-1 text-sm bg-white border rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50">قبلی</button>
              <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} className="px-3 py-1 text-sm bg-white border rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50">بعدی</button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}