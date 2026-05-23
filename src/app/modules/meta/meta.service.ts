import AppError from '../../errors/AppError'
import httpStatus from 'http-status'
import { User } from '../user/user.model'
import dayjs from 'dayjs'
import axios from 'axios'
import { Reminder } from '../reminders/reminders.models'
import QueryBuilder from '../../builder/QueryBuilder'
import { USER_ROLE, USER_STATUS } from '../user/user.constant'
import { Notification } from '../notification/notification.model'
import { getEarningOverview, getUserOverview } from './meta.utils'
import Payment from '../payments/payments.models'

const userMeta = async (userId: string, query: Record<string, any>) => {
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Your profile not found')
  }

  const { latitude, longitude, timezone } = user
  const { date } = query

  if (!latitude || !longitude) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Location not set. Please update your profile with latitude and longitude.',
    )
  }

  // Date format for Aladhan API
  let targetDate: string
  if (date) {
    targetDate = dayjs(date).format('DD-MM-YYYY')
  } else {
    targetDate = dayjs().format('DD-MM-YYYY')
  }

  try {
    // Prayer Times from Aladhan API
    const response = await axios.get(
      `https://api.aladhan.com/v1/timings/${targetDate}`,
      {
        params: {
          latitude,
          longitude,
          method: 2,
          ...(timezone && { timezonestring: timezone }),
        },
      },
    )

    if (response.data.code !== 200) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to fetch prayer times from Aladhan API',
      )
    }

    const timings = response.data.data.timings
    const dateInfo = response.data.data.date

    const prayerTimes = {
      fajr: timings.Fajr,
      sunrise: timings.Sunrise,
      dhuhr: timings.Dhuhr,
      asr: timings.Asr,
      maghrib: timings.Maghrib,
      isha: timings.Isha,
      date: {
        readable: dateInfo.readable,
        gregorian: dateInfo.gregorian.date,
        hijri: dateInfo.hijri.date,
      },
    }

    // Reminders for this date
    const reminders = await Reminder.find({
      user: userId,
      logAt: targetDate,
    }).lean()

    return {
      data: {
        prayerTimes,
        reminders,
      },
    }
  } catch (error: any) {
    console.error('Prayer Times Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    })

    if (error instanceof AppError) throw error

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to fetch prayer times',
    )
  }
}

const adminMeta = async (userId: string, query: Record<string, any>) => {
  const { earning_year, user_year, ... othersQuery } = query;

  const activeUserCount = await User.countDocuments({
    isDeleted: false,
    role: { $ne: USER_ROLE.admin },
    status: USER_STATUS.active,
  });

  const recentNotifications = await Notification.find({
    receiver: userId,
  }).limit(10);

  const totalRevenue = await Payment.aggregate([
    { $match: { status: 'paid', isPaid: true } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

  const selectedEarningYear = earning_year
    ? parseInt(earning_year as string, 10) || new Date().getFullYear()
    : new Date().getFullYear();

  const selectedUserYear = user_year
    ? parseInt(user_year as string, 10) || new Date().getFullYear()
    : new Date().getFullYear();

  const earningOverview = await getEarningOverview(selectedEarningYear);
  const userOverview = await getUserOverview(selectedUserYear);

  const usersQuery = new QueryBuilder(
    User.find({ isDeleted: false, role: { $ne: USER_ROLE.admin } }).select(
      '_id id name email photoUrl address contractNumber status createdAt',
    ),
    othersQuery,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await usersQuery.modelQuery;
  const meta = await usersQuery.countTotal();

  return {
    meta,
    result: {
      totalUser: meta.total,
      activeUser: activeUserCount,
      totalRevenue: revenue,
      userList: result,
      recentNotifications,
      earningOverview,
      userOverview,   
    },
  };
};


export const MetaService = {
  userMeta,
  adminMeta,
}