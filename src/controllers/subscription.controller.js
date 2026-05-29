import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) =>{
    const {channelId} = req.params

    if(!channelId){
        throw new ApiError(400, "Invalid channel id")
    }
    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    if(existingSubscription){
        await Subscription.deleteOne(
            {
            _id: existingSubscription._id
            }
        )

        return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "unsubscribed successfully"
        )
    )
    }
    
    const subcribe = await Subscription.create(
        {
            subscriber:  req.user._id ,
            channel: channelId
        }
    )
    if(!subcribe){
        throw new ApiError(401, " channel is not subscribed")
    }
    
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                subcribe
            },
            "subscribed successfully"
        )
    )
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!channelId){
        throw new ApiError(400, "Subscriber id required in params")
    }
    const subscriber = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                        username: 1,
                        fullName: 1,
                        avatar: 1
                        }
                    }
                ],
                as: "subscriberInfo"
            }
        },
        {
            $unwind: "$subscriberInfo" // it convert the array data into object
        },
        {
            $project: {
                _id: 0,
                subscriberId: "$subscriberInfo._id",
                username: "$subscriberInfo.username",
                email: "$subscriberInfo.email",
                fullName: "$subscriberInfo.fullName",
                avatar: "$subscriberInfo.avatar"
            }
        }
    ])
    if(!subscriber){
        throw new ApiError(400,"Errpor while fethching subscribers data")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            subscriber,
            "subscribers fetched successfully"
        )
    )
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!subscriberId){
        throw new ApiError(400, "Subscriber id required in params")
    }
    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                        username: 1,
                        fullName: 1,
                        avatar: 1
                        }
                    }
                ],
                as: "subscribedChannelInfo"
            }
        },
        {
            $unwind: "$subscribedChannelInfo"
        },
        {
            $project: {
               channelId: "$subscribedChannelInfo._id",
                username: "$subscribedChannelInfo.username",
                email: "$subscribedChannelInfo.email",
                fullName: "$subscribedChannelInfo.fullName",
                avatar: "$subscribedChannelInfo.avatar"
            }
        }
    ])
    
    if(!subscribedChannels){
        throw new ApiError(400,"Errpor while fethching subscribed channels data")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            subscribedChannels,
            "fetch subscribed channels successfully!"
        )
    )
})
export {toggleSubscription, getUserChannelSubscribers, getSubscribedChannels}