import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { isValidObjectId } from "mongoose";
import { ResponseHandler } from "../utils/apiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user._id;

  if (!isValidObjectId(channelId)) {
    throw new apiError(400, "Invalid Channel ID.");
  }

  //prevent self subscribe
  if (channelId === subscriberId.toString()) {
    throw new apiError(400, "You cannot subscribe yourself.");
  }

  //check if channel exist
  const channelExists = await User.exists({ _id: channelId });

  if (!channelExists) {
    throw new apiError(404, "Channel not found.");
  }

  // unsubscribe
  const existingSubscription = await Subscription.findOneAndDelete({
    subscriber: subscriberId,
    channel: channelId,
  });

  if (existingSubscription) {
    return res
      .status(200)
      .json(
        new ResponseHandler(200, "Channel unsubscribed successfully", {
          subscribed: false,
        }),
      );
  }
  //subscribe
  try {
    const subscription = await Subscription.create({
      subscriber: subscriberId,
      channel: channelId,
    });

    return res.status(201).json(
      new ResponseHandler(201, "Channel subscribed successfully.", {
        subscribed: true,
        subscription,
      }),
    );
  } catch (error) {
    if (error?.code === 11000) {
      throw new apiError(409, "Subscription state changed. Please try again.");
    }
    throw error;
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {});

const getSubscribedChannel = asyncHandler(async (req, res) => {});

export { toggleSubscription, getSubscribedChannel, getUserChannelSubscribers };
