import express from "express";
import {
  refreshToken,
  resendOTP,
  signup,
  verifyEmail,
} from "./auth.controllers.js";
import validate from "../../middlewares/validate.middleware.js";
import { userSchemaValidator } from "../../validators/auth.validator.js";

const router = express.Router();

router.post("/verify-email", verifyEmail);
router.post("/refresh-token", refreshToken);
router.post("/resend-otp", resendOTP);

router.use(validate(userSchemaValidator));
router.post("/signup", signup);

export default router;
