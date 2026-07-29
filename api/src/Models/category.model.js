import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category Name is required"],
      trim: true,
    },

     featureImage:{
         type: String,
      required: true,
    },

     featureImageFileId:{
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

  },
  { timestamps: true },
);


const Category = mongoose.model("Category" , categorySchema)
export default Category