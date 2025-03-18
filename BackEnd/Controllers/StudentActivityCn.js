import StudentActivity from "../Models/StudentActivityMd.js";
import catchAsync from "../Utils/catchAsync.js";
import ApiFeatures from "../Utils/apiFeatures.js";

export const changeStatus=catchAsync(async(req,res,next)=>{

})
export const createStudentActivity=catchAsync(async(req,res,next)=>{
    const studentActivity=await StudentActivity.create(req.body)
    return res.status(201).json({
        success:true,
        message: "studentActivity created successfully",
        data:studentActivity
    })
})