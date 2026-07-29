import { User } from "../Models/user.model.js";
import { ErrorHandler } from "../Utils/HandleError.js";
import bcrypt from "bcrypt";
import cloudinary from "../config/cloudinary.js";





export const getUser = async (req, res, next) => {
  try {
    const { userid } = req.params;
    const user = await User.findById({ _id: userid }).lean().exec();
    if (!user) {
      next(new ErrorHandler(401, "user.found"));
    }
    res.status(200).json({
      success: true,
      message: "User data found",
      user,
    });
  } catch (error) {
    next(new ErrorHandler(401, error.message));
  }
};



const getCloudinaryPublicId = (url) => {
  if (!url) return null;
  try {

    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (err) {
    return null;
  }
};



export const updateUser = async (req, res, next) => {
  try {
    const { name, email, bio, password } = req.body;
    const { userid } = req.params;
    const userRole = req.user?.role;

  
    if (
      name &&
      name.trim().toLowerCase() === "techfoanalyzer" &&
      userRole !== "admin"
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot use 'TechfoAnalyzer' as your name.",
      });
    }

    const user = await User.findById(userid).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User nahi mila",
      });
    }

  
    if (name) user.name = name;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;

  
    if (password && password.trim() !== "") {
      const hashPassword = await bcrypt.hash(password, 10);
      user.password = hashPassword;
    }

  
    if (req.file) {
     
      if (user.lastAvatarUpdate && userRole !== "admin") {
        const now = new Date();
        const lastUpdate = new Date(user.lastAvatarUpdate);

        const diffTime = Math.abs(now - lastUpdate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
          const remainingDays = 30 - diffDays;
          return res.status(400).json({
            success: false,
            message: `You can change avatar after ${remainingDays} days.`,
          });
        }
      }

      if (user.avatar) {
        try {
          const publicId = getCloudinaryPublicId(user.avatar);
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        } catch (err) {
          console.log("Failed to delete old image:", err.message);
        }
      }


      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const imageTransformations =
        userRole === "admin"
          ? [
              { width: 600, height: 600, crop: "limit", gravity: "center" },
              { quality: "auto:good" },
              { fetch_format: "auto" },
            ]
          : [
              { width: 400, height: 400, crop: "fill", gravity: "face" },
              { quality: "auto:eco" },
              { fetch_format: "auto" },
            ];

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "user_profiles",
        transformation: imageTransformations,
      });

      user.avatar = result.secure_url;
      user.lastAvatarUpdate = new Date();
    }

  
    await user.save();

    const updateData = user.toObject({ getters: true });
    delete updateData.password;

    return res.status(200).json({
      success: true,
      message: "Data updated successfully",
      user: updateData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update profile. Please try again.",
    });
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      users,
    });
  } catch (error) {
    next(new ErrorHandler(401, error.message));
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const users = await User.findByIdAndDelete(userId);

    res.status(200).json({
      status: true,
      message: "user Deleted",
    });
  } catch (error) {
    next(new ErrorHandler(401, error.message));
  }
};

export const autoget = async (req, res, next) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      message: `Welcome Back ${user.name}`,
      user,
    });
  } catch (error) {
    next(new ErrorHandler(501, "User Login Expire"));
  }
};
