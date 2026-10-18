import { redis } from "../../config/redis.connection.js";
import { User } from "../../models/user.model.js";
import ApiError from "../../utils/api.error.js";
import { sendVerificationEmail } from "../../utils/email/email.utils.js";
import generateOTP from "../../utils/generate.otp.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
} from "../../utils/tokens.utils.js";

export const signup_service = async (data) => {
  const { name, email, password } = data;

  const checkUser = await User.findOne({ email });

  if (checkUser) {
    throw new ApiError("User already exists with this email address", 400);
  }

  const user = await User.create({ name, email, password });

  const otp = generateOTP();

  await redis.set(`otp:${email}`, otp, "EX", 300, "NX");

  await sendVerificationEmail(email, otp);

  return { email: user.email };
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

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const hashedRefreshToken = hashToken(refreshToken);

  user.refreshToken = hashedRefreshToken;
  user.isVerified = true;
  await user.save();
  await redis.del(`otp:${email}`);

  return {
    message: "Email verified successfully",
    accessToken,
    refreshToken,
  };
};

export const refresh_token_service = async (token) => {
  const { user, hashRefreshToken } = await verifyRefreshToken(token);

  if (user.refreshToken !== hashRefreshToken) {
    return next(new ApiError("Invalid or expired refresh token", 401));
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const hashedRefreshToken = hashToken(refreshToken);
  user.refreshToken = hashedRefreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
  };
};

export const resend_otp_service = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError("User not found with this email address", 404);
  }

  if (user.isVerified) {
    throw new ApiError("user already verified", 400);
  }

  const key = await redis.get(`otp:${email}`);

  if (key) {
    throw new ApiError("Plz wait until the countdown resets", 400);
  }

  const otp = generateOTP();

  const result = await redis.set(`otp:${email}`, otp, "EX", 300, "NX");

  if (result !== "OK") {
    throw new ApiError("Please wait until the countdown resets", 400);
  }

  await sendVerificationEmail(email, otp);

  return {
    message: "Otp sent to your Email address",
  };
};

export const login_service = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError("Invalid email or password", 400);
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError("Invalid email or password", 401);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const hashedRefreshToken = hashToken(refreshToken);

  user.refreshToken = hashedRefreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    message: "LoggedIn successfully",
    data: {
      name: user.name,
      email: user.email,
    },
  };
};
