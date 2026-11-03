import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve("uploads", "clinical-documents");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${timestamp}-${safeName}`);
  }
});

export const uploadClinicalDocument = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});