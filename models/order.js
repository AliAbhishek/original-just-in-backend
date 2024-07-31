import { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    orderId:{
      type: String,
    },
    productId:{
        type: Schema.Types.ObjectId,
        ref: "Product",
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
    price: {
      type: Number,
    },
    order_quantity:{
      type: Number,
  },
 tracking_id:{
  type: String,
 },
 order_statuses: [
  {
    status: Number,
    updatedAt: Date
  }
],
  order_status:{
    type: Number,
    default: 0,
    enum: [0,1,2,3,4,5],
    description: "0-> Order Placed 1 -> Order Confirmed  2 -> Order Shipped 3 -> Out For Delivery 4 -> Order Delivered 5 -> Order Cancelled"
  }
},
  { timestamps: true }
);

const Order = model("Order", orderSchema, "Orders");
export default Order;
