import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book Title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Book Description is required"],
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

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookCategory",
      required: true,
    },

    originalPrice: {
      type: Number,
      required: [true, "Original Price is required"],
      min: [0, "Original Price cannot be negative"],
    },

    salePrice: {
      type: Number,
      required: [true, "Sale Price is required"],
      min: [0, "Sale Price cannot be negative"],
    },

    buyNowUrl: {
      type: String,
      required: [true, "Buy Now URL is required"],
      trim: true,
    },
  },
  { timestamps: true },
);

const Book = mongoose.model("Book", bookSchema);

export default Book;