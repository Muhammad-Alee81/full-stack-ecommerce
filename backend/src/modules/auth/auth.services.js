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

export const signup_service = async (data, purpose) => {
  const { name, email, password } = data;

  const checkUser = await User.findOne({ email });

  if (checkUser) {
    throw new ApiError("User already exists with this email address", 400);
  }

  const user = await User.create({ name, email, password });

  const otp = generateOTP();

  const result = await redis.set(
    `${purpose}_otp:${email}`,
    otp,
    "EX",
    300,
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
    await redis.del(`${purpose}_otp:${email}`);

    throw new ApiError(
      "Unable to send verification email. Please try again.",
      500,
    );
  }

  return { email: user.email };
};

export const email_verification_service = async (data, purpose) => {
  const { otp, email } = data;

  const savedOTP = await redis.get(`${purpose}_otp:${email}`);

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
  await redis.del(`${purpose}_otp:${email}`);

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

export const resend_otp_service = async (email, purpose) => {
  

  if (!allowedPurposes.includes(purpose)) {
    throw new ApiError("Invalid OTP purpose", 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    if (purpose === "forgot_password") {
      return {
        message: "If an account exist an OTP will be sent tou your email",
      };
    }

    throw new ApiError("User not found with this email address", 404);
  }

  if (purpose === "email_verification" && user.isVerified) {
    throw new ApiError("User already verified", 400);
  }


  const key = await redis.get(`${purpose}_otp:${email}`);

  if (key) {
    throw new ApiError("Plz wait until the countdown resets", 400);
  }

  const otp = generateOTP();

  const result = await redis.set(
    `${purpose}_otp:${email}`,
    otp,
    "EX",
    300,
    "NX",
  );

  if (result !== "OK") {
    throw new ApiError("Please wait until the countdown resets", 400);
  }

  try {
    await sendVerificationEmail(email, otp);
  } catch (err) {
    await redis.del(`${purpose}_otp:${email}`);

    throw new ApiError(
      "Unable to send verification email. Please try again.",
      500,
    );
  }

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

export const forgot_password_service = async ({ email }, purpose) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const otp = generateOTP();
  await redis.set(`${purpose}_otp:${email}`, otp, "EX", 300, "NX");

  try {
    await sendVerificationEmail(email, otp);
  } catch (err) {
    await redis.del(`${purpose}_otp:${email}`);

    throw new ApiError(
      "Unable to send verification email. Please try again.",
      500,
    );
  }

  return { email: user.email };
};
