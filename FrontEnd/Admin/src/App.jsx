import React, { useContext, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import { Toaster } from 'sonner';
import Login from './Pages/Login';
import { AuthContext } from './Utils/AuthContext';
import AddData from './Pages/AddData';
import Rewards from './Pages/Rewards';
import Result from './Pages/Results';
import Requests from './Pages/Requests';
import Sidebar from './Components/Sidebar';
import CreateNewData from './Pages/AddData/Create';
import ExcelUploader from './Pages/ExelUploader';

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
            path='/exel' 
            element={<ExcelUploader Open={open} />} 
          />
        </Routes>
        {token && <Sidebar activeNum={1} getOpen={getOpen} />}
      </div>
    </BrowserRouter>
  );
};

export default App;