import { Schema, model } from 'mongoose'
import { TCategory, TCategoryModel } from './category.interface'
import { categoryType } from './category.constant';

const categorySchema = new Schema<TCategory>(
  {
    title: {
      type: String,
      required: [true, 'Category title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(categoryType),
      required: [true, 'Category type is required']
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  }
);

categorySchema.index({ title: 'text' });

export const Category = model<TCategory, TCategoryModel>(
  'Category',
  categorySchema,
)
