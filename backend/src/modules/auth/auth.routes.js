import express from "express";
import {
  login,
  logout,
  refreshToken,
  requestResetPasswordOTP,
  resendEmailVarificationOTP,
  resendPassResetOTP,
  resetPassword,
  signup,
  verifyEmail,
  verifyPasswordResetOTP,
} from "./auth.controllers.js";
import validate from "../../middlewares/validate.middleware.js";
import {
  emailValidator,
  loginValidator,
  resetPasswordValidator,
  userSchemaValidator,
} from "../../validators/auth.validator.js";
import { checkAuth } from "../../middlewares/check.auth.middleware.js";

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
  validate(emailValidator),
  requestResetPasswordOTP,
);

router.post("/password-reset/otp/verify", verifyPasswordResetOTP);
router.post("/password-reset/otp/resend", resendPassResetOTP);
router.post("/password-reset", validate(resetPasswordValidator), resetPassword);

router.post("/logout", checkAuth, logout);

export default router;
