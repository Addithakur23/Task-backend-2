import jwt from "jsonwebtoken";
import express from "express";
// function verifyToken(req,res,next){
    // const authHeader=req.headers.authorization
    // console.log("auth",authHeader)
    // if(!authHeader)  return res.status(401).json({message:"Unauthorized"})
    //     const token=authHeader.split(" ")[1]
    //    console.log(token)
    //     jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
    //     if(err){
    //     return res.status(403).json({message:"Invalid Token"})
    //     }

    //     req.id=decoded.id
    //     req.role=decoded.role
    //     console.log(req.id)
    //     next();
    const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token not found"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    req.id = decoded.id;

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};
// }



export default verifyToken; 
