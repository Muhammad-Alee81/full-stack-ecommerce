import { Queue } from "bullmq";
import { redis } from "../config/redis.connection.js";

export const userRegistrationQueue = new Queue("user-registration-queue", {
  connection: redis ,
});
