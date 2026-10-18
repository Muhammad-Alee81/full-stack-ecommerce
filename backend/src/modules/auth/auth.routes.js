import express from "express";
import {
  login,
  refreshToken,
  resendOTP,
  signup,
  verifyEmail,
} from "./auth.controllers.js";
import validate from "../../middlewares/validate.middleware.js";
import {
  loginValidator,
  userSchemaValidator,
} from "../../validators/auth.validator.js";

const router = express.Router();

router.post("/verify-email", verifyEmail);
router.post("/refresh-token", refreshToken);
router.post("/resend-otp", resendOTP);

router.post("/signup", validate(userSchemaValidator), signup);
router.post("/login", validate(loginValidator), login);

export default router;
