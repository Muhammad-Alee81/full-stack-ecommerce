import mongoose, { model, Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      unique: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

// HASH USER PASSWORD BEFORE SAVE IN THE DATABASE
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const hashPassword = await bcrypt.hash(this.password, 10);
  this.password = hashPassword;
});

export const User = model("User", userSchema);
