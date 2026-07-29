import jwt from "jsonwebtoken";
import { ErrorHandler } from "../Utils/HandleError.js";

export const onlyAdminAuthenticate = async (req, res, next) => {
  try {
    const token = req.cookies.AccessToken;

    if (!token) {
      return next(new ErrorHandler(401, "Please login to access this resource"));
    }

    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);

    if (decodeToken.role === "admin") {
      req.user = decodeToken; 
      next();
    } else {
      return next(new ErrorHandler(403, "Access denied. Admin resources only."));
    }
  } catch (error) {
    return next(new ErrorHandler(401, "Invalid or expired token"));
  }
};