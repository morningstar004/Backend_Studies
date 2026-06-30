// require("dotenv").config({path: "./env"});
import dotenv from "dotenv";
dotenv.config({ path: "./env" });
import mongoose, { connect } from "mongoose";
import { DB_Name } from "../constants.js";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_Name
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

export default connectDB;