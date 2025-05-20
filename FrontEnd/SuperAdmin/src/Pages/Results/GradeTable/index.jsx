// GradeTable.js
import React from 'react';

const GradeTable = ({ grade }) => {
    // داده‌های نمونه - شما باید این داده‌ها را بر اساس پایه (grade) از API یا منبع دیگر واکشی کنید
    const allSampleData = {
        '10': [
            { id: '10-1', name: 'علی محمدی‌نیا', class: '۱۰۲', eduActivity: '۳۷۹', volunteerActivity: '۲۲۵', jobActivity: '۱۵۸', deduction: '۲۲۰', points: '۲۲۰ K', rank: '۱' },
            { id: '10-2', name: 'سارا رضایی', class: '۱۰۱', eduActivity: '۳۵۰', volunteerActivity: '۲۰۰', jobActivity: '۱۴۰', deduction: '۱۹۰', points: '۲۰۰ K', rank: '۲' },
            { id: '10-3', name: 'محمد حسینی', class: '۱۰۲', eduActivity: '۳۸۰', volunteerActivity: '۲۱۰', jobActivity: '۱۶۰', deduction: '۲۱۰', points: '۲۱۵ K', rank: '۳' },
            { id: '10-4', name: 'فاطمه احمدی', class: '۱۰۳', eduActivity: '۳۷۰', volunteerActivity: '۲۱۵', jobActivity: '۱۵۵', deduction: '۲۰۵', points: '۲۱۰ K', rank: '۴' },
            { id: '10-5', name: 'امیر کریمی', class: '۱۰۱', eduActivity: '۳۶۰', volunteerActivity: '۱۹۵', jobActivity: '۱۳۵', deduction: '۱۸۰', points: '۱۹۵ K', rank: '۵' },
        ],
        '11': [ // داده های نمونه برای پایه یازدهم
            { id: '11-1', name: 'زهرا قاسمی', class: '۱۱۲', eduActivity: '۳۹۰', volunteerActivity: '۲۳۰', jobActivity: '۱۷۰', deduction: '۲۰۰', points: '۲۵۰ K', rank: '۱' },
            { id: '11-2', name: 'رضا محمودی', class: '۱۱۱', eduActivity: '۳۶۰', volunteerActivity: '۲۱۰', jobActivity: '۱۵۰', deduction: '۱۸۰', points: '۲۲۰ K', rank: '۲' },
        ],
        '12': [ // داده های نمونه برای پایه دوازدهم
            { id: '12-1', name: 'مریم اکبری', class: '۱۲۲', eduActivity: '۴۰۰', volunteerActivity: '۲۴۰', jobActivity: '۱۸۰', deduction: '۱۹۵', points: '۲۶۰ K', rank: '۱' },
        ],
    };

    const dataToDisplay = (allSampleData[grade] || []).map((item, index) => ({ ...item, isOdd: index % 2 !== 0 }));

    if (!dataToDisplay.length) {
        return <p className="text-center text-gray-500 mt-6">داده‌ای برای نمایش در پایه {grade} وجود ندارد.</p>;
    }

    const headerCellStyle = "px-3 py-3 text-center text-xs font-semibold text-[#202A5A] border-b border-gray-200 tracking-tight"; // tracking-tight برای جلوگیری از شکستن کلمات طولانی
    const dataCellStyle = "px-3 py-3.5 text-center text-sm whitespace-nowrap text-indigo-800";

    return (
        <div className="mt-6 bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse"> {/* min-w برای اسکرول افقی در صورت نیاز */}
                <thead className="bg-[#F0F4FF]">
                    <tr>
                        {/* ترتیب ستون‌ها برای نمایش صحیح در RTL */}
                        <th className={`${headerCellStyle} !bg-amber-400 text-white`}>رتبه</th>
                        <th className={`${headerCellStyle} !bg-blue-500 text-white`}>امتیاز</th>
                        <th className={`${headerCellStyle} !bg-red-500 text-white`}>کسر امتیازات</th>
                        <th className={headerCellStyle}>فعالیت‌های شغلی</th>
                        <th className={headerCellStyle}>فعالیت‌های داوطلبانه و توسعه فردی</th>
                        <th className={headerCellStyle}>فعالیت‌های آموزشی</th>
                        <th className={headerCellStyle}>کلاس</th>
                        <th className={headerCellStyle}>نام و نام‌خانوادگی</th>
                    </tr>
                </thead>
                <tbody>
                    {dataToDisplay.map((row) => (
                        <tr key={row.id} className={`${row.isOdd ? 'bg-[#F9F9FF]' : 'bg-white'} hover:bg-indigo-50 transition-colors`}>
                            <td className={`${dataCellStyle} !font-semibold !text-amber-600`}>{row.rank}</td>
                            <td className={`${dataCellStyle} !font-semibold !text-blue-600`}>{row.points}</td>
                            <td className={`${dataCellStyle} !font-semibold !text-red-600`}>{row.deduction}</td>
                            <td className={dataCellStyle}>{row.jobActivity}</td>
                            <td className={dataCellStyle}>{row.volunteerActivity}</td>
                            <td className={dataCellStyle}>{row.eduActivity}</td>
                            <td className={dataCellStyle}>{row.class}</td>
                            <td className={dataCellStyle}>{row.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default GradeTable;