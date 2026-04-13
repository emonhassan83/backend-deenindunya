import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import QueryBuilder from '../../builder/QueryBuilder'
import { Surah, SurahProgress, SurahVerse } from './surah.models'
import { User } from '../user/user.model'

/**
 * Get list of all Surahs with search, filter, pagination, sorting & field selection
 */
const getSurahs = async (query: Record<string, any>, userId: string) => {
  const user = await User.findById(userId);
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  try {
    const surahQuery = new QueryBuilder(Surah.find(), query)
      .search(['name']) // Search by surah name
      .filter()
      .sort()
      .paginate()
      .fields();

    const [surahs, meta, progress] = await Promise.all([
      surahQuery.modelQuery,
      surahQuery.countTotal(),
      SurahProgress.find({ userId }).lean(),
    ]);

    // progress কে surahId অনুযায়ী map করো
    const progressMap = new Map(
      progress.map((p) => [p.surahId.toString(), p])
    );

    // surah list enrich করো
    const enrichedSurahs = surahs.map((s) => {
      const prog = progressMap.get(s._id.toString());
      return {
        ...s.toObject(),
        isMemorized: prog?.isMemorized || false,
        memorizedAt: prog?.memorizedAt || null,
      };
    });

    const totalMemorized = progress.filter((p) => p.isMemorized).length;

    return {
      data: {
        totalMemorized,
        surahLists: enrichedSurahs,
      },
      meta,
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to fetch Surahs',
    );
  }
};

/**
 * Get verses of a specific Surah with pagination, sorting etc.
 */
const getSurahVerses = async (
  surahNumber: string | number, // Better to use surah number instead of _id
  query: Record<string, any>,
) => {
  try {
    // Validate surahNumber
    const surahNum = Number(surahNumber)
    if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid Surah number')
    }

    const verseQuery = new QueryBuilder(
      SurahVerse.find({ surahId: { $in: await getSurahObjectId(surahNum) } }),
      query,
    )
      .filter()
      .sort()
      .paginate()
      .fields()

    const [data, meta] = await Promise.all([
      verseQuery.modelQuery,
      verseQuery.countTotal(),
    ])

    return {
      data,
      meta,
    }
  } catch (error: any) {
    if (error instanceof AppError) throw error

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to fetch Surah verses',
    )
  }
}

/**
 * Helper function to get Surah ObjectId by number
 * (Performance improvement)
 */
const getSurahObjectId = async (surahNumber: number) => {
  const surah = await Surah.findOne({ number: surahNumber }).select('_id')
  if (!surah) {
    throw new AppError(httpStatus.NOT_FOUND, `Surah ${surahNumber} not found`)
  }
  return surah._id
}

const memorizeSurah = async (id: string, userId: string) => {
  const surah = await Surah.findById(id)
  if (!surah) {
    throw new AppError(httpStatus.NOT_FOUND, `Surah not found`)
  }

  const result = await SurahProgress.findOneAndUpdate(
    { userId, surahId: id },
    { isMemorized: true, memorizedAt: new Date() },
    { upsert: true, new: true },
  )
  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to update memorization status',
    )
  }

  return result
}

// Export Service
export const SurahService = {
  getSurahs,
  getSurahVerses,
  memorizeSurah,
}
