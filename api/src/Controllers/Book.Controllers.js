import Book from "../Models/Book.model.js";
import BookCategory from "../Models/BookCategory.model.js";
import { ErrorHandler } from "../Utils/HandleError.js";
import imagekit from "../config/imagekit.js";
import sharp from "sharp";
import mongoose from "mongoose";

export const addBook = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      originalPrice,
      salePrice,
      buyNowUrl,
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      originalPrice === undefined ||
      originalPrice === "" ||
      salePrice === undefined ||
      salePrice === "" ||
      !buyNowUrl
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, category, original price, sale price, and Buy Now URL are required fields.",
      });
    }

    const parsedOriginalPrice = Number(originalPrice);
    const parsedSalePrice = Number(salePrice);

    if (
      !Number.isFinite(parsedOriginalPrice) ||
      !Number.isFinite(parsedSalePrice)
    ) {
      return res.status(400).json({
        success: false,
        message: "Original Price and Sale Price must be valid numbers.",
      });
    }

    if (parsedOriginalPrice < 0 || parsedSalePrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative.",
      });
    }

    if (parsedSalePrice > parsedOriginalPrice) {
      return res.status(400).json({
        success: false,
        message: "Sale Price cannot be greater than Original Price.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Book Category ID format",
      });
    }

    const existingCategory = await BookCategory.findById(category);

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Book Category not found.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Feature image is required.",
      });
    }

    let fileBuffer = req.file.buffer;
    const ONE_MB = 1024 * 1024;

    if (req.file.size > ONE_MB) {
      fileBuffer = await sharp(req.file.buffer)
        .resize(1200)
        .jpeg({ quality: 80 })
        .toBuffer();
    }

    const result = await imagekit.upload({
      file: fileBuffer,
      fileName: `book_${Date.now()}_${req.file.originalname.split(".")[0]}.jpg`,
      folder: "/book_images",
    });

    const book = new Book({
      title,
      description,
      category,
      originalPrice: parsedOriginalPrice,
      salePrice: parsedSalePrice,
      featureImage: result.url,
      featureImageFileId: result.fileId,
      buyNowUrl,
    });

    await book.save();

    return res.status(201).json({
      success: true,
      message: "Book added successfully",
      book,
    });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};

export const editBook = async (req, res, next) => {
  try {
    const { bookid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Book ID format",
      });
    }

    const book = await Book.findById(bookid);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    return res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};

export const updateBook = async (req, res, next) => {
  try {
    const { bookid } = req.params;
    const {
      title,
      description,
      category,
      originalPrice,
      salePrice,
      buyNowUrl,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(bookid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Book ID format",
      });
    }

    const book = await Book.findById(bookid);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Book Category ID format",
        });
      }

      const existingCategory = await BookCategory.findById(category);

      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: "Book Category not found.",
        });
      }

      book.category = category;
    }

    if (title) book.title = title;
    if (description) book.description = description;
    if (buyNowUrl) book.buyNowUrl = buyNowUrl;

    if (
      originalPrice !== undefined ||
      originalPrice === "" ||
      salePrice !== undefined ||
      salePrice === ""
    ) {
      const currentOriginalPrice = Number(
        originalPrice !== undefined && originalPrice !== ""
          ? originalPrice
          : book.originalPrice
      );

      const currentSalePrice = Number(
        salePrice !== undefined && salePrice !== ""
          ? salePrice
          : book.salePrice
      );

      if (
        !Number.isFinite(currentOriginalPrice) ||
        !Number.isFinite(currentSalePrice)
      ) {
        return res.status(400).json({
          success: false,
          message: "Original Price and Sale Price must be valid numbers.",
        });
      }

      if (currentOriginalPrice < 0 || currentSalePrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Price cannot be negative.",
        });
      }

      if (currentSalePrice > currentOriginalPrice) {
        return res.status(400).json({
          success: false,
          message: "Sale Price cannot be greater than Original Price.",
        });
      }

      book.originalPrice = currentOriginalPrice;
      book.salePrice = currentSalePrice;
    }

    if (req.file) {
      let fileBuffer = req.file.buffer;
      const ONE_MB = 1024 * 1024;

      if (req.file.size > ONE_MB) {
        fileBuffer = await sharp(req.file.buffer)
          .resize(1200)
          .jpeg({ quality: 80 })
          .toBuffer();
      }

      const result = await imagekit.upload({
        file: fileBuffer,
        fileName: `book_${Date.now()}_${req.file.originalname.split(".")[0]}.jpg`,
        folder: "/book_images",
      });

      if (book.featureImageFileId) {
        try {
          await imagekit.deleteFile(book.featureImageFileId);
        } catch (delError) {
          console.error(
            "Failed to delete old image from Book:",
            delError.message
          );
        }
      }

      book.featureImage = result.url;
      book.featureImageFileId = result.fileId;
    }

    await book.save();

    return res.status(200).json({
      success: true,
      message: "Book Updated",
      book,
    });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const { bookid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Book ID format",
      });
    }

    const book = await Book.findById(bookid);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found or already deleted.",
      });
    }

    if (book.featureImageFileId) {
      try {
        await imagekit.deleteFile(book.featureImageFileId);
      } catch (imgError) {
        console.error("ImageKit Deletion Error:", imgError.message);
      }
    }

    await book.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Book Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete book right now.",
    });
  }
};

export const getAllBook = async (req, res, next) => {
  try {
    const books = await Book.find({})
      .populate("category", "name slug featureImage")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      status: true,
      books,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Unable to fetch books right now.",
    });
  }
};

export const getBookByCategory = async (req, res, next) => {
  try {
    const { categoryid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryid)) {
      return res.status(400).json({
        status: false,
        message: "Invalid Book Category ID format",
      });
    }

    const category = await BookCategory.findById(categoryid);

    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Book Category not found.",
      });
    }

    const books = await Book.find({
      category: categoryid,
    })
      .populate("category", "name slug featureImage")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      status: true,
      category,
      books,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Unable to fetch books by category right now.",
    });
  }
};

export const showBook = async (req, res, next) => {
  try {
    const { bookid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookid)) {
      return res.status(400).json({
        status: false,
        message: "Invalid Book ID format",
      });
    }

    const book = await Book.findById(bookid)
      .populate("category", "name slug featureImage")
      .lean();

    if (!book) {
      return res.status(404).json({
        status: false,
        message: "Book not found.",
      });
    }

    return res.status(200).json({
      status: true,
      book,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Unable to fetch book details.",
    });
  }
};