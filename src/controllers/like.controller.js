import mongoose,{isValidObjectId} from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/apiResponse.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "invalid object id")
    }

    const existingLike = await Like.findOne({
        video:videoId,
        likedBy: req.user._id
    })

    if(existingLike){

        await Like.deleteOne(
            {
            _id: existingLike._id
            }
        )

        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "video unliked successfully!"
            )
        )
    }

    const like = await Like.create(
        {
            video: videoId,
            likedBy: req.user._id
        }
    )

    if(!like){
        throw new ApiError(401,"video is not liked")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            like,
            "video liked successfully!"
        )
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
   
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"invalid object id")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    if(existingLike){
        await Like.deleteOne({
            _id: existingLike._id
        })

        return res
        .status(200)
        .json(
            new ApiResponse(
            200,
            {},
            "comment unliked successfully"
            )
        )
    }

    const like = await Like.create({
        comment: commentId,
        likedBy: req.user._id
    })

    if(!like){
        throw new ApiError(401,"comment is not liked")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            like,
            "comment liked successfully!"
        )
    )


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"invalid object id")
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    if(existingLike){
        await Like.deleteOne({
            _id: existingLike._id
        })

        return res
        .status(200)
        .json(
            new ApiResponse(
            200,
            {},
            "tweet unliked successfully"
            )
        )
    }

    const like = await Like.create({
        tweet: tweetId,
        likedBy: req.user._id
    })

    if(!like){
        throw new ApiError(401,"comment is not liked")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            like,
            "tweet liked successfully!"
        )
    )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.find({
        likedBy: req.user._id
    })

    if(!likedVideos){
        throw new ApiError(400," no liked video found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
        200,
        likedVideos,
        "liked videos fetched successfully!"
    )
    )
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}