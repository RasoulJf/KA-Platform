// ResultsPageContainer.jsx (کامل و نهایی با گزارش‌های جدید)

import React, { useState, useEffect } from 'react';
import union from '../../assets/images/Union4.png';
import { BiSolidSchool } from "react-icons/bi";
import { IoMdNotificationsOutline, IoIosArrowDown } from "react-icons/io";
import { BsClipboardData, BsTable, BsCalendarEvent } from "react-icons/bs";
import GradeTable from './GradeTable';
import fetchData from '../../Utils/fetchData';

// کامپوننت‌های Dropdown و DatePicker (بدون تغییر)
const FilterDropdown = ({ label, name, value, onChange, options, placeholder, disabled = false }) => (
  <div className="w-full">
    <label className="text-xs text-gray-700 mb-1 block text-right">{label}</label>
    <div className="relative">
      <select
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className="w-full bg-white border border-gray-300 rounded-md px-3 py-2.5 text-sm h-[42px] appearance-none text-right cursor-pointer hover:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <IoIosArrowDown className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  </div>
);
const DatePickerField = ({ label, name, value, onChange, disabled = false }) => (
  <div className="w-full">
    <label className="text-xs text-gray-700 mb-1 block text-right">{label}</label>
    <input
      type="date"
      name={name}
      value={value || ''}
      onChange={onChange}
      disabled={disabled}
      className="w-full bg-white border border-gray-300 rounded-md px-3 py-2.5 text-sm h-[42px] text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
    />
  </div>
);


// ثابت‌ها
const GRADE_BUTTONS = [{ label: "دهم", value: "دهم" }, { label: "یازدهم", value: "یازدهم" }, { label: "دوازدهم", value: "دوازدهم" }];

// ✅ FIX: لیست انواع گزارش‌ها بر اساس نیازمندی جدید آپدیت شد
const REPORT_TYPES = [
  // گزارش‌های مربوط به فعالیت‌ها
  { label: "گزارش کلی همه فعالیت‌ها", value: "all_activities" },
  { label: "گزارش فعالیت‌های تایید شده (دانش‌آموز)", value: "approved_student_activities" },
  { label: "گزارش فعالیت‌های تایید شده (ادمین)", value: "admin_activities" },
  { label: "گزارش فعالیت‌های در انتظار بررسی", value: "pending_activities" },
  { label: "گزارش فعالیت‌های رد شده", value: "rejected_activities" },

  // گزارش‌های مربوط به پاداش‌ها
  { label: "گزارش کلی همه پاداش‌ها", value: "all_rewards" },
  { label: "گزارش پاداش‌های تایید شده", value: "approved_rewards" },
  { label: "گزارش پاداش‌های در انتظار", value: "requested_rewards" }, // درخواستی توسط دانش‌آموز همان در انتظار است
  { label: "گزارش پاداش‌های رد شده", value: "rejected_rewards" },
];


export default function ResultsPageContainer({ Open }) {
  const [selectedType, setSelectedType] = useState('tables');
  const [selectedGrade, setSelectedGrade] = useState('');

  const [reportFilters, setReportFilters] = useState({
    reportType: '',
    grade: '',
    studentId: '',
    fromDate: '',
    toDate: '',
  });

  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [studentsForSelection, setStudentsForSelection] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingStudents(true);
      let url = 'users/students-selection';
      if (reportFilters.grade) {
        url += `?grade=${encodeURIComponent(reportFilters.grade)}`;
      }
      try {
        const response = await fetchData(url, { headers: { authorization: `Bearer ${token}` } });
        if (response.success) {
          setStudentsForSelection(response.data.map(s => ({ value: s.value, label: s.label })));
        } else { throw new Error(response.message); }
      } catch (error) {
        setReportError(`خطا در دریافت لیست دانش‌آموزان: ${error.message}`);
        setStudentsForSelection([]);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [reportFilters.grade, token]);

  const handleTypeSelect = (type) => { setSelectedType(type); };

  const handleReportFilterChange = (e) => {
    const { name, value } = e.target;
    setReportFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      if (name === 'grade') newFilters.studentId = '';
      return newFilters;
    });
  };

  const handleGetReport = async (e) => {
    e.preventDefault();

    if (!reportFilters.reportType) {
      setReportError("لطفاً ابتدا نوع گزارش را انتخاب کنید.");
      return;
    }
    setSubmittingReport(true);
    setReportError(null);

    const filtersToSend = { reportType: reportFilters.reportType };
    if (reportFilters.grade) filtersToSend.grade = reportFilters.grade;
    if (reportFilters.studentId) filtersToSend.students = [reportFilters.studentId];
    if (reportFilters.fromDate) filtersToSend.fromDate = reportFilters.fromDate;
    if (reportFilters.toDate) filtersToSend.toDate = reportFilters.toDate;

    console.log("Sending filters to backend:", JSON.stringify(filtersToSend));

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}reports/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(filtersToSend)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `خطای سرور: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;

      let filename = `report.xlsx`;
      const disposition = response.headers.get('content-disposition');
      if (disposition && disposition.includes('attachment')) {
        const filenameMatch = disposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?/);
        if (filenameMatch && filenameMatch[1]) {
          try {
            filename = decodeURIComponent(filenameMatch[1]);
          } catch (e) {
            filename = filenameMatch[1]; // fallback
          }
        }
      }
      a.download = filename;

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      a.remove();

    } catch (error) {
      console.error("Error generating report:", error);
      setReportError(error.message);
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleGradeSelect = (gradeValue) => { setSelectedGrade(gradeValue); };

  useEffect(() => {
    if (selectedType === 'tables' && !selectedGrade) {
      setSelectedGrade(GRADE_BUTTONS[0].value);
    }
  }, [selectedType, selectedGrade]);

  const date = new Date();
  const dateInfo = {
    month: new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(date),
    day: new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date),
    year: new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date),
    week: new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(date),
  };

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
              <IoMdNotificationsOutline className='text-gray-400 text-sm sm:text-base' />
            </div>
          </div>
          <div className="flex justify-center items-center gap-3 sm:gap-5">
            <p className='text-gray-400 text-xs sm:text-sm'> امروز {dateInfo.week}، {dateInfo.day} {dateInfo.month}، {dateInfo.year}</p>
            <h1 className='text-[#19A297] font-semibold text-base sm:text-lg'>جداول و گزارشات</h1>
          </div>
        </div>

        {/* انتخاب نوع: گزارش یا جدول */}
        <div className="flex flex-col md:flex-row gap-5 md:gap-6 mb-8">
          <div onClick={() => handleTypeSelect('reports')} className={`flex-1 relative rounded-xl p-5 sm:p-6 flex items-center justify-between shadow-lg cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.03] border-2 ${selectedType === 'reports' ? 'bg-rose-500 text-white border-rose-600 ring-4 ring-rose-300/50' : 'bg-white text-rose-700 border-rose-200 hover:border-rose-400'}`}>
            <div className={`absolute inset-0 opacity-20 rounded-xl ${selectedType === 'reports' ? 'bg-gradient-radial from-white/30 via-transparent to-transparent' : 'bg-gradient-radial from-rose-200/30 via-transparent to-transparent'}`}></div>
            <div className="z-10 flex-grow text-right"> <h2 className={`font-bold text-xl sm:text-2xl mb-1 ${selectedType === 'reports' ? 'text-white' : 'text-rose-600'}`}>گزارشات</h2> <p className={`text-xs sm:text-sm ${selectedType === 'reports' ? 'text-rose-100' : 'text-rose-500'}`}>مشاهده و تولید گزارش‌های دوره‌ای</p> </div>
            <div className={`p-3 sm:p-4 rounded-full z-10 flex-shrink-0 transition-colors ${selectedType === 'reports' ? 'bg-white/20' : 'bg-rose-100'}`}> <BsClipboardData className={`text-2xl sm:text-3xl ${selectedType === 'reports' ? 'text-white' : 'text-rose-500'}`} /> </div>
          </div>
          <div onClick={() => handleTypeSelect('tables')} className={`flex-1 relative rounded-xl p-5 sm:p-6 flex items-center justify-between shadow-lg cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.03] border-2 ${selectedType === 'tables' ? 'bg-indigo-500 text-white border-indigo-600 ring-4 ring-indigo-300/50' : 'bg-white text-indigo-700 border-indigo-200 hover:border-indigo-400'}`}>
            <div className={`absolute inset-0 opacity-20 rounded-xl ${selectedType === 'tables' ? 'bg-gradient-radial from-white/30 via-transparent to-transparent' : 'bg-gradient-radial from-indigo-200/30 via-transparent to-transparent'}`}></div>
            <div className="z-10 flex-grow text-right"> <h2 className={`font-bold text-xl sm:text-2xl mb-1 ${selectedType === 'tables' ? 'text-white' : 'text-indigo-600'}`}>جداول امتیازات</h2> <p className={`text-xs sm:text-sm ${selectedType === 'tables' ? 'text-indigo-100' : 'text-indigo-500'}`}>مشاهده رتبه‌بندی دانش‌آموزان</p> </div>
            <div className={`p-3 sm:p-4 rounded-full z-10 flex-shrink-0 transition-colors ${selectedType === 'tables' ? 'bg-white/20' : 'bg-indigo-100'}`}> <BsTable className={`text-2xl sm:text-3xl ${selectedType === 'tables' ? 'text-white' : 'text-indigo-500'}`} /> </div>
          </div>
        </div>

        {selectedType === 'reports' && (
          <div className="bg-rose-50 p-6 rounded-xl shadow-lg border border-rose-200/80 animate-fadeIn">
            <h3 className="text-lg font-semibold text-rose-700 mb-6 text-center">تنظیمات گزارش فعالیت‌ها</h3>
            <form onSubmit={handleGetReport}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5 mb-5">
              <div></div>

                <FilterDropdown
                  label="نوع گزارش (الزامی)" name="reportType" value={reportFilters.reportType} onChange={handleReportFilterChange}
                  options={REPORT_TYPES} placeholder="لطفا یک نوع گزارش را انتخاب کنید" />
                <FilterDropdown
                  label="دانش‌آموز (اختیاری)" name="studentId" value={reportFilters.studentId} onChange={handleReportFilterChange}
                  options={studentsForSelection} placeholder="همه دانش‌آموزان" disabled={loadingStudents} />

                <FilterDropdown
                  label="پایه (اختیاری)" name="grade" value={reportFilters.grade} onChange={handleReportFilterChange}
                  options={GRADE_BUTTONS} placeholder="همه پایه‌ها" />

                <DatePickerField label="از تاریخ (اختیاری)" name="fromDate" value={reportFilters.fromDate} onChange={handleReportFilterChange} />
                <DatePickerField label="تا تاریخ (اختیاری)" name="toDate" value={reportFilters.toDate} onChange={handleReportFilterChange} />
              </div>
              {reportError && <p className="text-red-600 text-sm text-center mb-4">{reportError}</p>}
              <button type="submit" disabled={submittingReport}
                className="w-full mt-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-4 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed">
                {submittingReport ? "در حال آماده‌سازی گزارش..." : "دریافت گزارش اکسل"}
              </button>
            </form>
          </div>
        )}

        {selectedType === 'tables' && (
          <div className="bg-indigo-50 p-6 rounded-xl shadow-lg border border-indigo-200/80 animate-fadeIn">
            <h3 className="text-lg font-semibold text-indigo-700 mb-6 text-center">انتخاب پایه برای مشاهده جدول</h3>
            <div className="flex flex-row-reverse items-center justify-center gap-x-2 sm:gap-x-3 mb-6">
              {GRADE_BUTTONS.map((gradeButton) => (
                <button key={gradeButton.value} onClick={() => handleGradeSelect(gradeButton.value)}
                  className={`text-center px-5 sm:px-7 py-2.5 rounded-lg text-sm sm:text-base font-medium transition shadow-md ${selectedGrade === gradeButton.value ? 'bg-[#1E295A] text-white scale-105' : 'bg-white text-indigo-600 hover:bg-indigo-100'}`}>
                  {gradeButton.label}
                </button>
              ))}
            </div>
            {selectedGrade && <GradeTable key={selectedGrade} grade={selectedGrade} token={token} />}
          </div>
        )}
        <div className="pb-10"></div>
      </div>
    </>
  );
}