import Reward from "../Models/RewardMd.js";
import catchAsync from "../Utils/catchAsync.js";
import ApiFeatures from "../Utils/apiFeatures.js";

export const createReward=catchAsync(async(req,res,next)=>{
    const reward=await Reward.create(req.body)
    return res.status(201).json({
        success:true,
        message: "reward created successfully",
        data:reward
    })
})
export const getAllRewards=catchAsync(async(req,res,next)=>{
    const features=new ApiFeatures(Reward,req.query)
    .sort()
    .populate()
    .filter()
    .limitFields()
    const rewards=await features.query
    return res.status(200).json({
        success:true,
        data:rewards
    })
})
export const getOneReward=catchAsync(async(req,res,next)=>{
    const {id}=req.params
    const reward=await Reward.findById(id)
    return res.status(200).json({
        data:reward,
        success:true
    })
})
export const removeReward=catchAsync(async(req,res,next)=>{
    const {id}=req.params
    await Reward.findByIdAndDelete(id)
    return res.status(200).json({
        success:true,
        message:"reward removed successfully"
    })
})