import React from 'react';
import { BiSolidSchool } from "react-icons/bi";
import { IoNotificationsOutline } from "react-icons/io5";

// داده‌های نمونه برای جدول نتایج
const resultsData = [
  { id: 1, name: "علی محمدی‌نیا", class: "۱۰۲", educationalActivities: "۳۷۹", voluntaryActivities: "۲۲۵", jobActivities: "۱۵۸", deductions: "۲۲۰", score: "۲۲۰K", rank: "۱" },
  { id: 2, name: "علی محمدی‌نیا", class: "۱۰۲", educationalActivities: "۳۷۹", voluntaryActivities: "۲۲۵", jobActivities: "۱۵۸", deductions: "۲۲۰", score: "۲۲۰K", rank: "۱" },
  { id: 3, name: "علی محمدی‌نیا", class: "۱۰۲", educationalActivities: "۳۷۹", voluntaryActivities: "۲۲۵", jobActivities: "۱۵۸", deductions: "۲۲۰", score: "۲۲۰K", rank: "۱" },
  { id: 4, name: "علی محمدی‌نیا", class: "۱۰۲", educationalActivities: "۳۷۹", voluntaryActivities: "۲۲۵", jobActivities: "۱۵۸", deductions: "۲۲۰", score: "۲۲۰K", rank: "۱" },
  { id: 5, name: "علی محمدی‌نیا", class: "۱۰۲", educationalActivities: "۳۷۹", voluntaryActivities: "۲۲۵", jobActivities: "۱۵۸", deductions: "۲۲۰", score: "۲۲۰K", rank: "۱" },
  { id: 6, name: "علی محمدی‌نیا", class: "۱۰۲", educationalActivities: "۳۷۹", voluntaryActivities: "۲۲۵", jobActivities: "۱۵۸", deductions: "۲۲۰", score: "۲۲۰K", rank: "۱" },
  { id: 7, name: "علی محمدی‌نیا", class: "۱۰۲", educationalActivities: "۳۷۹", voluntaryActivities: "۲۲۵", jobActivities: "۱۵۸", deductions: "۲۲۰", score: "۲۲۰K", rank: "۱" },
  { id: 8, name: "علی محمدی‌نیا", class: "۱۰۲", educationalActivities: "۳۷۹", voluntaryActivities: "۲۲۵", jobActivities: "۱۵۸", deductions: "۲۲۰", score: "۲۲۰K", rank: "۱" },
  { id: 9, name: "علی محمدی‌نیا", class: "۱۰۲", educationalActivities: "۳۷۹", voluntaryActivities: "۲۲۵", jobActivities: "۱۵۸", deductions: "۲۲۰", score: "۲۲۰K", rank: "۱" },
  { id: 10, name: "علی محمدی‌نیا", class: "۱۰۲", educationalActivities: "۳۷۹", voluntaryActivities: "۲۲۵", jobActivities: "۱۵۸", deductions: "۲۲۰", score: "۲۲۰K", rank: "۱" },
  { id: 11, name: "علی محمدی‌نیا", class: "۱۰۲", educationalActivities: "۳۷۹", voluntaryActivities: "۲۲۵", jobActivities: "۱۵۸", deductions: "۲۲۰", score: "۲۲۰K", rank: "۱" },
  { id: 12, name: "علی محمدی‌نیا", class: "۱۰۲", educationalActivities: "۳۷۹", voluntaryActivities: "۲۲۵", jobActivities: "۱۵۸", deductions: "۲۲۰", score: "۲۲۰K", rank: "۱" },
];

// پیکربندی هدرهای جدول برای سهولت در رندر و استایل‌دهی
// ترتیب از راست به چپ در UI: نام، کلاس، فعالیت‌های آموزشی، فعالیت‌های داوطلبانه، فعالیت‌های شغلی، کسر امتیازات، امتیاز، رتبه
const headerConfig = [
  { title: "نام و نام‌خانوادگی", key: "name", headerClass: "bg-gray-100 text-gray-700", cellClass: "text-gray-800 font-medium" },
  { title: "کلاس", key: "class", headerClass: "bg-gray-100 text-gray-700", cellClass: "text-indigo-700" },
  { title: "فعالیت‌های آموزشی", key: "educationalActivities", headerClass: "bg-purple-600 text-white", cellClass: "text-indigo-700 font-semibold" },
  { title: "فعالیت‌های داوطلبانه و توسعه فردی", key: "voluntaryActivities", headerClass: "bg-pink-500 text-white", cellClass: "text-indigo-700 font-semibold" },
  { title: "فعالیت‌های شغلی", key: "jobActivities", headerClass: "bg-yellow-400 text-gray-800", cellClass: "text-indigo-700 font-semibold" }, // بر اساس تصویر، متن هدر تیره است
  { title: "کسر امتیازات", key: "deductions", headerClass: "bg-gray-600 text-white", cellClass: "text-indigo-700 font-semibold" },
  { title: "امتیاز", key: "score", headerClass: "bg-gray-100 text-gray-700", cellClass: "text-indigo-700 font-bold" }, // امتیاز معمولا برجسته تر است
  { title: "رتبه", key: "rank", headerClass: "bg-gray-100 text-gray-700", cellClass: "text-indigo-700 font-bold" }, // رتبه هم معمولا برجسته تر است
].reverse(); // معکوس کردن برای نمایش صحیح از راست به چپ در کد (هنگام map کردن)

export default function Results({ Open }) { // نام کامپوننت به Results تغییر یافت
  const date = new Date();
  const month = new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(date);
  const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
  const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date)
  const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(date);

  return (
    <>
      <div 
        className={`p-6 md:p-8 transition-all duration-500 flex-col h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ${
          !Open ? "w-[calc(100%-20%)]" : "w-[calc(100%-6%)]" // تنظیم عرض بر اساس وضعیت سایدبار
        }`}
         // اضافه کردن جهت راست به چپ برای کل محتوا
      >
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
        
        {/* جدول امتیازات */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead className="text-xs uppercase">
                <tr>
                  {headerConfig.map(header => (
                    <th 
                      key={header.key} 
                      scope="col" 
                      className={`px-4 py-3 font-semibold text-center ${header.headerClass}`}
                    >
                      {header.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resultsData.map((row, idx) => (
                  <tr key={row.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-gray-100 transition-colors`}>
                    {headerConfig.map(header => (
                      <td 
                        key={`${row.id}-${header.key}`} 
                        className={`px-4 py-3 whitespace-nowrap text-center ${header.cellClass}`}
                      >
                        {row[header.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
         {/* Padding at the bottom */}
        <div className="h-16"></div>
      </div>
    </>
  );
}