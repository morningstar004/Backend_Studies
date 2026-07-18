import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose, { isValidObjectId } from "mongoose";
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
    return res.status(200).json(
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

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  // `channelId` is the channel whose subscriber list the client requested.
  const { channelId } = req.params;

  // Avoid creating an ObjectId from an invalid value and querying MongoDB with it.
  if (!isValidObjectId(channelId)) {
    throw new apiError(400, "Invalid channel ID.");
  }

  // Future simple version (only when subscriber counts and `isSubscribed` are not needed):
  // const subscribers = await Subscription.find({ channel: channelId })
  //   .populate("subscriber", "username avatar fullName");
  const subscribers = await Subscription.aggregate([
    // Stage 1: Keep only subscription documents for the requested channel.
    // Each remaining document represents one user subscribed to this channel.
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },

    // Stage 2: Replace each subscriber id with that subscriber's public user data.
    // `subscriber` is initially an ObjectId; after this lookup it is an array of users.
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          // Nested stage 2a: Find everyone who subscribes to this subscriber.
          // This lets us calculate the subscriber's own subscriber count.
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },

          // Nested stage 2b: Find every channel this subscriber follows.
          // This lets us calculate how many channels they subscribe to.
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "subscriber",
              as: "subscribedTo",
            },
          },

          // Nested stage 2c: Derive counts and the viewer-specific subscription state.
          {
            $addFields: {
              // Number of users subscribed to this listed subscriber's channel.
              subscribersCount: {
                $size: "$subscribers",
              },
              // Number of channels the listed subscriber is subscribed to.
              noOfChannelSubscribed: {
                $size: "$subscribedTo",
              },
              // True when the logged-in viewer also subscribes to this listed subscriber.
              // `$subscribers.subscriber` is the array of ObjectIds that follow them.
              isSubscribed: {
                $cond: {
                  if: {
                    $in: [req.user?._id, "$subscribers.subscriber"],
                  },
                  then: true,
                  else: false,
                },
              },
            },
          },

          // Nested stage 2d: Return only safe, useful public fields from the user document.
          // Fields such as password and refreshToken are never included.
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
              subscribersCount: 1,
              noOfChannelSubscribed: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },

    // Stage 3: The lookup returns an array, but one subscription has one subscriber.
    // Extract that single user object so clients receive `subscriber: { ... }`.
    {
      $addFields: {
        subscriber: {
          $first: "$subscriber",
        },
      },
    },

    // Stage 4: Remove subscription-document metadata and return only each subscriber.
    {
      $project: {
        _id: 0,
        subscriber: 1,
      },
    },
  ]);

  // Send the final list in the application's standard response format.
  return res
    .status(200)
    .json(new ResponseHandler(200, "Got Subscribers", subscribers));
});

const getSubscribedChannel = asyncHandler(async (req, res) => {
  // `subscriberId` identifies the user whose followed channels are requested.
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new apiError(400, "Invalid Subscriber ID.");
  }

  // Return 404 rather than an ambiguous empty list for a non-existent user.
  const subscriberExists = await User.exists({ _id: subscriberId });
  if (!subscriberExists) {
    throw new apiError(404, "Subscriber not found.");
  }

  const subscribedChannels = await Subscription.aggregate([
    // Stage 1: Keep subscriptions created by the requested subscriber.
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },

    // Stage 2: Join every followed channel with its public user information.
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
        pipeline: [
          // Nested stage 2a: Find the users following this channel.
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },

          // Nested stage 2b: Find the channels this channel owner follows.
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "subscriber",
              as: "subscribedTo",
            },
          },

          // Nested stage 2c: Calculate display counts and viewer subscription state.
          {
            $addFields: {
              subscribersCount: {
                $size: "$subscribers",
              },

              channelsSubscribedToCount: {
                $size: "$subscribedTo",
              },

              isSubscribed: {
                $cond: {
                  if: {
                    $in: [req.user?._id, "$subscribers.subscriber"],
                  },
                  then: true,
                  else: false,
                },
              },
            },
          },

          // Nested stage 2d: Limit output to public channel fields.
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
              coverImage: 1,
              subscribersCount: 1,
              channelsSubscribedToCount: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },

    // Stage 3: A lookup produces an array; extract its single matching channel.
    {
      $addFields: {
        channel: {
          $first: "$channel",
        },
      },
    },

    // Stage 4: Exclude subscription document metadata from the API response.
    {
      $project: {
        _id: 0,
        channel: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ResponseHandler(200, "Got subscribed channels.", subscribedChannels),
    );
});

export { toggleSubscription, getSubscribedChannel, getUserChannelSubscribers };
