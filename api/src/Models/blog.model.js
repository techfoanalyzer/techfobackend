import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
      author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tittle: {
      type: String,
      required: [true, "Category Name is required"],
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    blogContent: {
      type: String,
      required: true,
     
    },
    featureImage:{
         type: String,
      required: true,
    },
    featureImageFileId:{
      type: String,
      required: true,
    }
  },
  { timestamps: true },
);

const Blog = mongoose.model("Blog", BlogSchema);
export default Blog;
