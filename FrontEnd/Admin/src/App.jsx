import React, { useContext } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import { Toaster } from 'sonner'
import Login from './Pages/Login'
import { AuthContext } from './Utils/AuthContext'
import AddData from './Pages/AddData'
import Rewards from './Pages/Rewards'
import Result from './Pages/Results'
import Requests from './Pages/Requests'

const App = () => {
  const {token,user,handleAuth}=useContext(AuthContext)
  const localToken=localStorage.getItem("token")
  const localUser=localStorage.getItem("user")
  const newLocaluser=JSON.parse(localUser)
  if(user==null){
  handleAuth(localToken,newLocaluser)
  }
  return (
    <BrowserRouter>
      <Toaster position='top-right' />
      <Routes>
      <Route path='/login' element={token && user?.role!="student" ? <Navigate to={"/"}/> : <Login/>}/>
        <Route path='/' element={!token || user?.role=="student" ? <Navigate to={"/login"}/> : <Home/>}/>
        <Route path='/add-data' element={!token || user?.role=="student" ? <Navigate to={"/login"}/> : <AddData/>}/>
        <Route path='/requests' element={!token || user?.role=="student" ? <Navigate to={"/login"}/> : <Requests/>}/>
        <Route path='/rewards' element={!token || user?.role=="student" ? <Navigate to={"/login"}/> : <Rewards/>}/>
        <Route path='/results' element={!token || user?.role=="student" ? <Navigate to={"/login"}/> : <Result/>}/>



      </Routes>


    </BrowserRouter>

  )
}

export default App

