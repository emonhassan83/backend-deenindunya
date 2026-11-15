import { Model, Types } from 'mongoose'
import { TPrayerName, TPrayerReminderOffset } from './prayer.constants'

export type TPrayerReminderPref = {
  enabled: boolean
  offsetMinutes: TPrayerReminderOffset
}

export type TPrayerReminderSettingsMap = Record<TPrayerName, TPrayerReminderPref>

export type TPrayerReminderSetting = {
  _id?: Types.ObjectId
  user: Types.ObjectId
  fajr: TPrayerReminderPref
  dhuhr: TPrayerReminderPref
  asr: TPrayerReminderPref
  maghrib: TPrayerReminderPref
  isha: TPrayerReminderPref
}

export type TPrayerReminderSettingModel = Model<
  TPrayerReminderSetting,
  Record<string, unknown>
>
