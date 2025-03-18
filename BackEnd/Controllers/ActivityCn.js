import Activity from "../Models/ActivityMd.js";
import catchAsync from "../Utils/catchAsync.js";
import ApiFeatures from "../Utils/apiFeatures.js";

export const createActivity=catchAsync(async(req,res,next)=>{
    const activity=await Activity.create(req.body)
    return res.status(201).json({
        success:true,
        message: "activity created successfully",
        data:activity
    })
})
export const getAllActivities=catchAsync(async(req,res,next)=>{
    const features=new ApiFeatures()
    .sort()
    .populate()
    .filter()
    .limitFields()
    const activities=await features.query
    return res.status(200).json({
        success:true,
        data:activities
    })
})
export const getOneActivity=catchAsync(async(req,res,next)=>{
    const {id}=req.params
    const activity=await Activity.findById(id)
    return res.status(200).json({
        data:activity,
        success:true
    })
})
export const removeActivity=catchAsync(async(req,res,next)=>{
    const {id}=req.params
    await Activity.findByIdAndDelete(id)
    return res.status(200).json({
        success:true,
        message:"activity removed successfully"
    })
})