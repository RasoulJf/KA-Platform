import jwt from 'jsonwebtoken'
const tokenDecode=(headers)=>{
    try{
        const {id}=jwt.verify(headers.authorization.split(' ')[1],process.env.JWT_SECRET)
        return {id}
    }catch(error){
        return {id:'invalid'}
    }

}
export default tokenDecode