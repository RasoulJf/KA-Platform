import Jwt from "jsonwebtoken";
import catchAsync from "../Utils/catchAsync.js";
import HandleERROR from "../Utils/handleError.js";

const isAdmin = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const { id, role } = Jwt.verify(token, process.env.JWT_SECRET);
  req.userId = id;
  req.role = role;
  if (role != "suoerAdmin") {
    return next(new HandleERROR("you are not superAdmin", 404));
  }
  return next();
});

export default isAdmin;