import StudentActivity from "../Models/StudentActivityMd.js";
import catchAsync from "../Utils/catchAsync.js";
import ApiFeatures from "../Utils/apiFeatures.js";
import User from "../Models/UserMd.js";

export const changeStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params
    const { status } = req.body
    const studentActivity = await StudentActivity.findByIdAndUpdate(id, { status }, {
        new: true,
        runValidators: true
    })
    if (status == "approved") {
        const {scoreAwarded}=req.body
        const user = await User.findById(req.body.userId)
            user.score=user.score+scoreAwarded
        await user.save()
        updateStudentRankings()
    }
    return res.status(200).json({
        data: studentActivity,
        success: true
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