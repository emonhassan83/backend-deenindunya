import { Schema, model } from "mongoose";
import { TGrocery, TGroceryModel } from "./grocery.interface";

const listSchema = new Schema<TGrocery>(
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
    logAt: {
      type: String,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

export const Grocery = model<TGrocery, TGroceryModel>("Grocery", listSchema);
