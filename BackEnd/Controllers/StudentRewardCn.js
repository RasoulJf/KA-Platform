import StudentReward from "../Models/StudentRewardMd.js";
import catchAsync from "../Utils/catchAsync.js";
import ApiFeatures from "../Utils/apiFeatures.js";

export const createStudentReward=catchAsync(async(req,res,next)=>{
    const studentReward=await StudentReward.create(req.body)
    return res.status(201).json({
        success:true,
        message: "studentReward created successfully",
        data:studentReward
    })
})