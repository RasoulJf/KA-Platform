import React, { useState } from 'react';
import axios from 'axios';
import union from '../../assets/images/Union4.png';
import frame7 from '../../assets/images/frame7.png';
import frame72 from '../../assets/images/frame72.png';
import { BiSolidSchool } from "react-icons/bi";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoDocumentTextOutline } from "react-icons/io5";
import { Link } from 'react-router-dom';

function ExcelUpload({ Open }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // منطق تاریخ
  const date = new Date();
  const month = new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(date);
  const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
  const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date);
  const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(date);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
  
    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      alert('لطفا فقط فایل‌های اکسل (xlsx یا xls) آپلود کنید');
      return;
    }
  
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('حجم فایل باید کمتر از 5 مگابایت باشد');
      return;
    }
  
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
  
    const formData = new FormData();
    formData.append('excelFile', file, file.name);

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/exel/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`${percentCompleted}% uploaded`);
        }
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message);
      setResult({
        success: false,
        message: error.response?.data?.message || 
          'خطا در آپلود فایل. لطفا فایل را بررسی کنید و مجددا تلاش نمایید'
      });
    } finally {
      setLoading(false);
    }
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
            <div className='w-8 flex justify-center items-center border-gray-400 h-8 border rounded-full'>
              <IoNotificationsOutline className='text-gray-400 scale-100' />
            </div>
          </div>
          <div className="flex justify-center items-center gap-5">
            <p className='text-gray-400 text-xs'> امروز {week} {day} {month} ماه، {year}</p>
            <h1 className='text-[#19A297] font-semibold text-lg'>ثبت‌نام گروهی از طریق اکسل</h1>
          </div>
        </div>

        {/* بخش کارت‌های بالا */}
        <div className="flex gap-5 mb-6 h-[12vh]">
          {/* کارت توضیحات */}
          <div className="relative flex-1 bg-white rounded-lg overflow-hidden p-8 flex items-center justify-between shadow-sm border border-gray-100">
            <img src={frame7} className='absolute z-0 h-full w-full object-cover scale-110 top-0 left-0 opacity-100' alt="" />
            <div className='flex items-center gap-4 z-10 w-full justify-between'>
              <h2 className='text-[#202A5A] font-semibold text-lg'>فایل اکسل باید شامل ستون‌های مشخص شده باشد</h2>
              <div className="bg-[#202A5A] flex justify-center items-center w-12 h-12 rounded-full">
                <IoDocumentTextOutline className='scale-150 text-white' />
              </div>
            </div>
          </div>
        </div>

        {/* بخش فرم آپلود */}
        <div className="relative bg-white rounded-lg overflow-hidden mb-6 p-6 flex flex-col shadow-sm border border-gray-100 min-h-[30vh]">
          <img src={frame72} className='absolute z-0 h-full w-full object-cover top-0 left-[-30px] opacity-100 scale-110' alt="" />
          
          <div className="z-10">
            <h2 className='text-[#202A5A] font-semibold text-lg mb-4'>آپلود فایل اکسل</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="block text-gray-600 text-sm">فایل اکسل</label>
                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  onChange={handleFileChange}
                  className="border border-gray-300 p-2 rounded-lg text-sm w-full max-w-md"
                />
                <p className="text-gray-500 text-xs">فرمت‌های مجاز: xlsx, xls (حداکثر حجم: 5MB)</p>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="bg-[#19A297] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#168a7f] transition-colors disabled:bg-gray-400"
              >
                {loading ? 'در حال پردازش...' : 'آپلود و ثبت‌نام'}
              </button>
            </form>
          </div>
        </div>

        {/* نتایج آپلود */}
        {result && (
          <div className={`relative bg-white rounded-lg overflow-hidden p-6 shadow-sm border ${result.success ? 'border-green-200' : 'border-red-200'} z-10`}>
            <h3 className={`font-bold mb-3 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
              {result.message}
            </h3>
            
            {result.insertedCount !== undefined && (
              <p className="text-[#202A5A] text-sm mb-2">تعداد کاربران ثبت‌شده: {result.insertedCount}</p>
            )}
            
            {result.errorCount > 0 && (
              <div className="mt-3">
                <h4 className="font-bold text-sm text-[#202A5A] mb-2">خطاها:</h4>
                <ul className="list-disc list-inside text-sm text-red-500 space-y-1">
                  {result.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default ExcelUpload;