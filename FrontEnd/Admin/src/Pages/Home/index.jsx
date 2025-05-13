import React, { useState } from 'react'
import Sidebar from '../../Components/Sidebar'
import union from '../../assets/images/Union4.png'
import frame156 from '../../assets/images/Frame156.png'
import frame6 from '../../assets/images/Frame6.png'


import { BiSolidSchool } from "react-icons/bi";
import { FaMedal } from "react-icons/fa";

import { IoNotificationsOutline } from "react-icons/io5";
import { Link } from 'react-router-dom'

export default function Home({ Open }) {
  // const [open, setOpen] = useState(false)
  // const getOpen = (e) => {
  //   setOpen(e)
  // }
  const date = new Date()
  const month = new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(date);
  const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
  const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date);
  const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(date);




  return (
    <>

      <img src={union} className='absolute scale-75 top-[-4rem] left-[-10rem]' alt="" />
      <div className={`${!Open ? "w-[80%]" : "w-[94%]"} p-8 transition-all duration-500 flex-col  h-screen`}>
        <div className="flex justify-between items-center h-[5vh] mb-4">
          <div className="flex justify-center items-center gap-5">
            <h3 className='text-[#19A297] text-xs'>هنرستان استارتاپی رکاد</h3>
            <BiSolidSchool className='text-[#19A297] ml-[-10px] scale-150' />
            <div className='w-8 flex justify-center items-center border-gray-400 h-8 border-1 rounded-[40px]'>
              <IoNotificationsOutline className='text-gray-400 scale-100' />
            </div>
          </div>
          <div className="flex justify-center items-center gap-5">
            <p className='text-gray-400 text-xs'> امروز {week} {day} {month} ماه، {year}</p>
            <h1 className='text-[#19A297] font-semibold text-lg'>داشبورد</h1>
          </div>
        </div>
        <div className="h-[20vh] mb-4  flex gap-5">

          <div className="grid grid-cols-2 gap-[2vh] h-[20vh] w-[70%]">
            <div className="relative bg-orange-300 rounded-lg overflow-hidden h-[9vh] p-8 flex items-center justify-center gap-8">
              <img src={frame6} className='absolute z-1 h-[9vh] w-full object-cover top-[0]' alt="" />
              <h2 className='text-[#202A5A] z-2 font- text-xl'>توکن‌ استفاده‌شده</h2>
              <p className='text-[#202A5A] z-2 font-semibold font- text-2xl'>12,300</p>
            </div>
            <div className="relative bg-orange-300 rounded-lg overflow-hidden h-[9vh] p-8 flex items-center justify-center gap-8">
              <img src={frame6} className='absolute z-1 h-[9vh] w-full object-cover top-[0]' alt="" />
              <h2 className='text-[#202A5A] z-2 font- text-xl'>توکن‌ قابل‌ استفاده</h2>
              <p className='text-[#202A5A] z-2 font-semibold font- text-2xl'>12,300</p>
            </div>
            <div className="relative bg-orange-300 rounded-lg overflow-hidden h-[9vh] p-8 flex items-center justify-center gap-8">
              <img src={frame6} className='absolute z-1 h-[9vh] w-full object-cover top-[0]' alt="" />
              <h2 className='text-[#202A5A] z-2 font- text-xl'>پاداش‌ پرداخت‌شده</h2>
              <p className='text-[#202A5A] z-2 font-semibold font- text-2xl'>12,300</p>
            </div>
            <div className="relative bg-orange-300 rounded-lg overflow-hidden h-[9vh] p-8 flex items-center justify-center gap-8">
              <img src={frame6} className='absolute z-1 h-[9vh] w-full object-cover top-[0]' alt="" />
              <h2 className='text-[#202A5A] z-2 font- text-xl'>درخواست‌ تأییدشده</h2>
              <p className='text-[#202A5A] z-2 font-semibold font- text-2xl'>12,300</p>
            </div>

          </div>

          <div className={`relative h-[20vh] rounded-lg overflow-hidden p-4 flex  flex-col  w-[30%] justify-between items-center   `}>
            <img src={frame156} className='absolute z-1 h-[20vh] w-full object-cover top-[0]' alt="" />
            <div className="bg-[#202A5A] z-2 flex justify-center items-center w-14 h-14 rounded-[40px] "><FaMedal className='scale-150 text-[#ffff]' /></div>
            <p className='text-[#202A5A] z-2 font- font-semibold text-3xl'>22,951</p>
            <h2 className='text-[#202A5A] z-2 font- text-xl'>جمع کل امتیازات</h2>
          </div>
        </div>

        <div className='w-[100%] mb-4 flex gap-[2vh] h-[20vh]'>
          <table className='w-[50%] h-[20vh] outline-gray-200 outline-2 overflow-hidden rounded-lg'>
            <thead className='bg-[#19A297] text-white border-gray-400 border-b-2  w-[100%] h-[5vh]'>
              <tr className='h-full w-full'>
                <th className='font-medium text-right pr-2 py-2'>درخواست‌های جدید</th>
              </tr>
            </thead>
            <tbody className='w-[100%] h-[15vh]'>
              <tr className='border-gray-200 relative border-b-2 text-right flex h-[5vh] justify-end gap-[1vh] w-full items-center'>
                <Link className='left-[4vh] absolute'>
                  مشاهده
                </Link>
                <p className='text-gray-400 text-xs'> امروز {week} {day} {month} ماه، {year}</p>
                <td className='pr-2 text-[#202A5A]'>رضا احمدی</td>
              </tr>
              <tr className='border-gray-200 bg-gray-100 relative border-b-2 flex text-right justify-end gap-[1vh] w-full h-[5vh] items-center'>
                <Link className='left-[4vh] absolute'>
                  مشاهده
                </Link>
                <p className='text-gray-400 text-xs'> امروز {week} {day} {month} ماه، {year}</p>
                <td className='pr-2 text-[#202A5A] '>سارا محمدی</td>
              </tr>
              <tr className='text-right flex relative h-[5vh] gap-[1vh] justify-end w-full items-center'>
                <Link className='left-[4vh] absolute'>
                  مشاهده
                </Link>
                <p className='text-gray-400 text-xs'> امروز {week} {day} {month} ماه، {year}</p>
                <td className='pr-2 text-[#202A5A]'>علی رضایی</td>
              </tr>
            </tbody>
          </table>
          <table className='w-[50%] h-[20vh] outline-gray-200 outline-2 overflow-hidden rounded-lg'>
            <thead className='bg-[#19A297] text-white border-gray-400 border-b-2  w-[100%] h-[5vh]'>
              <tr className='h-full w-full'>
                <th className='font-medium text-right pr-2 py-2'>درخواست‌های جدید</th>
              </tr>
            </thead>
            <tbody className='w-[100%] h-[15vh]'>
              <tr className='border-gray-200 relative border-b-2 text-right flex h-[5vh] justify-end gap-[1vh] w-full items-center'>
                <Link className='left-[4vh] absolute'>
                  مشاهده
                </Link>
                <p className='text-gray-400 text-xs'> امروز {week} {day} {month} ماه، {year}</p>
                <td className='pr-2 text-[#202A5A]'>رضا احمدی</td>
              </tr>
              <tr className='border-gray-200 bg-gray-100 relative border-b-2 flex text-right justify-end gap-[1vh] w-full h-[5vh] items-center'>
                <Link className='left-[4vh] absolute'>
                  مشاهده
                </Link>
                <p className='text-gray-400 text-xs'> امروز {week} {day} {month} ماه، {year}</p>
                <td className='pr-2 text-[#202A5A] '>سارا محمدی</td>
              </tr>
              <tr className='text-right flex relative h-[5vh] gap-[1vh] justify-end w-full items-center'>
                <Link className='left-[4vh] absolute'>
                  مشاهده
                </Link>
                <p className='text-gray-400 text-xs'> امروز {week} {day} {month} ماه، {year}</p>
                <td className='pr-2 text-[#202A5A]'>علی رضایی</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className='w-[100%] flex gap-[2vh] mb-4 h-[30vh]'>
          <table className='w-[33%] h-[25vh] outline-gray-200 outline-2 overflow-hidden rounded-lg'>
            <thead className='bg-[#202A5A] text-white border-gray-400 border-b-2  w-[100%] h-[5vh]'>
              <tr className='h-full w-full'>
              <th className='font-medium h-[5vh] flex w-full justify-between px-3 items-center  text-right pr-2 py-2'>
                  <p className='text-gray-400 text-xs'>مشاهده همه</p>
                  پایــه دوازدهــم</th>              </tr>
            </thead>
            <tbody className='w-[100%] h-[15vh]'>
              <tr className='border-gray-200 relative border-b-2 text-right flex h-[5vh] justify-end gap-[1vh] w-full items-center'>
                <Link className='left-[2vh] text-[#19A297] absolute'>
                  780
                </Link>
                <p className='text-gray-400 text-xs'>(301)</p>
                <td className='pr-2 text-[#19A297]'>رضا احمدی</td>
              </tr>
              <tr className='border-gray-200 bg-gray-100 relative border-b-2 flex text-right justify-end gap-[1vh] w-full h-[5vh] items-center'>
                <Link className='left-[2vh] text-[#19A297] absolute'>
                  780
                </Link>
                <p className='text-gray-400 text-xs'>(301)</p>
                <td className='pr-2 text-[#19A297] '>سارا محمدی</td>
              </tr>
              <tr className='text-right flex relative h-[5vh] gap-[1vh] justify-end w-full items-center'>
                <Link className='left-[2vh] text-[#19A297] absolute'>
                  780
                </Link>
                <p className='text-gray-400 text-xs'>(301)</p>
                <td className='pr-2 text-[#19A297]'>علی رضایی</td>
              </tr>
              <tr className='border-gray-200 bg-gray-100 relative border-b-2 flex text-right justify-end gap-[1vh] w-full h-[5vh] items-center'>
                <Link className='left-[2vh] text-[#19A297] absolute'>
                  780
                </Link>
                <p className='text-gray-400 text-xs'>(301)</p>
                <td className='pr-2 text-[#19A297] '>سارا محمدی</td>
              </tr>
              <tr className='text-right flex relative h-[5vh] gap-[1vh] justify-end w-full items-center'>
                <Link className='left-[2vh] text-[#19A297] absolute'>
                  780
                </Link>
                <p className='text-gray-400 text-xs'>(301)</p>
                <td className='pr-2 text-[#19A297]'>علی رضایی</td>
              </tr>
            </tbody>
          </table>
          <table className='w-[33%] h-[25vh] outline-gray-200 outline-2 overflow-hidden rounded-lg'>
            <thead className='bg-[#202A5A] text-white border-gray-400 border-b-2  w-[100%] h-[5vh]'>
              <tr className='h-full w-full'>
              <th className='font-medium h-[5vh] flex w-full justify-between px-3 items-center  text-right pr-2 py-2'>
                  <p className='text-gray-400 text-xs'>مشاهده همه</p>
                  پایــه یازدهــم</th>
              </tr>
            </thead>
            <tbody className='w-[100%] h-[15vh]'>
              <tr className='border-gray-200 relative border-b-2 text-right flex h-[5vh] justify-end gap-[1vh] w-full items-center'>
                <Link className='left-[2vh] text-[#19A297] absolute'>
                  780
                </Link>
                <p className='text-gray-400 text-xs'>(201)</p>
                <td className='pr-2 text-[#19A297]'>رضا احمدی</td>
              </tr>
              <tr className='border-gray-200 bg-gray-100 relative border-b-2 flex text-right justify-end gap-[1vh] w-full h-[5vh] items-center'>
                <Link className='left-[2vh] text-[#19A297] absolute'>
                  780
                </Link>
                <p className='text-gray-400 text-xs'>(201)</p>
                <td className='pr-2 text-[#19A297] '>سارا محمدی</td>
              </tr>
              <tr className='text-right flex relative h-[5vh] gap-[1vh] justify-end w-full items-center'>
                <Link className='left-[2vh] text-[#19A297] absolute'>
                  780
                </Link>
                <p className='text-gray-400 text-xs'>(201)</p>
                <td className='pr-2 text-[#19A297]'>علی رضایی</td>
              </tr>
              <tr className='border-gray-200 bg-gray-100 relative border-b-2 flex text-right justify-end gap-[1vh] w-full h-[5vh] items-center'>
                <Link className='left-[2vh] text-[#19A297] absolute'>
                  780
                </Link>
                <p className='text-gray-400 text-xs'>(201)</p>
                <td className='pr-2 text-[#19A297] '>سارا محمدی</td>
              </tr>
              <tr className='text-right flex relative h-[5vh] gap-[1vh] justify-end w-full items-center'>
                <Link className='left-[2vh] text-[#19A297] absolute'>
                  780
                </Link>
                <p className='text-gray-400 text-xs'>(201)</p>
                <td className='pr-2 text-[#19A297]'>علی رضایی</td>
              </tr>
            </tbody>
          </table>
          <table className='w-[33%] h-[25vh] outline-gray-200 outline-2 overflow-hidden rounded-lg'>
            <thead className='bg-[#202A5A] text-white border-gray-400 border-b-2  w-[100%] h-[5vh]'>
              <tr className='h-full w-full'>
                <th className='font-medium h-[5vh] flex w-full justify-between px-3 items-center  text-right pr-2 py-2'>
                  <p className='text-gray-400 text-xs'>مشاهده همه</p>
                  پایــه دهــم</th>
              </tr>
            </thead>
            <tbody className='w-[100%] h-[15vh]'>
              <tr className='border-gray-200 relative border-b-2 text-right flex h-[5vh] justify-end gap-[1vh] w-full items-center'>
                <Link className='left-[2vh] text-[#19A297] absolute'>
                  780
                </Link>
                <p className='text-gray-400 text-xs'>(101)</p>
                <td className='pr-2 text-[#19A297]'>رضا احمدی</td>
              </tr>
              <tr className='border-gray-200 bg-gray-100 relative border-b-2 flex text-right justify-end gap-[1vh] w-full h-[5vh] items-center'>
                <Link className='left-[2vh] text-[#19A297] absolute'>
                  780
                </Link>
                <p className='text-gray-400 text-xs'>(101)</p>
                <td className='pr-2 text-[#19A297] '>سارا محمدی</td>
              </tr>
              <tr className='text-right flex relative h-[5vh] gap-[1vh] justify-end w-full items-center'>
                <Link className='left-[2vh] text-[#19A297] absolute'>
                  780
                </Link>
                <p className='text-gray-400 text-xs'>(101)</p>
                <td className='pr-2 text-[#19A297]'>علی رضایی</td>
              </tr>
              <tr className='border-gray-200 bg-gray-100 relative border-b-2 flex text-right justify-end gap-[1vh] w-full h-[5vh] items-center'>
                <Link className='left-[2vh] text-[#19A297] absolute'>
                  780
                </Link>
                <p className='text-gray-400 text-xs'>(101)</p>
                <td className='pr-2 text-[#19A297] '>سارا محمدی</td>
              </tr>
              <tr className='text-right flex relative h-[5vh] gap-[1vh] justify-end w-full items-center'>
                <Link className='left-[2vh] text-[#19A297] absolute'>
                  780
                </Link>
                <p className='text-gray-400 text-xs'>(101)</p>
                <td className='pr-2 text-[#19A297]'>علی رضایی</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className='w-[100%] flex gap-[2vh] h-[30vh]'>
          <div className='w-[33%] items-center px-3 h-[7vh] flex justify-between border-[#202A5A] border-2 overflow-hidden rounded-lg'>
          <p className='text-[#202A5A]'>220</p>
            <h4 className='text-[#202A5A]'>میانگین امتیازات</h4>
          </div>
          <div className='w-[33%] items-center px-3 h-[7vh] flex justify-between border-[#202A5A] border-2 overflow-hidden rounded-lg'>
          <p className='text-[#202A5A]'>220</p>
            <h4 className='text-[#202A5A]'>میانگین امتیازات</h4>
          </div>
          <div className='w-[33%] items-center px-3 h-[7vh] flex justify-between border-[#202A5A] border-2 overflow-hidden rounded-lg'>
          <p className='text-[#202A5A]'>220</p>
            <h4 className='text-[#202A5A]'>میانگین امتیازات</h4>
          </div>
        </div>

      </div>

    </>
  )
}
