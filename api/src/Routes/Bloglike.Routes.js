import express from "express";
import { doLike, getblogLike, getblogsave } from "../Controllers/BlogLike.Controllers.js";
import { Authenticate } from "../middleware/Authenticate.Middleware.js";
const BlogLikeRoute = express.Router();

BlogLikeRoute.post("/like",Authenticate, doLike);
BlogLikeRoute.get("/get-like/:blogid", getblogLike);
BlogLikeRoute.get("/get-like/:blogid/:userid", getblogLike);
BlogLikeRoute.get("/get-save",Authenticate, getblogsave);



export default BlogLikeRoute;
