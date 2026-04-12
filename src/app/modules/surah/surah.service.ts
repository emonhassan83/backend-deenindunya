import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import { Surah, SurahVerse } from './surah.models';

/**
 * Get list of all Surahs with search, filter, pagination, sorting & field selection
 */
const getSurahs = async (query: Record<string, any>) => {
  try {
    const surahQuery = new QueryBuilder(Surah.find(), query)
      .search(['name'])           // Search by surah name
      .filter()
      .sort()
      .paginate()
      .fields();

    const [data, meta] = await Promise.all([
      surahQuery.modelQuery,
      surahQuery.countTotal()
    ]);

    return {
      data,
      meta,
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to fetch Surahs'
    );
  }
};

/**
 * Get verses of a specific Surah with pagination, sorting etc.
 */
const getSurahVerses = async (
  surahNumber: string | number,   // Better to use surah number instead of _id
  query: Record<string, any>
) => {
  try {
    // Validate surahNumber
    const surahNum = Number(surahNumber);
    if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid Surah number');
    }

    const verseQuery = new QueryBuilder(
      SurahVerse.find({ surahId: { $in: await getSurahObjectId(surahNum) } }), 
      query
    )
      .filter()
      .sort()
      .paginate()
      .fields();

    const [data, meta] = await Promise.all([
      verseQuery.modelQuery,
      verseQuery.countTotal()
    ]);

    return {
      data,
      meta,
    };
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to fetch Surah verses'
    );
  }
};

/**
 * Helper function to get Surah ObjectId by number
 * (Performance improvement)
 */
const getSurahObjectId = async (surahNumber: number) => {
  const surah = await Surah.findOne({ number: surahNumber }).select('_id');
  if (!surah) {
    throw new AppError(httpStatus.NOT_FOUND, `Surah ${surahNumber} not found`);
  }
  return surah._id;
};

// Export Service
export const SurahService = {
  getSurahs,
  getSurahVerses,
};