import express from "express"
import { createReward, getAllRewards, getOneReward, removeReward } from "../Controllers/RewardCn.js"
import isSuperAdmin from "../Middlewares/isSuperAdmin.js"
const rewardRouter=express.Router()
rewardRouter.route('/').post(isSuperAdmin,createReward).get(getAllRewards)
rewardRouter.route('/:id').get(getOneReward).delete(isSuperAdmin,removeReward)
export default rewardRouter