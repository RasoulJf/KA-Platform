import React, { useState } from 'react';
import axios from 'axios';
import union from '../../assets/images/Union4.png'; // فرض بر اینکه این تصاویر عمومی هستند
import frame7 from '../../assets/images/frame7.png';
import frame72 from '../../assets/images/frame72.png';
import { BiSolidSchool } from "react-icons/bi";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoDocumentTextOutline } from "react-icons/io5";
// import { Link } from 'react-router-dom'; // اگر نیازی به لینک نیست، می‌توان حذف کرد

// نام کامپوننت را به RewardExcelUpload تغییر می‌دهیم
function RewardExcelUpload({ Open }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // منطق تاریخ (بدون تغییر)
  const date = new Date();
  const month = new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(date);
  const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
  const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date);
  const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(date);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
        setFile(null); // اگر فایلی انتخاب نشده، file را null کنید
        setResult(null); // نتایج قبلی را پاک کنید
        return;
    }
  
    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      alert('لطفا فقط فایل‌های اکسل (xlsx یا xls) آپلود کنید');
      e.target.value = null; // پاک کردن انتخاب فایل نامعتبر
      setFile(null);
      return;
    }
  
    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB
      alert('حجم فایل باید کمتر از 5 مگابایت باشد');
      e.target.value = null; // پاک کردن انتخاب فایل نامعتبر
      setFile(null);
      return;
    }
  
    setFile(selectedFile);
    setResult(null); // پاک کردن نتایج قبلی هنگام انتخاب فایل جدید
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
        alert("لطفا یک فایل اکسل را انتخاب کنید.");
        return;
    }
  
    const formData = new FormData();
    formData.append('excelFile', file, file.name);

    try {
      setLoading(true);
      setResult(null); // پاک کردن نتایج قبلی قبل از ارسال جدید
      // *** تغییر URL برای آپلود پاداش‌ها ***
      const response = await axios.post('http://localhost:5000/api/exel/reward', formData, { // یا هر URL دیگری که برای rewards تنظیم کرده‌اید
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // اطمینان از وجود توکن
          'X-Requested-With': 'XMLHttpRequest'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`${percentCompleted}% uploaded`);
            // اینجا می‌توانید یک state برای نمایش درصد آپلود اضافه کنید
          }
        }
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message);
      setResult({
        success: false,
        message: error.response?.data?.message || 
          'خطا در آپلود فایل. لطفا فایل و اتصال خود را بررسی کنید و مجددا تلاش نمایید.',
        errors: error.response?.data?.errors || [] // اضافه کردن نمایش خطاهای جزئی از بک‌اند
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
            {/* *** تغییر عنوان صفحه *** */}
            <h1 className='text-[#19A297] font-semibold text-lg'>ثبت پاداش‌ها از طریق اکسل</h1>
          </div>
        </div>

        {/* بخش کارت‌های بالا */}
        <div className="flex gap-5 mb-6 h-[12vh]">
          {/* کارت توضیحات */}
          <div className="relative flex-1 bg-white rounded-lg overflow-hidden p-8 flex items-center justify-between shadow-sm border border-gray-100">
            <img src={frame7} className='absolute z-0 h-full w-full object-cover scale-110 top-0 left-0 opacity-100' alt="" />
            <div className='flex items-center gap-4 z-10 w-full justify-between'>
              <div>
                {/* *** تغییر توضیحات کارت *** */}
                <h2 className='text-[#202A5A] font-semibold text-lg mb-2'>قالب مورد نیاز فایل اکسل پاداش‌ها</h2>
                <p className='text-gray-600 text-sm'>ستون‌های ضروری: parent, name | ستون‌های اختیاری: description, minToken, maxToken</p>
                <p className='text-gray-600 text-sm mt-1'>مقادیر مجاز برای parent: پاداش های عمومی، پاداش های اختصاصی، پاداش نیکوکارانه</p>
              </div>
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
            {/* *** تغییر عنوان فرم *** */}
            <h2 className='text-[#202A5A] font-semibold text-lg mb-4'>آپلود فایل اکسل پاداش‌ها</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="rewardFileInput" className="block text-gray-600 text-sm">فایل اکسل</label>
                <input 
                  id="rewardFileInput" // آیدی برای input
                  type="file" 
                  accept=".xlsx, .xls" 
                  onChange={handleFileChange}
                  className="border border-gray-300 p-2 rounded-lg text-sm w-full max-w-md"
                />
                <p className="text-gray-500 text-xs">فرمت‌های مجاز: xlsx, xls (حداکثر حجم: 5MB)</p>
              </div>
              
              <button 
                type="submit" 
                disabled={loading || !file} // غیرفعال کردن دکمه اگر فایلی انتخاب نشده یا در حال لود است
                className="bg-[#19A297] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#168a7f] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {/* *** تغییر متن دکمه *** */}
                {loading ? 'در حال پردازش...' : 'آپلود و ثبت پاداش‌ها'}
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
              // *** تغییر متن تعداد ***
              <p className="text-[#202A5A] text-sm mb-2">تعداد پاداش‌های ثبت‌شده: {result.insertedCount}</p>
            )}
            
            {result.errorCount > 0 && Array.isArray(result.errors) && result.errors.length > 0 && ( // بررسی اینکه errors یک آرایه باشد و خالی نباشد
              <div className="mt-3">
                <h4 className="font-bold text-sm text-[#202A5A] mb-2">خطاها ({result.errorCount} مورد):</h4>
                <ul className="list-disc list-inside text-sm text-red-500 space-y-1 max-h-40 overflow-y-auto">
                  {result.errors.map((error, i) => (
                    <li key={i}>{typeof error === 'object' ? JSON.stringify(error) : error}</li> // نمایش بهتر خطاهای احتمالی آبجکتی
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

export default RewardExcelUpload;