import React, { useState } from 'react'
import KAlogo from '../assets/images/K-LogoGreen.png'
import right from '../assets/images/right.png'
import aziz from '../assets/images/aziz.png'
import { TbPencilPlus } from "react-icons/tb";
import { BsFillGridFill } from "react-icons/bs";
import { LuMails } from "react-icons/lu";
import { IoIosArrowDown } from "react-icons/io";
import { FaMedal } from "react-icons/fa";
import { MdBackupTable } from "react-icons/md";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { SlArrowDown, SlArrowUp } from "react-icons/sl";
import frame50 from '../assets/images/Frame50.png'


import { Link, useNavigate } from 'react-router-dom';

export default function Sidebar({ activeNum = 1, getOpen }) {
    const navigate = useNavigate()
    const [active, setActive] = useState(1)
    // if (active != activeNum) {
    //     setActive(activeNum)

    // }
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const handleActive=(num)=>{
        setActive(num)
    }
    const [open, setOpen] = useState(true)
    const handleOpen = () => {
        setOpen(!open)
        getOpen(open)
    }
    const [openProfile, setOpenProfile] = useState(false)
    const handleOpenProfile = () => {
        setOpenProfile(!openProfile)
    }
    const handleLogout = () => {
        // ۱. توکن و اطلاعات کاربر را از حافظه مرورگر پاک کن
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // ۲. به جای navigate، صفحه را به صورت کامل رفرش و به آدرس لاگین هدایت کن
        // این کار مشکل را به طور قطعی حل می‌کند
        window.location.href = '/login';
    }
    return (
        // <div className='relative'>

        <div className={`absolute flex-column  right-0 w-[20%] h-screen transition duration-500 ease-in-out bg-[#F3F3F3] ${!open ? "translate-x-[70%]" : ""}`}>
            <div className="w-full h-[21vh] flex justify-center relative items-center bg-linear-to-r from-[#19A297] to-[#59BBAF]">
                <img src={frame50} className='absolute z-1 h-full w-full object-cover top-[0]' alt="" />

                <div onClick={() => handleOpen()} className="w-9 h-9 rounded-[40px] flex items-center justify-center z-30 absolute top-20 left-[-18px] cursor-pointer bg-gray-200">
                    {open ? <IoIosArrowForward /> : <IoIosArrowBack />}
                </div>

                <div className={`absolute z-20 top-[125px] 2xl:top-[17vh] items-center justify-center ${!open ? "hidden" : ""}  rounded-md bg-white transition-all duration-300 w-[80%] ${openProfile ? "h-45" : "h-25"} overflow-hidden flex-column`}>
                    <div className="flex justify-center items-center w-full h-25 gap-2">
                        {openProfile ?
                            <SlArrowUp onClick={() => handleOpenProfile()} className='scale-70 cursor-pointer text-gray-400 mr-6' />
                            :
                            <SlArrowDown onClick={() => handleOpenProfile()} className='scale-70 cursor-pointer text-gray-400 mr-6' />
                        }

                        <div className='flex-column gap-2 text-end'>
                            <h3 className='text-sm font-semibold'>علیــرضا عزیــز‌پور</h3>
                            <h5 className='text-sm text-gray-400'>مدیر سامانه</h5>
                        </div>
                        <div className='w-12 h-12'>
                            <img src={aziz} alt="" />
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className={`w-[50%] mx-auto h-[7vh] rounded-md bg-linear-to-r text-white justify-center items-center flex from-[#19A297] to-[#59BBAF] cursor-pointer`}>خروج از حساب کاربری</button>
                </div>

                <div className={`absolute z-20 top-[125px] left-[10px] items-center justify-center flex ${open ? " hidden" : ""}  rounded-md bg-white transition-all duration-300 w-[20%] h-[10vh] overflow-hidden flex-column`}>
                        <div className='w-12 h-12'>
                            <img src={aziz} alt="" />
                        </div>
                </div>

                <div className={`flex z-2 gap-2 justify-center items-center mb-10 ${!open ? "hidden" : ""}`}>
                    <div className="flex-column justify-items-center items-center ">
                        <h3 className='text-white text-xl font-semibold'>پلتـفرم کــا</h3>
                        <p className='text-white text-[0.50rem] opacity-62'>سیستم جامع ارزیابی و پاداش</p>
                    </div>
                    <div className="rounded-xl flex justify-items-center items-center p-2 w-12 h-12 bg-white">
                        <img src={KAlogo} className='scale-50' alt="" />
                    </div>
                </div>
            </div>
            <div className='grid grid-cols-1 relative  text-end mt-25 w-full justify-end h-80 2xl:h-[40vh]'>
            <div className={`h-[7vh] w-[30%] absolute transition duration-300 ${open ? 'hidden' : ""} flex text-end items-center text-sm transition duration-500  ${active == 1 ? "text-[#19A297] bg-linear-to-l font-semibold   from-[white] to-[#F3F3F3] " : "text-gray-400"}`}
                ><Link onClick={()=>handleActive(1)} to={'/'} className='z-10 flex w-[100%] justify-end mr-10 items-center gap-2'>
                        <BsFillGridFill />
                    </Link>
                    <div className={`h-[7vh] absolute  w-[70%] right-[-0px] bg-linear-to-l transition duration-500 z-2 from-[#59BBAF] opacity-20 to-[#F3F3F3] ${active == 1 ? "" : active == 2 ? "translate-y-16" : active == 3 ? "translate-y-32" :  active == 4 ? "translate-y-48" : active == 5 ? "translate-y-64" : ""
                        }`}>
                    </div>
                    <div className={`w-3 h-[7vh] bg-[#19A297] transition duration-500 absolute z-2 right-[0px] opacity-100  ${active == 1 ? "translate-y-0" : active == 2 ? "translate-y-16" : active == 3 ? "translate-y-32" : active == 4 ? "translate-y-48" : active == 5 ? "translate-y-64" : ""
                        }`}></div>

                </div>
                <div className={`h-[7vh] w-[30%] absolute transition duration-300 ${open ? 'hidden' : ""} top-16 flex items-center text-sm transition duration-500 ${active == 2 ? "text-[#19A297] font-semibold  bg-linear-to-l from-[white] to-[#F3F3F3] " : "text-gray-400"}`}
                ><Link onClick={()=>handleActive(2)} to={'/add-data'} className='z-10 flex w-full justify-end mr-10 items-center gap-2'>
                        <TbPencilPlus />
                    </Link>


                </div>
                <div className={`h-[7vh] w-[30%] absolute transition duration-300 ${open ? 'hidden' : ""} top-32 flex justify-center items-center text-sm   ${active == 3 ? "text-[#19A297] font-semibold bg-linear-to-l  from-[white] to-[#F3F3F3] " : "text-gray-400"}`}
                ><Link onClick={()=>handleActive(3)} to={"/requests"} className='z-10 flex w-full justify-end mr-10 items-center gap-2'>
                        <LuMails />
                    </Link >


                </div>
                <div className={`h-[7vh] w-[30%] absolute transition duration-300 ${open ? 'hidden' : ""} top-48 flex justify-center items-center text-sm   ${active == 4 ? "text-[#19A297] font-semibold bg-linear-to-l  from-[white] to-[#F3F3F3] " : "text-gray-400"}`}
                ><Link onClick={()=>handleActive(4)} to={"/rewards"} className='z-10 flex w-full justify-end mr-10 items-center gap-2'>
                        <FaMedal />

                    </Link>


                </div>
                <div className={`h-[7vh] w-[30%] absolute transition duration-300 ${open ? 'hidden' : ""} top-64 flex justify-center items-center text-sm   ${active == 5 ? "text-[#19A297] font-semibold bg-linear-to-l  from-[white] to-[#F3F3F3] " : "text-gray-400"}`}
                ><Link onClick={()=>handleActive(5)} to={"/rewards"} className='z-10 flex w-full justify-end mr-10 items-center gap-2'>
                        <MdBackupTable />

                    </Link>


                </div>

                <div className={`h-[7vh] w-full relative flex text-end items-center text-sm transition duration-500  ${active == 1 ? "text-[#19A297] bg-linear-to-l font-semibold   from-[white] to-[#F3F3F3] " : "text-gray-400"}`}
                ><Link onClick={()=>handleActive(1)} to={'/'} className='z-10 flex w-[100%] justify-end mr-10 items-center gap-2'>
                        <h4>داشبــورد</h4>
                        <BsFillGridFill />
                    </Link>
                    <div className={`h-[7vh] absolute w-[30%] right-[-0px] bg-linear-to-l transition duration-500 z-2 from-[#59BBAF] opacity-20 to-[#F3F3F3] ${active == 1 ? "" : active == 2 ? "translate-y-16 2xl:translate-y-[8vh]" : active == 3 ? "translate-y-32  2xl:translate-y-[16vh]" :  active == 4 ? "translate-y-48  2xl:translate-y-[24vh]" : active == 5 ? "translate-y-64  2xl:translate-y-[32vh]" : ""
                        }`}>
                    </div>
                    <div className={`w-3 h-[7vh] bg-[#19A297] transition duration-500 absolute z-2 right-[0px] opacity-100  ${active == 1 ? "translate-y-0" : active == 2 ? "translate-y-16  2xl:translate-y-[8vh]" : active == 3 ? "translate-y-32  2xl:translate-y-[16vh]" : active == 4 ? "translate-y-48   2xl:translate-y-[24vh]" : active == 5 ? "translate-y-64  2xl:translate-y-[32vh]" : ""
                        }`}></div>

                </div>
                <div className={`h-[7vh] w-full relative flex items-center text-sm transition duration-500 ${active == 2 ? "text-[#19A297] font-semibold  bg-linear-to-l from-[white] to-[#F3F3F3] " : "text-gray-400"}`}
                ><Link onClick={()=>handleActive(2)} to={'/add-data'} className='z-10 flex w-full justify-end mr-10 items-center gap-2'>
                        <h4>ثبت اطلاعات</h4>
                        <TbPencilPlus />
                    </Link>


                </div>
                <div className={`h-[7vh] w-full relative flex justify-center items-center text-sm   ${active == 3 ? "text-[#19A297] font-semibold bg-linear-to-l  from-[white] to-[#F3F3F3] " : "text-gray-400"}`}
                ><Link onClick={()=>handleActive(3)} to={"/requests"} className='z-10 flex w-full justify-end mr-10 items-center gap-2'>
                        <h4>درخواست‌ها</h4>
                        <LuMails />
                    </Link >


                </div>
                <div className={`h-[7vh] w-full relative flex justify-center items-center text-sm   ${active == 4 ? "text-[#19A297] font-semibold bg-linear-to-l  from-[white] to-[#F3F3F3] " : "text-gray-400"}`}
                ><Link onClick={()=>handleActive(4)} to={"/rewards"} className='z-10 flex w-full justify-end mr-10 items-center gap-2'>
                        <h4>پاداش‌ها</h4>
                        <FaMedal />

                    </Link>


                </div>
                <div className={`h-[7vh] w-full relative flex justify-center items-center text-sm   ${active == 5 ? "text-[#19A297] bg-linear-to-l font-semibold from-[white] to-[#F3F3F3] " : "text-gray-400"}`}
                ><Link onClick={()=>handleActive(5)} to={'/results'} className='z-10 flex w-full justify-end mr-10 items-center gap-2'>
                        <h4>جداول و گزارشات</h4>
                        <MdBackupTable />

                    </Link>


                </div>
            </div>
            <div className={`w-[85%] mt-12 mx-auto bg-gray-400 h-[1px] rounded-xl ${!open ? "hidden" : ""}`}></div>
            <div className={`w-[80%] mt-12 mx-auto h-[7vh] rounded-md bg-linear-to-r text-white justify-center items-center flex from-[#19A297] to-[#59BBAF] 2xl:mt-30 cursor-pointer ${!open ? "hidden" : ""}`}>تنظیمات</div>

        </div>

        // </div>
    )
}
