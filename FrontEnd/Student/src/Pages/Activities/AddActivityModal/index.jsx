import React, { useState, useEffect } from 'react';
import { IoClose } from "react-icons/io5"; // آیکون بستن
import { IoChevronDown } from "react-icons/io5"; // آیکون برای دراپ‌دان

export default function AddActivityModal({ isOpen, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activityType, setActivityType] = useState(''); // برای فیلد "عنوان" که دراپ‌دان است

  // مقادیر ثابت یا دریافت شده از کاربر فعلی
  const studentName = "امیرعلی جهدی (دهم)";
  const submissionDate = "۲۷ اردیبهشت ۱۴۰۳"; // این تاریخ می‌تواند داینامیک هم باشد

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setActivityType('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    // اینجا می‌توانید داده‌ها را برای ارسال به سرور یا والد آماده کنید
    const activityData = {
      studentName,
      submissionDate,
      activityType, // یا title اگر نام متغیر را تغییر ندادید
      description,
    };
    if (onSubmit) {
      onSubmit(activityData);
    }
    onClose(); // بستن مودال پس از ثبت
  };

  // گزینه‌های دراپ‌دان "عنوان"
  const activityOptions = [
    "دوره‌های آموزشی برون مدرسه‌ای",
    "شرکت در مسابقات علمی",
    "فعالیت‌های فرهنگی و هنری",
    "پروژه‌های تحقیقاتی",
    "سایر موارد"
  ];

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out" dir="rtl">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg relative transform transition-all duration-300 ease-in-out scale-100">
        {/* دکمه بستن مودال */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-red-500 hover:text-red-700 transition-colors z-10"
          aria-label="بستن"
        >
          <IoClose className='cursor-pointer' size={28} />
        </button>

        {/* عنوان مودال */}
        <h2 className="text-xl sm:text-2xl font-semibold text-center text-[#202A5A] mb-6 sm:mb-8">
          فرم ثبت فعالیت
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* نام و نام خانوادگی - نمایش */}
          <div>
            <label htmlFor="studentName" className="block text-xs font-medium text-gray-500 mb-1 text-right">
              نام و نام‌خانوادگی
            </label>
            <div
              id="studentName"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-[#202A5A] text-sm text-right"
            >
              {studentName}
            </div>
          </div>

          {/* تاریخ ثبت درخواست - نمایش */}
          <div>
            <label htmlFor="submissionDate" className="block text-xs font-medium text-gray-500 mb-1 text-right">
              تاریخ ثبت درخواست
            </label>
            <div
              id="submissionDate"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-[#202A5A] text-sm text-right"
            >
              {submissionDate}
            </div>
          </div>

          {/* عنوان فعالیت - دراپ‌دان */}
          <div className="relative">
            <label htmlFor="activityType" className="block text-xs font-medium text-gray-500 mb-1 text-right">
              عنوان
            </label>
            <select
              id="activityType"
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              required
              className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#19A297] focus:border-[#19A297] text-[#202A5A] text-sm text-right appearance-none"
            >
              <option value="" disabled className="text-gray-400">انتخاب کنید...</option>
              {activityOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none top-[25px]"> {/* Adjusted top for label */}
              <IoChevronDown className="text-gray-400" />
            </div>
          </div>

          {/* شرح فعالیت - تکست اریا */}
          <div>
            <label htmlFor="description" className="block text-xs font-medium text-gray-500 mb-1 text-right">
              شرح
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows="4"
              placeholder="شرح کامل فعالیت خود را در اینجا وارد کنید..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#19A297] focus:border-[#19A297] text-indigo-700 text-sm text-right placeholder-gray-400 resize-none"
            ></textarea>
          </div>

          {/* دکمه ثبت اطلاعات */}
          <button
            type="submit"
            className="w-full bg-[#19A297] hover:bg-[#158a80] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#19A297] focus:ring-opacity-50"
          >
            ثبت اطلاعات
          </button>
        </form>
      </div>
    </div>
  );
}