import { Schema, model } from "mongoose";
import { TRoom, TRoomModel } from "./room.interface";

const roomSchema = new Schema<TRoom>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Room = model<TRoom, TRoomModel>("Room", roomSchema);
