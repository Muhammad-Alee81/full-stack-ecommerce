import { redis } from "../../config/redis.connection.js";
import { User } from "../../models/user.model.js";
import ApiError from "../../utils/api.error.js";
import { sendVerificationEmail } from "../../utils/email/email.utils.js";
import generateOTP from "../../utils/generate.otp.js";

export const signup_service = async (data) => {
  const { name, email, password } = data;

  const checkUser = await User.findOne({ email });

  if (checkUser) {
    throw new ApiError("User already exists with this email address", 400);
  }

  const user = await User.create({ name, email, password });

  const otp = generateOTP();

  await redis.set(`otp:${email}`, otp, "EX", 300);

  await sendVerificationEmail(email, otp);

  return { user, otp };
};

export const email_verification_service = async (data) => {
  const { otp, email } = data;

  const savedOTP = await redis.get(`otp:${email}`);

  if (!savedOTP) {
    throw new ApiError("OTP expired or not found", 400);
  }

  if (savedOTP !== String(otp)) {
    throw new ApiError("Invalid OTP", 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (user.isVerified) {
    throw new ApiError("Email already verified", 400);
  }

  user.isVerified = true;
  await user.save();

  await redis.del(`otp:${email}`);

  return {
    message: "Email verified successfully",
  };
};
