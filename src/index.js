import dotenv from "dotenv";
dotenv.config();
import express from "express"

import connectDB from "./db/index.js"
const app=express()

connectDB()
.then(()=>{
  app.get(process.env.PORT || 8000 ,()=>{
    console.log(`Server is running at the port number ${process.env.PORT}`);
  })
})
.catch((error)=>{
  console.log("MONGODB connection failed !!!",error);
  
})