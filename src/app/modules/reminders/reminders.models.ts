import { Schema, model } from "mongoose";
import { TReminder, TReminderModel } from "./reminders.interface";

const reminderSchema = new Schema<TReminder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

export const Reminder = model<TReminder, TReminderModel>("Reminder", reminderSchema);