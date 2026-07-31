import cloudinary from "../config/cloudinary.js";
import Blog from "../Models/blog.model.js";
import { ErrorHandler } from "../Utils/HandleError.js";
import Category from "../Models/category.model.js";
import imagekit from "../config/imagekit.js";
import sharp from "sharp";
import mongoose from "mongoose";
import { ckImagekit } from "../config/ck.imagekit.js";


export const deleteCkeditorImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: { message: "Image URL is required." } });
    }


    const cleanUrl = imageUrl.split("?")[0]; 
    const rawFileName = cleanUrl.split("/").pop(); 
    const fileName = decodeURIComponent(rawFileName);

    if (!fileName) {
      return res.status(400).json({ error: { message: "Invalid URL structure." } });
    }


    let files = await ckImagekit.listFiles({
      path: "/ckeditor_uploads",
      searchQuery: `name = "${fileName}"`
    });

  
    if (!files || files.length === 0) {
      const baseName = fileName.split(".")[0]; 
      files = await ckImagekit.listFiles({
        path: "/ckeditor_uploads",
        searchQuery: `name : "${baseName}"` 
      });
    }

   
    if (files && files.length > 0) {
      const fileId = files[0].fileId;

      await ckImagekit.deleteFile(fileId);
     

      return res.status(200).json({
        success: true,
        message: "Image deleted successfully from ImageKit."
      });
    }


    return res.status(200).json({ 
      success: true, 
      message: "File was already removed or not found on storage." 
    });

  } catch (error) {
    console.error("CKEditor Image Delete Error:", error);
    return res.status(500).json({
      error: { message: error.message || "Failed to delete image." }
    });
  }
};

// export const uploadCkeditorImage = async (req, res) => {
//   try {

//     if (!req.file) {
    
//       return res.status(400).json({
//         error: { message: "No image file uploaded." }
//       });
//     }

//     let fileBuffer = req.file.buffer;

   
//     try {
//       if (req.file.size > 1024 * 1024) {
//         fileBuffer = await sharp(req.file.buffer)
//           .resize(1000)
//           .jpeg({ quality: 80 })
//           .toBuffer();
//       }
//     } catch (sharpError) {
      
//       fileBuffer = req.file.buffer; 
//     }

    
//     const cleanFileName = req.file.originalname.split(".")[0].replace(/[^a-zA-Z0-9]/g, "_");
    
//     const result = await ckImagekit.upload({
//       file: fileBuffer,
//       fileName: `editor_${Date.now()}_${cleanFileName}.jpg`,
//       folder: "/ckeditor_uploads",
//     });

  
//     return res.status(200).json({
//       url: result.url
//     });

//   } catch (error) {
//     console.error("CKEditor Upload Catch Error:", error);
    
   
//     return res.status(500).json({
//       error: {
//         message: error.message || "Failed to upload image to server."
//       }
//     });
//   }
// };


export const uploadCkeditorImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: { message: "No image file uploaded." }
      });
    }

    // 1. Sharp Always-Optimize & Compress
    let optimizedBuffer;
    try {
      optimizedBuffer = await sharp(req.file.buffer)
        .resize({ width: 1000, withoutEnlargement: true })
        .jpeg({ quality: 75 })
        .toBuffer();
    } catch (sharpError) {
      optimizedBuffer = req.file.buffer;
    }

    const cleanFileName = req.file.originalname
      .split(".")[0]
      .replace(/[^a-zA-Z0-9]/g, "_");

    // 2. Pure Buffer Upload (No Base64 Prefix Issues - Guaranteed Valid ImageKit CDN URL)
    const result = await ckImagekit.upload({
      file: optimizedBuffer, // Pure binary buffer directly
      fileName: `editor_${Date.now()}_${cleanFileName}.jpg`,
      folder: "/ckeditor_uploads",
      useUniqueFileName: true
    });

    // 3. Response Return
    return res.status(200).json({
      url: result.url,
      default: result.url,
      urls: {
        default: result.url
      }
    });

  } catch (error) {
    console.error("CKEditor Upload Catch Error:", error);

    return res.status(500).json({
      error: {
        message: error.message || "Failed to upload image to server."
      }
    });
  }
};

export const addBlog = async (req, res, next) => {
  try {
    const { tittle, blogContent, category, slug } = req.body;

    if (!tittle || !blogContent || !category || !slug) {
      return res.status(400).json({
        success: false,
        message: "Title, blog content, category, and slug are required fields.",
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
      fileName: `blog_${Date.now()}_${req.file.originalname.split(".")[0]}.jpg`,
      folder: "/blog_images",
    });


    const blog = new Blog({
      author: req.user._id,
      tittle,
      slug,
      category,
      featureImage: result.url,
      featureImageFileId: result.fileId, 
      blogContent,
    });

    await blog.save();

    return res.status(201).json({
      success: true,
      message: "Blog added successfully",
      blog,
    });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};

export const editBlog = async (req, res, next) => {
  try {
    const { blogid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(blogid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Blog ID format",
      });
    }

    const blog = await Blog.findById(blogid).populate("category", "name");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const { blogid } = req.params;
    const { tittle, blogContent, category, slug } = req.body;

    if (!mongoose.Types.ObjectId.isValid(blogid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Blog ID format",
      });
    }

    const blogdata = await Blog.findById(blogid);

    if (!blogdata) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }
    blogdata.tittle = tittle || blogdata.tittle;
    blogdata.blogContent = blogContent || blogdata.blogContent;
    blogdata.category = category || blogdata.category;
    blogdata.slug = slug || blogdata.slug;

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
        fileName: `blog_${Date.now()}_${req.file.originalname.split(".")[0]}.jpg`,
        folder: "/blog_images",
      });

      if (blogdata.featureImageFileId) {
        try {
          await imagekit.deleteFile(blogdata.featureImageFileId);
        } catch (delError) {
          console.error("Failed to delete old image from Blog:", delError.message);
        }
      }

      blogdata.featureImage = result.url;
      blogdata.featureImageFileId = result.fileId;
    }

    await blogdata.save();

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog: blogdata,
    });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const { blogid } = req.params;


    if (!mongoose.Types.ObjectId.isValid(blogid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Blog ID format",
      });
    }

    const blog = await Blog.findById(blogid);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found or already deleted",
      });
    }

    if (blog.featureImageFileId) {
      try {
        await imagekit.deleteFile(blog.featureImageFileId);
      } catch (imgError) {
        console.error("ImageKit Deletion Error:", imgError.message);
      }
    }

    await blog.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Blog and associated image deleted successfully",
    });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};


export const showAllBlog = async (req, res, next) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin resources only.",
      });
    }

    const blog = await Blog.find()
      .populate("author", "name avatar role")
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: blog.length,
      blog,
    });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};



export const getAllBlog = async (req, res, next) => {
  try {
    const blog = await Blog.find()
      .populate("author", "name avatar role")
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      status: true,
      blog,
    });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};

export const getBlog = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug })
      .populate("author", "name avatar role")
      .populate("category", "name slug")
      .lean();

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }
    return res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};



export const getRelatedBlog = async (req, res, next) => {
  try {
    const { category, blog } = req.params;

    const categoryData = await Category.findOne({ slug: category });

    if (!categoryData) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    const relatedBlog = await Blog.find({
      category: categoryData._id,
      slug: { $ne: blog }, 
    })
      .select("tittle slug featureImage category author createdAt") 
      .populate("author", "name avatar role")
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .limit(10) 
      .lean();

    return res.status(200).json({
      success: true,
      count: relatedBlog.length,
      relatedBlog,
    });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};


export const getBlogByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;

    const categoryData = await Category.findOne({ slug: category }).lean();
    if (!categoryData) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const blog = await Blog.find({ category: categoryData._id })
      .select("tittle slug featureImage category author createdAt") 
      .populate("author", "name avatar role")
      .populate("category", "name slug")
      .sort({ createdAt: -1 }) 
      .lean();

    return res.status(200).json({
      success: true,
      count: blog.length,
      categoryData,
      blog,
    });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};



export const search = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string" || q.trim() === "") {
      return res.status(200).json({
        success: true,
        count: 0,
        blog: [],
      });
    }

    const sanitizedQuery = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const blog = await Blog.find({
      tittle: { $regex: sanitizedQuery, $options: "i" },
    })
      .select("tittle slug featureImage category author createdAt") 
      .populate("author", "name avatar role")
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .limit(20) 
      .lean();

    return res.status(200).json({
      success: true,
      count: blog.length,
      blog,
    });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};