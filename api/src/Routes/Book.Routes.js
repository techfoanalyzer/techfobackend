import express from "express";
import {
  addBook,
  editBook,
  updateBook,
  deleteBook,
  getAllBook,
  getBookByCategory,
  showBook,
} from "../Controllers/Book.Controllers.js";
import upload from "../config/multer.js";
import { onlyAdminAuthenticate } from "../middleware/AdminAuthenticate.Middleware.js";

const BookRoute = express.Router();

BookRoute.post(
  "/add",
  upload.single("file"),
  onlyAdminAuthenticate,
  addBook
);

BookRoute.get(
  "/edit/:bookid",
  onlyAdminAuthenticate,
  editBook
);

BookRoute.put(
  "/update/:bookid",
  upload.single("file"),
  onlyAdminAuthenticate,
  updateBook
);

BookRoute.delete(
  "/delete/:bookid",
  onlyAdminAuthenticate,
  deleteBook
);

BookRoute.get(
  "/get-all",
  getAllBook
);

BookRoute.get(
  "/get-by-category/:categoryid",
  getBookByCategory
);

BookRoute.get(
  "/show/:bookid",
  showBook
);

export default BookRoute;