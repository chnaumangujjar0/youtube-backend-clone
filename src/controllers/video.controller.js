import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {Video} from "../models/video.model.js"
import cloudinary from "cloudinary"
import mongoose from "mongoose";
const deleteFromCloudinary = async (url = "") => {

    if(url == ""){
        throw new ApiError(401,"URL is not corect! ")
    }
    const resource_type = url.includes("/video/") ? "video" : "image"

   // Get filename after last '/'
    let part = url.split('/').pop();

    // Remove file extension
    part = part.substring(0, part.lastIndexOf('.'));

    const result = await cloudinary.uploader.destroy(part,{resource_type});
    if(result.result === "ok"){
        console.log("file deleted successfully!", resource_type)
    } else {
        console.log("file not found!",resource_type)
    }
}

// ------Controllers-----------------
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!(title && description)) {
        throw new ApiError(400, "Title and description are required")
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path

    let thumbnailLocalPath;
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files.thumbnail[0]?.path;
    }

    if (!videoFileLocalPath) throw new ApiError(400, "Video file is required")
    if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail is required")

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!(videoFile && thumbnail)) {
        throw new ApiError(400, "Upload to Cloudinary failed")
    }

    const videoDetails = await Video.create({
        title,
        thumbnail: thumbnail.url,
        videoFile: videoFile.url,
        description,
        duration: parseFloat(videoFile.duration.toFixed(1)),
        owner: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201, videoDetails, "Video uploaded successfully")
    )
})

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)

    const videos = await Video.aggregate([  // ✅ await added
        {
            $match: {
                ...(userId && { owner: new mongoose.Types.ObjectId(userId) }),
                ...(query && { title: { $regex: query, $options: "i" } })
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $sort: {
                [sortBy || "createdAt"]: sortType === "asc" ? 1 : -1
            }
        },
        { $skip: (pageNum - 1) * limitNum },
        { $limit: limitNum }
    ])

    return res.status(200).json(
        new ApiResponse(200, videos, "Videos fetched successfully!")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    console.log(videoId)
    const video = await Video.findById(videoId);
    console.log(video)
    if(!video){
        throw new ApiError(400, "Video not found")
    }
    return res.status(200).json(
    new ApiResponse(
        200,
        video,
        "video fetched successfully"
    )
   )
})

const updateVideoDetails = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const { videoId } = req.params;

    if (!title && !description) {
        throw new ApiError(400, "At least one field is required to update")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video does not exist!")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video")
    }

    
    const thumbnailLocalPath = req.file?.path;

    let thumbnail = null;

    if (thumbnailLocalPath) {
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

        if (!thumbnail) {
            throw new ApiError(400, "Thumbnail upload failed")
        }

        
        await deleteFromCloudinary(video.thumbnail)
    }

    
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: thumbnail?.url || video.thumbnail  // keeps old if not updated
            }
        },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Details updated successfully!"))
})

const deleteVideo = asyncHandler(async (req,res) => {
    const {videoId} = req.params

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "Video does not exist!")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video")
    }
    
    const deleted = await Video.deleteOne({ _id: new mongoose.Types.ObjectId(videoId)})

    
    if(!deleted){
        throw new ApiError(400, "video not deleted");  
    }
    deleteFromCloudinary(video.videoFile)
    deleteFromCloudinary(video.thumbnail)
    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Video deleted successfully"
        )
    )
})

const togglePublishStatus = asyncHandler(async (req,res) => {
    const {videoId} = req.params

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "Video does not exist!")
    }
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished
            }
        },
        { returnDocument: "after" }
    )
    
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            updatedVideo,
            "publish toggled successfully!"
        )
    )
})
export {publishAVideo, getVideoById, updateVideoDetails, deleteVideo, togglePublishStatus, getAllVideos}