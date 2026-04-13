import { Router } from 'express'
import { UserRoutes } from '../modules/user/user.route'
import { AuthRoutes } from '../modules/auth/auth.route'
import { otpRoutes } from '../modules/otp/otp.route'
import { NotificationRoutes } from '../modules/notification/notification.route'
import { contentsRoutes } from '../modules/contents/contents.route'
import { TaskRoutes } from '../modules/task/task.route'
import { ListRoutes } from '../modules/list/list.route'
import { ItemRoutes } from '../modules/item/item.route'
import { CategoriesRoutes } from '../modules/category/category.route'
import { DuasRoutes } from '../modules/duas/duas.route'
import { AffirmationRoutes } from '../modules/affirmations/affirmations.route'
import { AmbitionRoutes } from '../modules/ambitions/ambitions.route'
import { GratitudeLogsRoutes } from '../modules/gratitudeLogs/gratitudeLogs.route'
import { ExerciseRoutes } from '../modules/exercises/exercises.route'
import { WaterIntakeRoutes } from '../modules/waterIntake/waterIntake.route'
import { MoodLogsRoutes } from '../modules/moodLogs/moodLogs.route'
import { ReminderRoutes } from '../modules/reminders/reminders.route'
import { PrayerRoutes } from '../modules/prayer/prayer.route'
import { SurahRoutes } from '../modules/surah/surah.route'
import { SunnahRoutes } from '../modules/sunnah/sunnah.route'
import { EventRoutes } from '../modules/event/event.route'

const router = Router()

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/otp',
    route: otpRoutes,
  },
  {
    path: '/categories',
    route: CategoriesRoutes,
  },
  {
    path: '/reminders',
    route: ReminderRoutes,
  },
  {
    path: '/tasks',
    route: TaskRoutes,
  },
  {
    path: '/lists',
    route: ListRoutes,
  },
  {
    path: '/items',
    route: ItemRoutes,
  },
  {
    path: '/events',
    route: EventRoutes,
  },
  {
    path: '/prayers',
    route: PrayerRoutes,
  },
  {
    path: '/surahs',
    route: SurahRoutes,
  },
  {
    path: '/sunnahs',
    route: SunnahRoutes,
  },
  {
    path: '/duas',
    route: DuasRoutes,
  },
  {
    path: '/affirmations',
    route: AffirmationRoutes,
  },
  {
    path: '/ambitions',
    route: AmbitionRoutes,
  },
  {
    path: '/gratitude-logs',
    route: GratitudeLogsRoutes,
  },
  {
    path: '/exercises',
    route: ExerciseRoutes,
  },
  {
    path: '/water-intakes',
    route: WaterIntakeRoutes,
  },
  {
    path: '/mood-logs',
    route: MoodLogsRoutes,
  },
  {
    path: '/notifications',
    route: NotificationRoutes,
  },
  {
    path: '/contents',
    route: contentsRoutes,
  },
]

moduleRoutes.forEach((route) => router.use(route.path, route.route))

export default router
