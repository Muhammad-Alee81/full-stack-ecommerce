import ApiError from "../../utils/api.error.js";
import { catchAsync } from "../../utils/catch_async.utils.js";
import { setAuthCookies } from "../../utils/cookie.utils.js";
import { verifyRefreshToken } from "../../utils/tokens.utils.js";
import {
  email_verification_service,
  forgot_password_service,
  login_service,
  refresh_token_service,
  resend_otp_service,
  signup_service,
} from "./auth.services.js";

export const signup = catchAsync(async (req, res, next) => {
  const { email } = await signup_service(req.body, "email_verification");

  return res.status(200).json({
    status: "success",
    message: "Verification OTP sent to your email",
    email,
  });
});

export const verifyEmail = catchAsync(async (req, res, next) => {
  const { accessToken, message, refreshToken } =
    await email_verification_service(req.body, "email_verification");

  setAuthCookies(res, accessToken, refreshToken);

  return res.status(200).json({
    status: "success",
    message,
    accessToken,
  });
});

export const refreshToken = catchAsync(async (req, res, next) => {
  const incomingRefreshToken = req.cookies["refreshToken"];

  const { accessToken, refreshToken } =
    await refresh_token_service(incomingRefreshToken);

  setAuthCookies(res, accessToken, refreshToken);

  return res.status(201).json({ status: "success", accessToken });
});

export const resendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const { message } = await resend_otp_service(email, "email_verification");

  return res.status(201).json({ status: "success", message });
});

export const login = catchAsync(async (req, res, next) => {
  const { accessToken, refreshToken, message, data } = await login_service(
    req.body,
  );

  setAuthCookies(res, accessToken, refreshToken);

  return res.status(200).json({ status: "success", message, data });
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = await forgot_password_service(req.body, "forgot_password");

  return res
    .status(200)
    .json(
      { status: "success", message: "OTP sent to your email address" },
      email,
    );
});
