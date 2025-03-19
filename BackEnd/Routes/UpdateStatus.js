import express from "express"
import { login, register } from "../Controllers/AuthCn.js"
import isAdmin from "../Middlewares/isAdmin.js"
import { changeStatusAndAddAdminComment } from "../Controllers/StudentActivityCn.js"
import { changeStatus } from "../Controllers/StudentRewardCn.js"
const updateStatusRouter=express.Router()
updateStatusRouter.route('/activity').post(isAdmin,changeStatusAndAddAdminComment)
updateStatusRouter.route('/reward').post(isAdmin,changeStatus)
export default updateStatusRouter