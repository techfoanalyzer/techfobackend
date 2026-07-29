import express from "express"
import { autoget, deleteUser, getAllUsers, getUser, updateUser } from "../Controllers/User.Controllers.js"
import upload from "../config/multer.js"
import { Authenticate } from "../middleware/Authenticate.Middleware.js"
import { onlyAdminAuthenticate } from "../middleware/AdminAuthenticate.Middleware.js"

const userRoutes = express.Router()

userRoutes.get("/get-user/:userid",Authenticate,getUser)
userRoutes.put("/update-user/:userid", upload.single("file"),Authenticate,updateUser)
userRoutes.get("/get-all-users",onlyAdminAuthenticate,getAllUsers)
userRoutes.delete("/delete-user/:userId",onlyAdminAuthenticate,deleteUser)


export default userRoutes



