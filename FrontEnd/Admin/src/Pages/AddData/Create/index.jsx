import React, { useState } from 'react';
import union from '../../../assets/images/Union4.png'; // یا مسیر صحیح
import frame7 from '../../../assets/images/frame7.png'; // برای کارت‌های بالا
import frame72 from '../../../assets/images/frame72.png'; // برای بخش "ثبت اطلاعات جدید"

import { BiSolidSchool } from "react-icons/bi";
import { IoNotificationsOutline } from "react-icons/io5";
import { TbPencilPlus } from "react-icons/tb";
import { IoDocumentTextOutline } from "react-icons/io5";
import { BsGrid1X2 } from "react-icons/bs";
import { IoIosArrowDown } from "react-icons/io";
import { FiUploadCloud, FiDownloadCloud } from "react-icons/fi"; // آیکون‌های آپلود و دانلود

// کامپوننت CreateNewData
export default function CreateNewData({ Open }) {
    const date = new Date();
    const month = new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(date);
    const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
    const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date);
    const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(date);

    // State برای مدیریت تب فعال (فردی یا گروهی)
    const [activeTab, setActiveTab] = useState('individual'); // Initial tab set to individual based on last image

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // State برای مقادیر فرم فردی
    const [individualFormData, setIndividualFormData] = useState({
        base: '',
        class: '',
        name: '',
        category: '',
        title: '',
        value: '',
        points: '', // Added points field
        description: '',
    });

    // State برای مقادیر فرم گروهی
    const [groupFormData, setGroupFormData] = useState({
        category: '',
        title: '',
        // فایل‌ها معمولا جداگانه مدیریت می‌شوند
    });

    const handleIndividualChange = (e) => {
        const { name, value } = e.target;
        setIndividualFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleGroupChange = (e) => {
        const { name, value } = e.target;
        setGroupFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmitIndividual = (e) => {
        e.preventDefault();
        console.log("Individual Data Submitted:", individualFormData);
        // منطق ارسال داده‌های فردی
    };

    const handleSubmitGroup = (e) => {
        e.preventDefault();
        console.log("Group Data Submitted:", groupFormData);
        // منطق ارسال داده‌های گروهی
    };


    return (
        <>
            <img src={union} className='absolute scale-75 top-[-4rem] left-[-10rem] z-0' alt="" />

            <div className={`${!Open ? "w-[80%]" : "w-[94%]"} p-8 transition-all duration-500 flex flex-col h-screen relative z-10`}>

                {/* هدر صفحه */}
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
                        <h1 className='text-[#19A297] font-semibold text-lg'>ثبت اطلاعات</h1>
                    </div>
                </div>

                {/* بخش کارت‌های بالا */}
                <div className="flex gap-5 mb-6 h-[12vh]">
                    <div className="relative flex-1 bg-white rounded-lg overflow-hidden p-8 flex items-center justify-between shadow-sm border border-gray-100">
                        <img src={frame7} className='absolute z-0 h-full w-full object-cover scale-110 top-0 left-0 opacity-100' alt="" />
                        <p className='text-[#202A5A] font-semibold text-2xl z-10'>۳۳۰۰</p>
                        <div className='flex items-center gap-4 z-10'>
                            <h2 className='text-[#202A5A] font-semibold text-lg'>جمع کل امتیازات</h2>
                            <div className="bg-[#202A5A] flex justify-center items-center w-12 h-12 rounded-full">
                                <BsGrid1X2 className='scale-150 text-white' />
                            </div>
                        </div>
                    </div>
                    <div className="relative flex-1 bg-white rounded-lg overflow-hidden p-8 flex items-center justify-between shadow-sm border border-gray-100">
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

                {/* بخش "ثبت اطلاعات جدید" با توضیح */}
                <div className="relative bg-white rounded-lg overflow-hidden mb-6 p-4 flex items-center justify-between shadow-sm border border-gray-100 h-[12vh]">
                    <img src={frame72} className='absolute z-0 h-full w-full object-cover top-0 left-[-30px] opacity-100 scale-110' alt="" />
                    <p className='text-gray-500 text-sm z-10 ml-auto mr-8'>برای ثبت اطلاعات جدید، فرم زیر را تکمیل کنید.</p>
                    <div className='flex items-center gap-4 z-10'>
                        <h2 className='text-[#202A5A] font-semibold text-lg'>ثبت اطلاعات جدید</h2>
                        <div className="bg-[#202A5A] flex justify-center items-center w-12 h-12 rounded-full">
                            <TbPencilPlus className='scale-150 text-white' />
                        </div>
                    </div>
                </div>

                {/* بخش تب‌ها و فرم */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex-grow">
                    {/* تب‌ها */}
                    <div className="flex mb-6 bg-gray-100 rounded-lg p-1"> {/* Changed background for tabs container */}
                        <button
                            onClick={() => handleTabChange('group')}
                            className={`flex-1 py-2.5 px-4 text-center rounded-md text-sm font-medium transition-colors duration-200 ease-in-out ${activeTab === 'group' ? 'bg-white shadow text-[#19A297]' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            گروهی
                        </button>
                        <button
                            onClick={() => handleTabChange('individual')}
                            className={`flex-1 py-2.5 px-4 text-center rounded-md text-sm font-medium transition-colors duration-200 ease-in-out ${activeTab === 'individual' ? 'bg-white shadow text-[#19A297]' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            فردی
                        </button>
                    </div>


                    {/* محتوای فرم بر اساس تب فعال */}
                    {activeTab === 'group' && (
                        <form onSubmit={handleSubmitGroup} className="space-y-6 mt-6">
                            {/* ... (کد فرم گروهی بدون تغییر باقی می ماند) ... */}
                            {/* ردیف اول: دسته بندی و عنوان */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* دسته بندی (دراپ داون) */}
                                <div className="relative">
                                    <label htmlFor="groupCategory" className="block text-sm font-medium text-gray-700 mb-1 text-right">دسته‌بندی</label>
                                    <select
                                        id="groupCategory"
                                        name="category"
                                        value={groupFormData.category}
                                        onChange={handleGroupChange}
                                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#19A297] focus:border-[#19A297] text-sm text-right bg-white" // Added bg-white explicitly
                                    >
                                        <option value="">انتخاب کنید...</option>
                                        <option value="category1">داوطلبانه و توسعه فردی</option>
                                        <option value="category2">آموزشی و پژوهشی</option>
                                        {/* گزینه‌های بیشتر */}
                                    </select>
                                    <IoIosArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-3 text-gray-400 pointer-events-none" />
                                </div>
                                {/* عنوان (ورودی متنی) */}
                                <div>
                                    <label htmlFor="groupTitle" className="block text-sm font-medium text-gray-700 mb-1 text-right">عنوان</label>
                                    <input
                                        type="text"
                                        id="groupTitle"
                                        name="title"
                                        value={groupFormData.title}
                                        onChange={handleGroupChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#19A297] focus:border-[#19A297] text-sm text-right"
                                        placeholder="عنوان فعالیت گروهی"
                                    />
                                </div>
                            </div>

                            {/* ردیف دوم: دریافت فایل نمونه و بارگذاری فایل */}
                            <div className="bg-[#202A5A] p-4 rounded-md flex flex-col md:flex-row justify-between items-center gap-4">
                                <button type="button" className="flex items-center justify-center gap-2 bg-transparent border border-gray-400 text-gray-300 px-6 py-2.5 rounded-md text-sm hover:bg-gray-700 transition w-full md:w-auto">
                                    <FiDownloadCloud className="w-5 h-5" />
                                    دریافت فایل نمونه
                                </button>
                                <span className="hidden md:block text-gray-400 text-sm">|</span>
                                <button type="button" className="flex items-center justify-center gap-2 bg-gray-100 text-[#202A5A] px-6 py-2.5 rounded-md text-sm font-medium hover:bg-gray-200 transition w-full md:w-auto">
                                    <FiUploadCloud className="w-5 h-5" />
                                    بارگذاری فایل
                                </button>
                            </div>

                            {/* دکمه ثبت */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-[#19A297] text-white py-3 px-4 rounded-md hover:bg-[#14857d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#19A297] font-medium"
                                >
                                    ثبت اطلاعات
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'individual' && (
                        <form onSubmit={handleSubmitIndividual} className="space-y-5 mt-6"> {/* Added mt-6 for spacing */}
                            {/* ردیف اول: پایه، کلاس، نام */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                                {/* Field Wrapper */}
                                <div className="flex items-center justify-between gap-x-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                                    <select id="base" name="base" value={individualFormData.base} onChange={handleIndividualChange} className="flex-grow px-3 py-2 pr-8 border-0 focus:ring-0 focus:outline-none text-sm text-right bg-transparent appearance-none">
                                        <option value="">انتخاب پایه...</option>
                                        <option value="10">دهم</option>
                                        <option value="11">یازدهم</option>
                                        <option value="12">دوازدهم</option>
                                    </select>
                                    <IoIosArrowDown className="text-gray-400 flex-shrink-0 ml-1" />
                                    <label htmlFor="base" className="text-sm font-medium text-gray-700 flex-shrink-0 whitespace-nowrap">پایه</label>
                                </div>
                                {/* Field Wrapper */}
                                <div className="flex items-center justify-between gap-x-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                                    <select id="class" name="class" value={individualFormData.class} onChange={handleIndividualChange} className="flex-grow px-3 py-2 pr-8 border-0 focus:ring-0 focus:outline-none text-sm text-right bg-transparent appearance-none">
                                        <option value="">انتخاب کلاس...</option>
                                        <option value="101">۱۰۱</option>
                                        <option value="102">۱۰۲</option>
                                        {/* ... */}
                                    </select>
                                    <IoIosArrowDown className="text-gray-400 flex-shrink-0 ml-1" />
                                    <label htmlFor="class" className="text-sm font-medium text-gray-700 flex-shrink-0 whitespace-nowrap">کلاس</label>
                                </div>
                                {/* Field Wrapper */}
                                <div className="flex items-center justify-between gap-x-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                                    <input type="text" id="name" name="name" value={individualFormData.name} onChange={handleIndividualChange} className="flex-grow px-3 py-2 border-0 focus:ring-0 focus:outline-none text-sm text-right bg-transparent" placeholder="نام دانش آموز" />
                                    <label htmlFor="name" className="text-sm font-medium text-gray-700 flex-shrink-0 whitespace-nowrap">نام و نام خانوادگی</label>
                                </div>
                            </div>

                            {/* ردیف دوم: دسته بندی و عنوان */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                {/* Field Wrapper */}
                                <div className="flex items-center justify-between gap-x-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                                    <select id="individualCategory" name="category" value={individualFormData.category} onChange={handleIndividualChange} className="flex-grow px-3 py-2 pr-8 border-0 focus:ring-0 focus:outline-none text-sm text-right bg-transparent appearance-none">
                                        <option value="">انتخاب دسته‌بندی...</option>
                                        <option value="category1">داوطلبانه و توسعه فردی</option>
                                        <option value="category2">آموزشی و پژوهشی</option>
                                    </select>
                                    <IoIosArrowDown className="text-gray-400 flex-shrink-0 ml-1" />
                                    <label htmlFor="individualCategory" className="text-sm font-medium text-gray-700 flex-shrink-0 whitespace-nowrap">دسته‌بندی</label>
                                </div>
                                {/* Field Wrapper */}
                                <div className="flex items-center justify-between gap-x-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                                    <input type="text" id="individualTitle" name="title" value={individualFormData.title} onChange={handleIndividualChange} className="flex-grow px-3 py-2 border-0 focus:ring-0 focus:outline-none text-sm text-right bg-transparent" placeholder="عنوان فعالیت فردی" />
                                    <label htmlFor="individualTitle" className="text-sm font-medium text-gray-700 flex-shrink-0 whitespace-nowrap">عنوان</label>
                                </div>
                            </div>

                            {/* ردیف سوم: مقدار داده و امتیاز */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                {/* Field Wrapper */}
                                <div className="flex items-center justify-between gap-x-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                                    <input type="text" id="value" name="value" value={individualFormData.value} onChange={handleIndividualChange} className="flex-grow px-3 py-2 border-0 focus:ring-0 focus:outline-none text-sm text-right bg-transparent" placeholder="مثلا: ۲۰ ساعت، رتبه اول، و..." />
                                    <label htmlFor="value" className="text-sm font-medium text-gray-700 flex-shrink-0 whitespace-nowrap">مقدار داده</label>
                                </div>
                                {/* Field Wrapper */}
                                <div className="flex items-center justify-between gap-x-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                                    <input type="number" id="points" name="points" value={individualFormData.points} onChange={handleIndividualChange} className="flex-grow px-3 py-2 border-0 focus:ring-0 focus:outline-none text-sm text-right bg-transparent" placeholder="امتیاز تخصیصی" />
                                    <label htmlFor="points" className="text-sm font-medium text-gray-700 flex-shrink-0 whitespace-nowrap">امتیاز</label>
                                </div>
                            </div>

                            {/* ردیف چهارم: شرح اطلاعات (لیبل بالا) */}

                            <div className="flex items-center justify-between gap-x-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="3"
                                    value={individualFormData.description}
                                    onChange={handleIndividualChange}
                                    className="w-full px-3 py-2 h-[5vh] border-0 focus:ring-0 focus:outline-none text-sm text-right bg-transparent"
                                    placeholder="توضیحات بیشتر در مورد فعالیت..."
                                ></textarea>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2 text-right w-10">شرح اطلاعات</label>

                            </div>


                            {/* دکمه ثبت */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-[#19A297] text-white py-3 px-4 rounded-md hover:bg-[#14857d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#19A297] font-medium"
                                >
                                    ثبت اطلاعات
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}