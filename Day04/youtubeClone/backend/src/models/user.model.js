import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

/*NOTE: If you Import mongoose, {Schema} together from mongoose the you can start with the Schema constructor directly no need write new mongoose.Schema write new Schema.
                    if import mongoose,{Schema} from "mongoose";
                    then new mongoose.Schema will be new Schema
*/

const userSchema = new mongoose.Schema(
  {
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      minlength: 3,
      maxlength: 60,
      trim: true, // to remove the extra spaces
      index: true, // for faster search
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    fullName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // Cloudinary URL of the image
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    },
    coverImage: {
      type: String, // Cloudinary URL of the image
      default:
        "https://images.unsplash.com/photo-1503264116251-35a269479413?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y292ZXJ8ZW58MHx8MHx8&w=1000&q=80",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    refreshToken: {
      type: String,
    },
    passwordResetOtpHash: {
      type: String,
      select: false,
    },
    passwordResetOtpExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      //PAYLOAD
      _id: this._id,
      username: this.username,
      fullname: this.fullName,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    },
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      //PAYLOAD
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    },
  );
};

export const User = mongoose.model("User", userSchema);
