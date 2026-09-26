import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    caption: {
      type: String,
      required: true,
      trim: true,
      maxlength: 280,
    },
    imageContent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const Tweet = mongoose.model("Tweet", tweetSchema);
