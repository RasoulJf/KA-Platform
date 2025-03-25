import StudentActivity from "../Models/StudentActivityMd.js";
import catchAsync from "../Utils/catchAsync.js";
import ApiFeatures from "../Utils/apiFeatures.js";
import User from "../Models/UserMd.js";
import { UpdateScore } from "./UserCn.js";

export const changeStatusAc = catchAsync(async (req, res, next) => {
    const { id } = req.params
    const { status,adminComment="Your Request Seen" } = req.body
    const studentActivity = await StudentActivity.findByIdAndUpdate(id, { status,adminComment }, {
        new: true,
        runValidators: true
    })
    UpdateScore()
    return res.status(200).json({
        data: studentActivity,
        success: true,
        message:"change status Successfully"
    })
})
export const createStudentActivity=catchAsync(async(req,res,next)=>{
    const studentActivity=await StudentActivity.create(req.body)
    return res.status(201).json({
        success:true,
        message: "studentActivity created successfully",
        data:studentActivity
    })
})
export const getAllStudentActivities=catchAsync(async(req,res,next)=>{
    const features=new ApiFeatures(StudentActivity,req.query)
    .sort()
    .populate()
    .filter()
    .limitFields()
    const studentActivities=await features.query
    return res.status(200).json({
        success:true,
        data:studentActivities
    })
})
export const getOneStudentActivity=catchAsync(async(req,res,next)=>{
    const {id}=req.params
    const studentActivity=await StudentActivity.findById(id)
    return res.status(200).json({
        data:studentActivity,
        success:true
    })
})