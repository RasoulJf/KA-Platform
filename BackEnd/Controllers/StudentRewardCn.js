import StudentReward from "../Models/StudentRewardMd.js";
import catchAsync from "../Utils/catchAsync.js";
import ApiFeatures from "../Utils/apiFeatures.js";
import User from "../Models/UserMd.js";
import HandleERROR from "../Utils/handleError.js";
import updateStudentRankings from "../Utils/updateRanks.js";

export const changeStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params
    const { status } = req.body
    const studentReward = await StudentReward.findByIdAndUpdate(id, { status }, {
        new: true,
        runValidators: true
    })
    if (status == "approved") {
        const {token}=req.body
        const user = await User.findById(req.body.userId)
        if((0.95 * user.score) >= token){
            user.score=user.score-token
        }else{
            return next(new HandleERROR("user not enough score",400))
        }
        await user.save()
        updateStudentRankings()
    }
    return res.status(200).json({
        data: studentReward,
        success: true
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