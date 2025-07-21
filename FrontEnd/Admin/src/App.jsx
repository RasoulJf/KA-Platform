import React, { useContext, useState } from 'react';
// ۱. هوک useLocation را وارد کنید
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';

// Context و کامپوننت‌ها
import { AuthContext } from './Utils/AuthContext';
import Sidebar from './Components/Sidebar';

// صفحات (Pages)
import Home from './Pages/Home';
import Login from './Pages/Login';
import AddData from './Pages/AddData';
import CreateNewData from './Pages/AddData/Create';
import Requests from './Pages/Requests';
import Rewards from './Pages/Rewards';
import Result from './Pages/Results';
import ExcelUpload from './Pages/ExelUploader';


// کامپوننت داخلی برای دسترسی به هوک‌ها
const AppContent = () => {
  const { token, user } = useContext(AuthContext);
  const [open, setOpen] = useState(true); // پیش‌فرض سایدبار باز است

  // ۲. مسیر فعلی را از URL می‌گیریم
  const location = useLocation();

  const getOpen = (isOpen) => {
    // مقدار جدید را از سایدبار دریافت کرده و state را آپدیت می‌کنیم
    setOpen(isOpen);
  };

  // ۳. شرط هوشمند برای نمایش سایدبار
  // سایدبار فقط زمانی نمایش داده می‌شود که:
  // - کاربر لاگین کرده باشد (token وجود داشته باشد)
  // - نقش کاربر "student" نباشد (یعنی ادمین یا سوپرادمین باشد)
  // - مسیر فعلی "/login" نباشد
  const showSidebar = token && user?.role !== 'student' && location.pathname !== '/login';

  return (
    <div className="w-full relative flex min-h-screen">
      <Toaster position='top-right' />

      {/* سایدبار فقط در صورت برقرار بودن شرط نمایش داده می‌شود */}

      <Routes>
        <Route
          path='/login'
          element={token && user?.role !== "student" ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path='/'
          element={!token || user?.role === "student" ? <Navigate to="/login" /> : <Home Open={open} />}
        />

        {/* روت‌های تودرتو برای AddData */}
        <Route path='/add-data'>
          <Route
            index
            element={!token || user?.role === "student" ? <Navigate to="/login" /> : <AddData Open={open} />}
          />
          <Route
            path='create'
            element={!token || user?.role === "student" ? <Navigate to="/login" /> : <CreateNewData Open={open} />}
          />
        </Route>

        <Route
          path='/requests'
          element={!token || user?.role === "student" ? <Navigate to="/login" /> : <Requests Open={open} />}
        />
        <Route
          path='/rewards'
          element={!token || user?.role === "student" ? <Navigate to="/login" /> : <Rewards Open={open} />}
        />
        <Route
          path='/results'
          element={!token || user?.role === "student" ? <Navigate to="/login" /> : <Result Open={open} />}
        />
        <Route
          path='/exel' // املای صحیح: excel
          element={!token || user?.role === "student" ? <Navigate to="/login" /> : <ExcelUpload Open={open} />}
        />
      </Routes>
      {showSidebar && <Sidebar getOpen={getOpen} />}

    </div>
  );
}


// کامپوننت اصلی App که BrowserRouter را فراهم می‌کند
const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;