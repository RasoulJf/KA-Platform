import React, { useContext, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import { Toaster } from 'sonner';
import Login from './Pages/Login';
import { AuthContext } from './Utils/AuthContext';
import Result from './Pages/Results';
import Sidebar from './Components/Sidebar';

import ExcelUploader from './Pages/ExelUploader';
import ExcelUpload from './Pages/ExelUploader';
import ActivityExcelUpload from './Pages/Activity';
import RewardExcelUpload from './Pages/Rewards';

const App = () => {
  const { token, user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  const getOpen = (e) => {
    setOpen(e);
  };

  return (
    <BrowserRouter>
      <div className="overflow-hidden h-screen w-full relative flex">
        <Toaster position='top-right' />
        <Routes>
          <Route
            path='/login'
            element={token && user?.role !== "student" ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path='/'
            element={!token || user?.role === "student" ? <Navigate to="/login" /> : <Home Open={open} />}
          />
          <Route
            path='/add-users'
            element={!token || user?.role === "student" ? <Navigate to="/login" /> : <ExcelUpload Open={open} />}
          />
          <Route
            path='/add-activity'
            element={!token || user?.role === "student" ? <Navigate to="/login" /> : <ActivityExcelUpload Open={open} />}
          />
          <Route
            path='/rewards'
            element={!token || user?.role === "student" ? <Navigate to="/login" /> : <RewardExcelUpload Open={open} />}
          />
          <Route
            path='/results'
            element={!token || user?.role === "student" ? <Navigate to="/login" /> : <Result Open={open} />}
          />
          <Route
            path='/exel'
            element={<ExcelUpload Open={open} />}
          />
        </Routes>
        {token && <Sidebar activeNum={1} getOpen={getOpen} />}
      </div>
    </BrowserRouter>
  );
};

export default App;