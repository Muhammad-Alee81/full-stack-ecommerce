import { redis } from "../../config/redis.connection.js";
import { User } from "../../models/user.model.js";
import ApiError from "../../utils/api.error.js";
import { catchAsync } from "../../utils/catch_async.utils.js";
import { sendVerificationEmail } from "../../utils/email/email.utils.js";
import generateOTP from "../../utils/generate.otp.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
} from "../../utils/tokens.utils.js";
import crypto from "node:crypto";

export const signup_service = async (data) => {
  const { name, email, password } = data;

  const checkUser = await User.findOne({ email });

  if (checkUser) {
    throw new ApiError("User already exists with this email address", 400);
  }

  const user = await User.create({ name, email, password });

  const otp = generateOTP();
  const otpTTL = 300;

  const result = await redis.set(
    `email_verification_otp:${email}`,
    otp,
    "EX",
    otpTTL,
    "NX",
  );

  if (result !== "OK") {
    throw new ApiError(
      "Unable to generate verification OTP. Please try again.",
      500,
    );
  }
  try {
    await sendVerificationEmail(email, otp);
  } catch (err) {
    await redis.del(`email_verification_otp:${email}`);

    throw new ApiError(
      "Unable to send verification email. Please try again.",
      500,
    );
  }

  return {
    email: user.email,
    expiresIn: otpTTL,
    message: "Verification OTP sent tou your email",
  };
};

export const email_verification_service = async (data) => {
  const { otp, email } = data;

  const savedOTP = await redis.get(`email_verification_otp:${email}`);

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
  await redis.del(`email_verification_otp:${email}`);

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

export const resend_email_verification_otp_service = async ({ email }) => {
  const user = await User.findOne({ email });

  if (!user) {
    return {
      message: "If the account exist the otp will be sent to your email",
    };
  }

  const key = await redis.get(`email_verification_otp:${email}`);

  if (key) {
    throw new ApiError("Plz wait until the countdown resets", 400);
  }

  const otp = generateOTP();
  const otpTTL = 300;

  const result = await redis.set(
    `email_verification_otp:${email}`,
    otp,
    "EX",
    otpTTL,
    "NX",
  );

  if (result !== "OK") {
    throw new ApiError("Please wait until the countdown resets", 400);
  }

  try {
    await sendVerificationEmail(email, otp);
  } catch (err) {
    await redis.del(`email_verification_otp:${email}`);

    throw new ApiError(
      "Unable to send verification email. Please try again.",
      500,
    );
  }

  return {
    message: "Otp sent to your Email address",
    email: user.email,
    expiresIn: otpTTL,
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

export const forgot_password_service = async ({ email }, purpose) => {
  const user = await User.findOne({ email });

  if (!user) {
    return {
      message: "If the account exist the otp will be sent to your email",
    };
  }

  const key = await redis.get(`password_reset_otp:${email}`);

  if (key) {
    throw new ApiError("Plz wait until the countdown resets", 400);
  }

  const otp = generateOTP();
  const otpTTL = 300;
  await redis.set(`password_reset_otp:${email}`, otp, "EX", otpTTL, "NX");

  try {
    await sendVerificationEmail(email, otp);
  } catch (err) {
    await redis.del(`password_reset_otp:${email}`);

    throw new ApiError(
      "Unable to send verification email. Please try again.",
      500,
    );
  }

  return {
    email: user.email,
    message: "Reset password OTP sent to your email address",
    expiresIn: otpTTL,
  };
};

export const verify_pass_reset_OTP_service = async ({ otp, email }) => {
  if (!email || !otp) {
    throw new ApiError("Plz provide information", 400);
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new ApiError("Invalid or expired OTP", 400);
  }

  const otpKey = `password_reset_otp:${email}`;

  const savedOtp = await redis.get(otpKey);
  if (!savedOtp) {
    throw new ApiError("OTP invalid or expired", 400);
  }

  if (savedOtp !== String(otp)) {
    throw new ApiError("Invalid OTP", 400);
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const resetTokenKey = `password_reset_token:${tokenHash}`;

  const result = await redis.set(resetTokenKey, user._id, "EX", 600, "NX");

  if (result !== "OK") {
    throw new ApiError(
      "Unable to generate reset token . plz try again later",
      500,
    );
  }

  await redis.del(otpKey);

  return {
    message: "otp verified successfully",
    resetToken,
  };
};

export const reset_pass_service = async ({
  resetToken,
  newPassword,
  confirmNewPassword,
}) => {
  const tokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const resetTokenKey = `password_reset_token:${tokenHash}`;
  const userId = await redis.get(resetTokenKey);

  if (!userId) {
    throw new ApiError("Token expired or invalid", 400);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  user.password = newPassword;
  await user.save();

  await redis.del(resetTokenKey);

  return {
    message: "Password changed successfully",
  };
};
 
// POST /api/v1/auth/password-reset/otp/request
// OTP verify karna	POST /api/v1/auth/password-reset/otp/verify
// OTP resend karna	POST /api/v1/auth/password-reset/otp/resend
// Naya password set karna	POST /api/v1/auth/password-reset
