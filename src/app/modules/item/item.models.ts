import { Schema, model } from "mongoose";
import { TList, TListModel } from "./item.interface";
import { List_TYPE } from "./item.constants";

const listSchema = new Schema<TList>(
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
    type: {
      type: String,
      enum: Object.values(List_TYPE),
      required: true,
    },
  },
  { timestamps: true }
);

export const List = model<TList, TListModel>("List", listSchema);
