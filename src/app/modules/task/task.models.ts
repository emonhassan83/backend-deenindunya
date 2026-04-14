import { Schema, model } from "mongoose";
import { TTask, TTaskModel } from "./task.interface";
import { TASK_TYPE } from "./task.constants";

const taskSchema = new Schema<TTask>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TASK_TYPE),
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    logAt: {
      type: String,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Task = model<TTask, TTaskModel>("Task", taskSchema);
