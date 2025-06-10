// =========================================================================
// ResultsPageContainer.jsx (کامل با UI فرم گزارشات)
// =========================================================================
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import union from '../../assets/images/Union4.png';

import { BiSolidSchool } from "react-icons/bi";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import { BsClipboardData, BsTable, BsCalendarEvent } from "react-icons/bs";
import GradeTable from './GradeTable';
import fetchData from '../../Utils/fetchData';

// کامپوننت‌های داخلی برای فرم گزارشات
const FilterDropdown = ({ label, options = [], name, value, onChange, placeholder, disabled = false }) => (
    <div className="relative w-full">
      <label className="text-xs text-gray-700 mb-1 block text-right">{label}</label>
      <div className={`bg-white border border-gray-300 rounded-md px-3 py-2.5 flex items-center justify-between text-sm h-[42px] ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:border-indigo-400'}`}>
        <span className={`flex-grow text-right ${value ? 'text-gray-800' : 'text-gray-400'}`}>{value || placeholder || `انتخاب ${label}`}</span>
        {!disabled && <IoIosArrowDown className="text-gray-400 mr-2" />}
      </div>
      {/* برای select واقعی، باید یک <select> واقعی با options اینجا رندر کنید یا از یک کتابخانه استفاده نمایید */}
      {/* مثال ساده:
      {!disabled && options.length > 0 && (
        <select name={name} value={value} onChange={onChange} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer">
            <option value="">{placeholder || `انتخاب ${label}`}</option>
            {options.map(opt => (
                <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
            ))}
        </select>
      )}
      */}
    </div>
);

const DatePickerField = ({ label, name, value, onChange, placeholder, disabled = false }) => (
    <div className="relative w-full">
      <label className="text-xs text-gray-700 mb-1 block text-right">{label}</label>
      <div className={`bg-white border border-gray-300 rounded-md px-3 py-2.5 flex items-center justify-between text-sm h-[42px] ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-default'}`}>
        <span className={`flex-grow text-right ${value ? 'text-gray-800' : 'text-gray-400'}`}>{value || placeholder || `انتخاب تاریخ`}</span>
        {!disabled && <BsCalendarEvent className={`mr-2 scale-110 ${disabled ? 'text-gray-300' : 'text-gray-500'}`} />}
      </div>
      {/* برای DatePicker واقعی، باید از یک کتابخانه یا input type="date" استفاده کنید */}
      {/* مثال ساده:
      {!disabled && (
          <input type="date" name={name} value={value} onChange={onChange} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"/>
      )}
      */}
    </div>
);

// دکمه های پایه
const GRADE_BUTTONS = [
    { label: "دهم", value: "دهم" },
    { label: "یازدهم", value: "یازدهم" },
    { label: "دوازدهم", value: "دوازدهم" },
];

export default function ResultsPageContainer({ Open }) {
  const token = localStorage.getItem("token");

  const date = new Date();
  const month = new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(date);
  const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
  const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date)
  const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(date);

  const [selectedType, setSelectedType] = useState('tables');
  const [selectedGrade, setSelectedGrade] = useState('');
  // const [gradeDataCounts, setGradeDataCounts] = useState({}); // حذف شد

  const [reportFilters, setReportFilters] = useState({
    title: '', // عنوان گزارش (متنی)
    grade: '', // پایه تحصیلی (از GRADE_BUTTONS)
    students: '', // شناسه دانش‌آموز یا "همه"
    activityParent: '', // دسته فعالیت (اختیاری)
    fromDate: '', // تاریخ شروع
    toDate: '',   // تاریخ پایان
  });
  const [submittingReport, setSubmittingReport] = useState(false);
  // const [studentsForSelection, setStudentsForSelection] = useState([]); // برای لیست دانش‌آموزان در دراپ‌داون
  // const [loadingStudents, setLoadingStudents] = useState(false);

  const gradeButtons = GRADE_BUTTONS;


  const handleTypeSelect = (type) => {
    setSelectedType(type);
    if (type === 'tables' && !selectedGrade && gradeButtons.length > 0) {
      setSelectedGrade(gradeButtons[0].value);
    } else if (type !== 'tables') {
      setSelectedGrade('');
    }
    // ریست فیلترهای گزارشات هنگام تغییر نوع
    setReportFilters({ title: '', grade: '', students: '', activityParent: '', fromDate: '', toDate: '' });
  };

  const handleReportFilterChange = (e) => { // تغییر نام برای وضوح
    const { name, value } = e.target;
    setReportFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleGetReport = async (e) => {
    e.preventDefault();
    // اعتبارسنجی اولیه فیلترها
    // if (!reportFilters.students) { // یا هر فیلد الزامی دیگر
    //     alert("لطفاً حداقل یک دانش‌آموز یا گروه را برای گزارش انتخاب کنید.");
    //     return;
    // }
    setSubmittingReport(true);
    console.log("درخواست گزارش با فیلترهای:", reportFilters);

    // TODO: اینجا درخواست API برای دریافت گزارش بر اساس reportFilters ارسال می‌شود
    // مثال:
    // try {
    //   let queryParams = `studentId=${reportFilters.students}`;
    //   if (reportFilters.fromDate) queryParams += `&fromDate=${reportFilters.fromDate}`;
    //   // ... بقیه پارامترها
    //   const response = await fetchData(`users/report/student-activities?${queryParams}`, {
    //     headers: { authorization: `Bearer ${token}` }
    //   });
    //   if (response.success) {
    //      // نمایش داده‌های گزارش (که در این مثال پیاده‌سازی نشده)
    //     console.log("Report Data:", response.data);
    //     alert("گزارش با موفقیت دریافت شد (در کنسول ببینید).");
    //   } else {
    //     alert("خطا در دریافت گزارش: " + response.message);
    //   }
    // } catch (error) {
    //   alert("خطای شبکه در دریافت گزارش: " + error.message);
    // }

    await new Promise(resolve => setTimeout(resolve, 1000)); // شبیه‌سازی تاخیر شبکه
    alert("قابلیت دریافت گزارش در حال حاضر فقط UI است و به API متصل نیست. فیلترها در کنسول ثبت شدند.");
    setSubmittingReport(false);
  };

  const handleGradeSelect = (gradeValue) => {
    setSelectedGrade(gradeValue);
  };

  // const handleGradeDataLoad = useCallback( /* ... */ , []); // حذف شد

  useEffect(() => {
    if (selectedType === 'tables' && !selectedGrade && gradeButtons.length > 0) {
      setSelectedGrade(gradeButtons[0].value);
    }
  }, [selectedType, selectedGrade, gradeButtons]);


  return (
    <>
      <img src={union} className='absolute scale-75 top-[-4rem] left-[-10rem] z-0 opacity-30' alt="" />
      <div className={`${!Open ? "w-[calc(100%-1rem)] md:w-[80%]" : "w-[calc(100%-1rem)] md:w-[94%]"} p-4 md:p-8 transition-all duration-500 flex flex-col h-screen relative z-10 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}>
        {/* هدر */}
        <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-[5vh] mb-8">
          <div className="flex justify-center items-center gap-3 sm:gap-5 mb-3 sm:mb-0">
            <h3 className='text-[#19A297] text-xs sm:text-sm'>هنرستان استارتاپی رکاد</h3>
            <BiSolidSchool className='text-[#19A297] ml-[-8px] sm:ml-[-10px] text-lg sm:text-xl' />
            <div className='w-7 h-7 sm:w-8 sm:h-8 flex justify-center items-center border border-gray-300 rounded-full cursor-pointer'>
              <IoNotificationsOutline className='text-gray-400 text-sm sm:text-base' />
            </div>
          </div>
          <div className="flex justify-center items-center gap-3 sm:gap-5">
            <p className='text-gray-400 text-xs sm:text-sm'> امروز {week}، {day} {month}، {year}</p>
            <h1 className='text-[#19A297] font-semibold text-base sm:text-lg'>جداول و گزارشات</h1>
          </div>
        </div>

        {/* انتخاب نوع: گزارش یا جدول */}
        <div className="flex flex-col md:flex-row gap-5 md:gap-6 mb-8">
          {/* کارت گزارشات */}
          <div
            className={`flex-1 relative rounded-xl p-5 sm:p-6 flex items-center justify-between shadow-lg cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.03] border-2 
                        ${selectedType === 'reports' ? 'bg-rose-500 text-white border-rose-600 ring-4 ring-rose-300/50' : 'bg-white text-rose-700 border-rose-200 hover:border-rose-400'}`}
            onClick={() => handleTypeSelect('reports')}
          >
             <div className={`absolute inset-0 opacity-20 rounded-xl ${selectedType === 'reports' ? 'bg-gradient-radial from-white/30 via-transparent to-transparent' : 'bg-gradient-radial from-rose-200/30 via-transparent to-transparent'}`}></div>
            <div className="z-10 flex-grow text-right">
                <h2 className={`font-bold text-xl sm:text-2xl mb-1 ${selectedType === 'reports' ? 'text-white' : 'text-rose-600'}`}>گزارشات</h2>
                <p className={`text-xs sm:text-sm ${selectedType === 'reports' ? 'text-rose-100' : 'text-rose-500'}`}>مشاهده و تولید گزارش‌های دوره‌ای</p>
            </div>
            <div className={`p-3 sm:p-4 rounded-full z-10 flex-shrink-0 transition-colors ${selectedType === 'reports' ? 'bg-white/20' : 'bg-rose-100'}`}>
                <BsClipboardData className={`text-2xl sm:text-3xl ${selectedType === 'reports' ? 'text-white' : 'text-rose-500'}`} />
            </div>
          </div>
          {/* کارت جداول */}
          <div
            className={`flex-1 relative rounded-xl p-5 sm:p-6 flex items-center justify-between shadow-lg cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.03] border-2 
                        ${selectedType === 'tables' ? 'bg-indigo-500 text-white border-indigo-600 ring-4 ring-indigo-300/50' : 'bg-white text-indigo-700 border-indigo-200 hover:border-indigo-400'}`}
            onClick={() => handleTypeSelect('tables')}
          >
            <div className={`absolute inset-0 opacity-20 rounded-xl ${selectedType === 'tables' ? 'bg-gradient-radial from-white/30 via-transparent to-transparent' : 'bg-gradient-radial from-indigo-200/30 via-transparent to-transparent'}`}></div>
            <div className="z-10 flex-grow text-right">
                <h2 className={`font-bold text-xl sm:text-2xl mb-1 ${selectedType === 'tables' ? 'text-white' : 'text-indigo-600'}`}>جداول امتیازات</h2>
                <p className={`text-xs sm:text-sm ${selectedType === 'tables' ? 'text-indigo-100' : 'text-indigo-500'}`}>مشاهده رتبه‌بندی دانش‌آموزان</p>
            </div>
            <div className={`p-3 sm:p-4 rounded-full z-10 flex-shrink-0 transition-colors ${selectedType === 'tables' ? 'bg-white/20' : 'bg-indigo-100'}`}>
                <BsTable className={`text-2xl sm:text-3xl ${selectedType === 'tables' ? 'text-white' : 'text-indigo-500'}`} />
            </div>
          </div>
        </div>


        {selectedType === 'reports' && (
          <div className="bg-rose-50 p-6 rounded-xl shadow-lg border border-rose-200/80 animate-fadeIn">
            <h3 className="text-lg font-semibold text-rose-700 mb-6 text-center">تنظیمات گزارش فعالیت‌ها</h3>
            <form onSubmit={handleGetReport}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-5 mb-5">
                <FilterDropdown
                  label="عنوان گزارش (اختیاری)"
                  name="title"
                  value={reportFilters.title}
                  onChange={handleReportFilterChange}
                  placeholder="مثلا گزارش هفتگی دانش‌آموز X"
                />
                <FilterDropdown
                  label="پایه (اختیاری)"
                  name="grade"
                  value={reportFilters.grade}
                  onChange={handleReportFilterChange}
                  options={gradeButtons} // باید به صورت [{label: 'دهم', value: 'دهم'}, ...] باشد
                  placeholder="همه پایه‌ها"
                />
                <FilterDropdown
                  label="دانش‌آموز" // این باید یک select واقعی با لیست دانش‌آموزان باشد
                  name="students" // یا studentId
                  value={reportFilters.students}
                  onChange={handleReportFilterChange}
                  placeholder="انتخاب دانش‌آموز (الزامی)"
                  // options={studentsForSelection.map(s => ({label: s.fullName, value: s._id}))} // مثال
                  // disabled={loadingStudents}
                />
                 <FilterDropdown
                  label="دسته فعالیت (اختیاری)"
                  name="activityParent"
                  value={reportFilters.activityParent}
                  onChange={handleReportFilterChange}
                  options={['فعالیت‌های آموزشی', 'فعالیت‌های داوطلبانه و توسعه فردی', 'فعالیت‌های شغلی', 'موارد کسر امتیاز'].map(p => ({label:p, value:p}))}
                  placeholder="همه دسته‌ها"
                />
                <DatePickerField
                  label="از تاریخ"
                  name="fromDate"
                  value={reportFilters.fromDate}
                  onChange={(e) => handleReportFilterChange({target: {name: 'fromDate', value: e.target.value}})} // اگر از input date استفاده می‌کنید
                  placeholder="مثلا ۱۴۰۳/۰۱/۰۱"
                />
                <DatePickerField
                  label="تا تاریخ"
                  name="toDate"
                  value={reportFilters.toDate}
                  onChange={(e) => handleReportFilterChange({target: {name: 'toDate', value: e.target.value}})}
                  placeholder="مثلا ۱۴۰۳/۰۱/۰۷"
                />
              </div>
              <button
                type="submit"
                disabled={submittingReport}
                className="w-full mt-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50 disabled:bg-gray-400"
              >
                {submittingReport ? "در حال آماده‌سازی..." : "دریافت گزارش"}
              </button>
            </form>
            {/* TODO: اینجا باید نتایج گزارش نمایش داده شود */}
          </div>
        )}

        {selectedType === 'tables' && (
          <div className="bg-indigo-50 p-6 rounded-xl shadow-lg border border-indigo-200/80 animate-fadeIn">
            <h3 className="text-lg font-semibold text-indigo-700 mb-6 text-center">انتخاب پایه برای مشاهده جدول</h3>
            <div className="flex flex-row-reverse items-center justify-center gap-x-2 sm:gap-x-3 mb-6">
              {gradeButtons.map((gradeButton) => ( // استفاده از gradeButtons برای ترتیب دهم، یازدهم، دوازدهم از راست
                <button
                  key={gradeButton.value}
                  onClick={() => handleGradeSelect(gradeButton.value)}
                  className={`text-center px-5 sm:px-7 py-2.5 rounded-lg text-sm sm:text-base min-w-[90px] sm:min-w-[110px] font-medium transition-all duration-200 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2
                                        ${selectedGrade === gradeButton.value
                      ? 'bg-[#1E295A] text-white scale-105 ring-[#1E295A]'
                      : 'bg-white text-indigo-600 hover:bg-indigo-100 ring-indigo-300'
                    }`}
                >
                  {gradeButton.label}
                </button>
              ))}
            </div>

            {selectedGrade ? (
              <GradeTable
                key={selectedGrade}
                grade={selectedGrade}
                token={token}
                // onDataLoad دیگر لازم نیست
              />
            ) : (
              <div className="text-center text-gray-500 mt-8 py-10 bg-white/60 rounded-md shadow">
                <BsTable size={40} className="mx-auto mb-3 text-indigo-300" />
                <p className="text-lg"> لطفاً یک پایه را برای مشاهده جدول امتیازات انتخاب کنید. </p>
              </div>
            )}
          </div>
        )}
        <div className="pb-10"></div>
      </div>
    </>
  );
}