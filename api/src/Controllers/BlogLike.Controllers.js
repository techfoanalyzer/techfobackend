import { ErrorHandler } from "../Utils/HandleError.js";
import BlogLike from "../Models/bloglike.model.js";

export const doLike = async (req, res, next) => {
  try {
    const { user, blogid , categoryid} = req.body;

    if (!user || !blogid || !categoryid) {
      return res.status(400).json({
        status: false,
        message: "Unable to process like right now. Please try again.",
      });
    }

    let isuserLiked = false;

    const existingLike = await BlogLike.findOne({ user, blogid , categoryid });

    if (!existingLike) {

      await BlogLike.create({ user, blogid ,categoryid });
      isuserLiked = true;
    } else {

      await BlogLike.findByIdAndDelete(existingLike._id);
      isuserLiked = false;
    }

    const likeCount = await BlogLike.countDocuments({ blogid });

    return res.status(200).json({
      status: true,
      likeCount,
      isuserLiked,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

export const getblogLike = async (req, res, next) => {
  try {
    const { blogid, userid } = req.params;

    if (!blogid) {
      return res.status(400).json({
        status: false,
        message: "Blog ID is required to fetch likes.",
      });
    }

    const [likeCount, userLikeExists] = await Promise.all([
      BlogLike.countDocuments({ blogid }),
      userid ? BlogLike.exists({ blogid, user: userid }) : null,
    ]);

    const isuserLiked = Boolean(userLikeExists);

    return res.status(200).json({
      status: true,
      likeCount,
      isuserLiked,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Unable to fetch likes right now.",
    });
  }
};

export const getblogsave = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized user",
      });
    }


    const savedblog = await BlogLike.find({ user: user._id })
      .populate("blogid").populate('categoryid',"name slug" ).populate('user').sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      status: true,
      data: savedblog,
    });
  } catch (error) {
    console.error("Get liked/saved blogs error:", error);
    return res.status(500).json({
      status: false,
      message: "Unable to access saved right now.",
    });
  }
};