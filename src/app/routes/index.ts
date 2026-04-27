import { Router } from 'express'
import { UserRoutes } from '../modules/user/user.route'
import { AuthRoutes } from '../modules/auth/auth.route'
import { otpRoutes } from '../modules/otp/otp.route'
import { NotificationRoutes } from '../modules/notification/notification.route'
import { contentsRoutes } from '../modules/contents/contents.route'
import { TaskRoutes } from '../modules/task/task.route'
import { DuasRoutes } from '../modules/duas/duas.route'
import { AffirmationRoutes } from '../modules/affirmations/affirmations.route'
import { AmbitionRoutes } from '../modules/ambitions/ambitions.route'
import { GratitudeLogsRoutes } from '../modules/gratitudeLogs/gratitudeLogs.route'
import { ExerciseRoutes } from '../modules/exercises/exercises.route'
import { WaterIntakeRoutes } from '../modules/waterIntake/waterIntake.route'
import { ReminderRoutes } from '../modules/reminders/reminders.route'
import { PrayerRoutes } from '../modules/prayer/prayer.route'
import { SurahRoutes } from '../modules/surah/surah.route'
import { SunnahRoutes } from '../modules/sunnah/sunnah.route'
import { EventRoutes } from '../modules/event/event.route'
import { GroceryRoutes } from '../modules/grocery/grocery.route'
import { RoomRoutes } from '../modules/room/room.route'
import { MoodsRoutes } from '../modules/moods/moods.route'
import { metaRoutes } from '../modules/meta/meta.route'
import { PackageRoutes } from '../modules/package/package.route'
import { SubscriptionRoutes } from '../modules/subscription/subscription.route'
import { paymentsRoutes } from '../modules/payments/payments.route'
import { uploadRouter } from '../modules/uploads/route'
import { EducationHubRoutes } from '../modules/educationHub/educationHub.route'

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
    path: '/reminders',
    route: ReminderRoutes,
  },
  {
    path: '/tasks',
    route: TaskRoutes,
  },
  {
    path: '/events',
    route: EventRoutes,
  },
  {
    path: '/groceries',
    route: GroceryRoutes,
  },
  {
    path: '/rooms',
    route: RoomRoutes,
  },
  {
    path: '/prayers',
    route: PrayerRoutes,
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
    path: '/surahs',
    route: SurahRoutes,
  },
  {
    path: '/moods',
    route: MoodsRoutes,
  },
  {
    path: '/water-intakes',
    route: WaterIntakeRoutes,
  },
  {
    path: '/exercises',
    route: ExerciseRoutes,
  },
  {
    path: '/gratitude-logs',
    route: GratitudeLogsRoutes,
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
    path: '/education-hub',
    route: EducationHubRoutes,
  },
  {
    path: '/uploads',
    route: uploadRouter,
  },
  {
    path: '/notifications',
    route: NotificationRoutes,
  },
  {
    path: '/contents',
    route: contentsRoutes,
  },
  {
    path: '/packages',
    route: PackageRoutes,
  },
  {
    path: '/subscriptions',
    route: SubscriptionRoutes,
  },
  {
    path: '/payments',
    route: paymentsRoutes,
  },
  {
    path: '/meta',
    route: metaRoutes,
  },
]

moduleRoutes.forEach((route) => router.use(route.path, route.route))

export default router
