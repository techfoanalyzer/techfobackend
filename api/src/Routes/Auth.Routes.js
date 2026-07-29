import express from 'express'
const authRoutes = express.Router()
import {Register,Login, GoogleLogin, Logout, VerifyOTP, ResendOTP, requestForgetOtp, verifyForgetOtp, resetPassword} from "../Controllers/Auth.Controllers.js"
import { Authenticate } from '../middleware/Authenticate.Middleware.js'


authRoutes.post('/register', Register)
authRoutes.post('/verify-otp', VerifyOTP);
authRoutes.post('/resend-otp', ResendOTP);
authRoutes.post('/login', Login)
authRoutes.post('/google-login', GoogleLogin)
authRoutes.get('/logout', Authenticate, Logout)
authRoutes.post("/forget-password/request-otp", requestForgetOtp);
authRoutes.post("/forget-password/verify-otp", verifyForgetOtp);
authRoutes.post("/forget-password/reset", resetPassword);


export default authRoutes