import React, { useContext } from 'react'
import union from '../../assets/images/Union.png'
import union2 from '../../assets/images/Union2.png'
import union3 from '../../assets/images/Union3.png'
import KAlogo from '../../assets/images/KA-Logo.png'
import useFormFields from '../../Utils/useFormFields'
import fetchData from '../../Utils/fetchData'
import { toast } from 'sonner'
import { Navigate, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../Utils/AuthContext'


export default function Login() {
    const [fields,handleChange]=useFormFields()
    const {handleAuth}=useContext(AuthContext)


    
    const navigate=useNavigate()
    const handleSubmit=async(e)=>{
        e.preventDefault()
        try {
            const res=await fetchData('auth',{
                method:"POST",
                headers:{
                    "content-type" : "application/json"
                },
                body:JSON.stringify(fields)
            })

            if(res?.data?.user?.role=="student"){
                toast("You Are Not Admin")

            }
            else{
                toast(res.message)

            }
            if(res.success && res.data.user.role!="admin"){
                handleAuth(res.data.token,res.data.user)
                localStorage.setItem("token",res.data.token)
                localStorage.setItem("user",JSON.stringify(res.data.user))
                navigate('/')

            }
        } catch (error) {
            console.log(error)
        }

    }

    return (
        <div className='flex w-full h-screen'>
            <div className="w-[45%] h-full overflow-hidden relative bg-black bg-linear-to-t from-[#19A297] to-[#59BBAF]">
                <img className='absolute  bottom-10 right-[-110px] scale-140'
                    src={union} alt="" />
                <img className='absolute scale-60 left-[-100px] bottom-0'
                    src={union2} alt="" />
                <img className='absolute left-[70px]'
                    src={union3} alt="" />
                <div className="absolute left-15 bottom-40">
                    <h2 className='text-white text-4xl font-gilory'>Welcome To</h2>
                    <h1 className='text-white text-5xl font-bold-gilory'
                    >KA Platform</h1>
                </div>
            </div>

            <div className="flex w-[55%] items-center justify-center">
                <div className='p-10 w-100 mx-auto rounded shadow-[0_0px_10px_rgba(0,0,0,0.15)]'>
                    <div className="flex gap-2 justify-center items-center mb-10">
                        <div className="flex-column justify-items-center items-center ">
                            <h3 className='text-[#59BBAF] text-3xl font-semibold'>پلتـفرم کــا</h3>
                            <p className='text-[#59BBAF] text-xs'>سیستم جامع ارزیابی و پاداش</p>
                        </div>
                        <div className="rounded-[15px] flex justify-items-center items-center p-2 w-16 h-16 bg-[#59BBAF]">
                            <img src={KAlogo} className='scale-120' alt="" />
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="flex-column">
                        <p className='font-semibold mb-8 text-gray-400 text-right'>!سلام</p>
                        <div className="relative mb-8">
                            <p className='text-gray-300 bg-white px-2 absolute right-5 top-[-10px] rounded-lg'>نام کاربری</p>
                        <input type="text" 
                        name='idCode'
                        onChange={handleChange}
                        className='outline-none border-2 rounded w-full px-4 py-5 border-gray-100  ' />
                        </div>
                        <div className="relative mb-8">
                            <p className='text-gray-300 bg-white px-2 absolute right-5 rounded-lg top-[-10px]'>رمز عبور</p>
                        <input type="password" 
                        name='password'
                        onChange={handleChange}
                        className='outline-none border-2 rounded w-full px-4 py-5 border-gray-100 ' />
                        </div>
                        <button type='submit' className='w-full bg-[#59BBAF] font-semibold py-5 rounded text-white cursor-pointer'>ورود</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

