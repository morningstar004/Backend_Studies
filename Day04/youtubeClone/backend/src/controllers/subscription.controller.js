import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    

});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {});

const getSubscribedChannel = asyncHandler(async (req, res) => {});

export { toggleSubscription, getSubscribedChannel, getUserChannelSubscribers };
