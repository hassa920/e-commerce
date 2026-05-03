import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    name:String,
    email: { type: String, unique: true },
    password:String,
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
      }
})

const User=mongoose.model("users",userSchema);
export default User;