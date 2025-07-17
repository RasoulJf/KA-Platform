import React, { useState } from "react";
import KAlogo from "../assets/images/K-LogoGreen.png";
import profile from "../assets/images/profile.png";
import frame1 from "../assets/images/Frame1.png";

import { BsFillGridFill } from "react-icons/bs";
import { LuMails } from "react-icons/lu";
import { FaMedal } from "react-icons/fa";
import { MdBackupTable } from "react-icons/md";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { SlArrowDown, SlArrowUp } from "react-icons/sl";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ getOpen }) {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  const [open, setOpen] = useState(true);
  const [openProfile, setOpenProfile] = useState(false);

  const handleOpen = () => {
    const newOpenState = !open;
    setOpen(newOpenState);
    if (getOpen) {
      getOpen(newOpenState);
    }
  };

  const handleOpenProfile = () => {
    setOpenProfile(!openProfile);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const menuItems = [
    { num: 1, to: "/", text: "داشبورد", icon: <BsFillGridFill /> },
    { num: 2, to: "/activities", text: "فعالیت‌ها", icon: <LuMails /> },
    { num: 3, to: "/rewards", text: "پاداش‌ها", icon: <FaMedal /> },
    { num: 4, to: "/results", text: "جداول امتیازات", icon: <MdBackupTable /> },
  ];

  const location = useLocation();

  // ====================== ۱. محاسبه موقعیت نشانگر ======================
  // ارتفاع هر آیتم منو (h-14 در Tailwind برابر با 3.5rem یا 56px است)
  const ITEM_HEIGHT = 56;
  // پیدا کردن اندیس آیتم فعال در آرایه
  const activeIndex = menuItems.findIndex(item => location.pathname === item.to);
  // محاسبه موقعیت Y برای transform
  const indicatorY = activeIndex !== -1 ? activeIndex * ITEM_HEIGHT : -ITEM_HEIGHT; // اگر آیتمی فعال نبود، نشانگر را مخفی کن

  return (
    <div
      className={`absolute flex-col right-0 h-screen transition-all duration-500 ease-in-out bg-[#F9F9F9] ${
        open ? "w-[22%]" : "w-[6.5%]"
      }`}
    >
      <div className="w-full h-[21vh] flex justify-center relative items-center bg-gradient-to-r from-[#19A297] to-[#59BBAF]">
        <img
          src={frame1}
          className="absolute z-0 h-full w-full object-cover top-[0]"
          alt=""
        />

        <div
          onClick={handleOpen}
          className="w-8 h-8 z-20 rounded-full flex items-center justify-center absolute top-5 left-[-16px] cursor-pointer bg-white shadow-md"
        >
          {open ? (
            <IoIosArrowForward className="text-gray-600" />
          ) : (
            <IoIosArrowBack className="text-gray-600" />
          )}
        </div>

        {/* کارت پروفایل کاربر */}
        <div
          className={`absolute z-20 top-[130px] 2xl:top-[16vh] items-center justify-center ${
            !open ? "hidden" : ""
          } rounded-lg bg-white shadow-sm transition-all duration-500 w-[85%] overflow-hidden flex flex-col`}
        >
          <div className="flex justify-between items-center w-full py-3 px-3 gap-2">
            {openProfile ? (
              <SlArrowUp onClick={handleOpenProfile} className="scale-75 cursor-pointer text-gray-400" />
            ) : (
              <SlArrowDown onClick={handleOpenProfile} className="scale-75 cursor-pointer text-gray-400" />
            )}
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1 text-end">
                <h3 className="text-sm font-semibold text-gray-800">
                  {user?.fullName || "کاربر مهمان"}
                </h3>
                <h5 className="text-[11px] text-gray-500">
                  {`دانش‌آموز پایۀ ${user?.grade || "نامشخص"}`}
                </h5>
              </div>
              <div className="w-11 h-11 flex-shrink-0 bg-[#19A297] rounded-full flex items-center justify-center">
                <img src={profile} className={`w-8 h-8`} alt="" />
              </div>
            </div>
          </div>
          {openProfile && (
            <div className="w-full px-3 pb-3">
              <button
                onClick={handleLogout}
                className={`w-full h-10 rounded-md bg-red-500 text-white justify-center items-center flex hover:bg-red-600 cursor-pointer`}
              >
                خروج از حساب
              </button>
            </div>
          )}
        </div>

        {/* آیکون پروفایل در حالت بسته */}
        <div
          className={`absolute z-20 top-[130px] left-0 right-0 mx-auto items-center justify-center flex ${
            open ? "hidden" : ""
          } rounded-lg bg-white shadow-sm transition-all duration-500 p-2 w-max`}
        >
          <div className="w-11 h-11 bg-[#19A297] rounded-full flex items-center justify-center">
            <img src={profile} className={`w-7 h-7`} alt="" />
          </div>
        </div>

        {/* لوگو و عنوان */}
        <div
          className={`flex z-10 gap-2 justify-center items-center mb-12 ${
            !open ? "hidden" : ""
          }`}
        >
          <div className="flex flex-col justify-center items-end">
            <h3 className="text-white text-xl font-bold">پلتفرم کا</h3>
            <p className="text-white text-[0.6rem] opacity-70">
              سیستم جامع ارزیابی و پاداش
            </p>
          </div>
          <div className="rounded-lg flex justify-center items-center p-2 w-12 h-12 bg-white">
            <img src={KAlogo} className="scale-75" alt="" />
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-grow w-full">
        <div className="relative w-full mt-24">
        
          {/* ====================== ۲. رندر کردن نشانگر متحرک ====================== */}
          <div
            className="absolute right-0 h-14 w-1.5 bg-[#19A297] z-10 transition-transform duration-300 ease-in-out"
            style={{ transform: `translateY(${indicatorY}px)` }}
          ></div>
          {/* ==================================================================== */}

          {menuItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.num}
                to={item.to}
                className={`relative flex items-center h-14 transition-colors duration-200
                  ${open ? "justify-end pr-8" : "justify-center"}
                  ${isActive ? "text-[#19A297] font-semibold" : "text-gray-400 hover:bg-gray-200/50"}
                  ${isActive && !open ? "bg-teal-500/10" : ""}
                `}
              >
                {isActive && open && (
                  <div className="absolute inset-0 bg-gradient-to-l from-white to-[#F9F9F9]"></div>
                )}
                <div className={`relative z-10 flex items-center ${open ? "gap-3" : "gap-0"}`}>
                  <h4 className={`text-base whitespace-nowrap transition-all duration-200 ${open ? "opacity-100" : "w-0 opacity-0"}`}>
                    {item.text}
                  </h4>
                  <div className="text-xl">{item.icon}</div>
                </div>

                {/* ============= ۳. نشانگر ثابت و قدیمی حذف شد ============= */}
              </Link>
            );
          })}
        </div>

        <div className={`mt-auto p-4 ${!open ? "hidden" : ""}`}>
          <button className="w-full py-2.5 rounded-lg bg-[#19A297] text-white font-semibold text-base hover:bg-[#148b80] transition-colors my-45">
            دستورالعمل
          </button>
        </div>
      </div>
    </div>
  );
}