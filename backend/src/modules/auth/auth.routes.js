import express from "express";
import { signup } from "./auth.controllers.js";
import validate from "../../middlewares/validate.middleware.js";
import { userSchemaValidator } from "../../validators/auth.validator.js";

const router = express.Router();

router.use(validate(userSchemaValidator));

router.post("/signup", signup);

export default router;
