import React, { useContext, useState } from 'react';
// 1. هوک useLocation را وارد کنید
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Home from './Pages/Home';
import { Toaster } from 'sonner';
import Login from './Pages/Login';
import { AuthContext } from './Utils/AuthContext';
import Rewards from './Pages/Rewards';
import Result from './Pages/Results';
import Sidebar from './Components/Sidebar';
import Activities from './Pages/Activities';
import RequestRewardPage from './Pages/Rewards/RewardOptionData';

// کامپوننت اصلی برنامه را در یک کامپوننت داخلی قرار می‌دهیم تا به useLocation دسترسی داشته باشد
const AppContent = () => {
  const { token, user } = useContext(AuthContext);
  const [open, setOpen] = useState(true);
  
  // 2. مسیر فعلی را بگیرید
  const location = useLocation();
  
  const getOpen = (e) => {
    setOpen(e);
  };

  // 3. شرط نمایش سایدبار را اصلاح کنید
  // سایدبار فقط زمانی نمایش داده می‌شود که:
  // - کاربر لاگین کرده باشد (token وجود داشته باشد)
  // - نقش کاربر "student" باشد
  // - مسیر فعلی "/login" نباشد
  const showSidebar = token && user?.role === 'student' && location.pathname !== '/login';

  return (
    <div className="overflow-hidden h-screen w-full relative flex">
      <Toaster position='top-right' />
      <Routes>
        <Route 
          path='/login' 
          element={token && user?.role === "student" ? <Navigate to="/" /> : <Login />} 
        />
        <Route 
          path='/' 
          element={!token || user?.role !== "student" ? <Navigate to="/login" /> : <Home Open={open} />} 
        />
  
        <Route 
          path='/activities' 
          element={!token || user?.role !== "student" ? <Navigate to="/login" /> : <Activities Open={open} />} 
        />
        <Route 
          path='/rewards' 
          element={!token || user?.role !== "student" ? <Navigate to="/login" /> : <Rewards Open={open} />} 
        />
         <Route path="/request-reward" element={!token || user?.role !== "student" ? <Navigate to="/login" /> : <RequestRewardPage Open={open} />} /> 
        <Route 
          path='/results' 
          element={!token || user?.role !== "student" ? <Navigate to="/login" /> : <Result Open={open} />} 
        />
      </Routes>
      {showSidebar && <Sidebar activeNum={1} getOpen={getOpen} />}
    </div>
  );
}


const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;