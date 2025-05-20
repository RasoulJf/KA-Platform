import React, { useState } from 'react';
import axios from 'axios';

function ExcelUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
  
    // بررسی نوع فایل
    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      alert('لطفا فقط فایل‌های اکسل (xlsx یا xls) آپلود کنید');
      return;
    }
  
    // بررسی اندازه فایل
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
    formData.append('excelFile', file, file.name); // اضافه کردن نام فایل
  
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/users/register/excel', formData, {
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
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">ثبت‌نام گروهی از طریق اکسل</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">فایل اکسل</label>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={handleFileChange}
            className="border p-2 rounded"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'در حال پردازش...' : 'آپلود و ثبت‌نام'}
        </button>
      </form>

      {result && (
        <div className={`mt-4 p-4 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <h3 className="font-bold">{result.message}</h3>
          {result.insertedCount !== undefined && (
            <p>تعداد کاربران ثبت‌شده: {result.insertedCount}</p>
          )}
          {result.errorCount > 0 && (
            <div className="mt-2">
              <h4 className="font-bold">خطاها:</h4>
              <ul className="list-disc list-inside">
                {result.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ExcelUpload;