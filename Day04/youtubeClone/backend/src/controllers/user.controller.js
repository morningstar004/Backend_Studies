import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ResponseHandler } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get details about the User from its model
  const { fullName, email, password, username } = req.body;
  console.log("Incoming body:", req.body);
  // Validate the data input

  // if(fullName || email || password || username == ""){
  //     throw new apiError(400,"All feilds are required")
  // }
  if (
    [fullName, email, username, password].some((field) => {
      return field?.trim() === "";
    })
  ) {
    throw new apiError(400, "All feilds should be filed");
  }

  
  // check if the user already exists: username, email
  const UserExist = await User.findOne({
    $or: [{ username }, { email }],
  });

  console.log("UserExist result:", UserExist);

  if (UserExist) {
    throw new apiError(409, "User already exists");
  }

  // check from images, and avtar
const avtarLocalPath = req.files?.avtar?.[0]?.path;
const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
console.log(req.files);

  if (!avtarLocalPath) {
    throw new apiError(400, "Avtar Image is required.");
  }

  // upload the image to cloudinary
  const avtar = await uploadOnCloudinary(avtarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avtar) {
    throw new apiError(400, "File not uploaded");
  }

  // create user object - create enter in db
  const user = await User.create({
    fullName,
    avtar: avtar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // remove password and refresh token feild from responce
  const createdUser = await User.findById(user._id).select(
    "-password -refreshtoken",
  );

  // check if user created
  if (!createdUser) {
    throw new apiError(500, "Something went wrong while user registration");
  }

  // send a response back to the client
  return res
    .status(201)
    .json(
      new ResponseHandler(201, "User Registered successfully", createdUser),
    );
});

export { registerUser };
