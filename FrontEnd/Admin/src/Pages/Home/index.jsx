import React, { useState } from 'react'
import Sidebar from '../../Components/Sidebar'
import union from '../../assets/images/Union4.png'
import frame156 from '../../assets/images/Frame156.png'

import { BiSolidSchool } from "react-icons/bi";
import { FaMedal } from "react-icons/fa";

import { IoNotificationsOutline } from "react-icons/io5";

export default function Home() {
  const [open, setOpen] = useState(false)
  const getOpen = (e) => {
    setOpen(e)
  }
  const date = new Date()
  const month = new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(date);
  const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
  const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date);
  const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(date);




  return (
    <>
      <div className="overflow-hidden h-screen w-full relative flex">
        <img src={union} className='absolute scale-75 top-[-4rem] left-[-10rem]' alt="" />
        <div className={`${!open ? "w-[75%]" : "w-[97%]"} p-8 transition-all duration-1000 flex-col bg-red-300 h-screen`}>
          <div className="flex justify-between items-center bg-green-200 h-15 mb-4">
            <div className="flex justify-center items-center gap-5">
              <h3 className='text-[#19A297]'>هنرستان استارتاپی رکاد</h3>
              <BiSolidSchool className='text-[#19A297] scale-150' />
              <div className='w-12 flex justify-center items-center border-gray-400 h-12 border-1 rounded-[40px]'>
                <IoNotificationsOutline className='text-gray-400 scale-150' />
              </div>
            </div>
            <div className="flex justify-center items-center gap-5">
              <p className='text-gray-400'> امروز {week} {day} {month} ماه، {year}</p>
              <h1 className='text-[#19A297] font-bold text-xl'>داشبورد</h1>
            </div>
          </div>
          <div className="h-55  flex gap-5">

            <div className="grid grid-cols-2 gap-5 h-55 w-[70%]">
              <div className="bg-orange-300 h-25 p-8 flex items-center justify-center gap-8">
                <h2 className='text-[#202A5A] font- text-xl'>توکن‌ استفاده‌شده</h2>
                <p className='text-[#202A5A] font-semibold font- text-2xl'>12,300</p>
              </div>
              <div className="bg-orange-300 h-25 p-8 flex items-center justify-center gap-8">
                <h2 className='text-[#202A5A] font- text-xl'>توکن‌ استفاده‌شده</h2>
                <p className='text-[#202A5A] font-semibold font- text-2xl'>12,300</p>
              </div>
              <div className="bg-orange-300 h-25 p-8 flex items-center justify-center gap-8">
                <h2 className='text-[#202A5A] font- text-xl'>توکن‌ استفاده‌شده</h2>
                <p className='text-[#202A5A] font-semibold font- text-2xl'>12,300</p>
              </div>
              <div className="bg-orange-300 h-25 p-8 flex items-center justify-center gap-8">
                <h2 className='text-[#202A5A] font- text-xl'>توکن‌ استفاده‌شده</h2>
                <p className='text-[#202A5A] font-semibold font- text-2xl'>12,300</p>
              </div>

            </div>

            <div className={`relative h-55 rounded-lg overflow-hidden p-6 flex  flex-col  w-[30%] justify-between items-center   `}>
              <img src={frame156} className='absolute z-1 h-55 w-full object-cover top-[0]' alt="" />
              <div className="bg-[#202A5A] z-2 flex justify-center items-center w-20 h-20 rounded-[40px]"><FaMedal className='scale-250 text-[#ffff]' /></div>
              <p className='text-[#202A5A] z-2 font- font-semibold text-3xl'>22,951</p>
              <h2 className='text-[#202A5A] z-2 font- text-xl'>جمع کل امتیازات</h2>
            </div>
          </div>


        </div>
        <Sidebar activeNum={1} getOpen={getOpen} />
      </div>

    </>
  )
}
