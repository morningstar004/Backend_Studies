import mongoose, { Schema, isValidObjectId } from "mongoose";
import { Video } from "../models/video.model";
import { apiError } from "../utils/apiError.js";
import { ResponseHandler } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getAllVideos = asyncHandler(async,(req,res)=>{
    const {
        page = 1,
        limit = 10,
        query,
        sortBy = 'createAt',
        sortType = 'desc',
        userId,
    } = req.body
    
})