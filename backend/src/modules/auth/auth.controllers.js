import ApiError from "../../utils/api.error.js";
import { email_verification_service, signup_service } from "./auth.services.js";

export const signup = async (req, res, next) => {
  const { user, otp } = await signup_service(req.body);

  return res.status(201).json({
    status: "success",
    message: "Verification OTP sent to your email",
    email: user.email,
  });
};

export const verifyEmail = async (req, res, next) => {
  const result = await email_verification_service(req.body);

  return res.status(200).json({ status: "success", message: result.message });
};
