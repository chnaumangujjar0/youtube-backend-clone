import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import cloudinary from "cloudinary"
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
import { response } from "express";
import mongoose from "mongoose";
// we create a separate method for generating tokens
const generateAccessAndRefreshtoken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false})
        
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(401,"Something went Wrong while generating tokens")
    }
}
// Function for deleting old image url from cloudinary
const deleteOldImageFromCloudinary = async (url = "") => {

    if(url == ""){
        throw new ApiError(401,"URL is not corect! ")
    }

   // Get filename after last '/'
    let part = url.split('/').pop();

    // Remove file extension
    part = part.substring(0, part.lastIndexOf('.'));

    const result = await cloudinary.uploader.destroy(part);
    if(result.result === "ok"){
        console.log("Image deleted successfully!")
    } else {
        console.log("Image not found!")
    }
}
// -------------Controllers---------------------------
const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message : "ok"
    // })

    // get data from frontend
    // validationn - empty or not
    //chech if user already exist
    // check for images, avatar
    // upload to cloudinary
    // create user object - create db
    // remove password and refresh token from field
    // check for user creation
    // return response
    
    const {email , username, password, fullName} = req.body;
   

    if (
        [username, email , fullName, password].some((field)=> field?.trim() === "")
    ) {
        throw new ApiError(400,"All fields are required")
    }

    if(!email.includes("@")){
        throw new ApiError(400,"Enter valid email")
    }
    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })
   
    if(existedUser){
        throw new ApiError(409,"Username or email already exists");
    }

   //const avatarLocalPath = req.files?.avatar?.[0]?.path;  // simple syntax
   let avatarLocalPath;
   if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){ //it is an advanced syntax
    avatarLocalPath = req.files?.avatar[0]?.path;
   }
   console.log(avatarLocalPath)
   // const coverImageLocalPath = req.files?.coverImage[0]?.path;  // simple syntax
   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){ //it is an advanced syntax
    coverImageLocalPath = req.files?.coverImage[0]?.path;
   }
   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required");
   }
   
   
   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if(!avatar){
    throw new ApiError(400,"Avatar file is required");
   }
   
   const user = await User.create(
    {
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password
    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    
    if(!createdUser){
        throw new ApiError(500,"Something went wrong")
    }

    return res.status(200).json(
        new ApiResponse(200, createdUser, "Registered user Successfully!")
    )
} ) 

const loginUser = asyncHandler(async (req,res) => {
    // To Does
    // 1. req.body -> data from front end
    // 2. check user exist
    // 3. check password match
    // 4. assign access token and refresh token 
    // 5. send cookies
    // 6. send res

    const {username, email, password} = req.body;

    if(!(username || email)){
        throw new ApiError(400,"Email or username is required!") 
    }

   const existedUser = await User.findOne({ $or:[{email},{username}]})
   
   if(!existedUser){
        throw new ApiError(404,"Username or email does not exist!")
   }
   
  const isPasswordvalid = await existedUser.isPasswordCorrect(password);
    
  if(!isPasswordvalid){
        throw new ApiError(401,"Incorrect password!")
  }
  
  const {accessToken,refreshToken} =await generateAccessAndRefreshtoken(existedUser._id)
  
  const loggedInUser = await User.findById(existedUser._id).select("-password -refreshToken")
  
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  }
  

  return res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
    200,
    {
    user: loggedInUser,
    accessToken,
    refreshToken
  },
  "User loggedin syccessfully"
)
)
})

const logoutUser = asyncHandler(async (req,res)=>{
 await User.findByIdAndUpdate(
    req.user._id,
    {
        $unset: {
            refreshToken: 1
        }
    },
    { returnDocument: "after" }
 )
    
 const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(
    new ApiResponse(
        200,
        {},
        "User loggedout Successfuly"
    )
  )
})

const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401,"Un authorized access")
    }

    try {
        const decodedToken =  jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"refreh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshtoken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken, options)
        .cookie("refreshToken",newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: user,
                    accessToken,
                    refreshToken : newRefreshToken
                },
                "Token Generated Sucessfuly"
            )
        )
    } catch (error) {
        throw new ApiError(401,"acces token frefreshed failed")
    }
})

const changeCurrentPassword = asyncHandler(async (req,res) => {
    const {oldPassword, newPassword} = req.body;
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Both passwords are required")
    }
   const user = await User.findById(req.user._id)
   console.log("old password",oldPassword)
   console.log("new password",newPassword)
   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
   console.log(isPasswordCorrect)
   if(!isPasswordCorrect){
    throw new ApiError(400,"Incorrect password")
   }

   user.password = newPassword;
   await user.save({validateBeforeSave: false})

   return res
   .status(200)
   .json(
    new ApiResponse(
        200,
        {},
        "password changed successfully"
    )
   )
})

const currentUser = asyncHandler(async (req,res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            req.user,
            "User fetched Successfully"
        )
    )
})

const updateUserDetails = asyncHandler(async (req,res) => {
    const {fullName, email, } = req.body;

    if ([fullName, email].some((field)=> field?.trim() === "")) {
        throw new ApiError(400,"New name required")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                email,
                fullName
            }
        },
        {returnDocument: "after"}
    ).select("-password -refreshToken")


    return res.status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "Details updated successfully"
        )
    )
})

const updateUserAvatar = asyncHandler(async (req, res) =>{

    const avatarLocalPath = req.file.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }
    const oldAvatarUrl = req.user.avatar;  // URL of old Avatar

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    
    if(!avatar.url){
        throw new ApiError(400,"Error while uploading avatar file to cloudinary")
    }
    deleteOldImageFromCloudinary(oldAvatarUrl); // call the delete function
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {avatar: avatar.url}
        }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "Avatar updated Successfully!"
        )
    )

})

const updateUserCoverImage = asyncHandler(async (req, res) =>{
    const coverImageLocalPath = req.file.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover Image file is missing")
    }
    const oldCoverImageUrl = req.user.coverImage;

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading coverImage file to cloudinary")
    }
    deleteOldImageFromCloudinary(oldCoverImageUrl);
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {coverImage: coverImage.url}
        }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "Avatar updated Successfully!"
        )
    )
}
)

const getUserChannelProfile = asyncHandler(async (req,res) => {
    const {username} = req.params;

    if(!username.trim()){
        throw new ApiError(401," This username does not exist")
    }

    const channel = await User.aggregate([
        {
            $match : {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedto"
            }
        },
        {
            $addFields: {
                subscribesCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedto"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                username: 1,
                fullName: 1,
                subscribesCount: 1,
                channelSubscribedToCount: 1,
                avatar: 1,
                coverImage: 1,
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(400,"Erroe does not exist!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            channel[0],
            "User channel fetched Successfully!"
        )
    )
})

const getWatchHistory = asyncHandler(async (req,res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users", // feeling mistake
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }   
                        }    
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "watch history fetched successfully"
        )
    )
})

export  {
    registerUser,
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    currentUser, 
    updateUserDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
};