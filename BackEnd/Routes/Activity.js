import express from "express"
import { createActivity, getAllActivities, getOneActivity, removeActivity } from "../Controllers/ActivityCn.js"
import isSuperAdmin from "../Middlewares/isSuperAdmin.js"
const activityRouter=express.Router()
activityRouter.route('/').post(isSuperAdmin,createActivity).get(getAllActivities)
activityRouter.route('/:id').get(getOneActivity).delete(isSuperAdmin,removeActivity)
export default activityRouter