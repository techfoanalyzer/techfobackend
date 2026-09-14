import express from "express";

import {
  createBookCategory,
  showBookCategory,
  updateBookCategory,
  deleteBookCategory,
  getAllBookCategories,
  getBookCategoryBySlug,
} from "../Controllers/BookCategory.Controllers.js";

import upload from "../config/multer.js";
import { onlyAdminAuthenticate } from "../middleware/AdminAuthenticate.Middleware.js";

const BookCategoryRoute = express.Router();

BookCategoryRoute.post(
  "/create",
  upload.single("file"),
  onlyAdminAuthenticate,
  createBookCategory
);

BookCategoryRoute.put(
  "/update/:categoryid",
  upload.single("file"),
  onlyAdminAuthenticate,
  updateBookCategory
);

BookCategoryRoute.get(
  "/show/:categoryid",
  onlyAdminAuthenticate,
  showBookCategory
);

BookCategoryRoute.delete(
  "/delete/:categoryid",
  onlyAdminAuthenticate,
  deleteBookCategory
);

BookCategoryRoute.get(
  "/all-category",
  getAllBookCategories
);

BookCategoryRoute.get(
  "/show-by-slug/:slug",
  getBookCategoryBySlug
);

export default BookCategoryRoute;