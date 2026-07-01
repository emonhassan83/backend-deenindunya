import { endOfYear, startOfYear } from "date-fns"
import Payment from "../payments/payments.models"
import { User } from "../user/user.model"

export const getEarningOverview = async (year: number) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const isCurrentYear = year === currentYear;

  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 11, 31));

  const monthlyRevenue = await Payment.aggregate([
    {
      $match: {
        createdAt: { $gte: yearStart, $lte: yearEnd },
        status: 'paid',
        isPaid: true,
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        amount: { $sum: '$amount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Short month names
  const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

  const filteredMonths = isCurrentYear
    ? months.slice(0, now.getMonth() + 1)
    : months;

  const barChartData = filteredMonths.map((month, index) => {
    const data = monthlyRevenue.find((m: any) => m._id === index + 1);
    return { month, amount: data ? data.amount : 0 };
  });

  return barChartData;
};

export const getUserOverview = async (year: number) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const isCurrentYear = year === currentYear;

  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 11, 31));

  const monthlyUsers = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: yearStart, $lte: yearEnd },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

  const filteredMonths = isCurrentYear
    ? months.slice(0, now.getMonth() + 1)
    : months;

  const userOverview = filteredMonths.map((month, index) => {
    const data = monthlyUsers.find((m: any) => m._id === index + 1);
    return { month, count: data ? data.count : 0 };
  });

  return userOverview;
};
