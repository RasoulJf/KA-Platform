import catchAsync from "../Utils/catchAsync.js";
import User from "../Models/UserMd.js";
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import HandleERROR from "../Utils/handleError.js";
export const register=catchAsync(async(req,res,next)=>{
    const {idCode='',password='',role=null, ...others}=req.body
    let pass 
     if(role === 'student'){
        pass = `s${idCode}`
    }else {
        pass = `a${idCode}`
    }
    const hashPass=bcryptjs.hashSync(pass,10)
    await User.create({...others,idCode:idCode,password:hashPass,role:role})
    return res.status(201).json({
        message:'register successfully',
        success:true
    })
})
export const login=catchAsync(async(req,res,next)=>{
    const {idCode=null,password=null}=req.body
    if(!password || !idCode){
        return next(new HandleERROR('idCode and password is required'))
    }
    const user=await User.findOne({idCode})
    if(!user){
        return next(new HandleERROR('user not found',404))
    }
    const checkPassword=bcryptjs.compareSync(password,user?.password)
    if(!checkPassword){
        return next(new HandleERROR('password or idCode is incorrect',400))
    }
    const token=jwt.sign({id:user?._id,role:user?.role},process.env.JWT_SECRET)
    return res.status(200).json({
        message:"login successfully",
        success:true,
        data:{
            token,
            user:{
                id:user?._id,
                fullName:user?.fullName,
                role:user?.role,
                idcode:user?.idCode
            }
        }
    })
})
