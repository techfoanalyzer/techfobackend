import express from "express";
import { doLike, getblogLike } from "../Controllers/BlogLike.Controllers.js";
import { Authenticate } from "../middleware/Authenticate.Middleware.js";
const BlogLikeRoute = express.Router();

BlogLikeRoute.post("/like",Authenticate, doLike);
BlogLikeRoute.get("/get-like/:blogid", getblogLike);
BlogLikeRoute.get("/get-like/:blogid/:userid", getblogLike);



export default BlogLikeRoute;
