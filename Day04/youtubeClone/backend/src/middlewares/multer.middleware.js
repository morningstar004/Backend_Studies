import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = path.resolve("public", "temp");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Configures multer disk storage settings for file uploads.
 * 
 * @type {multer.StorageEngine}
 * 
 * @description
 * Sets up file storage configuration with two callback functions:
 * - destination: Specifies where uploaded files will be stored on the server
 * - filename: Generates unique filenames using timestamp and original filename
 * 
 * @example
 * const upload = multer({ storage });
 * app.post('/upload', upload.single('file'), (req, res) => {
 *   // Handle uploaded file
 * });
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({
  storage,
});
