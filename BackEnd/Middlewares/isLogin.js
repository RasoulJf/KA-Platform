import jwt from 'jsonwebtoken'
import HandleERROR from '../Utils/handleError.js'
const isLogin=(req,res,next)=>{
    try {
        const token=req.headers.authorization.split(' ')[1]
        const {id,role}=jwt.verify(token,process.env.JWT_SECRET)
        req.userId=id
        req.role=role
        next()
    } catch (error) {
        return next(new HandleERROR('you most be login',404))
    }
}
export default isLogin