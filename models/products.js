import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    product_name: {
      type: String,
    },
    desc: {
      type: String,
    },
    price: {
      type: Number,
    },
    quantity:{
      type: String,
  },
   image:{
    type: String
   },
   is_deleted:{
    type: Number,
    default: 0,
    enum: [0,1],
    description: "0-> not Deleted, 1-> Deleted"
   }
},
  { timestamps: true }
);

const Product = model("Product", productSchema, "Products");
export default Product;
