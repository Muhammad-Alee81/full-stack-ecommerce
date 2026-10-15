import { User } from "../../models/user.model.js";
import ApiError from "../../utils/api.error.js";
import { funEmail, sendVerificationEmail } from "../../utils/email/email.utils.js";
import generateOTP from "../../utils/generate.otp.js";

export const signup_service = async (data) => {
  const { name, email, password } = data;

  const checkUser = await User.findOne({ email });

  if (checkUser) {
    throw new ApiError("User already exists with this email address", 400);
  }

  const user = await User.create({ name, email, password });

  const otp = generateOTP();

  // await sendVerificationEmail(email, otp);
  await funEmail(email);
  

  return { user, otp };
};
