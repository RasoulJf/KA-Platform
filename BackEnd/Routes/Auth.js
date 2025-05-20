import express from "express"
import { login, register } from "../Controllers/AuthCn.js"
import isSuperAdmin from "../Middlewares/isSuperAdmin.js"
const authRouter=express.Router()
authRouter.route('/').post(login)
authRouter.route('/register').post(register)
export default authRouter