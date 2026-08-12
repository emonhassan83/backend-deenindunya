import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { TMood, TMoodLogs } from './moods.interface'
import { Mood, MoodLog } from './moods.model'
import { User } from '../user/user.model'

const insertIntoDB = async (payload: TMood): Promise<TMood> => {
  const { title } = payload

  // Check if a mood with the same title already exists (case‑insensitive, not soft‑deleted)
  const existingMood = await Mood.findOne({
    title: { $regex: new RegExp(`^${title}$`, 'i') },
    isDeleted: false,
  })

  if (existingMood) {
    throw new AppError(
      httpStatus.CONFLICT,
      `Mood with title "${title}" already exists.`,
    )
  }

  return await Mood.create(payload)
}

const getAllFromDB = async () => {
  return await Mood.find({ isDeleted: false }).select('title emoji')
}

const updateIntoDB = async (id: string, payload: Partial<TMood>) => {
  const mood = await Mood.findOne({ _id: id, isDeleted: false })
  if (!mood) {
    throw new AppError(httpStatus.NOT_FOUND, 'Mood not found')
  }

  if (payload.title) {
    const existingMood = await Mood.findOne({
      _id: { $ne: id },
      title: { $regex: new RegExp(`^${payload.title}$`, 'i') },
      isDeleted: false,
    })

    if (existingMood) {
      throw new AppError(
        httpStatus.CONFLICT,
        `Mood with title "${payload.title}" already exists.`,
      )
    }
  }

  const updatedMood = await Mood.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).select('title emoji')

  if (!updatedMood) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Mood update failed')
  }

  return updatedMood
}

const deleteAFromDB = async (id: string) => {
  return await Mood.findByIdAndDelete(id)
}

const insertMoodLogs = async (
  payload: TMoodLogs,
  userId: string,
): Promise<TMoodLogs> => {
  // Validate user exists
  const userExists = await User.findById(userId);
  if (!userExists || userExists.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  // Determine log date as YYYY-MM-DD string (no time)
  const logDateStr = payload.logAt || new Date().toISOString().slice(0, 10);
  payload.logAt = logDateStr;

  // Assign user
  payload.user = userExists._id;

  // Check if a mood log already exists for this user on the exact same date
  const existingLog = await MoodLog.findOne({
    user: userExists._id,
    logAt: logDateStr
  });

  if (existingLog) {
    // Replace: update mood only, keep the same logAt
    const updated = await MoodLog.findByIdAndUpdate(
      existingLog._id,
      { mood: payload.mood },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update mood log');
    }
    return updated;
  }

  // No existing log – create new one
  const result = await MoodLog.create(payload);
  return result;
};

const getAllMoodLogs = async (userId: string) => {
  // Validate user exists
  const userExists = await User.findById(userId);
  if (!userExists || userExists.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

  // Get today's mood log (if any)
  const todayLog = await MoodLog.findOne({
    user: userId,
    logAt: today
  }).populate('mood', 'title emoji').lean();

  const todayMood = todayLog?.mood || null;
  const todayLogged = !!todayLog;

  // Get logs from last 7 days (including today)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // last 7 days inclusive of today
  const startDateStr = sevenDaysAgo.toISOString().slice(0, 10); // YYYY-MM-DD

  const lastSevenDaysLogs = await MoodLog.find({
    user: userId,
    logAt: { $gte: startDateStr, $lte: today },
  })
    .populate('mood', 'title emoji')
    .select('mood logAt')
    .sort({ logAt: 1 }) // ascending order by date
    .lean();

  return {
    todayMood,
    todayLogged,
    lastSevenDaysLogs,
  };
};

export const MoodLogsService = {
  insertIntoDB,
  updateIntoDB,
  insertMoodLogs,
  deleteAFromDB,
  getAllFromDB,
  getAllMoodLogs,
}
