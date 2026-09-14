import mongoose from "mongoose";

const bookCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Book Category Name is required"],
      trim: true,
    },

    featureImage: {
      type: String,
      required: true,
    },

    featureImageFileId: {
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

const BookCategory = mongoose.model("BookCategory", bookCategorySchema);

export default BookCategory;