import catchAsync from "../Utils/catchAsync.js";
import User from "../Models/UserMd.js";
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import HandleERROR from "../Utils/handleError.js";
export const register=catchAsync(async(req,res,next)=>{
    const {idCode='',role="",...others}=req.body
    const hashPass=bcryptjs.hashSync(idCode,10)
    await User.create({...others,idCode:hashPass})
    return res.status(201).json({
        message:'register successfully',
        success:true
    })
})
export const login=catchAsync(async(req,res,next)=>{
    const {fullName=null,idCode=null}=req.body
    if(!fullName || !idCode){
        return next(new HandleERROR('fullName and idCode is required'))
    }
    const user=await User.findOne({fullName})
    if(!user){
        return next(new HandleERROR('user not found',404))
    }
    const checkidCode=bcryptjs.compareSync(idCode,user.idCode)
    if(!checkidCode){
        return next(new HandleERROR('fullName or idCode is incorrect',400))
    }
    const token=jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET)
    return res.status(200).json({
        message:"login successfully",
        success:true,
        data:{
            token,
            user:{
                id:user._id,
                fullName:user.fullName,
                role:user.role
            }
        }
    })
})
