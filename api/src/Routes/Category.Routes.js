import express from 'express'
import { createCategory, deleteCategory, getAllCategory, showCategory, updateCategory } from '../Controllers/Category.Controllers.js'
import { onlyAdminAuthenticate } from '../middleware/AdminAuthenticate.Middleware.js'
import upload from "../config/multer.js";

const CategoryRoute =  express.Router()

CategoryRoute.post("/create",upload.single("file"),onlyAdminAuthenticate,createCategory)
CategoryRoute.put("/update/:categoryid" ,upload.single("file"), onlyAdminAuthenticate,updateCategory)
CategoryRoute.get("/show/:categoryid",onlyAdminAuthenticate,showCategory)
CategoryRoute.delete("/delete/:categoryid",onlyAdminAuthenticate,deleteCategory)
CategoryRoute.get("/all-category",getAllCategory)




export default CategoryRoute