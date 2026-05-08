import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js";

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

    if(!username || !email){
        throw new ApiError(400,"Email or username is required!")
    }

   const existedUser = await User.findOne({ $or:[{email},{username}]})

   if(!existedUser){
    throw new ApiError(401,"Username or email does not exist!")
   }

   
})
export  {registerUser, loginUser};