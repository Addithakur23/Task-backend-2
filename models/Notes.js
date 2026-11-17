import mongoose from "mongoose";
let TasksSchema=new mongoose.Schema({
    Title:String,
    Description:String,
    Status:{
        type:String,
        enum:["Pending","Completed","In Progress"],
        default:"Pending"
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"user"
    }
})
export const Tasks=mongoose.model("tasks",TasksSchema)