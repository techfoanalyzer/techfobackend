import express from "express";
import { addComment, commentCount, deleteComment, getAllComments, getComments } from "../Controllers/Comment.Controllers.js";
import { Authenticate } from "../middleware/Authenticate.Middleware.js";
import { onlyAdminAuthenticate } from "../middleware/AdminAuthenticate.Middleware.js";
const commentRoute = express.Router();

commentRoute.post("/add",Authenticate, addComment);
commentRoute.get("/get/:blogid", getComments);
commentRoute.get("/get-all-comments", Authenticate, getAllComments);
commentRoute.delete("/delete-comment/:commentId",Authenticate, deleteComment);
commentRoute.get("/get-count/:blogid", commentCount);

export default commentRoute;
