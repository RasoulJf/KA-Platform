// GradeTable.jsx
import React, { useState, useEffect } from 'react';
import fetchData from '../../../Utils/fetchData';

// headerConfig رو می‌تونیم اینجا هم تعریف کنیم یا از والد بگیریم
const headerConfig = [
  { title: "نام و نام‌خانوادگی", key: "name", headerClass: "bg-gray-100 text-gray-700", cellClass: "text-gray-800 font-medium" },
  { title: "کلاس", key: "class", headerClass: "bg-gray-100 text-gray-700", cellClass: "text-indigo-700" },
  { title: "فعالیت‌های آموزشی", key: "educationalActivities", headerClass: "bg-purple-600 text-white", cellClass: "text-purple-700 font-semibold" },
  { title: "ف. داوطلبانه و ت. فردی", key: "voluntaryActivities", headerClass: "bg-pink-500 text-white", cellClass: "text-pink-700 font-semibold" },
  { title: "فعالیت‌های شغلی", key: "jobActivities", headerClass: "bg-yellow-400 text-yellow-800", cellClass: "text-yellow-700 font-semibold" },
  { title: "کسر امتیازات", key: "deductions", headerClass: "bg-gray-600 text-white", cellClass: "text-gray-700 font-semibold" },
  { title: "امتیاز کل", key: "score", headerClass: "bg-gray-100 text-gray-700", cellClass: "text-indigo-700 font-bold" },
  { title: "رتبه در پایه", key: "rank", headerClass: "bg-gray-100 text-gray-700", cellClass: "text-indigo-700 font-bold" },
].reverse(); // برای map کردن در JSX


const formatNumberToPersianTable = (num) => { // اسم تابع تغییر کرد برای جلوگیری از تداخل
    if (num === undefined || num === null || isNaN(Number(num))) return "۰";
    if (num < 0) return `(${Math.abs(num).toLocaleString('fa-IR')}-)`;
    return Number(num).toLocaleString('fa-IR');
};

export default function GradeTable({ grade, token, onDataLoad }) { // token و onDataLoad از والد می‌آیند
    const [tableData, setTableData] = useState([]);
    const [loadingTable, setLoadingTable] = useState(true);
    const [errorTable, setErrorTable] = useState(null);
    // صفحه‌بندی برای هر جدول پایه (اختیاری)
    const [currentPageTable, setCurrentPageTable] = useState(1);
    const [totalPagesTable, setTotalPagesTable] = useState(1);

    useEffect(() => {
        const fetchGradeData = async (page = 1) => {
            if (!grade || !token) {
                setTableData([]); // اگر پایه یا توکن نیست، داده‌ها را خالی کن
                setLoadingTable(false);
                if (!grade) setErrorTable("پایه‌ای برای نمایش جدول انتخاب نشده است.");
                return;
            }
            setLoadingTable(true);
            setErrorTable(null);
            try {
                // ارسال grade به عنوان پارامتر کوئری
                const response = await fetchData(`users/grade-rankings?grade=${encodeURIComponent(grade)}&page=${page}&limit=15`, {
                    headers: { authorization: `Bearer ${token}` }
                });

                console.log(`--- GradeTable (${grade}) - Data from API ---`);
                console.log("Raw response:", JSON.stringify(response, null, 2));

                if (response.success && Array.isArray(response.data)) {
                    const formattedData = response.data.map((item, index) => ({
                        ...item,
                        educationalActivities: formatNumberToPersianTable(item.educationalActivities),
                        voluntaryActivities: formatNumberToPersianTable(item.voluntaryActivities),
                        jobActivities: formatNumberToPersianTable(item.jobActivities),
                        deductions: formatNumberToPersianTable(item.deductions),
                        score: formatNumberToPersianTable(item.score),
                        rank: formatNumberToPersianTable(item.rank),
                        isOdd: index % 2 !== 0, // برای استایل‌دهی ردیف‌های زوج و فرد
                    }));
                    setTableData(formattedData);
                    setCurrentPageTable(page);
                    console.log(response)
                    setTotalPagesTable(Math.ceil((response.totalCount || 0) / 15));
                    if (onDataLoad) onDataLoad({ grade, count: response.totalCount || 0 }); // اطلاع به والد از تعداد نتایج
                } else {
                    setErrorTable(response.message || `خطا در دریافت داده‌های پایه ${grade}.`);
                    setTableData([]);
                }
            } catch (err) {
                setErrorTable(`خطای شبکه (پایه ${grade}): ` + (err.message || "خطای ناشناخته"));
                setTableData([]);
            } finally {
                setLoadingTable(false);
            }
        };

        fetchGradeData(currentPageTable); // با تغییر پایه یا صفحه، دوباره فچ کن

    }, [grade, token, currentPageTable, onDataLoad]); // به onDataLoad هم وابسته شد

    const handlePageChangeTable = (newPage) => {
        if (newPage >= 1 && newPage <= totalPagesTable && !loadingTable) {
            console.log(totalPagesTable)
            setCurrentPageTable(newPage);
        }
      };

    if (loadingTable) {
        return <p className="text-center text-gray-500 mt-6 py-4">در حال بارگذاری جدول پایه {grade}...</p>;
    }
    if (errorTable) {
        return <p className="text-center text-red-500 mt-6 py-4 bg-red-50 rounded-md">{errorTable}</p>;
    }
    if (!tableData.length) {
        return <p className="text-center text-gray-500 mt-6 py-4">داده‌ای برای نمایش در پایه {grade} وجود ندارد.</p>;
    }

    // استایل‌های هدر و سلول از headerConfig که در بالا تعریف شده، خوانده می‌شود
    // یا می‌توانید آنها را مستقیماً اینجا تعریف کنید.

    return (
        <div className="mt-6 bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
                <thead className="bg-[#F0F4FF] text-xs uppercase sticky top-0 z-10 shadow-sm">
                    <tr>
                        {headerConfig.map(header => (
                            <th key={header.key} className={`px-3 py-3 font-semibold text-center ${header.headerClass} ${header.key === 'deductions' ? '!bg-red-500' : ''}`}>
                                {header.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {tableData.map((row) => (
                        <tr key={row.id} className={`${row.isOdd ? 'bg-[#F9F9FF]' : 'bg-white'} hover:bg-indigo-50/70 transition-colors text-xs`}>
                            {headerConfig.map(header => (
                                <td key={`${row.id}-${header.key}`} className={`px-3 py-2.5 whitespace-nowrap text-center ${header.cellClass}`}>
                                    {row[header.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* صفحه‌بندی برای جدول هر پایه */}
            {totalPagesTable > 1 && (
                <div className="flex justify-center items-center space-x-1 sm:space-x-2 space-x-reverse py-4 border-t">
                    <button onClick={() => handlePageChangeTable(currentPageTable - 1)} disabled={currentPageTable === 1 || loadingTable} className="px-3 py-1.5 text-xs sm:text-sm bg-gray-200 hover:bg-gray-300 rounded-md disabled:opacity-50"> قبلی </button>
                    {/* ... منطق نمایش شماره صفحات ... */}
                    <button onClick={() => handlePageChangeTable(currentPageTable + 1)} disabled={currentPageTable === totalPagesTable - 1 || loadingTable} className="px-3 py-1.5 text-xs sm:text-sm bg-gray-200 hover:bg-gray-300 rounded-md disabled:opacity-50"> بعدی </button>
                </div>
            )}
        </div>
    );
}