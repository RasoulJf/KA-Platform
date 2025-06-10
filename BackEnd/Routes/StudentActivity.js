import express from "express"
import { createStudentActivity, getAllStudentActivities, getOneStudentActivity, getPendingStudentActivitiesAggregated} from "../Controllers/StudentActivityCn.js"
import isLogin from "../Middlewares/isLogin.js"
const studentActivityRouter=express.Router()
studentActivityRouter.route('/').post(isLogin,createStudentActivity).get(getAllStudentActivities)
studentActivityRouter.route('/pending-aggregated').get(getPendingStudentActivitiesAggregated)
studentActivityRouter.route('/:id').get(isLogin,getOneStudentActivity)

export default studentActivityRouter