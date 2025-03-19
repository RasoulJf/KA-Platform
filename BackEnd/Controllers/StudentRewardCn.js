import StudentReward from "../Models/StudentRewardMd.js";
import catchAsync from "../Utils/catchAsync.js";
import ApiFeatures from "../Utils/apiFeatures.js";
import User from "../Models/UserMd.js";
import HandleERROR from "../Utils/handleError.js";
import updateStudentRankings from "../Utils/updateRanks.js";
import { UpdateScore } from "./UserCn.js";

export const changeStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params
    const { status } = req.body
    const studentReward = await StudentReward.findByIdAndUpdate(id, { status }, {
        new: true,
        runValidators: true
    })
    UpdateScore()

    return res.status(200).json({
        data: studentReward,
        success: true,
        message:"change status Successfully"
    })
})
export const createStudentReward = catchAsync(async (req, res, next) => {
    const studentReward = await StudentReward.create(req.body)
    return res.status(201).json({
        success: true,
        message: "studentReward created successfully",
        data: studentReward
    })
})
export const getAllStudentRewards=catchAsync(async(req,res,next)=>{
    const features=new ApiFeatures(StudentReward,req.query)
    .sort()
    .populate()
    .filter()
    .limitFields()
    const studentRewards=await features.query
    return res.status(200).json({
        success:true,
        data:studentRewards
    })
})
export const getOnetudentReward=catchAsync(async(req,res,next)=>{
    const {id}=req.params
    const studentReward=await StudentReward.findById(id)
    return res.status(200).json({
        data:studentReward,
        success:true
    })
})