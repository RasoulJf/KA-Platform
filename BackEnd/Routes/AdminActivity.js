import express from "express"
import isAdmin from "../Middlewares/isAdmin.js"
import { createAdminActivity, getAllAdminActivities, getOneAdminActivity } from "../Controllers/AdminActivityCn.js"
const adminActivityRouter=express.Router()
adminActivityRouter.route('/:id').post(isAdmin,createAdminActivity).get(isAdmin,getAllAdminActivities)
// adminActivityRouter.route('/:id').get(isAdmin,getOneAdminActivity)

export default adminActivityRouter