import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
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

   const avatarLocalPath = req.files?.avatar[0]?.path;
   // const coverImageLocalPath = req.files?.coverImage[0]?.path;  it is an advanced syntax
   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
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

    return res.status(201).json(
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
  
  const loggedInUser = await User.findById(existedUser._Id).select("-password -refreshToken")
  console.log(loggedInUser)
  const options = {
    httpOnly: true,
    secure: true
  }
  

  return res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
    200,
    {
    user: existedUser,
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
        $set: {
            refreshToken: undefined
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

    if(incomingRefreshToken){
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

export  {registerUser, loginUser, logoutUser, refreshAccessToken};