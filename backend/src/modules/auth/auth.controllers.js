import ApiError from "../../utils/api.error.js";
import { signup_service } from "./auth.services.js";

export const signup = async (req, res, next) => {
  const { user, otp } = await signup_service(req.body);

  return res.status(201).json({
    status: "success",
    message: "Verification Otp sent tou your email address",
    otp,
  });
};
