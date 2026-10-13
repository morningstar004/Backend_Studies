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
    watchHistoryDates: {
      type: Map,
      of: Date,
      default: {},
    },
    watchlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    watchlistDates: {
      type: Map,
      of: Date,
      default: {},
    },
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

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    return next();
  } catch (error) {
    return next(error);
  }
});

// Instance methods for the User model 
userSchema.methods.isPasswordCorrect = async function (password) {
  // here this refers to the current user document instance, and this.password is the hashed password stored in the database. The bcrypt.compare function compares the provided password with the hashed password and returns a boolean indicating whether they match or not.
  return await bcrypt.compare(password, this.password);
};


//Access Token : It is used to authenticate the user and authorize access to protected resources. It is usually short-lived and has an expiration time. The access token is sent with each request to the server to verify the user's identity and permissions.

//Refresh Token : It is used to obtain a new access token when the current access token expires. It is usually long-lived and can be stored securely on the client-side. The refresh token is sent to the server to request a new access token without requiring the user to re-authenticate. 

userSchema.methods.generateAccessToken = function () {
  // sign method is used to create a new JWT (JSON Web Token) with the specified payload and secret key. The payload contains the user's unique identifier (_id), username, full name, and email. The token is signed using the ACCESS_TOKEN_SECRET from the environment variables and has an expiration time defined by ACCESS_TOKEN_EXPIRES_IN.
  return jwt.sign(
    {
      //PAYLOAD
      _id: this._id,
      username: this.username,
      fullName: this.fullName,
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
