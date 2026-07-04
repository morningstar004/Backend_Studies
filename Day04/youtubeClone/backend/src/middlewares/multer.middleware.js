import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, ".public/temp");
  },//cb: callback function that takes two arguments: an error (if any) and the destination path where the file should be stored. In this case, it specifies that the uploaded files should be stored in the ".public/temp" directory.
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },//cb: callback function that takes two arguments: an error (if any) and the filename to be used for the uploaded file. In this case, it generates a unique filename by prepending the current timestamp (Date.now()) to the original filename of the uploaded file (file.originalname). This helps avoid filename collisions and ensures that each uploaded file has a unique name.
});

export const upload = multer({
  storage,
});//storage: This property specifies the storage engine to be used for handling file uploads. In this case, it uses the diskStorage engine defined earlier, which saves files to the local disk in the specified destination directory with unique filenames.
