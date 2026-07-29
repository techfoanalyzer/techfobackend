import { User } from "../Models/user.model.js";
import { ErrorHandler } from "../Utils/HandleError.js";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import { sendForgetPasswordEmail } from "../Utils/sendForgetPasswordEmail.js";



const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};



export const requestForgetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User with this email does not exist" });
    }

    const otp = generateOTP();
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000; 
    await user.save();

  
    await sendForgetPasswordEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "Verification OTP has been sent to your email.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const verifyForgetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user || user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP code" });
    }

    if (Date.now() > user.resetOtpExpires) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const user = await User.findOne({ email });
    if (!user || user.resetOtp !== otp || Date.now() > user.resetOtpExpires) {
      return res.status(400).json({ success: false, message: "Invalid session or expired OTP." });
    }

   
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = null;
    user.resetOtpExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful! You can now log in.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};






export const Register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

   
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

  
    if (name.trim().toLowerCase() === "techfoanalyzer") {
      return res.status(400).json({
        success: false,
        message: "You cannot use 'TechfoAnalyzer' as your name.",
      });
    }

    
    const findUser = await User.findOne({ email });
    if (findUser) {
    
      if (findUser.isVerified) {
        return res.status(409).json({
          success: false,
          message: "User already exists with this email",
        });
      }
      
  
      await User.deleteOne({ _id: findUser._id });
    }

  
    const HashPassword = await bcrypt.hash(password, 10);

   
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 

   
    const user = await User.create({
      name,
      email,
      password: HashPassword,
      isVerified: false,
      otp,
      otpExpires, 
    });

   
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Welcome to Techfo Analyzer!</h2>
        <p>Your verification code for signup is:</p>
        <h1 style="color: #2563eb; letter-spacing: 4px;">${otp}</h1>
        <p>This code will expire in <b>10 minutes</b>. If you do not enter this OTP, your registration will be cancelled automatically.</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: "Verify Your Techfo Analyzer Account",
      html: emailHtml,
    });

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete registration.",
      email: user.email,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again later.",
    });
  }
};


export const VerifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Registration session expired or account not found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified. Please login.",
      });
    }

    if (user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE,
      }
    );

    res.cookie("AccessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      user: userData,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "OTP verification failed. Please try again.",
    });
  }
};


export const ResendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Session expired. Please signup again.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified.",
      });
    }

    const newOtp = generateOTP();
    user.otp = newOtp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Techfo Analyzer - Resend OTP</h2>
        <p>Your new verification code is:</p>
        <h1 style="color: #2563eb; letter-spacing: 4px;">${newOtp}</h1>
        <p>This code will expire in <b>10 minutes</b>.</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: "Your New Verification OTP - Techfo Analyzer",
      html: emailHtml,
    });

    return res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your email.",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP.",
    });
  }
};



export const Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter both email and password",
      });
    }

    const userExist = await User.findOne({ email }).select("+password");
    if (!userExist) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

   
    if (!userExist.isVerified) {
      return res.status(403).json({
        success: false,
        isVerified: false,
        message: "Your email is not verified. Please verify your OTP to continue.",
      });
    }

    const hashpass = userExist.password;

    const DecryptPassword = await bcrypt.compare(password, hashpass);

    if (!DecryptPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const token = jwt.sign(
      {
        _id: userExist._id,
        name: userExist.name,
        email: userExist.email,
        avatar: userExist.avatar,
        role: userExist.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE,
      }
    );

    res.cookie("AccessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userData = userExist.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      user: userData,
      message: "user Login successfully",
    });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};

export const GoogleLogin = async (req, res, next) => {
  try {
    const { name, email, avatar } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required from Google auth",
      });
    }

    let userExist = await User.findOne({ email }).select("+password");

    if (!userExist) {
     
      const randomPassword = "Google@" + crypto.randomBytes(8).toString("hex");
      const hashpass = await hash(randomPassword, 10);

      const newUser = new User({
        name,
        email,
        password: hashpass,
        avatar: avatar || "",
      });

      userExist = await newUser.save();
    } 
  

    const token = jwt.sign(
      {
        _id: userExist._id,
        name: userExist.name,
        email: userExist.email,
        avatar: userExist.avatar,
        role: userExist.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE,
      }
    );

    res.cookie("AccessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userData = userExist.toObject();
    delete userData.password;

    return res.status(200).json({
      success: true,
      user: userData,
      message: "user Login successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to login with Google",
    });
  }
};

export const Logout = async (req, res, next) => {
  try {
    res.clearCookie("AccessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successfully",
    });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};
