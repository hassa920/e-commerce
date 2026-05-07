import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB  is connected ✅");
    })
    .catch((err) => {
        console.log("MongoDB connection failed ❌", err.message);
        process.exit(1);
    });



// mongoose.connect("mongodb://127.0.0.1:27017/e-commerce")
//   .then(() => console.log("✅ Connected to LOCAL DB"))
//   .catch(err => console.log(err));