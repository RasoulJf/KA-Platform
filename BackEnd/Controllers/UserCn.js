import User from "../Models/UserMd.js";
import catchAsync from "../Utils/catchAsync.js";
import ApiFeatures from "../Utils/apiFeatures.js";
import Activity from "../Models/ActivityMd.js";
import Reward from "../Models/RewardMd.js";
import HandleERROR from "../Utils/handleError.js";

export const UpdateScore=catchAsync(async (req, res, next) => {
    const {id}=req.params
    const user=await User.findById(id)
    let totalScore=0
    const queryString={...req.query,filters:{...req.query.filters,userId:id}}
    const activityFeatures=new ApiFeatures(Activity,queryString)
    .filter().sort().paginate().populate()
    const activities=await activityFeatures.query
    for(const activity of activities){
        activity.status=="approved"?totalScore+=activity.scoreAwarded:""
    }

    const rewardFeatures=new ApiFeatures(Reward,queryString)
    .filter().sort().paginate().populate()
    const rewards=await rewardFeatures.query
    for(const reward of rewards){
        if(reward.status=="approved"){
            if((0.95 * user.score) >= token){
                totalScore-=reward.token
            }else{
                return next(new HandleERROR("user not enough score",400))
            }
    }
        
    }
    user.score=totalScore
    await user.save()
    updateStudentRankings()
})