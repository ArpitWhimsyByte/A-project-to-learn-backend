import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser=asynchandler(async(req,res)=>{
    //get details from frontend
    //validation - not empty
    // check if the user already exist or not - username and email
    //check for images ,check for avatar
    //upload them on cloudinary,avatar
    //create user object - create entry in db
    // remove passowrds and refreshToken field from the response \
    //check user creation
    //return response
    const{fullname,email,username,password}=req.body
    console.log("Email : ",email)
    console.log(req.body)
    if (
        [fullname,email,username,password].some((field)=>{
            field =>field ===undefined || field?.trim()===""
        })
    ) {
        throw new ApiError(400,"All fields are required")
    }

    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with this username or email already exists")
    }
   const avatarLocalPath=req.files?.avatar[0]?.path
//    const coverImageLocalPath=req.files?.coverImage[0]?.path
   let coverImageLocalPath;
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0) {
    coverImageLocalPath=req.files.coverImage[0].path
   }

   const avatar=await uploadOnCloudinary(avatarLocalPath)
   const coverImage=await uploadOnCloudinary(coverImageLocalPath)
   console.log(req.files)
   if(!avatar){
    throw new ApiError(409,"Avatar is required")
   }
   const user= await User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    password,
    email,
    username:username.toLowerCase()
   })
   const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
   )
   if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering")
   }
   return res.status(201).json(
    new ApiResponse(201,createdUser,"User is successfully registered")
   )
})

export {registerUser}