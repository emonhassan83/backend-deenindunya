import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { Lesson, LessonLogs, Module } from './educationHub.models'
import { getCache, setCache, deleteCachePattern } from '../../redis/helpers'

/**
 * Get list of all Modules
 */
const getModules = async (userId: string) => {
  // Validate user
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }

  const cacheKey = `edu:modules:${userId}`
  const cachedData = await getCache<any>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  try {
    // Get all modules (no pagination)
    const modules = await Module.find()
      .sort({ createdAt: 1 })
      .select('name')
      .lean()

    // Get all lesson logs for this user
    const lessonLogs = await LessonLogs.find({ user: userId }).lean()

    // Map lessonLogs by lessonId for quick lookup
    const logsMap = new Map<string, string>()
    lessonLogs.forEach((log) => {
      logsMap.set(log.lesson.toString(), log.readAt as any)
    })

    // Attach readAt info to each module (based on its lessons)
    const modulesWithReadAt = await Promise.all(
      modules.map(async (mod: any) => {
        const lessons = await Lesson.find({ module: mod._id }).lean()
        let lastReadAt: string | null = null
        let totalLessons = lessons.length
        let readLessons = 0

        lessons.forEach((lesson) => {
          const readAt = logsMap.get(lesson._id.toString())
          if (readAt) {
            readLessons++
            // keep the latest readAt
            if (!lastReadAt || new Date(readAt) > new Date(lastReadAt)) {
              lastReadAt = readAt
            }
          }
        })

        return {
          ...mod,
          lastReadAt,
          totalLessons,
          readLessons,
          progress:
            totalLessons > 0
              ? Math.round((readLessons / totalLessons) * 100)
              : 0,
        }
      }),
    )

    const result = { data: modulesWithReadAt }
    await setCache(cacheKey, result)

    return result
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to fetch modules',
    )
  }
}

/**
 * Get lessons by type
 */
const getLessonsByType = async (query: Record<string, any>, userId: string) => {
  const { type } = query
  if (!type) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Lesson type is required')
  }

  const cacheKey = `edu:lessons:type:${userId}:${type}`
  const cachedData = await getCache<any>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  try {
    // Get all lessons for this module (no pagination)
    const lessons = await Lesson.find({ type })
      .select('type title')
      .sort({ createdAt: 1 })
      .lean()

    // Get all lesson logs for this user
    const lessonLogs = await LessonLogs.find({ user: userId }).lean()

    // Map logs for quick lookup
    const logsMap = new Map<string, string>()
    lessonLogs.forEach((log) => {
      logsMap.set(log.lesson.toString(), log.readAt as any)
    })

    // Attach readAt to each lesson
    const lessonsWithReadAt = lessons.map((lesson: any) => ({
      ...lesson,
      isRead: !!logsMap.get(lesson._id.toString()),
      readAt: logsMap.get(lesson._id.toString()) || null,
    }))

    await setCache(cacheKey, lessonsWithReadAt)

    return lessonsWithReadAt
  } catch (error: any) {
    if (error instanceof AppError) throw error

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to fetch module lessons',
    )
  }
}

const getModuleLessons = async (moduleId: string, userId: string) => {
  const cacheKey = `edu:lessons:module:${userId}:${moduleId}`
  const cachedData = await getCache<any>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  try {
    // Check if module exists
    const module = await Module.findById(moduleId)
    if (!module) {
      throw new AppError(httpStatus.NOT_FOUND, 'Module not found')
    }

    // Get all lessons for this module (no pagination)
    const lessons = await Lesson.find({ module: moduleId })
      .select('type title')
      .sort({ createdAt: 1 })
      .lean()

    // Get all lesson logs for this user
    const lessonLogs = await LessonLogs.find({ user: userId }).lean()

    // Map logs for quick lookup
    const logsMap = new Map<string, string>()
    lessonLogs.forEach((log) => {
      logsMap.set(log.lesson.toString(), log.readAt as any)
    })

    // Attach readAt to each lesson
    const lessonsWithReadAt = lessons.map((lesson: any) => ({
      ...lesson,
      isRead: !!logsMap.get(lesson._id.toString()),
      readAt: logsMap.get(lesson._id.toString()) || null,
    }))

    await setCache(cacheKey, lessonsWithReadAt)

    return lessonsWithReadAt
  } catch (error: any) {
    if (error instanceof AppError) throw error

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to fetch module lessons',
    )
  }
}

const readLesson = async (id: string, userId: string) => {
  const lesson = await Lesson.findById(id)
  if (!lesson) {
    throw new AppError(httpStatus.NOT_FOUND, `Lesson not found`)
  }

  const result = await LessonLogs.findOneAndUpdate(
    { user: userId, lesson: id },
    { isRead: true, readAt: new Date() },
    { upsert: true, returnDocument: 'after' },
  )
  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to update read status',
    )
  }

  // Invalidate all user's education caches
  await deleteCachePattern(`edu:*:${userId}:*`)

  return result
}

// Export Service
export const EducationHubService = {
  getModules,
  getModuleLessons,
  getLessonsByType,
  readLesson,
}
