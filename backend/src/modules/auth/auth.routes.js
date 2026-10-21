import express from "express";
import {
  login,
  refreshToken,
  resendEmailVarificationOTP,
  resetPassword,
  signup,
  verifyEmail,
} from "./auth.controllers.js";
import validate from "../../middlewares/validate.middleware.js";
import {
  forgotPasswordValidator,
  loginValidator,
  userSchemaValidator,
} from "../../validators/auth.validator.js";

const router = express.Router();


// Login / SignUp 

router.post("/signup", validate(userSchemaValidator), signup);
router.post("/email-verification/otp/verify", verifyEmail);
router.post("/email-verification/otp/resend", resendEmailVarificationOTP);
router.post("/refresh-token", refreshToken);
router.post("/login", validate(loginValidator), login);


// Reset Password 

router.post(
  "/password-reset/otp/request",
  validate(forgotPasswordValidator),
  resetPassword,
);

export default router;
