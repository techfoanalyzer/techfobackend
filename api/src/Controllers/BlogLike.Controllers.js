import { ErrorHandler } from "../Utils/HandleError.js";
import BlogLike from "../Models/bloglike.model.js";

export const doLike = async (req, res, next) => {
  try {
    const { user, blogid } = req.body;

    if (!user || !blogid) {
      return res.status(400).json({
        status: false,
        message: "Unable to process like right now. Please try again.",
      });
    }

    let isuserLiked = false;

    const existingLike = await BlogLike.findOne({ user, blogid });

    if (!existingLike) {

      await BlogLike.create({ user, blogid });
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
