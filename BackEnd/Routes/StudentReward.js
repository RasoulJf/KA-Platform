import express from "express"
import { createStudentReward} from "../Controllers/StudentRewardCn.js"
import isLogin from "../Middlewares/isLogin.js"
const studentRewardRouter=express.Router()
studentRewardRouter.route('/').post(isLogin,createStudentReward)
export default studentRewardRouter