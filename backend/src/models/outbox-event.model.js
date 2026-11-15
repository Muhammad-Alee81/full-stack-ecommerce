
import mongoose from "mongoose";

const outboxEventSchema = new mongoose.Schema(
  {
    aggregateType: {
      type: String,
      required: true,
      enum: ["User", "Order", "Product"],
    },

    aggregateId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    eventType: {
      type: String,
      required: true,
    },

    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "PROCESSED", "FAILED"],
      default: "PENDING",
    },

    attempts: {
      type: Number,
      default: 0,
    },

    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Fetch pending events efficiently
outboxEventSchema.index({ status: 1, createdAt: 1 });

export const OutboxEvent = mongoose.model(
  "OutboxEvent",
  outboxEventSchema
);
