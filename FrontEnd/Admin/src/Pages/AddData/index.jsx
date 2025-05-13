import React from 'react';
import union from '../../assets/images/Union4.png'; // یا مسیر صحیح
import frame156 from '../../assets/images/Frame156.png'; // یا مسیر صحیح
import frame7 from '../../assets/images/frame7.png'; // یا مسیر صحیح
import frame72 from '../../assets/images/frame72.png'; // یا مسیر صحیح


import { BiSolidSchool } from "react-icons/bi";
import { IoNotificationsOutline } from "react-icons/io5";
import { TbPencilPlus } from "react-icons/tb"; // آیکون برای ثبت اطلاعات
import { IoDocumentTextOutline } from "react-icons/io5"; // آیکون پیشنهادی برای کل اطلاعات ثبت شده
import { BsGrid1X2 } from "react-icons/bs"; // آیکون پیشنهادی برای جمع کل امتیازات
import { IoIosArrowDown } from "react-icons/io"; // آیکون دراپ داون
import { Link } from 'react-router-dom';

// کامپوننت جدید برای صفحه ثبت اطلاعات
export default function AddData({ Open }) {
  // منطق تاریخ مشابه کامپوننت Home
  const date = new Date();
  const month = new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(date);
  const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
  const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date);
  const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(date);

  // داده‌های نمونه برای جدول
  const tableData = [
    { id: 1, category: 'داوطلبانه و توسعه فردی', title: 'پروژه تدوین برای شرکت آسا آسانسور', date: '۲۲ دی ۱۴۰۳', type: 'گروهی' },
    { id: 2, category: 'داوطلبانه و توسعه فردی', title: 'پروژه تدوین برای شرکت آسا آسانسور', date: '۲۲ دی ۱۴۰۳', type: 'گروهی', isOdd: true },
    { id: 3, category: 'داوطلبانه و توسعه فردی', title: 'پروژه تدوین برای شرکت آسا آسانسور', date: '۲۲ دی ۱۴۰۳', type: 'گروهی' },
    { id: 4, category: 'داوطلبانه و توسعه فردی', title: 'پروژه تدوین برای شرکت آسا آسانسور', date: '۲۲ دی ۱۴۰۳', type: 'گروهی', isOdd: true },
    { id: 5, category: 'داوطلبانه و توسعه فردی', title: 'پروژه تدوین برای شرکت آسا آسانسور', date: '۲۲ دی ۱۴۰۳', type: 'گروهی' },
    { id: 6, category: 'داوطلبانه و توسعه فردی', title: 'پروژه تدوین برای شرکت آسا آسانسور', date: '۲۲ دی ۱۴۰۳', type: 'گروهی', isOdd: true },
  ];


  return (
    <>
      {/* تصویر پس زمینه بالا سمت چپ - مشابه Home */}
      <img src={union} className='absolute scale-75 top-[-4rem] left-[-10rem] z-0' alt="" />

      {/* کانتینر اصلی محتوا با عرض داینامیک */}
      <div className={`${!Open ? "w-[80%]" : "w-[94%]"} p-8 transition-all duration-500 flex flex-col h-screen relative z-10`}>

        {/* هدر صفحه - مشابه Home */}
        <div className="flex justify-between items-center h-[5vh] mb-6">
          <div className="flex justify-center items-center gap-5">
            <h3 className='text-[#19A297] text-xs'>هنرستان استارتاپی رکاد</h3>
            <BiSolidSchool className='text-[#19A297] ml-[-10px] scale-150' />
            <div className='w-8 flex justify-center items-center border-gray-400 h-8 border rounded-full'> {/* استفاده از border بجای border-1 */}
              <IoNotificationsOutline className='text-gray-400 scale-100' />
            </div>
          </div>
          <div className="flex justify-center items-center gap-5">
            <p className='text-gray-400 text-xs'> امروز {week} {day} {month} ماه، {year}</p>
            {/* عنوان صفحه تغییر کرده */}
            <h1 className='text-[#19A297] font-semibold text-lg'>ثبت اطلاعات</h1>
          </div>
        </div>


        {/* بخش کارت‌های بالا */}
        <div className="flex gap-5 mb-6 h-[12vh]"> {/* تنظیم ارتفاع مناسب */}


          {/* کارت جمع کل امتیازات */}
          <div className="relative flex-1 bg-white rounded-lg overflow-hidden p-8 flex items-center justify-between shadow-sm border  border-gray-100">
            <img src={frame7} className='absolute z-0 h-full w-full object-cover scale-110 top-0 left-0 opacity-100' alt="" />

            <p className='text-[#202A5A] font-semibold text-2xl z-10'>۳۳۰۰</p>
            <div className='flex items-center gap-4 z-10'>
              <h2 className='text-[#202A5A] font-semibold text-lg'>جمع کل امتیازات</h2>
              <div className="bg-[#202A5A] flex justify-center items-center w-12 h-12 rounded-full">
                <BsGrid1X2 className='scale-150 text-white' />
              </div>
            </div>
          </div>
          {/* کارت کل اطلاعات ثبت شده */}
          <div className="relative flex-1 bg-white rounded-lg overflow-hidden p-12 flex items-center justify-between shadow-sm border border-gray-100">
            <img src={frame7} className='absolute z-0 h-full w-full object-cover scale-110 top-0 left-0 opacity-100' alt="" />
            <p className='text-[#202A5A] font-semibold text-2xl z-10'>۱۳۶,۲۰۱</p>
            <div className='flex items-center gap-4 z-10'>
              <h2 className='text-[#202A5A] font-semibold text-lg'>کل اطلاعات ثبت‌شده</h2>
              <div className="bg-[#202A5A] flex justify-center items-center w-12 h-12 rounded-full">
                <IoDocumentTextOutline className='scale-150 text-white' />
              </div>
            </div>
          </div>
        </div>

        {/* بخش ثبت اطلاعات جدید */}
        <div className="relative bg-white rounded-lg overflow-hidden mb-6 p-4 flex items-center justify-between shadow-sm border border-gray-100 h-[12vh]">
          <img src={frame72} className='absolute z-0 h-full w-full object-cover top-0 left-[-30px] opacity-100 scale-110' alt="" />
          {/* دکمه اضافه کردن */}
          <button className='bg-white cursor-pointer text-[#202A5A] px-5 py-2 rounded-4xl text-sm font-medium flex items-center gap-2 z-10 hover:bg-gray-300 transition-colors'>
          <Link to={"create"}>
            اضافه کردن<span className="text-lg">+</span>
            </Link>

          </button>
          {/* متن راهنما */}
          <p className='text-gray-500 text-sm z-10'>برای ثبت اطلاعات جدید بر روی اضافه کردن ضربه بزنید</p>
          {/* سمت راست: آیکون و عنوان */}
          <div className='flex items-center gap-4 z-10'>
            <h2 className='text-[#202A5A] font-semibold text-lg'>ثبت اطلاعات جدید</h2>
            <div className="bg-[#202A5A] flex justify-center items-center w-12 h-12 rounded-full">
              <TbPencilPlus className='scale-150 text-white' />
            </div>
          </div>


        </div>


        {/* بخش فیلترها و عنوان جدول */}
        <div className="flex justify-between items-center w-full mb-3 mt-4">
          {/* فیلترها */}
          <div className="flex gap-2">
            {/* دراپ داون دسته بندی */}
            <div className="bg-white border border-gray-300 rounded px-3 py-1.5 flex items-center justify-between text-xs text-gray-600 cursor-pointer min-w-[100px]">
              <span>دسته‌بندی</span>
              <IoIosArrowDown className="text-gray-400" />
            </div>
            {/* دراپ داون نوع ثبت */}
            <div className="bg-white border border-gray-300 rounded px-3 py-1.5 flex items-center justify-between text-xs text-gray-600 cursor-pointer min-w-[90px]">
              <span>نوع ثبت</span>
              <IoIosArrowDown className="text-gray-400" />
            </div>
            {/* دراپ داون تاریخ */}
            <div className="bg-white border border-gray-300 rounded px-3 py-1.5 flex items-center justify-between text-xs text-gray-600 cursor-pointer min-w-[80px]">
              <span>تاریخ</span>
              <IoIosArrowDown className="text-gray-400" />
            </div>
          </div>
          {/* سمت چپ: متن راهنما و فیلترها */}
          <div className="flex items-center gap-4">
            <p className='text-gray-400 text-xs'>در اینجا سوابق آخرین اطلاعات ثبت شده را مشاهده می‌کنید</p>
            {/* سمت راست: عنوان */}
            <h3 className='text-[#19A297] font-semibold text-lg'>آخرین اطلاعات ثبت شده</h3>

          </div>
        </div>

        {/* جدول اطلاعات */}
        <div className="flex-grow overflow-auto"> {/* برای اسکرول شدن جدول در صورت نیاز */}
          <table className='w-full  overflow-hiddn rounded-lg bg-white'>
            {/* سربرگ جدول */}
            <thead className='bg-gray-50 text-sm text-[#202A5A] border-gray-400 border-1'>
              <tr>
                {/* ترتیب ستون ها بر اساس تصویر */}
                <th className='font-medium text-center px-4 py-3 border-gray-400 border-1'>نوع ثبت</th>
                <th className='font-medium text-center px-4 py-3 border-gray-400 border-1'>تاریخ ثبت</th>
                <th className='font-medium text-center px-4 py-3 border-gray-400 border-1'>عنوان</th>
                <th className='font-medium text-center px-4 py-3 border-gray-400 border-1'>دسته‌بندی</th>
              </tr>
            </thead>
            {/* بدنه جدول */}
            <tbody className='divide-y divide-gray-200'>
              {tableData.map((row) => (
                <tr key={row.id} className={`${row.isOdd ? 'bg-gray-50' : 'bg-white'} text-sm`}>
                  <td className='px-4 py-3 text-center whitespace-nowrap border-gray-400 border-1 text-[#19A297] font-medium'>{row.type}</td>
                  <td className='px-4 py-3 rtl text-center whitespace-nowrap border-gray-400 border-1 text-[#202A5A]'>{row.date}</td>
                  <td className='px-4 py-3 text-center whitespace-nowrap border-gray-400 border-1 text-[#202A5A]'>{row.title}</td>
                  <td className='px-4 py-3 text-center whitespace-nowrap border-gray-400 border-1 text-[#202A5A]'>{row.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}

