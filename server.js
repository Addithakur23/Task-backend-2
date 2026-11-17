import express from "express"
import mongoose from "mongoose" 
import dotenv from "dotenv"
import cors from "cors"
import { User } from "./models/User.js"
import { Tasks } from "./models/Tasks.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import verifyToken from "./middleware/authmiddleware.js"
import cookieParser from "cookie-parser"


const app=express()
const port =3000
app.use(express.json())
app.use(cors({origin:"https://task-management-app-smoky-five.vercel.app",credentials:true}))
app.use(cookieParser())
dotenv.config()
console.log("mongodb connection string ",process.env.MONGO_URI)
await mongoose.connect(process.env.MONGO_URI)

app.post('/api/Signup', async(req, res) => {
try { 
  let {Name,Email,Password}=req.body
  if(!Email.endsWith("@gmail.com")){
     return res.status(400).json({message:"Only Gamil addresses are allowed ❌"})
  }
  let salt=await bcrypt.genSalt(10)
  let hashedPassword=await bcrypt.hash(Password,salt)
console.log(req.body)
  const user=await User.create({
    Name,
    Email,
    Password:hashedPassword
  })

  res.status(201).json({
    success:true,
    data:user
  })
}
catch(error){
  res.status(500).json({success:false,message:error.message})
}

})

app.post('/api/Login', async(req, res) => {
  console.log(req.body)
 try {
  let {Email,Password}=req.body
  let user=await User.findOne({Email})
  if(!user){
    return res.status(401).json({message:"Invalid Credentials"})
  }
 
  let isMatch=await bcrypt.compare(Password,user.Password)
  console.log(isMatch)
  if(!isMatch){
    return res.status(401).json({message:"Invalid Credentials"})
  }
  const isProduction = process.env.NODE_ENV === "production";
const token = jwt.sign(
  {
    id: user._id,
    role: user.role
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "1d"
  }
);

res.cookie("token", token, {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000
});
console.log("token",token)
  return res.status(200).json({success:true})

}
 catch(error){
  res.status(500).json({message:error.message})
 }
  
})

app.get('/api/tasks',verifyToken, async(req, res) =>{
//   const data=await Tasks.find({user:req.id})
//   console.log(data)
//  return res.status(200).json({
//   success: true,
//  data
// });
  try {
    const { status } = req.query;

    let filter = {};

    if (status && status !== "All") {
      filter.Status = status;
    }

    const tasks = await Tasks.find(filter);

    return res.status(200).json({
      success: true,
      tasks
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }

})

app.post('/api/tasks',verifyToken, async(req, res) =>{
   try{
   
    const {Title,Description,Status}=req.body
    console.log(req.body)
   const task=await Tasks.create({
    Title,Description,Status,user:req.id
   })
   
   res.status(201).json({success:true,data:task})}
   catch(error){
      res.status(500).json({success:true,message:error.message})
   }

})

app.delete('/api/tasks/:id',verifyToken, async(req, res) =>{
try { const task=await Tasks.deleteOne({_id:req.params.id,user:req.id})
  if(task.deletedCount==0){
    return res.status(404).json({message:"Task not found"})
  }
  res.json({message:"Task Deleted Successfully"})}
  catch(error){
    res.status(500).json({message:error.message})
  }
  
})

app.put('/api/tasks/:id',verifyToken, async(req, res) =>{
  const updateTask=await Tasks.findByIdAndUpdate({_id:req.params.id,user:req.id},{Title:req.body.Title,Description:req.body.Description,Status:req.body.Status},{new:true})
  if(!updateTask){
    res.status(400).json({message:"Note not Found"})
  }
res.json(updateTask)

})


app.get("/api/me", verifyToken, async (req, res) => {
  try {
    console.log(req.id)
    const user = await User.findById(req.id).select("-Password");

    console.log("me", user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

app.post("/api/logout",verifyToken,async(req, res) =>{
  res.clearCookie("token",{
    httpOnly:true,
    secure:true,
    sameSite:"none"
  })
  res.status(200).json({message:"Logged out"})
  

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})