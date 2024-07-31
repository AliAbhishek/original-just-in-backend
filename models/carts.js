import { Schema, model } from "mongoose";

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
    },
    quantity:{
      type: Number,
    },
    addressId: {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
    date:{
      type: Date,
    },
    time:{
      type: String,
    },
    instructions:{
      type: String,
    },
},
  { timestamps: true }
);

const Cart = model("Cart", cartSchema, "Carts");
export default Cart;
