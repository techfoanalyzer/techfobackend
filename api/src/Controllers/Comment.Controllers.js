import Comment from "../Models/comment.model.js";
import { ErrorHandler } from "../Utils/HandleError.js";

export const addComment = async (req, res, next) => {
  try {
    const { user, blogid, comment } = req.body;


    const newComment = new Comment({
      user: user,
      blogid: blogid,
      comment: comment,
    });

    await newComment.save();

    res.status(200).json({
      status: true,
      message: "comment Submitted",
      comment: newComment,
    });
  } catch (error) {
    next(new ErrorHandler(401, error.message));
  }
};
export const getComments = async (req, res, next) => {
  try {
    const { blogid } = req.params;

    if (!blogid) {
      return res.status(400).json({
        status: false,
        message: "Blog ID is required",
      });
    }

    const comments = await Comment.find({ blogid })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return res.status(200).json({
      status: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch comments",
    });
  }
};
export const commentCount = async (req, res, next) => {
  try {
    const { blogid } = req.params;

    if (!blogid) {
      return res.status(400).json({
        status: false,
        message: "Blog ID is required",
      });
    }

    const commentCount = await Comment.countDocuments({ blogid }).exec();

    return res.status(200).json({
      status: true,
      commentCount,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to get comment count",
    });
  }
};


export const getAllComments = async (req, res, next) => {
  try {
    const user = req.user;

    
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized user",
      });
    }

    let comments;

    if (user.role === "admin") {
      comments = await Comment.find()
        .populate("user", "name")
        .populate("blogid", "tittle")
        .sort({ createdAt: -1 })
        .lean()
        .exec();
    } else {
      comments = await Comment.find({ user: user._id })
        .populate("user", "name")
        .populate("blogid", "tittle")
        .sort({ createdAt: -1 })
        .lean()
        .exec();
    }

    return res.status(200).json({
      status: true,
      count: comments.length, // 👈 Total comments count added
      comments,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch comments",
    });
  }
};


export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    if (!commentId) {
      return res.status(400).json({
        status: false,
        message: "Comment ID is required",
      });
    }

    const comments = await Comment.findByIdAndDelete(commentId);

    if (!comments) {
      return res.status(404).json({
        status: false,
        message: "Comment not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Comment Deleted",
    });
  } catch (error) {
    console.error("Delete Comment Error:", error.message);
    
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to delete comment",
    });
  }
};