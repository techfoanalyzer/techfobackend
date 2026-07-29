import express from "express";
const app = express();
import cookieParser from "cookie-parser";
import cors from "cors";

import DB_connection from "./src/DB/DB_Connection.js";


import AuthRoutes from "./src/Routes/Auth.Routes.js";
import userRoutes from "./src/Routes/User.Routes.js";
import CategoryRoute from "./src/Routes/Category.Routes.js";
import BlogRoute from "./src/Routes/Blog.Routes.js";
import commentRoute from "./src/Routes/Comment.Route.js";
import BlogLikeRoute from "./src/Routes/Bloglike.Routes.js";
import getUserRoute from "./src/Routes/GetUser.Route.js";


app.set("trust proxy", 1);


app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(async (req, res, next) => {
  try {
    await DB_connection(); 
    next();
  } catch (error) {
    res.status(500).json({ status: false, message: "Database connection failed" });
  }
});



app.use("/api/auth", AuthRoutes);
app.use("/api/user", userRoutes);
app.use("/api/category", CategoryRoute);
app.use("/api/blog", BlogRoute);
app.use("/api/comment", commentRoute);
app.use("/api/blog-like", BlogLikeRoute);
app.use("/api/get", getUserRoute);

export default app;