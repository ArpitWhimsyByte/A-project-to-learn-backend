import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { configDotenv } from "dotenv";
import dotenv from "dotenv"
dotenv.config()

export const verifyJWT=asynchandler(async(req,res,next)=>{
    
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        // console.log("Token details:",token)
        // console.log("Cookies:", req.cookies)
        // console.log("Auth Header:", req.header("Authorization"))

        if (!token) {
            throw new ApiError(401,"Unauthorized request")
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }
        req.user=user
        next()
   

})