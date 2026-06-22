import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  //object 01
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: 6,
      maxLength: 20,
    },
  },
  // object 02
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", userSchema);
