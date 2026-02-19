import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessTokenAndRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId)
    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()
    user.refreshToken=refreshToken
    await user.save({validateBeforeSave: false})
    return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating access and refresh tokens")
    }
}

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
const loginUser=asynchandler(async(req,res)=>{
    //req.body-get data 
    //username or email -check
    //find the user
    //password check
    //generate access and refresh tokens
    //send cookie
    const{username,email,password}=req.body
    if((!username) || (!email) ){
        throw new ApiError(400,"username or email is required")
    }

    const user=await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(404,"User not found")
    }
    const isPasswordValid=await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credintials")
    }
    const {accessToken,refreshToken}=await generateAccessTokenAndRefreshToken(user._id)
    
    const loggedInUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    const options={
        httpOnly:true,
        secure:true
    }
    console.log("User Logged in with Success")

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User logged in Successfully"
        )
    )

})

const loggOutUser=asynchandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            },
            
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User  logges Out")
    )
})
export {
    registerUser,
    loginUser,
    loggOutUser
}