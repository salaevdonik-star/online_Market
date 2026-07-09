import multer from "multer";
import fs from "fs";
import path from "path";

const uploadPath = path.join(__dirname, "..", "..", "uploads", "images");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueFilename = "image_" + Math.random() + Date.now() + ext;
    cb(null, uniqueFilename);
  },
});

const allowedTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/bmp",
];

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error("allowed types are required"));
    return;
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
});

export default upload;

export const productImages = upload.fields([
  { name: "images", maxCount: 6 },
]);

export const categoryIcon = upload.single("icon");
