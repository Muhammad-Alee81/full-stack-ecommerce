import ApiError from "../../utils/api.error.js";
import { catchAsync } from "../../utils/catch_async.utils.js";
import { setAuthCookies } from "../../utils/cookie.utils.js";
import {
  email_verification_service,
  forgot_password_service,
  login_service,
  refresh_token_service,
  resend_email_verification_otp_service,
  resend_pass_verification_otp_service,
  reset_pass_service,
  signup_service,
  verify_pass_reset_OTP_service,
} from "./auth.services.js";

export const signup = catchAsync(async (req, res, next) => {
  const { email, expiresIn, message } = await signup_service(req.body);

  return res.status(200).json({
    status: "success",
    message,
    email,
    expiresIn,
  });
});

export const verifyEmail = catchAsync(async (req, res, next) => {
  const { accessToken, message, refreshToken } =
    await email_verification_service(req.body);

  setAuthCookies(res, accessToken, refreshToken);

  return res.status(200).json({
    status: "success",
    message,
    accessToken,
  });
});

export const resendEmailVarificationOTP = catchAsync(async (req, res, next) => {
  const { message, email, expiresIn } =
    await resend_email_verification_otp_service(req.body);

  return res.status(201).json({ status: "success", message, email, expiresIn });
});

export const refreshToken = catchAsync(async (req, res, next) => {
  const incomingRefreshToken = req.cookies["refreshToken"];

  const { accessToken, refreshToken } =
    await refresh_token_service(incomingRefreshToken);

  setAuthCookies(res, accessToken, refreshToken);

  return res.status(201).json({ status: "success", accessToken });
});

export const login = catchAsync(async (req, res, next) => {
  const { accessToken, refreshToken, message, data } = await login_service(
    req.body,
  );

  setAuthCookies(res, accessToken, refreshToken);

  return res.status(200).json({ status: "success", message, data });
});

export const requestResetPasswordOTP = catchAsync(async (req, res, next) => {
  const { email, message, expiresIn } = await forgot_password_service(req.body);

  return res.status(200).json({ status: "success", message, email, expiresIn });
});

export const verifyPasswordResetOTP = catchAsync(async (req, res, next) => {
  const { message, resetToken } = await verify_pass_reset_OTP_service(req.body);

  res.cookie("resetToken", resetToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 10 * 60 * 1000,
    path: "/api/v1/auth/password-reset",
  });

  return res.status(200).json({ status: "success", message });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { newPassword, confirmNewPassword } = req.body;

  const { message } = await reset_pass_service({
    newPassword,
    confirmNewPassword,
    resetToken: req.cookies["resetToken"],
  });

  res.clearCookie("resetToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 10 * 60 * 1000,
    path: "/api/v1/auth/password-reset",
  });

  return res.status(200).json({
    status: "success",
    message,
  });
});

export const resendPassResetOTP = catchAsync(async (req, res, next) => {
  const { email, message, expiresIn } =
    await resend_pass_verification_otp_service(req.body);

  return res.status(200).json({ status: "success", message, email, expiresIn });
});

// SELECT
// WHERE
// ORDER BY
// OPERATORS
