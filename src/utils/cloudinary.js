import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv"
dotenv.config()
    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

const uploadOnCloudinary= async (localFilepath)=>{
     try {
        if(!localFilepath) return null
        // upload the file on cloudinary
        const response=await cloudinary.uploader.upload(localFilepath,{
            resource_type:"auto"
        })
        //file has been uploaded successfully
        console.log("file is uploaded on cloudinary",response.url);
        fs.unlinkSync(localFilepath)
        console.log(response)
        return response;
     } catch (error) {
         console.log("Cloudinary Upload Error:", error)
    if (fs.existsSync(localFilepath)) {
        fs.unlinkSync(localFilepath)
    }
    return null
     }
}

export {uploadOnCloudinary}