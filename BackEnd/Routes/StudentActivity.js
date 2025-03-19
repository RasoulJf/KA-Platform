import express from "express"
import { createStudentActivity, getAllStudentActivities, getOneStudentActivity} from "../Controllers/StudentActivityCn.js"
import isLogin from "../Middlewares/isLogin.js"
const studentActivityRouter=express.Router()
studentActivityRouter.route('/').post(isLogin,createStudentActivity).get(getAllStudentActivities)
studentActivityRouter.route('/:id').get(isLogin,getOneStudentActivity)

export default studentActivityRouter