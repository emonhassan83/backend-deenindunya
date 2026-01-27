import { Schema, model } from "mongoose";
import { TItem, TItemModel } from "./item.interface";

const listSchema = new Schema<TItem>(
  {
    list: {
      type: Schema.Types.ObjectId,
      ref: "List",
      required: true,
    },
    title: {
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

export const Item = model<TItem, TItemModel>("Item", listSchema);
