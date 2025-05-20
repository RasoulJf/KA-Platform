import React, { useState } from 'react';
import Sidebar from '../../Components/Sidebar';
import union from '../../assets/images/Union4.png';
import frame156 from '../../assets/images/Frame156.png';
import frame6 from '../../assets/images/Frame6.png';
import { BiSolidSchool } from "react-icons/bi";
import { FaMedal } from "react-icons/fa";
import { IoNotificationsOutline } from "react-icons/io5";
import { Link } from 'react-router-dom';

export default function Home({ Open }) {
  const date = new Date();
  const month = new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(date);
  const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
  const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date);
  const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(date);

  return (
    <>
      {/* بک‌گراند تزئینی */}
      <img src={union} className="absolute scale-75 top-[-4rem] left-[-10rem]" alt="" />

      {/* کانتینر اصلی داشبورد */}
      <div className={`${!Open ? "w-[80%]" : "w-[94%]"} p-8 transition-all duration-500 flex-col h-screen`}>

        {/* هدر بالا */}
        <div className="flex justify-between items-center h-[5vh] mb-4">
          <div className="flex justify-center items-center gap-5">
            <h3 className="text-[#19A297] text-xs">هنرستان استارتاپی رکاد</h3>
            <BiSolidSchool className="text-[#19A297] ml-[-10px] scale-150" />
            <div className="w-8 h-8 flex justify-center items-center border border-gray-400 rounded-full">
              <IoNotificationsOutline className="text-gray-400" />
            </div>
          </div>
          <div className="flex justify-center items-center gap-5">
            <p className="text-gray-400 text-xs">امروز {week} {day} {month} ماه، {year}</p>
            <h1 className="text-[#19A297] font-semibold text-lg">داشبورد</h1>
          </div>
        </div>

        {/* بخش کارت‌های آماری */}
        <div className="h-[20vh] mb-4 flex gap-5">
          <div className="grid grid-cols-2 gap-[2vh] h-full w-[70%]">
            {[
              "توکن‌ استفاده‌شده",
              "توکن‌ قابل‌ استفاده",
              "پاداش‌ پرداخت‌شده",
              "درخواست‌ تأییدشده",
            ].map((title, idx) => (
              <div key={idx} className="relative bg-orange-300 rounded-lg overflow-hidden h-[9vh] p-8 flex items-center justify-center gap-8">
                <img src={frame6} className="absolute z-0 h-full w-full object-cover top-0" alt="" />
                <h2 className="text-[#202A5A] font-semibold text-xl z-10">{title}</h2>
                <p className="text-[#202A5A] font-bold text-2xl z-10">12,300</p>
              </div>
            ))}
          </div>

          {/* کارت مجموع امتیازات */}
          <div className="relative h-full w-[30%] rounded-lg overflow-hidden p-4 flex flex-col justify-between items-center">
            <img src={frame156} className="absolute z-0 h-full w-full object-cover top-0" alt="" />
            <div className="bg-[#202A5A] z-10 flex justify-center items-center w-14 h-14 rounded-full">
              <FaMedal className="scale-150 text-white" />
            </div>
            <p className="text-[#202A5A] font-bold text-3xl z-10">22,951</p>
            <h2 className="text-[#202A5A] text-xl z-10">جمع کل امتیازات</h2>
          </div>
        </div>

        {/* جدول درخواست‌های جدید */}
        <div className="w-full mb-4 flex gap-[2vh] h-[20vh]">
          {[1, 2].map((_, idx) => (
            <table key={idx} className="w-1/2 h-full border-2 border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-[#19A297] text-white h-[5vh]">
                <tr>
                  <th className="text-right pr-2 py-2"></th>
                  <th className="text-right pr-2 py-2"></th>
                  <th className="text-right pr-2 py-2">درخواست‌های جدید</th>
                </tr>

              </thead>
              <tbody>
                {["رضا احمدی", "سارا محمدی", "علی رضایی"].map((name, i) => (
                  <tr key={i} className={`w-full h-[5vh] ${i % 2 !== 0 ? "bg-gray-100" : ""} border-b border-gray-200 text-right`}>
                    <td className="text-left pl-2">
                      <Link to="/" className="text-[#19A297] hover:underline">مشاهده</Link>
                    </td>
                    <td className="text-gray-400 text-xs">امروز {week} {day} {month} ماه، {year}</td>
                    <td className="pr-2 text-[#202A5A]">{name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>

        {/* جدول پایه‌های مختلف */}
        <div className="w-full flex gap-[2vh] mb-4 h-[30vh]">
          {[
            { grade: "پایــه دوازدهــم", code: 301 },
            { grade: "پایــه یازدهــم", code: 201 },
            { grade: "پایــه دهــم", code: 101 },
          ].map((item, idx) => (
            <table key={idx} className="w-1/3 h-[25vh] border-2 border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-[#202A5A] text-white h-[5vh]">
                <tr>
                  <th className='flex text-right justify-start pl-2  w-full py-2'>
                    <p className="text-gray-400 text-xs">مشاهده همه</p>
                  </th>
                  <th className="text-right"></th>
                  <th className="flex text-right justify-end pr-2  w-full py-2">
                    {item.grade}
                  </th>
                </tr>

              </thead>
              <tbody>
                {["رضا احمدی", "سارا محمدی", "علی رضایی", "سارا محمدی", "علی رضایی"].map((name, i) => (
                  <tr key={i} className={`w-full h-[5vh] ${i % 2 !== 0 ? "bg-gray-100" : ""} border-b border-gray-200 text-right`}>
                    <td className="text-left pl-2">
                      <Link to="/" className="text-[#19A297] hover:underline">780</Link>
                    </td>
                    <td className="text-gray-400 text-xs">({item.code})</td>
                    <td className="pr-2 text-[#19A297]">{name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>

        {/* میانگین امتیازات */}
        <div className="w-full flex gap-[2vh] h-[30vh]">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="w-1/3 h-[7vh] px-3 flex justify-between items-center border-2 border-[#202A5A] rounded-lg">
              <p className="text-[#202A5A]">220</p>
              <h4 className="text-[#202A5A]">میانگین امتیازات</h4>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}
