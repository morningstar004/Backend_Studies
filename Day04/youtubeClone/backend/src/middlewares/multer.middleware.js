import fs from "fs";
import path from "path";
import multer from "multer";

/**
 * Constructs an absolute file system path for temporary file uploads.
 * Resolves to the "public/temp" directory relative to the project root.
 * Used to store temporarily uploaded files before processing or permanent storage.
 * @type {string}
 */
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
  destination: function (_, __, cb) {
    cb(null, uploadDir);
  },
  filename: function (_, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
  fileFilter: function (_, file, cb) {
    // Accept common image mime types only
    if (/image\/(jpeg|png|jpg|webp)/.test(file.mimetype)) return cb(null, true);
    cb(new Error("Only image files are allowed (jpeg, jpg, png, webp)."));
  },
});

export const uploadVideo = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  fileFilter: function (_, file, cb) {
    const isThumbnail =
      file.fieldname === "thumbnail" &&
      /image\/(jpeg|png|jpg|webp)/.test(file.mimetype);
    const isVideo =
      file.fieldname === "videoFile" &&
      /video\/(mp4|webm|ogg|quicktime)/.test(file.mimetype);

    if (isThumbnail || isVideo) return cb(null, true);

    cb(
      new Error(
        "Upload a video (mp4, webm, ogg, mov) as videoFile and an image as thumbnail.",
      ),
    );
  },
});
