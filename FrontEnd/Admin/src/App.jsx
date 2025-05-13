import React, { useContext, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import { Toaster } from 'sonner'
import Login from './Pages/Login'
import { AuthContext } from './Utils/AuthContext'
import AddData from './Pages/AddData'
import Rewards from './Pages/Rewards'
import Result from './Pages/Results'
import Requests from './Pages/Requests'
import Sidebar from './Components/Sidebar'
import createNewData from './Pages/AddData/Create'
import CreateNewData from './Pages/AddData/Create'

const App = () => {
  const { token = null, user = null, handleAuth } = useContext(AuthContext)
  const [open,setOpen]=useState(false)
  const localToken = localStorage.getItem("token")
  const localUser = localStorage.getItem("user")
  const newLocaluser = JSON.parse(localUser)
  if (user == null) {
    handleAuth(localToken, newLocaluser)
  }
  const getOpen = (e) => {
    setOpen(e)
  }
  return (
    <BrowserRouter>
      <div className="overflow-hidden h-screen w-full relative flex">
        <Toaster position='top-right' />
        <Routes>
          <Route path='/login' element={token && user?.role != "student" ? <Navigate to={"/"} /> : <Login />} />
          <Route path='/' element={!token || user?.role == "student" ? <Navigate to={"/login"} /> : <Home Open={open} />} />
          <Route path='/add-data'  >
          <Route index path='' element={!token || user?.role == "student" ? <Navigate to={"/login"} /> : <AddData Open={open} />}/>
          <Route path='create' element={<CreateNewData Open={open}/>}/>
          </Route>
          <Route path='/requests' element={!token || user?.role == "student" ? <Navigate to={"/login"} /> : <Requests />} />
          <Route path='/rewards' element={!token || user?.role == "student" ? <Navigate to={"/login"} /> : <Rewards />} />
          <Route path='/results' element={!token || user?.role == "student" ? <Navigate to={"/login"} /> : <Result />} />



        </Routes>
        <Sidebar activeNum={1} getOpen={getOpen}/>
      </div>


    </BrowserRouter>

  )
}

export default App

