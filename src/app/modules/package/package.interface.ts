import { Model } from 'mongoose'
import { TDurationType } from './package.constant'

export type TPackage = {
  _id?: string
  title: string
  billingCycle?: TDurationType
  description: string[]
  price: number
  isDeleted: boolean
}

export type TPackageModel = Model<TPackage, Record<string, unknown>>
