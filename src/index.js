import dotenv from "dotenv";
dotenv.config();
import express from "express"

import connectDB from "./db/index.js"

connectDB()
.then(()=>{
  app.listen(process.env.PORT|| 8000,()=>{
    console.log(`Server is running at port ${process.env.PORT}`);
    
  })
})
.catch((error)=>{
console.log("MONGO db connection failed")
})