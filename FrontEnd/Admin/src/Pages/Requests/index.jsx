import React, { useState } from 'react';
import union from '../../assets/images/Union4.png'; // یا مسیر صحیح
import Frame10 from '../../assets/images/Frame10.png'; // یک تصویر پس زمینه احتمالی برای کارت های نارنجی
import Frame11 from '../../assets/images/Frame11.png'; // یک تصویر پس زمینه احتمالی برای کارت های نارنجی

import { BiSolidSchool } from "react-icons/bi";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import { LuMails } from "react-icons/lu"; // آیکون کلی درخواست‌ها
import { BsChatLeftText } from "react-icons/bs"; // آیکون برای کارت‌های درخواست
import { Link } from 'react-router-dom'; // اگر نیاز به لینک در جدول باشد
import RequestApprovalModal from './RequestApprovalModal';

// کامپوننت جدید برای صفحه درخواست‌ها (بر اساس تصویر دوم)
export default function Requests({ Open }) {
    // منطق تاریخ مشابه کامپوننت‌های قبلی
    const date = new Date();
    const month = new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(date);
    const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
    const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date);
    const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(date);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const handleRowClick = (request) => {
        // فقط اگر درخواست تایید نشده است، مودال را باز کن (یا هر منطق دیگری)
        // if (request.status === 'تایید نشده') {
        setSelectedRequest(request);
        setIsModalOpen(true);
        // }
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRequest(null); // پاک کردن درخواست انتخاب شده
    };

    const handleApprove = (requestId, points) => {
        console.log(`Approving request ${requestId} with ${points} points`);
        // اینجا منطق API برای تایید درخواست و تخصیص امتیاز را اضافه کنید
        // ... پس از موفقیت:
        // داده‌های جدول را به‌روز کنید (مثلا با fetch مجدد یا آپدیت local state)
        handleCloseModal();
    };

    const handleReject = (requestId) => {
        console.log(`Rejecting request ${requestId}`);
        // اینجا منطق API برای رد درخواست را اضافه کنید
        // ... پس از موفقیت:
        // داده‌های جدول را به‌روز کنید
        handleCloseModal();
    };
    // داده‌های نمونه برای جدول درخواست‌ها مطابق تصویر
    const requestsData = [
        { id: 1, name: 'علی هاشمی', title: 'طراحی پست استوری', submissionDate: '۲۲ دی ۱۴۰۳', reviewDate: '۲۲ دی ۱۴۰۳', status: 'تایید نشده', isOdd: false },
        { id: 2, name: 'علی هاشمی', title: 'طراحی پست استوری', submissionDate: '۲۲ دی ۱۴۰۳', reviewDate: '۲۲ دی ۱۴۰۳', status: 'تایید شده', isOdd: true },
        { id: 3, name: 'علی هاشمی', title: 'طراحی پست استوری', submissionDate: '۲۲ دی ۱۴۰۳', reviewDate: '۲۲ دی ۱۴۰۳', status: 'تایید نشده', isOdd: false },
        { id: 4, name: 'علی هاشمی', title: 'طراحی پست استوری', submissionDate: '۲۲ دی ۱۴۰۳', reviewDate: '۲۲ دی ۱۴۰۳', status: 'تایید شده', isOdd: true },
        { id: 5, name: 'علی هاشمی', title: 'طراحی پست استوری', submissionDate: '۲۲ دی ۱۴۰۳', reviewDate: '۲۲ دی ۱۴۰۳', status: 'تایید نشده', isOdd: false },
        { id: 6, name: 'علی هاشمی', title: 'طراحی پست استوری', submissionDate: '۲۲ دی ۱۴۰۳', reviewDate: '۲۲ دی ۱۴۰۳', status: 'تایید شده', isOdd: true },
        // ... سایر ردیف ها
    ];

    // تابعی برای دریافت کلاس رنگ وضعیت
    const getStatusClass = (status) => {
        switch (status) {
            case 'تایید شده': return 'text-green-600';
            case 'تایید نشده': return 'text-red-600'; // بر اساس تصویر
            case 'در انتظار بررسی': return 'text-yellow-600'; // یا نارنجی یا خاکستری
            default: return 'text-gray-600';
        }
    };

    return (
        <>
            {/* تصویر پس زمینه بالا سمت چپ */}
            <img src={union} className='absolute scale-75 top-[-4rem] left-[-10rem] z-0' alt="" />

            {/* کانتینر اصلی محتوا با عرض داینامیک */}
            <div className={`${!Open ? "w-[80%]" : "w-[94%]"} p-8 transition-all duration-500 flex flex-col h-screen relative z-10`}>

                {/* هدر صفحه - مشابه بقیه */}
                <div className="flex justify-between items-center h-[5vh] mb-6">
                    <div className="flex justify-center items-center gap-5">
                        <h3 className='text-[#19A297] text-xs'>هنرستان استارتاپی رکاد</h3>
                        <BiSolidSchool className='text-[#19A297] ml-[-10px] scale-150' />
                        <div className='w-8 flex justify-center items-center border border-gray-400 h-8 rounded-full'>
                            <IoNotificationsOutline className='text-gray-400 scale-100' />
                        </div>
                    </div>
                    <div className="flex justify-center items-center gap-5">
                        <p className='text-gray-400 text-xs'> امروز {week} {day} {month} ماه، {year}</p>
                        <h1 className='text-[#19A297] font-semibold text-lg'>درخواست ها</h1> {/* عنوان صفحه */}
                    </div>
                </div>

                {/* بخش کارت‌های بالا (چیدمان جدید) */}
                <div className="flex gap-5 mb-6 h-[30vh]"> {/* ارتفاع ممکن است نیاز به تنظیم داشته باشد */}

                    {/* ستون سمت چپ: دو کارت کوچک */}
                    <div className="flex flex-col gap-4 w-1/2">
                        {/* کارت درخواست های در انتظار بررسی */}
                        <div className="relative flex-1 bg-[#FFF7F0] rounded-lg overflow-hidden p-6 flex items-center justify-between shadow-sm border border-gray-100">
                            <img src={Frame11} className='absolute z-0 h-full w-full object-cover left-0 top-0 opacity-100' alt="" />
                            <p className='text-[#FF4F0A] font-semibold text-3xl z-10'>۱۰</p>
                            <div className='flex items-center gap-3 z-10'>
                                <h2 className='text-[#FF4F0A] font-semibold text-2xl text-right'>درخواست های در انتظار بررسی</h2>
                                <div className="bg-orange-500 flex justify-center items-center w-10 h-10 rounded-full flex-shrink-0">
                                    <BsChatLeftText className='text-white scale-125' />
                                </div>
                            </div>
                        </div>
                        {/* کارت درخواست های تایید شده */}
                        <div className="relative flex-1 bg-[#FFF7F0] rounded-lg overflow-hidden p-6 flex items-center justify-between shadow-sm border border-gray-100">
                            <img src={Frame11} className='absolute z-0 h-full w-full object-cover top-0 left-0 opacity-100' alt="" />
                            <p className='text-[#FF4F0A] font-semibold text-3xl z-10'>۳۲۵</p>
                            <div className='flex items-center gap-3 z-10'>
                                <h2 className='text-[#FF4F0A] font-semibold text-2xl text-right'>درخواست های تایید شده</h2>
                                <div className="bg-orange-500 flex justify-center items-center w-10 h-10 rounded-full flex-shrink-0">
                                    <BsChatLeftText className='text-white scale-125' />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ستون سمت راست: یک کارت بزرگ */}
                    <div className="relative w-2/4 rounded-lg overflow-hidden p-6 flex flex-col justify-center items-center text-center shadow-sm border border-gray-100 gap-2">
                        <img src={Frame10} className='absolute z-0 h-full w-full object-cover top-0 left-0 opacity-100' alt="" />
                        <div className="bg-orange-500 flex justify-center items-center w-12 h-12 rounded-full mb-2 z-10">
                            <BsChatLeftText className='text-white scale-150' />
                        </div>
                        <h2 className='text-[#FF4F0A] font-semibold text-2xl z-10'>کل درخواست های ثبت شده</h2>
                        <p className='text-[#FF4F0A] font-bold text-4xl z-10'>۳۱۲,۵۱۲</p>
                    </div>
                </div>

                {/* بخش فیلترها و عنوان جدول */}
                <div className="flex justify-between items-center w-full mb-3 mt-8">
                    {/* فیلترها */}
                    <div className="flex gap-2">
                        {/* دراپ داون عنوان (یا دسته بندی؟) */}
                        <div className="relative bg-white border border-gray-300 rounded px-3 py-1.5 flex items-center justify-between text-xs text-gray-600 cursor-pointer min-w-[100px]">
                            <span>عنوان</span>
                            <IoIosArrowDown className="text-gray-400 ml-2" />
                            {/* Select hidden or integrated for functionality */}
                        </div>
                        {/* دراپ داون وضعیت */}
                        <div className="relative bg-white border border-gray-300 rounded px-3 py-1.5 flex items-center justify-between text-xs text-gray-600 cursor-pointer min-w-[90px]">
                            <span>وضعیت</span>
                            <IoIosArrowDown className="text-gray-400 ml-2" />
                            {/* Select hidden or integrated for functionality */}
                        </div>
                        {/* دراپ داون تاریخ */}
                        <div className="relative bg-white border border-gray-300 rounded px-3 py-1.5 flex items-center justify-between text-xs text-gray-600 cursor-pointer min-w-[80px]">
                            <span>تاریخ</span>
                            <IoIosArrowDown className="text-gray-400 ml-2" />
                            {/* Select hidden or integrated for functionality */}
                        </div>
                    </div>
                    {/* سمت چپ: متن راهنما و عنوان */}
                    <div className="flex items-center w-[50%] justify-between gap-4">
                        <p className='text-gray-400 text-xs '>در اینجا سوابق آخرین درخواست ها را مشاهده می کنید</p>
                        <h3 className='text-[#19A297] font-semibold text-lg'>آخرین درخواست ها</h3>
                    </div>
                </div>

                {/* جدول درخواست‌ها */}
                <div className="flex-grow overflow-auto">
                    <table className='w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100'>
                        {/* سربرگ جدول */}
                        <thead className='bg-gray-50 text-sm text-[#202A5A]'>
                            <tr>
                                {/* ترتیب ستون ها بر اساس تصویر جدید (راست به چپ) */}
                                <th className='font-medium text-center px-4 py-3 border border-gray-200'>وضعیت</th>
                                <th className='font-medium text-center px-4 py-3 border border-gray-200'>تاریخ بررسی</th>
                                <th className='font-medium text-center px-4 py-3 border border-gray-200'>تاریخ ثبت</th>
                                <th className='font-medium text-center px-4 py-3 border border-gray-200'>عنوان</th>
                                <th className='font-medium text-center px-4 py-3 border border-gray-200'>نام و نام خانوادگی</th>
                            </tr>
                        </thead>
                        {/* بدنه جدول */}
                        <tbody className=''>
                            {requestsData.map((row) => (
                                <tr key={row.id}
                                    className={`${row.isOdd ? 'bg-gray-50' : 'bg-white'} text-sm hover:bg-gray-100 transition-colors cursor-pointer`} // Added cursor-pointer
                                    onClick={() => handleRowClick(row)} // Attach onClick handler
                                >
                                    {/* استفاده از کلاس رنگی برای وضعیت */}
                                    <td className={`px-4 py-3 text-center whitespace-nowrap border border-gray-200 font-medium ${getStatusClass(row.status)}`}>{row.status}</td>
                                    {/* توجه به ترتیب جدید ستون ها */}
                                    <td className='px-4 py-3 rtl text-center whitespace-nowrap border border-gray-200 text-[#202A5A]'>{row.reviewDate}</td>
                                    <td className='px-4 py-3 rtl text-center whitespace-nowrap border border-gray-200 text-[#202A5A]'>{row.submissionDate}</td>
                                    <td className='px-4 py-3 text-center whitespace-nowrap border border-gray-200 text-[#202A5A]'>{row.title}</td>
                                    <td className='px-4 py-3 text-center whitespace-nowrap border border-gray-200 text-[#202A5A]'>{row.name}</td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
            {/* Closing main content div */}

            <RequestApprovalModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                requestData={selectedRequest}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </>
    );
}