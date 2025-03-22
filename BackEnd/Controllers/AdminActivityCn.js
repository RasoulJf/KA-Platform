import AdminActivity from "../Models/AdminActivityMd.js";
import catchAsync from "../Utils/catchAsync.js";
import ApiFeatures from "../Utils/apiFeatures.js";
import { UpdateScore } from "./UserCn.js";


export const createAdminActivity=catchAsync(async(req,res,next)=>{
    const {scoreAwarded=null,average=null}=req.body
    if (average){
        scoreAwarded=average*5
    }
    const adminActivity=await AdminActivity.create({...req.body,scoreAwarded})
    UpdateScore()

    return res.status(201).json({
        success:true,
        message: "adminActivity created successfully",
        data:adminActivity
    })
})
export const getAllAdminActivities=catchAsync(async(req,res,next)=>{
    const features=new ApiFeatures(AdminActivity,req.query)
    .sort()
    .populate()
    .filter()
    .limitFields()
    const adminActivities=await features.query
    return res.status(200).json({
        success:true,
        data:adminActivities
    })
})
export const getOneAdminActivity=catchAsync(async(req,res,next)=>{
    const {id}=req.params
    const adminActivity=await AdminActivity.findById(id)
    return res.status(200).json({
        data:adminActivity,
        success:true
    })
})


