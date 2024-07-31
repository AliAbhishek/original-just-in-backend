import { Schema, model } from "mongoose";

const adminSchema = new Schema(
  {
    admin_name: {
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
    profile_image: {
      type: String,
    },
    otp: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Admin = model("Admin", adminSchema, "Admins");
export default Admin;
