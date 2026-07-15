import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tweet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tweet",
    },
  },
  { timestamps: true },
);

// likeSchema.pre("validate", function () {
//   const targets = [this.video, this.comment, this.tweet].filter(Boolean);

//   if (targets.length !== 1) {
//     this.invalidate(
//       "video",
//       "A like must belong to exactly one video, comment, or tweet.",
//     );
//   }
// });

// likeSchema.index({ video: 1, likedBy: 1 }, { unique: true, sparse: true });
// likeSchema.index({ comment: 1, likedBy: 1 }, { unique: true, sparse: true });
// likeSchema.index({ tweet: 1, likedBy: 1 }, { unique: true, sparse: true });

export const Like = mongoose.model("Like", likeSchema);
