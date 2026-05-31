import mongoose,{isValidObjectId} from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Comment } from "../models/comment.model.js";
import {ApiResponse} from "../utils/apiResponse.js"

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {content} = req.body

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid object Id")
    }

    if(content.trim() == ""){
        throw new ApiError(400,"content is required")
    }
    const comment = await Comment.create({
        content: content,
        video: videoId,
        owner: req.user._id
    })

    if(!comment){
        throw new ApiError(401,"comment is not posted")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            "comment posted successfully!"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const {content} = req.body

    const existingComment = await Comment.findById(commentId)

    if(!existingComment){
        throw new ApiError(400,"comment does not exist for edit")
    }

    if(existingComment.content == content || content.trim() == ""){
        throw new ApiError(400,"new content is required")
    }

    if (existingComment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video")
    }
    const updatedComment = await Comment.findByIdAndUpdate(
        existingComment._id,
        {
            $set: {
                content: content
            }
        },
        {
            returnDocument: "after"
        }
    )

    if(!updatedComment){
        throw new ApiError(400,"comment is not updated")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedComment,
            "comment updated successfully!"
        )
    )

})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    const existingComment = await Comment.findById(commentId)

    if(!commentId){
        throw new ApiError(400," comment does not exist")
    }
    if (existingComment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video")
    }
    await Comment.deleteOne({
        _id: new mongoose.Types.ObjectId(commentId)
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
    addComment,
    updateComment,
    deleteComment
}