import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null; // Return null if no file path is provided

    console.log("Cloudinary upload input path:", localFilePath);

    const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto", // Automatically detect the file type (image, video, etc.)

    });
    console.log("File uploaded to Cloudinary:", response.url);
    return response; // Return the URL of the uploaded file
  } catch (error) {
    fs.unlinkSync(localFilePath); // Delete the local file if upload fails
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

export { uploadOnCloudinary };

// cloudinary.v2.uploader.upload(
//   "https://i.pinimg.com/736x/d1/d4/41/d1d4417cd2b2bf5814b51fe3cc3b2864.jpg",
//   { public_id: "Dog" },
//   function (error, result) {
//     console.log(result);
//   },
// );

/*The Node.js File System (fs) module is a powerful, built-in core module that allows you to interact with the file system on your computer in a manner modeled on standard POSIX functions. It is an essential tool for backend development, used for reading, writing, updating, deleting, and managing files and directories.

Key Features and Concepts
Versatile Operations: The module supports a wide range of actions, including:
Reading/Writing: Accessing file contents or saving data to the disk.
Deletion: Removing files using methods like fs.unlink() (for files) or fs.rm() (more versatile for files and directories).
File Metadata: Getting information about file status (size, creation date, etc.).
Multiple API Styles: fs provides three main ways to perform operations, allowing you to choose based on your project's needs:
Synchronous: Methods (e.g., fs.writeFileSync) block the execution of the program until the operation is complete.
Asynchronous (Callbacks): Standard methods (e.g., fs.writeFile) that use callback functions to handle results without blocking the event loop.
Promises: Modern methods (e.g., fs.promises.writeFile) that work seamlessly with async/await syntax, making code cleaner and easier to manage.
Common Usage: Deletion with unlink
As discussed in the video (14:12 - 16:05), fs.unlink() is a common method used to remove files or symbolic links. It is particularly useful for server-side tasks like cleaning up temporary files after they have been successfully processed or uploaded to a cloud service like Cloudinary.

How it works: unlink essentially removes the link to the file in the file system. If the operation fails or is no longer needed, developers often use unlink to keep the server clean and prevent storage buildup (24:25 - 25:00).
Because the fs module is built directly into Node.js, you do not need to install it via npm; you can simply import it in your code using require('fs') or import fs from 'fs'.*/
