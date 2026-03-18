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
