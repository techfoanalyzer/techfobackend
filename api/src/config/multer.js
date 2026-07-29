import multer from "multer";


const storage = multer.memoryStorage();

function fileFilter (req, file, cb) {

    const allowedFiles = ["image/png", "image/jpeg", "image/webp"];

    if (!allowedFiles.includes(file.mimetype)) {
        cb(new Error("Only images (png, jpeg, webp) are allowed."), false);
    } else {
        cb(null, true);
    }
}

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

export default upload;