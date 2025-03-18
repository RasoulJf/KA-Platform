import express from "express"
import { createStudentActivity} from "../Controllers/StudentActivityCn.js"
import isLogin from "../Middlewares/isLogin.js"
const studentActivityRouter=express.Router()
studentActivityRouter.route('/').post(isLogin,createStudentActivity)
export default studentActivityRouter