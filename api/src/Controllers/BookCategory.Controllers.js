import BookCategory from "../Models/BookCategory.model.js";
import { ErrorHandler } from "../Utils/HandleError.js";
import imagekit from "../config/imagekit.js";
import sharp from "sharp";
import Book from "../Models/Book.model.js";

const generateSlug = (name) => {
  return name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export const createBookCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        status: false,
        message: "Book Category name is required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "Feature image is required.",
      });
    }

    const slug = generateSlug(name);

    const existingCategory = await BookCategory.findOne({
      $or: [{ name }, { slug }],
    });

    if (existingCategory) {
      return res.status(400).json({
        status: false,
        message: "Book Category with this name already exists!",
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
      fileName: `book_category_${Date.now()}_${req.file.originalname
        .split(".")[0]
        .replace(/\s+/g, "_")}.jpg`,
      folder: "/book_category_images",
    });

    const category = await BookCategory.create({
      name,
      slug,
      featureImage: result.url,
      featureImageFileId: result.fileId,
    });

    return res.status(201).json({
      status: true,
      message: "Book Category added successfully",
      category,
    });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};

export const showBookCategory = async (req, res, next) => {
  try {
    const { categoryid } = req.params;

    if (!categoryid) {
      return res.status(400).json({
        status: false,
        message: "Book Category ID is required.",
      });
    }

    const category = await BookCategory.findById(categoryid);

    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Book Category not found.",
      });
    }

    return res.status(200).json({
      status: true,
      category,
    });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};

export const updateBookCategory = async (req, res, next) => {
  try {
    const { categoryid } = req.params;
    const { name } = req.body;

    if (!categoryid) {
      return res.status(400).json({
        status: false,
        message: "Book Category ID is required.",
      });
    }

    const category = await BookCategory.findById(categoryid);

    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Book Category not found.",
      });
    }

    if (name) {
      const slug = generateSlug(name);

      const existingCategory = await BookCategory.findOne({
        _id: { $ne: categoryid },
        $or: [{ name }, { slug }],
      });

      if (existingCategory) {
        return res.status(400).json({
          status: false,
          message: "Book Category with this name already exists!",
        });
      }

      category.name = name;
      category.slug = slug;
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
        fileName: `book_category_${Date.now()}_${req.file.originalname
          .split(".")[0]
          .replace(/\s+/g, "_")}.jpg`,
        folder: "/book_category_images",
      });

      if (category.featureImageFileId) {
        try {
          await imagekit.deleteFile(category.featureImageFileId);
        } catch (deleteError) {
          console.error(
            "Failed to delete old Book Category image:",
            deleteError.message
          );
        }
      }

      category.featureImage = result.url;
      category.featureImageFileId = result.fileId;
    }

    await category.save();

    return res.status(200).json({
      status: true,
      message: "Book Category updated successfully",
      category,
    });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};

export const deleteBookCategory = async (req, res, next) => {
  try {
    const { categoryid } = req.params;

    if (!categoryid) {
      return res.status(400).json({
        status: false,
        message: "Book Category ID is required.",
      });
    }

    const category = await BookCategory.findById(categoryid);

    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Book Category not found or already deleted.",
      });
    }

    const booksCount = await Book.countDocuments({
      category: categoryid,
    });

    if (booksCount > 0) {
      return res.status(400).json({
        status: false,
        message:
          "This Book Category cannot be deleted because books are assigned to it.",
      });
    }

    if (category.featureImageFileId) {
      try {
        await imagekit.deleteFile(category.featureImageFileId);
      } catch (imgError) {
        console.error(
          "Book Category ImageKit Deletion Error:",
          imgError.message
        );
      }
    }

    await category.deleteOne();

    return res.status(200).json({
      status: true,
      message: "Book Category deleted successfully",
    });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};

export const getAllBookCategories = async (req, res, next) => {
  try {
    const categories = await BookCategory.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      status: true,
      categories,
    });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};



export const getBookCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        status: false,
        message: "Book Category slug is required.",
      });
    }

    const category = await BookCategory.findOne({
      slug: slug.toLowerCase().trim(),
    }).lean();

    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Book Category not found.",
      });
    }

    const books = await Book.find({
      category: category._id,
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
    next(new ErrorHandler(500, error.message));
  }
};