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
    imageContents: {
      type: [String],
      default: [],
    },
    imageCrops: {
      type: [
        {
          _id: false,
          x: { type: Number, min: 0, max: 100, required: true },
          y: { type: Number, min: 0, max: 100, required: true },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const Tweet = mongoose.model("Tweet", tweetSchema);
