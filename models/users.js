import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    full_name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    email_otp: {
      type: Number,
    },
    email_verified: {
      type: Number,
      default: 0,
    },
    is_active: {
      type: Number,
      default: 1,
      enum: [0, 1],
      description: " 0: Inactive; 1: Active",
    },
    profile_image: {
      type: String,
    },
 
    phone_number:{
      type: Number,
    },
    country_code:{
      type: Number,
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
    address:{
      type: String,
    },
    landmark:{
      type: String,
    },
    is_deleted: {
      type: Number,
      default: 0,
      enum: [0, 1],
      description: " 0: not Deleted; 1: Deleted",
    },
    is_profile_created:{
      type: Number,
      default: 0,
      enum: [0, 1],
      description: " 0: not Completed; 1: Completed",
    },
    is_admin_deleted: {
      type: Number,
      default: 0,
      enum: [0, 1],
      description: " 0: not Deleted; 1: Deleted",
    },
    social_id: {
      type: String,
      default: null,
    },
    social_type: {
      type: Number,
      enum: [0, 1, 2, 3],
      description: "0:facebook; 1:google; 2:apple; 3:default",
    },
    social_platform: {
      type: String,
    },
    device_token: {
      type: String,
      default: null,
    },
    device_type: {
      type: Number,
      default: 3,
      enum: [0, 1, 2, 3],
      description: "0:Web; 1:Android; 2:iOS; 3:default",
    },
    device_model: {
      type: String,
      default: null,
      enum: [null, "OS", "DEVICE"],
      description: "OS-browser name for web; DEVICE-model for mobile apps",
    },
    login_type: {
      type: Number,
      default: 0,
      enum: [0, 1, 2, 3],
      description: " 0: general 1: apple 2: google 3: facebook",
    },
    push_notification: {
      type: Number,
      default: 1,
      enum: [0, 1],
      description: " 0: not Allowed 1: Allowed",
    },
  },
  { timestamps: true }
);
userSchema.index({ location: "2dsphere" });
const User = model("User", userSchema, "Users");
export default User;
