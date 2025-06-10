import React, { useContext, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import { Toaster } from 'sonner';
import Login from './Pages/Login';
import { AuthContext } from './Utils/AuthContext';
import Rewards from './Pages/Rewards';
import Result from './Pages/Results';
import Sidebar from './Components/Sidebar';
import Activities from './Pages/Activities';
import RequestRewardPage from './Pages/Rewards/RewardOptionData';

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
           <Route path="/request-reward" element={!token || user?.role !== "student" ? <Navigate to="/login" /> :<RequestRewardPage Open={open} />} /> 
          <Route 
            path='/results' 
            element={!token || user?.role !== "student" ? <Navigate to="/login" /> : <Result Open={open} />} 
          />
        </Routes>
        {token || user?.role !== "student" ?   <Sidebar activeNum={1} getOpen={getOpen} /> : ""}
      </div>
    </BrowserRouter>
  );
};

export default App;