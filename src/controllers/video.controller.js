import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {Video} from "../models/video.model.js"
const publishAVideo = asyncHandler(async (req, res) => {
    // user logged in 
    // req.body
    // take files 
    // send duration in response

   const {title, description, } = req.body;

   if(!(title && description)){
    throw new ApiError(400, "Title and description are required")
   }

   const videoLocalPath = req.files?.video[0]?.path;

   if(!videoLocalPath){
    throw new ApiError(400,"video required for upload!")
   }

   let thumbnailLocalPath; // differnt syntax just for practice
   if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0){ //it is an advanced syntax
    thumbnailLocalPath = req.files?.thumbnail[0]?.path;
   }
   
   const videoFile = await uploadOnCloudinary(videoLocalPath);
   const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
   
   const videoDetails = await Video.create(
       {
           title,
           thumbnail: thumbnail.url,
           videoFile: videoFile.url,
           description,
           duration: parseFloat(videoFile.duration.toFixed(1)),
           owner: req.user._id
       })
     
         if(!videoDetails){
             throw new ApiError(500,"videoFile does not added to ")
         }

   res.status(200).json(
    new ApiResponse(
        200,
        {
            title: title,
            description: description,
            _id: videoDetails._id,
            duration: parseFloat(videoFile.duration.toFixed(1)),
            owner: req.user._id,
            thumbnail: thumbnail.url,
            videoFile: videoFile.url
        },
        "file uploaded successfully"
    )
   )
})

export {publishAVideo}