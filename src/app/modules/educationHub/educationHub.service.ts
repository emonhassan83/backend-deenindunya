import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import QueryBuilder from '../../builder/QueryBuilder'
import { User } from '../user/user.model'
import { Lesson, LessonLogs, Module } from './educationHub.models'

/**
 * Get list of all Surahs with search, filter, pagination, sorting & field selection
 */
const getModules = async (query: Record<string, any>, userId: string) => {
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }

  try {
    const moduleQuery = new QueryBuilder(Module.find(), query)
      .search(['name'])
      .filter()
      .sort()
      .paginate()
      .fields()

    const [modules, meta, lessonLogs] = await Promise.all([
      moduleQuery.modelQuery.lean(),
      moduleQuery.countTotal(),
      LessonLogs.find({ user: userId }).lean(),
    ])

    // Map lessonLogs by lessonId for quick lookup
    const logsMap = new Map<string, string>()
    lessonLogs.forEach(log => {
      logsMap.set(log.lesson.toString(), log.readAt)
    })

    // Attach readAt info to each module (based on its lessons)
    const modulesWithReadAt = await Promise.all(
      modules.map(async (mod: any) => {
        const lessons = await Lesson.find({ module: mod._id }).lean()
        let lastReadAt: string | null = null

        lessons.forEach(lesson => {
          const readAt = logsMap.get(lesson._id.toString())
          if (readAt) {
            // keep the latest readAt
            if (!lastReadAt || new Date(readAt) > new Date(lastReadAt)) {
              lastReadAt = readAt
            }
          }
        })

        return { ...mod, lastReadAt }
      })
    )

    return { data: modulesWithReadAt, meta }
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to fetch Surahs',
    )
  }
}

/**
 * Get verses of a specific Surah with pagination, sorting etc.
 */
const getModuleLessons = async (
  moduleId: string,
  query: Record<string, any>,
  userId: string,
) => {
  try {
    const module = await Module.findById(moduleId)
    if (!module) {
      throw new AppError(httpStatus.NOT_FOUND, `Module not found`)
    }

    const verseQuery = new QueryBuilder(
      Lesson.find({ module: moduleId }),
      query,
    )
      .filter()
      .sort()
      .paginate()
      .fields()

    const [lessons, meta, lessonLogs] = await Promise.all([
      verseQuery.modelQuery.lean(),
      verseQuery.countTotal(),
      LessonLogs.find({ user: userId }).lean(),
    ])

    // Map logs for quick lookup
    const logsMap = new Map<string, string>()
    lessonLogs.forEach(log => {
      logsMap.set(log.lesson.toString(), log.readAt)
    })

    // Attach readAt to each lesson
    const lessonsWithReadAt = lessons.map((lesson: any) => ({
      ...lesson,
      readAt: logsMap.get(lesson._id.toString()) || null,
    }))

    return {
      data: lessonsWithReadAt,
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

const readLesson = async (id: string, userId: string) => {
  const lesson = await Lesson.findById(id)
  if (!lesson) {
    throw new AppError(httpStatus.NOT_FOUND, `Lesson not found`)
  }

  const result = await LessonLogs.findOneAndUpdate(
    { userId, lesson: id },
    { readAt: new Date() },
    { upsert: true, new: true },
  )
  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to update read status',
    )
  }

  return result
}

// Export Service
export const EducationHubService = {
  getModules,
  getModuleLessons,
  readLesson,
}
