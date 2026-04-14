import { Model, Types } from 'mongoose'

export interface TContents {
  _id?: string
  termsAndConditions?: string
  privacyPolicy?: string
  waterIntake?: string[]
}

export type TContentsModel = Model<TContents, Record<string, unknown>>
