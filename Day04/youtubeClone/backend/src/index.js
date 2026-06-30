import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";
import { DB_Name } from "./constants.js";

const app = express();
(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_Name,
    });
    app.on("error", (error) => {
      console.log("ERROR: ", error.message);
      throw error;
    });
    console.log("MongoDB Connected");

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
})();
// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGODB_URI, {
//         dbName: process.env.DB_Name
//     });
//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`Error: ${error.message}`);
//     process.exit(1);
//   }
// }

// connnectDB();
