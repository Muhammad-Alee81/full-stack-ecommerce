import ApiError from "../../utils/api.error.js";
import { setAuthCookies } from "../../utils/cookie.utils.js";
import { email_verification_service, signup_service } from "./auth.services.js";

export const signup = async (req, res, next) => {
  const { email } = await signup_service(req.body);

  return res.status(200).json({
    status: "success",
    message: "Verification OTP sent to your email",
    email,
  });
};

export const verifyEmail = async (req, res, next) => {
  const { accessToken, message, refreshToken } =
    await email_verification_service(req.body);

  setAuthCookies(res, accessToken, refreshToken);

  return res.status(200).json({
    status: "success",
    message,
    accessToken,
  });
};
