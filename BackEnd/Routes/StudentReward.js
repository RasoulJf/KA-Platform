import express from "express"
import { createStudentReward, getAllStudentRewards, getOnetudentReward} from "../Controllers/StudentRewardCn.js"
import isLogin from "../Middlewares/isLogin.js"
const studentRewardRouter=express.Router()
studentRewardRouter.route('/').post(isLogin,createStudentReward).get(getAllStudentRewards)
studentRewardRouter.route('/:id').get(isLogin,getOnetudentReward)

export default studentRewardRouter