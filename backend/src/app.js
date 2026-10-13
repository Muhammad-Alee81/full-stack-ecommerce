import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRouter from "./modules/auth/auth.routes.js";
import { globalErrorHandler } from "./middlewares/global.err.handler.js";
const app = express();


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(morgan("dev"));

// Routes will be registered here
app.use("/api/v1/auth", authRouter);



app.use((req, res, next) => {
       return next(
              new ApiError(`Cannot find ${req.originalUrl} on this server`, 404)
       );
});

app.use(globalErrorHandler);




export default app;
