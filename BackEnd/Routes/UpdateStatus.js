import express from "express"
import { login, register } from "../Controllers/AuthCn.js"
import isAdmin from "../Middlewares/isAdmin.js"
import { changeStatusAc } from "../Controllers/StudentActivityCn.js"
import { changeStatusRe } from "../Controllers/StudentRewardCn.js"
const updateStatusRouter=express.Router()
updateStatusRouter.route('/activity/:id').post(isAdmin,changeStatusAc)
updateStatusRouter.route('/reward/:id').post(isAdmin,changeStatusRe)
export default updateStatusRouter