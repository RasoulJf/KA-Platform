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


import { Link } from 'react-router-dom';

export default function Sidebar({ activeNum = 1 ,getOpen}) {
    const [active, setActive] = useState(1)
    if (active != activeNum) {
        setActive(activeNum)

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
    return (
        // <div className='relative'>

            <div className={`absolute flex-column right-0 w-85 h-screen transition duration-1000 ease-in-out bg-[#F3F3F3] ${!open ? "translate-x-[300px]" : ""}`}>
                <div className="w-85 h-45 flex justify-center relative items-center bg-linear-to-r from-[#19A297]  to-[#59BBAF]">
                    <div onClick={() => handleOpen()} className="w-9 h-9 rounded-[40px] flex items-center justify-center absolute top-20 left-[-18px] cursor-pointer bg-gray-200">
                        {open ? <IoIosArrowForward /> : <IoIosArrowBack />}
                    </div>
                    <img src={right} className='absolute rotate-90 scale-25 left-[-127px] top-[-134px]' alt="" />
                    <img src={right} className='absolute scale-25 right-[-127px] top-[-132px]' alt="" />
                    <div className={`absolute z-20 top-[125px] items-center justify-center  rounded-md bg-white transition-all duration-300 w-70 ${openProfile ? "h-45" : "h-25"} overflow-hidden flex-column`}>
                        <div className="flex justify-center items-center w-70 h-25 gap-5">
                            {openProfile ? 
                            <SlArrowUp onClick={()=>handleOpenProfile()} className='scale-100 cursor-pointer text-gray-400 mr-6' />
                                         : 
                            <SlArrowDown onClick={()=>handleOpenProfile()} className='scale-100 cursor-pointer text-gray-400 mr-6' />
                        } 

                            <div className='flex-column gap-2 text-end'>
                                <h3 className='text-lg font-semibold'>علیــرضا عزیــز‌پور</h3>
                                <h5 className='text-sm text-gray-400'>معاون</h5>
                            </div>
                            <div className='w-12 h-12'>
                                <img src={aziz} alt="" />
                            </div>
                        </div>
                        <button className={`w-40 mx-auto h-15 rounded-md bg-linear-to-r text-white justify-center items-center flex from-[#19A297] to-[#59BBAF] cursor-pointer`}>خروج از حساب کاربری</button>
                    </div>
                    <div className="flex gap-2 justify-center items-center mb-10">
                        <div className="flex-column justify-items-center items-center ">
                            <h3 className='text-white text-xl font-semibold'>پلتـفرم کــا</h3>
                            <p className='text-white text-[0.50rem] opacity-62'>سیستم جامع ارزیابی و پاداش</p>
                        </div>
                        <div className="rounded-xl flex justify-items-center items-center p-2 w-12 h-12 bg-white">
                            <img src={KAlogo} className='scale-50' alt="" />
                        </div>
                    </div>
                </div>
                <div className='grid grid-cols-1  text-end mt-20 w-85 justify-end h-80 '>
                    <div className={`h-15 w-85 relative flex text-end items-center text-lg  ${active == 1 ? "text-[#19A297] bg-linear-to-l font-semibold   from-[white] to-[#F3F3F3] " : "text-gray-400"}`}
                    ><Link to={'/'} className='z-10 flex w-85 justify-end mr-20 items-center gap-2'>
                            <h4>داشبــورد</h4>
                            <BsFillGridFill />
                        </Link>
                        <div className={`h-15 absolute w-40 right-[-0px] bg-linear-to-l from-[#59BBAF] opacity-20 to-[#F3F3F3] ${active != 1 ? "hidden" : ""
                            }`}>
                        </div>
                        <div className={`w-3 h-15 bg-[#19A297] absolute right-[0px] opacity-100  ${active != 1 ? "hidden" : ""
                            }`}></div>

                    </div>
                    <div className={`h-15 w-85 relative flex items-center text-lg  ${active == 2 ? "text-[#19A297] font-semibold  bg-linear-to-l from-[white] to-[#F3F3F3] " : "text-gray-400"}`}
                    ><Link to={'/add-data'} className='z-10 flex w-85 justify-end mr-20 items-center gap-2'>
                            <h4>ثبت اطلاعات</h4>
                            <TbPencilPlus />
                        </Link>
                        <div className={`h-15 absolute w-40 right-[0px] bg-linear-to-l from-[#59BBAF] opacity-20 to-[#F3F3F3] ${active != 2 ? "hidden" : ""
                            }`}>
                        </div>
                        <div className={`w-3 h-15 bg-[#19A297] absolute right-[0px] opacity-100 ${active != 2 ? "hidden" : ""
                            }`}></div>

                    </div>
                    <div className={`h-15 w-85 relative flex justify-center items-center text-lg   ${active == 3 ? "text-[#19A297] font-semibold bg-linear-to-l  from-[white] to-[#F3F3F3] " : "text-gray-400"}`}
                    ><Link to={"/requests"} className='z-10 flex w-85 justify-end mr-20 items-center gap-2'>
                            <h4>درخواست‌ها</h4>
                            <LuMails />
                        </Link >
                        <div className={`h-15 absolute w-40 right-[0px] bg-linear-to-l from-[#59BBAF] opacity-20 to-[#F3F3F3] ${active != 3 ? "hidden" : ""
                            }`}>
                        </div>
                        <div className={`w-3 h-15 bg-[#19A297] absolute right-[0px] opacity-100 ${active != 3 ? "hidden" : ""
                            }`}></div>

                    </div>
                    <div className={`h-15 w-85 relative flex justify-center items-center text-lg   ${active == 4 ? "text-[#19A297] font-semibold bg-linear-to-l  from-[white] to-[#F3F3F3] " : "text-gray-400"}`}
                    ><Link to={"/rewards"} className='z-10 flex w-85 justify-end mr-20 items-center gap-2'>
                            <h4>پاداش‌ها</h4>
                            <FaMedal />

                        </Link>
                        <div className={`h-15 absolute w-40 right-[0px] bg-linear-to-l from-[#59BBAF] opacity-20 to-[#F3F3F3] ${active != 4 ? "hidden" : ""
                            }`}>
                        </div>
                        <div className={`w-3 h-15 bg-[#19A297] absolute right-[0px] opacity-100 ${active != 4 ? "hidden" : ""
                            }`}></div>

                    </div>
                    <div className={`h-15 w-85 relative flex justify-center items-center text-lg   ${active == 5 ? "text-[#19A297] bg-linear-to-l font-semibold from-[white] to-[#F3F3F3] " : "text-gray-400"}`}
                    ><Link to={'/results'} className='z-10 flex w-85 justify-end mr-20 items-center gap-2'>
                            <h4>جداول و گزارشات</h4>
                            <MdBackupTable />

                        </Link>
                        <div className={`h-15 absolute w-40 right-[0px] bg-linear-to-l from-[#59BBAF] opacity-20 to-[#F3F3F3] ${active != 5 ? "hidden" : ""
                            }`}>
                        </div>
                        <div className={`w-3 h-15 bg-[#19A297] absolute right-[0px] opacity-100 ${active != 5 ? "hidden" : ""
                            }`}></div>

                    </div>
                </div>
                <div className="w-60 mt-12 mx-auto bg-gray-400 h-[1px] rounded-xl"></div>
                <div className="w-70 mt-12 mx-auto h-15 rounded-md bg-linear-to-r text-white justify-center items-center flex from-[#19A297] to-[#59BBAF] cursor-pointer">تنظیمات</div>

            </div>

        // </div>
    )
}
