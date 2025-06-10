import React, { useState, useEffect } from 'react';
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

export default function AddData({ Open }) {
  const token = localStorage.getItem("token");

  // --- State ها ---
  const [totalUserScore, setTotalUserScore] = useState(0);
  const [totalAdminActivitiesCount, setTotalAdminActivitiesCount] = useState(0);
  const [adminActivitiesList, setAdminActivitiesList] = useState([]);
  const [loading, setLoading] = useState({
    stats: true,
    list: true,
  });
  const [error, setError] = useState({
    stats: null,
    list: null,
  });

  // --- منطق تاریخ ---
  const date = new Date();
  const month = new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(date);
  const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
  const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date);
  const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(date);

  // --- useEffect برای بارگذاری داده‌ها ---
  useEffect(() => {
    const loadPageData = async () => {
      if (!token) {
        setError({ stats: "توکن احراز هویت یافت نشد.", list: "توکن احراز هویت یافت نشد." });
        setLoading({ stats: false, list: false });
        return;
      }

      // بارگذاری آمارهای بالا
      setLoading(prev => ({ ...prev, stats: true }));
      setError(prev => ({ ...prev, stats: null }));
      try {
        const userStatsPromise = fetchData('users/summary-stats', {
          headers: {
            authorization: `Bearer ${token}` // اصلاح شده
          }
        });
        const adminActivityCountPromise = fetchData('admin-activity/stats/count', {
          headers: {
            authorization: `Bearer ${token}` // اصلاح شده
          }
        });

        const [userStatsResponse, adminActivityCountResponse] = await Promise.all([
          userStatsPromise,
          adminActivityCountPromise
        ]);

        if (userStatsResponse.success && userStatsResponse.data) {
          setTotalUserScore(userStatsResponse.data.totalScore);
        } else {
          setError(prev => ({ ...prev, stats: userStatsResponse.message || 'خطا در دریافت امتیاز کل کاربران' }));
        }

        if (adminActivityCountResponse.success && adminActivityCountResponse.data) {
          setTotalAdminActivitiesCount(adminActivityCountResponse.data.count);
        } else {
          setError(prev => ({ ...prev, stats: (prev.stats ? prev.stats + '; ' : '') + (adminActivityCountResponse.message || 'خطا در دریافت تعداد فعالیت‌های ثبت‌شده') }));
        }
      } catch (err) {
        console.error("Failed to load stats data:", err);
        setError(prev => ({ ...prev, stats: err.message || 'خطای سرور در بارگذاری آمارها' }));
      } finally {
        setLoading(prev => ({ ...prev, stats: false }));
      }

      // بارگذاری لیست AdminActivities
      setLoading(prev => ({ ...prev, list: true }));
      setError(prev => ({ ...prev, list: null }));
      try {
        const populateParams = "activityId,userId"; // فیلدهایی که می‌خواهید populate شوند، با کاما جدا شده
        const activitiesListResponse = await fetchData(`admin-activity?sort=-createdAt&limit=10&populate=${populateParams}`, {
          headers: {
            authorization: `Bearer ${token}` // اصلاح شده
          }
        });

        if (activitiesListResponse.success && activitiesListResponse.data) {
          setAdminActivitiesList(activitiesListResponse.data);
        } else {
          console.error("Error fetching admin activities list:", activitiesListResponse.message);
          setError(prev => ({ ...prev, list: activitiesListResponse.message || 'خطا در دریافت لیست فعالیت‌ها' }));
          setAdminActivitiesList([]);
        }
      } catch (err) {
        console.error("Failed to load admin activities list:", err);
        setError(prev => ({ ...prev, list: err.message || 'خطای سرور در بارگذاری لیست' }));
        setAdminActivitiesList([]);
      } finally {
        setLoading(prev => ({ ...prev, list: false }));
      }
    };

    loadPageData();
  }, [token]); // اجرای مجدد در صورت تغییر توکن (اگرچه معمولاً ثابت است پس از لاگین)


  // --- نمایش حالت لودینگ کلی یا خطای کلی ---
  if (loading.stats && loading.list) {
    return (
      <div className={`flex justify-center items-center h-screen ${!Open ? "w-[80%]" : "w-[94%]"} p-8`}>
        <p className="text-xl text-[#19A297]">در حال بارگذاری اطلاعات صفحه...</p>
      </div>
    );
  }

  if (error.stats || error.list) {
    return (
      <div className={`flex flex-col justify-center items-center h-screen ${!Open ? "w-[80%]" : "w-[94%]"} p-8`}>
        <p className="text-xl text-red-500">خطا در بارگذاری صفحه</p>
        {error.stats && <p className="text-md text-gray-600 mt-2">خطای آمار: {error.stats}</p>}
        {error.list && <p className="text-md text-gray-600 mt-2">خطای لیست: {error.list}</p>}
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-[#19A297] text-white px-4 py-2 rounded hover:bg-[#157a70]"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }


  return (
    <>
      <img src={union} className='absolute scale-75 top-[-4rem] left-[-10rem] z-0' alt="" />
      <div className={`${!Open ? "w-[80%]" : "w-[94%]"} p-8 transition-all duration-500 flex flex-col h-screen relative z-10 overflow-y-auto`}>

        {/* هدر صفحه */}
        <div className="flex justify-between items-center h-[5vh] mb-6">
          <div className="flex justify-center items-center gap-5">
            <h3 className='text-[#19A297] text-xs'>هنرستان استارتاپی رکاد</h3>
            <BiSolidSchool className='text-[#19A297] ml-[-10px] scale-150' />
            <div className='w-8 flex justify-center items-center border-gray-400 h-8 border rounded-full cursor-pointer'>
              <IoNotificationsOutline className='text-gray-400 scale-100' />
            </div>
          </div>
          <div className="flex justify-center items-center gap-5">
            <p className='text-gray-400 text-xs'> امروز {week} {day} {month} ماه، {year}</p>
            <h1 className='text-[#19A297] font-semibold text-lg'>ثبت اطلاعات توسط ادمین</h1>
          </div>
        </div>

        {/* بخش کارت‌های بالا */}
        <div className="flex flex-col md:flex-row gap-5 mb-6 h-auto md:h-[12vh]">
          <div className="relative flex-1 bg-white rounded-lg overflow-hidden p-6 md:p-8 flex items-center justify-between shadow-sm border border-gray-100">
            <img src={frame7} className='absolute z-0 h-full w-full object-cover scale-110 top-0 left-0 opacity-100' alt="" />
            {loading.stats ? <p className="z-10 animate-pulse">...</p> : <p className='text-[#202A5A] font-semibold text-2xl z-10'>{totalUserScore.toLocaleString('fa-IR')}</p>}
            <div className='flex items-center gap-2 md:gap-4 z-10'>
              <h2 className='text-[#202A5A] font-semibold text-sm md:text-lg'>جمع کل امتیازات کاربران</h2>
              <div className="bg-[#202A5A] flex justify-center items-center w-10 h-10 md:w-12 md:h-12 rounded-full">
                <BsGrid1X2 className='scale-125 md:scale-150 text-white' />
              </div>
            </div>
          </div>
          <div className="relative flex-1 bg-white rounded-lg overflow-hidden p-6 md:p-8 flex items-center justify-between shadow-sm border border-gray-100">
            <img src={frame7} className='absolute z-0 h-full w-full object-cover scale-110 top-0 left-0 opacity-100' alt="" />
            {loading.stats ? <p className="z-10 animate-pulse">...</p> : <p className='text-[#202A5A] font-semibold text-2xl z-10'>{totalAdminActivitiesCount.toLocaleString('fa-IR')}</p>}
            <div className='flex items-center gap-2 md:gap-4 z-10'>
              <h2 className='text-[#202A5A] font-semibold text-sm md:text-lg'>کل فعالیت‌های ثبت‌شده (ادمین)</h2>
              <div className="bg-[#202A5A] flex justify-center items-center w-10 h-10 md:w-12 md:h-12 rounded-full">
                <IoDocumentTextOutline className='scale-125 md:scale-150 text-white' />
              </div>
            </div>
          </div>
        </div>

        {/* بخش ثبت اطلاعات جدید */}
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

        {/* بخش فیلترها و عنوان جدول */}
        <div className="flex flex-col md:flex-row justify-between items-center w-full mb-3 mt-4">
          <div className="flex gap-2 mb-2 md:mb-0">
            {/* TODO: پیاده‌سازی فیلترها در آینده */}
            <div className="bg-white border border-gray-300 rounded px-3 py-1.5 flex items-center justify-between text-xs text-gray-600 cursor-not-allowed opacity-50 min-w-[100px] shadow-sm">
              <span>دسته‌بندی</span> <IoIosArrowDown className="text-gray-400" />
            </div>
            <div className="bg-white border border-gray-300 rounded px-3 py-1.5 flex items-center justify-between text-xs text-gray-600 cursor-not-allowed opacity-50 min-w-[90px] shadow-sm">
              <span>نوع فعالیت</span> <IoIosArrowDown className="text-gray-400" />
            </div>
            <div className="bg-white border border-gray-300 rounded px-3 py-1.5 flex items-center justify-between text-xs text-gray-600 cursor-not-allowed opacity-50 min-w-[80px] shadow-sm">
              <span>تاریخ</span> <IoIosArrowDown className="text-gray-400" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className='text-gray-400 text-xs hidden md:block'>سوابق آخرین فعالیت‌های ثبت‌شده توسط ادمین</p>
            <h3 className='text-[#19A297] font-semibold text-base md:text-lg'>آخرین فعالیت‌های ثبت‌شده (ادمین)</h3>
          </div>
        </div>

        {/* جدول اطلاعات - اصلاح شده برای جلوگیری از خطای hydration */}
        <div className="flex-grow overflow-x-auto mb-8">
          <table className='w-full min-w-[600px] rounded-lg bg-white shadow-md'>
            <thead className='bg-gray-50 text-xs md:text-sm text-[#202A5A] border-b border-gray-300'>
              <tr>
                <th className='font-medium text-center px-3 py-3'>نوع فعالیت</th>
                <th className='font-medium text-center px-3 py-3'>تاریخ ثبت</th>
                <th className='font-medium text-center px-3 py-3'>عنوان/جزئیات</th>
                <th className='font-medium text-center px-3 py-3'>دسته‌بندی فعالیت</th>
                <th className='font-medium text-center px-3 py-3'>امتیاز داده شده</th>
                <th className='font-medium text-center px-3 py-3 hidden md:table-cell'>دانش‌آموز</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {loading.list ? (
                <tr><td colSpan="6" className="text-center py-10 text-gray-500 animate-pulse">در حال بارگذاری لیست...</td></tr>
              ) : adminActivitiesList.length > 0 ? (
                adminActivitiesList.map((row, index) => (
                  <tr key={row._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} text-xs md:text-sm hover:bg-gray-100 transition-colors`}>
                    <td className='px-3 py-3 text-center whitespace-nowrap text-[#19A297] font-medium'>{row?.type || 'نامشخص'}</td>
                    <td className='px-3 py-3 text-center whitespace-nowrap text-[#202A5A]'>{new Date(row.createdAt).toLocaleDateString('fa-IR')}</td>
                    <td className='px-3 py-3 text-center whitespace-nowrap text-[#202A5A] max-w-[150px] sm:max-w-[200px] truncate' title={row.activityId?.name || row.details}>{row.activityId?.name || row.details}</td>
                    <td className='px-3 py-3 text-center whitespace-nowrap text-[#202A5A]'>{row.activityId?.parent || 'نامشخص'}</td>
                    <td className='px-3 py-3 text-center whitespace-nowrap text-green-600 font-semibold'>{row.scoreAwarded?.toLocaleString('fa-IR') || '0'}</td>
                    <td className='px-3 py-3 text-center whitespace-nowrap text-[#202A5A] hidden md:table-cell'>{row.userId?.fullName || 'نامشخص'}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-10 text-gray-500">هیچ فعالیتی توسط ادمین ثبت نشده است.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}