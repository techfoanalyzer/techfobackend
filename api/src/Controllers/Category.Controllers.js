import Category from "../Models/category.model.js";
import { ErrorHandler } from "../Utils/HandleError.js";
import imagekit from "../config/imagekit.js";
import sharp from "sharp";

export const createCategory = async (req, res, next) => {
  try {
    const { name, slug } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        status: false,
        message: "Category name and slug are required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "Feature image is required.",
      });
    }
    

    const existingCategory = await Category.findOne({
      $or: [{ name: name }, { slug: slug }],
    });

    if (existingCategory) {
      return res.status(400).json({
        status: false,
        message: "Category with this name or slug already exists!",
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
      fileName: `category_${Date.now()}_${req.file.originalname.split(".")[0]}.jpg`,
      folder: "/category_images",
    });

    await Category.create({
      name,
      slug,
      featureImage: result.url,
      featureImageFileId: result.fileId,
    });

    return res.status(201).json({
      status: true,
      message: "Category added successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to create category. Please try again later.",
    });
  }
};

export const showCategory = async (req, res, next) => {
  try {
    const { categoryid } = req.params;

    if (!categoryid) {
      return res.status(400).json({
        status: false,
        message: "Category ID is required.",
      });
    }

    const category = await Category.findById(categoryid);

    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      status: true,
      category,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Unable to fetch category details.",
    });
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { categoryid } = req.params;
    const { name, slug } = req.body;

    if (!categoryid) {
      return res.status(400).json({
        status: false,
        message: "Category ID is required.",
      });
    }

    const category = await Category.findById(categoryid);

    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Category not found.",
      });
    }

    if (name || slug) {
      const existingCategory = await Category.findOne({
        _id: { $ne: categoryid }, 
        $or: [...(name ? [{ name }] : []), ...(slug ? [{ slug }] : [])],
      });

      if (existingCategory) {
        return res.status(400).json({
          status: false,
          message: "Category with this name or slug already exists!",
        });
      }
    }

    if (name) category.name = name;
    if (slug) category.slug = slug;

 
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
        fileName: `category_${Date.now()}_${req.file.originalname.split(".")[0]}.jpg`,
        folder: "/category_images",
      });

      if (category.featureImageFileId) {
        try {
          await imagekit.deleteFile(category.featureImageFileId);
        } catch (delError) {
          console.error("Failed to delete old image from Category:", delError.message);
        }
      }

      category.featureImage = result.url;
      category.featureImageFileId = result.fileId;
    }

    await category.save();

    return res.status(200).json({
      status: true,
      message: "Category Updated",
      category,
    });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { categoryid } = req.params;

    if (!categoryid) {
      return res.status(400).json({
        status: false,
        message: "Category ID is required.",
      });
    }

    const category = await Category.findById(categoryid);

    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Category not found or already deleted.",
      });
    }

    if (category.featureImageFileId) {
      try {
        await imagekit.deleteFile(category.featureImageFileId);
      } catch (imgError) {
        console.error("ImageKit Deletion Error:", imgError.message);
      }
    }

    await category.deleteOne();

    return res.status(200).json({
      status: true,
      message: "Category Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Unable to delete category right now.",
    });
  }
};

export const getAllCategory = async (req, res, next) => {
  try {
    const categories = await Category.find({}).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      status: true,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Unable to fetch categories right now.",
    });
  }
};
