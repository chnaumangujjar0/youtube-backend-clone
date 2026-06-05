import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body
    
    if(content.trim() == ""){
        throw new ApiError(400,"content is required")
    }
    const tweet = await Tweet.create({
        content: content,
        owner: req.user._id
    })
    
        if(!tweet){
            throw new ApiError(401,"tweet is not posted")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tweet,
                "tweet posted successfully!"
            )
        )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params
    const { page = 1, limit = 10 } = req.query

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"invalid object id")
    }
    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            _id: 0,
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$ownerDetails"
        },
        { $skip: (pageNum - 1) * limitNum },
        { $limit: limitNum }
    ])

    return res.status(200).json(
            new ApiResponse(200, tweets, "Comments fetched successfully!")
        )
})

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;
        const {content} = req.body
    
        const existingTweet = await Tweet.findById(tweetId)
    
        if(!existingTweet){
            throw new ApiError(400,"tweet does not exist for edit")
        }
    
        if(existingTweet.content == content || content.trim() == ""){
            throw new ApiError(400,"new content is required")
        }
    
        if (existingTweet.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You are not authorized to update this tweet")
        }
        const updatedTweet = await Tweet.findByIdAndUpdate(
            existingTweet._id,
            {
                $set: {
                    content: content
                }
            },
            {
                returnDocument: "after"
            }
        )
    
        if(!updatedTweet){
            throw new ApiError(400,updateTweet,"tweet is not updated")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedTweet,
                "tweet updated successfully!"
            )
        )
})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    
        const existingTweet = await Tweet.findById(tweetId)
    
        if(!tweetId){
            throw new ApiError(400," tweet does not exist")
        }
        if (existingTweet.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You are not authorized to delete this tweet")
        }
        await Tweet.deleteOne({
            _id: new mongoose.Types.ObjectId(tweetId)
        })
    
        return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "comment deletes successfully!"
            )
        )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}