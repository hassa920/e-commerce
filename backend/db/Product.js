import mongoose from "mongoose";

const productSchema=new mongoose.Schema({

    name:String,
    price:String,
    category:String,
    userId:String,
    company:String,
    image:String

});

productSchema.index({
    name:"text",
    category:"text",
    company:"text",
    price:"number",


})

const Product=mongoose.model("products",productSchema);
export default Product;