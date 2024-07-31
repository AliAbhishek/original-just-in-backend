import mongoose from "mongoose";

const supportSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: String,
    //   0 -> In Processing  1 -> Resolved
    status: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Support = mongoose.model("Support", supportSchema, "supports");

export default Support;