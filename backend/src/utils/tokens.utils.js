import jwt from "jsonwebtoken";
import { createHash } from "node:crypto";
import { User } from "../models/user.model.js";

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    },
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

export const hashToken = (token) => {
  return createHash("sha256").update(token).digest("hex");
};

export const verifyRefreshToken = async (token) => {
  const decode = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

  const user = await User.findById(decode.id);

  const hashRefreshToken = createHash("sha256").update(token).digest("hex");

  return { user, hashRefreshToken };
};

export const generateAccessAndRefreshToken = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const hashedToken = hashToken(refreshToken);

  user.refreshToken = hashedToken;

  return {
    accessToken,
    refreshToken,
  };
};
