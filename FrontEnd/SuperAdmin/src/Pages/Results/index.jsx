import React, { useState } from 'react';
import union from '../../assets/images/Union4.png';
// import Frame11 from '../../assets/images/Frame11.png';

import { BiSolidSchool } from "react-icons/bi";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoIosArrowDown, IoIosArrowForward as ArrowIcon } from "react-icons/io"; // ArrowIcon for grade nav
import { BsClipboardData, BsTable, BsCalendarEvent } from "react-icons/bs";
import GradeTable from './GradeTable';

export default function Results({ Open }) {
  const date = new Date();
  const month = new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(date);
  const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
  const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date);
  const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(date);

  const [selectedType, setSelectedType] = useState('reports');
  const [selectedGrade, setSelectedGrade] = useState(''); // Initially no grade selected for tables

  const [reportFilters, setReportFilters] = useState({
    title: '', grade: '', students: '', fromDate: '', toDate: '',
  });

  // دکمه های پایه به ترتیب نمایش در UI (از راست به چپ در تصویر شما: دوازدهم، یازدهم، دهم)
  // اما برای منطق ناوبری ساده تر، آنها را به ترتیب عددی نگه میداریم
  const gradeButtons = [
    { label: "دوازدهم", value: "12" },
    { label: "یازدهم", value: "11" },
    { label: "دهم", value: "10" },
  ];
  // برای نمایش در UI با ترتیب تصویر (دهم سمت راست ترین دکمه فعال)
  // ما آرایه را برای map کردن معکوس میکنیم
  const reversedGradeButtonsForDisplay = [...gradeButtons].reverse();


  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setSelectedGrade('');
    setReportFilters({ title: '', grade: '', students: '', fromDate: '', toDate: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleGetReport = (e) => {
    e.preventDefault();
    console.log("دریافت گزارش با فیلترهای:", reportFilters);
  };

  const handleGradeSelect = (gradeValue) => {
    setSelectedGrade(gradeValue);
  };

  const navigateGrade = () => {
    if (!selectedGrade) { // اگر هیچ پایه ای انتخاب نشده، پایه اول (دهم) را انتخاب کن
      setSelectedGrade(gradeButtons[0].value);
      return;
    }
    const currentIndex = gradeButtons.findIndex(g => g.value === selectedGrade);
    const nextIndex = (currentIndex + 1) % gradeButtons.length;
    setSelectedGrade(gradeButtons[nextIndex].value);
  };


  const FilterDropdown = ({ label, options = [], name, value, onChange, placeholder }) => (
    <div className="relative w-full">
      <label className="text-xs text-gray-700 mb-1 block text-right">{label}</label>
      <div className="bg-white border border-gray-300 rounded-md px-3 py-2.5 flex items-center justify-between text-sm text-gray-700 cursor-pointer h-[42px]">
        <span className='flex-grow text-right'>{value || placeholder || `انتخاب ${label}`}</span>
        <IoIosArrowDown className="text-gray-400 mr-2" />
      </div>
    </div>
  );

  const DatePickerField = ({ label, name, value, onChange, placeholder }) => (
    <div className="relative w-full">
      <label className="text-xs text-gray-700 mb-1 block text-right">{label}</label>
      <div className="bg-white border border-gray-300 rounded-md px-3 py-2.5 flex items-center justify-between text-sm text-gray-700 h-[42px]">
        <span className='flex-grow text-right'>{value || placeholder || `انتخاب تاریخ`}</span>
        <BsCalendarEvent className="text-gray-500 mr-2 scale-110" />
      </div>
    </div>
  );

  return (
    <>
      <img src={union} className='absolute scale-75 top-[-4rem] left-[-10rem] z-0' alt="" />
      <div className={`${!Open ? "w-[80%]" : "w-[94%]"} p-8 transition-all duration-500 flex flex-col h-screen relative z-10`}>
        <div className="flex justify-between items-center h-[5vh] mb-8">
          <div className="flex justify-center items-center gap-5">
            <h3 className='text-[#19A297] text-xs'>هنرستان استارتاپی رکاد</h3>
            <BiSolidSchool className='text-[#19A297] ml-[-10px] scale-150' />
            <div className='w-8 flex justify-center items-center border border-gray-400 h-8 rounded-full'>
              <IoNotificationsOutline className='text-gray-400 scale-100' />
            </div>
          </div>
          <div className="flex justify-center items-center gap-5">
            <p className='text-gray-400 text-xs'> امروز {week} {day} {month} ماه، {year}</p>
            <h1 className='text-[#19A297] font-semibold text-lg'>جداول و گزارشات</h1>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* کارت گزارشات */}
          <div
            className={`flex-1 relative bg-[#FFF0F0] rounded-lg p-6 flex items-center justify-between shadow-sm cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105 border-2 ${selectedType === 'reports' ? 'border-red-500 ring-2 ring-red-300' : 'border-transparent'}`}
            onClick={() => handleTypeSelect('reports')}
          >
            <div className="absolute inset-0 opacity-50 bg-gradient-radial from-red-200/30 via-transparent to-transparent rounded-lg"></div>
            <button className="mt-3 bg-white text-red-500 text-xs font-semibold px-5 py-1.5 rounded-full shadow-md hover:bg-red-50 transition-colors">
              مشاهده
            </button>
            <div className="z-10 flex items-center gap-5">
              <h2 className='text-red-600 font-bold text-2xl'>گزارشات</h2>
              <div className="bg-red-500 flex justify-center items-center w-14 h-14 rounded-full z-10 flex-shrink-0">

                <BsClipboardData className='text-white scale-150' />
              </div>
            </div>



          </div>
          {/* کارت جداول */}
          <div
            className={`flex-1 relative bg-[#FFF0F0] rounded-lg p-6 flex items-center justify-between shadow-sm cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105 border-2 ${selectedType === 'tables' ? 'border-red-500 ring-2 ring-red-300' : 'border-transparent'}`}
            onClick={() => handleTypeSelect('tables')}
          >
            <div className="absolute inset-0 opacity-50 bg-gradient-radial from-red-200/30 via-transparent to-transparent rounded-lg"></div>
            <button className="mt-3 bg-white text-red-500 text-xs font-semibold px-5 py-1.5 rounded-full shadow-md hover:bg-red-50 transition-colors">
              مشاهده
            </button>
            <div className="z-10 flex items-center gap-5">
              <h2 className='text-red-600 font-bold text-2xl'>جداول</h2>
              <div className="bg-red-500 flex justify-center items-center w-14 h-14 rounded-full z-10 flex-shrink-0">

                <BsTable className='text-white scale-150' />
              </div>
            </div>




          </div>
        </div>

        {selectedType === 'reports' && (
          <div className="bg-[#F0F4FF] p-6 rounded-lg shadow-md">
            {/* فرم گزارشات بدون تغییر */}
            <form onSubmit={handleGetReport}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-4 mb-5">
                <FilterDropdown label="عنوان گزارش" name="title" value={reportFilters.title} onChange={handleInputChange} placeholder="مثلا گزارش هفتگی" />
                <FilterDropdown label="پایه" name="grade" value={reportFilters.grade} onChange={handleInputChange} placeholder="دهم" />
                <FilterDropdown label="انتخاب دانش‌آموزان" name="students" value={reportFilters.students} onChange={handleInputChange} placeholder="همه دانش آموزان" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 mb-6">
                <DatePickerField label="از تاریخ" name="fromDate" value={reportFilters.fromDate} onChange={handleInputChange} placeholder="۱۴۰۳/۰۱/۰۱" />
                <DatePickerField label="تا تاریخ" name="toDate" value={reportFilters.toDate} onChange={handleInputChange} placeholder="۱۴۰۳/۰۱/۰۷" />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-3 px-4 rounded-lg transition duration-150 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
              >
                دریافت گزارش
              </button>
            </form>
          </div>
        )}

        {selectedType === 'tables' && (
          <div className="bg-[#F0F4FF] p-6 rounded-lg shadow-md">
            <div className="flex flex-row-reverse items-center justify-center gap-x-3 mb-6"> {/* flex-row-reverse for RTL display order */}
              {/* دکمه فلش برای ناوبری */}

              {/* دکمه های پایه */}
              {reversedGradeButtonsForDisplay.map((grade) => ( // map روی آرایه معکوس شده
                <button
                  key={grade.value}
                  onClick={() => handleGradeSelect(grade.value)}
                  className={`text-center px-6 sm:px-8 py-3 rounded-md text-base sm:text-lg w-full font-semibold transition-all duration-200 ease-in-out shadow
                                        ${selectedGrade === grade.value
                      ? 'bg-[#202A5A] text-white scale-105 min-w-[100px] sm:min-w-[120px]' // Active
                      : 'bg-white text-indigo-500 hover:bg-indigo-50 min-w-[90px] sm:min-w-[110px]' // Inactive
                    }`}
                >
                  {grade.label}
                </button>
              ))}
            </div>

            {selectedGrade ? (
              <GradeTable grade={selectedGrade} />
            ) : (
              <p className="text-center text-gray-600 mt-8 text-lg">
                لطفاً یک پایه را برای مشاهده جدول انتخاب کنید.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}