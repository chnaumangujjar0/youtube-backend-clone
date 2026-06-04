import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {

    const channelStats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: { $size: "$likes" } }
            }
        }
    ]);

    const subscribers = await Subscription.countDocuments({
        channel: req.user._id
    });

    const stats = channelStats[0] || {
        totalVideos: 0,
        totalViews: 0,
        totalLikes: 0
    };

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalSubscribers: subscribers,
                totalVideos: stats.totalVideos,
                totalViews: stats.totalViews,
                totalLikes: stats.totalLikes
            },
            "Channel stats fetched successfully"
        )
    );
});

export {getChannelStats}