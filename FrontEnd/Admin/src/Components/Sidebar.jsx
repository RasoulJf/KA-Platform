// components/Admin/Sidebar.jsx (نسخه نهایی و واکنش‌گرا)

import React, { useState } from "react";
import KAlogo from '../assets/images/K-LogoGreen.png';
import aziz from '../assets/images/aziz.png';
import frame1 from '../assets/images/Frame1.png';

import { TbPencilPlus } from "react-icons/tb";
import { BsFillGridFill } from "react-icons/bs";
import { LuMails } from "react-icons/lu";
import { FaMedal } from "react-icons/fa";
import { MdBackupTable } from "react-icons/md";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { SlArrowDown, SlArrowUp } from "react-icons/sl";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ getOpen }) {
  const user = {
    fullName: "علیرضا عزیزپور",
    role: "مدیر سامانه",
  };

  const [open, setOpen] = useState(true);
  const [openProfile, setOpenProfile] = useState(false);

  const handleOpen = () => {
    const newOpenState = !open;
    setOpen(newOpenState);
    if (getOpen) {
      getOpen(newOpenState);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const menuItems = [
    { num: 1, to: "/", text: "داشبورد", icon: <BsFillGridFill /> },
    { num: 2, to: "/add-data", text: "ثبت اطلاعات", icon: <TbPencilPlus /> },
    { num: 3, to: "/requests", text: "درخواست‌ها", icon: <LuMails /> },
    { num: 4, to: "/rewards", text: "پاداش‌ها", icon: <FaMedal /> },
    { num: 5, to: "/results", text: "گزارشات", icon: <MdBackupTable /> },
  ];

  const location = useLocation();

  const ITEM_HEIGHT = 56;
  const activeIndex = menuItems.findIndex(item => location.pathname === item.to);
  // اضافه کردن یک شرط برای مسیرهای تودرتو مثل /add-data/create
  const parentPath = "/" + location.pathname.split('/')[1];
  const activeParentIndex = menuItems.findIndex(item => item.to === parentPath);

  const finalActiveIndex = activeIndex !== -1 ? activeIndex : activeParentIndex;
  const indicatorY = finalActiveIndex !== -1 ? finalActiveIndex * ITEM_HEIGHT : -ITEM_HEIGHT;

  return (
    // <<< تغییر ۱: container اصلی به flex-col تبدیل شد >>>
    <div className={`flex flex-col right-0 h-screen transition-all duration-500 ease-in-out bg-[#F9F9F9] ${ open ? "w-[20%]" : "w-[6%]" }`}>
      
      {/* بخش هدر سایدبار - flex-shrink-0 برای جلوگیری از کوچک شدن */}
      <div className="w-full h-[21vh] flex-shrink-0 flex justify-center relative items-center bg-gradient-to-r from-[#19A297] to-[#59BBAF]">
        <img src={frame1} className="absolute z-0 h-full w-full object-cover top-[0]" alt="" />
        
        <div onClick={handleOpen} className="w-8 h-8 z-30 rounded-full flex items-center justify-center absolute top-5 left-[-16px] cursor-pointer bg-white shadow-md">
          {open ? <IoIosArrowForward className="text-gray-600" /> : <IoIosArrowBack className="text-gray-600" />}
        </div>
        
        {/* کارت پروفایل، لوگو و ... داخل هدر باقی می‌مانند */}
        <div className={`flex z-10 gap-2 justify-center items-center absolute top-8 ${!open ? "hidden" : ""}`}>
          <div className="flex flex-col justify-center items-end">
            <h3 className="text-white text-xl font-bold">پلتفرم کا</h3>
            <p className="text-white text-[0.6rem] opacity-70">سیستم جامع ارزیابی و پاداش</p>
          </div>
          <div className="rounded-lg flex justify-center items-center p-2 w-12 h-12 bg-white">
            <img src={KAlogo} className="scale-75" alt="logo" />
          </div>
        </div>

      </div>

      {/* <<< تغییر ۲: این div جدید برای جدا کردن پروفایل از منوها است >>> */}
      {/* این بخش اجازه می‌دهد پروفایل روی هدر و منو شناور باشد */}
      <div className="relative w-full h-24 flex-shrink-0">
          {/* کارت پروفایل ادمین (حالت باز) */}
          <div className={`absolute z-20 top-[-50px] left-0 right-0 mx-auto ${!open ? "hidden" : ""} rounded-lg bg-white shadow-sm transition-all duration-500 w-[85%] overflow-hidden flex flex-col`}>
              <div className="flex justify-between items-center w-full py-3 px-3 gap-2">
                  <button onClick={() => setOpenProfile(!openProfile)} className="p-1">
                      {openProfile ? <SlArrowUp className="scale-75 text-gray-400" /> : <SlArrowDown className="scale-75 text-gray-400" />}
                  </button>
                  <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1 text-end">
                          <h3 className="text-sm font-semibold text-gray-800">{user.fullName}</h3>
                          <h5 className="text-[11px] text-gray-500">{user.role}</h5>
                      </div>
                      <div className="w-11 h-11 flex-shrink-0">
                          <img src={aziz} className="w-11 h-11 rounded-full" alt="avatar" />
                      </div>
                  </div>
              </div>
              {openProfile && (
                  <div className="w-full px-3 pb-3">
                  <button onClick={handleLogout} className="w-full h-10 rounded-md bg-red-500 text-white flex justify-center items-center hover:bg-red-600 cursor-pointer">
                      خروج از حساب
                  </button>
                  </div>
              )}
          </div>

          {/* آیکون پروفایل در حالت بسته */}
          <div className={`absolute z-20 top-[-50px] left-0 right-0 mx-auto ${open ? "hidden" : ""} rounded-lg bg-white shadow-sm p-2 w-max`}>
              <div className="w-11 h-11">
                  <img src={aziz} className="w-11 h-11 rounded-full" alt="avatar" />
              </div>
          </div>
      </div>
      
      {/* <<< تغییر ۳: flex-grow باعث می‌شود این بخش بقیه فضا را پر کند >>> */}
      {/* و mt-24 حذف شد */}
      <div className="relative w-full flex-grow overflow-y-auto scrollbar-thin">
        {/* نشانگر متحرک */}
        <div className="absolute right-0 h-14 w-1.5 bg-[#19A297] z-10 transition-transform duration-300 ease-in-out"
          style={{ transform: `translateY(${indicatorY}px)` }}
        ></div>
        {/* آیتم‌های منو */}
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to) && (item.to !== '/' || location.pathname === '/');
          return (
            <Link key={item.num} to={item.to}
              className={`relative flex items-center h-14 transition-colors duration-200 ${open ? "justify-end pr-8" : "justify-center"} ${isActive ? "text-[#19A297] font-semibold" : "text-gray-400 hover:bg-gray-200/50"} ${isActive && !open ? "bg-teal-500/10" : ""}`}
            >
              {isActive && open && (
                <div className="absolute inset-0 bg-gradient-to-l from-white to-[#F9F9F9]"></div>
              )}
              <div className={`relative z-10 flex items-center ${open ? "gap-3" : "gap-0"}`}>
                <h4 className={`text-base whitespace-nowrap transition-all duration-200 ${open ? "opacity-100" : "w-0 opacity-0"}`}>{item.text}</h4>
                <div className="text-xl">{item.icon}</div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* دکمه تنظیمات (فوتر) */}
      <div className={`p-4 flex-shrink-0 mb-[14vh] ${!open ? "hidden" : ""}`}>
        <button className="w-full py-2.5 rounded-lg bg-[#19A297] text-white font-semibold text-base hover:bg-[#148b80] transition-colors">
          تنظیمات
        </button>
      </div>
    </div>
  );
}