import { Schema, model } from "mongoose";

const addressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    address: {
      type: String,
    },
    landmark: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        //[long, lat]
        default: [0, 0],
      },
    },
    save_as:{
      type: Number,
      default: 0,
      enum: [0, 1, 2],
      description: " 0: Home 1: Office 2: Other",
    }
  },
  { timestamps: true }
);
addressSchema.index({ location: "2dsphere" });
const Address = model("Address", addressSchema, "Addresses");
export default Address;
