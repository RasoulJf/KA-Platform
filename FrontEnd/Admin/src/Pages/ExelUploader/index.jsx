import { useState } from 'react';
import fetchData from '../../Utils/fetchData';

const ExcelUploader = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop().toLowerCase();
      if (!['xlsx', 'xls'].includes(ext)) {
        setError('فقط فایل‌های اکسل با پسوند .xlsx یا .xls مجاز هستند');
        return;
      }
      setFile(selectedFile);
      setError('');
      setMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('لطفاً یک فایل انتخاب کنید');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetchData("upload-users", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body:formData
      });

      console.log(response)
      setMessage(`کاربران با موفقیت اضافه شدند. تعداد: ${response.count}`);
    } catch (err) {
      setError(err.message || 'خطا در آپلود فایل');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of your component remains the same ...


  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">آپلود فایل اکسل کاربران</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            فایل اکسل (.xlsx, .xls)
          </label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium
            ${isLoading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          {isLoading ? 'در حال آپلود...' : 'آپلود فایل'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-md text-sm text-gray-600">
        <h3 className="font-medium mb-2">راهنما:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>فایل باید با فرمت .xlsx یا .xls باشد</li>
          <li>ستون‌های ضروری: fullName, role, idCode</li>
          <li>برای دانش‌آموزان: fieldOfStudy, grade, class نیز نیاز است</li>
        </ul>
      </div>
    </div>
  );
};

export default ExcelUploader;