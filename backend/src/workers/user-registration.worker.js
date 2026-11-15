import { Worker } from "bullmq";
import { redis } from "../config/redis.connection.js";

const worker = new Worker(
  "user-registration-queue",
  async (job) => {
    console.log("Processing job:", job.name);
    console.log("Job data:", job.data);
  },
  {
    connection: redis,
    concurrency: 5,
  },
);
