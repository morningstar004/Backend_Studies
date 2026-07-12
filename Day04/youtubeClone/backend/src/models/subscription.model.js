import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    subscribers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User", //? Users that are subscribing to his channel 
      default: "0",
      required: true,
    },
    channel: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User" //? Channel which the he subscribed
    }
  },
  {
    timestamps: true,
  },
);


export const Subscription = mongoose.model("Subscription",subscriptionSchema)