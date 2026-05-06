import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
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
    console.log("email : ",email)

    if (
        [username, email , fullName, password].some((field)
        => field?.trim() === "")
    ) {
        throw new apiError(400,"All fields are required")
    }

    if(!email.includes("@")){
        throw new apiError(400,"Enter valid email")
    }
    
} ) 

export  {registerUser};