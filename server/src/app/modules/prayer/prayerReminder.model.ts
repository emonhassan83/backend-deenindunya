import { Schema, model } from 'mongoose'
import {
  TPrayerReminderPref,
  TPrayerReminderSetting,
  TPrayerReminderSettingModel,
} from './prayerReminder.interface'
import { PRAYER_REMINDER_OFFSETS } from './prayer.constants'

const prayerReminderPrefSchema = new Schema<TPrayerReminderPref>(
  {
    enabled: { type: Boolean, default: true },
    offsetMinutes: {
      type: Number,
      enum: PRAYER_REMINDER_OFFSETS,
      default: 0,
    },
  },
  { _id: false },
)

const prayerReminderSettingSchema = new Schema<TPrayerReminderSetting>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    fajr: { type: prayerReminderPrefSchema, default: () => ({}) },
    dhuhr: { type: prayerReminderPrefSchema, default: () => ({}) },
    asr: { type: prayerReminderPrefSchema, default: () => ({}) },
    maghrib: { type: prayerReminderPrefSchema, default: () => ({}) },
    isha: { type: prayerReminderPrefSchema, default: () => ({}) },
  },
  { timestamps: true },
)

export const PrayerReminderSetting = model<
  TPrayerReminderSetting,
  TPrayerReminderSettingModel
>('PrayerReminderSetting', prayerReminderSettingSchema)
