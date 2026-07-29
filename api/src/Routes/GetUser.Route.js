import express from "express"
import upload from "../config/multer.js"
import { Authenticate } from "../middleware/Authenticate.Middleware.js"
import { autoget } from "../Controllers/User.Controllers.js"

const getUserRoute = express.Router()

getUserRoute.get("/auto-get",Authenticate,autoget)



export default getUserRoute



