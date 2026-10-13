import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const authorization = req.header("Authorization");
    // Check for Bearer token in the Authorization header
    const bearerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    // Check for access token in cookies or Bearer token
    const token = req.cookies?.accessToken || bearerToken;
    if (!token) {
      throw new apiError(401, "Unauthorized request.");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Check if the user exists in the database and exclude sensitive fields like password and refreshToken
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken",
    );
    if (!user) {
      throw new apiError(401, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof apiError) throw error;
    throw new apiError(401, "Invalid access token.");
  }
});
