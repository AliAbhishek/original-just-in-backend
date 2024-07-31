import { Schema, model } from "mongoose";

const activitySchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: String,
  },
  { timestamps: true }
);

const Activity = model("Activity", activitySchema, "Activities");

export default Activity;
