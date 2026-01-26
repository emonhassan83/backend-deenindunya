import { Router } from 'express'
import { UserRoutes } from '../modules/user/user.route'
import { AuthRoutes } from '../modules/auth/auth.route'
import { otpRoutes } from '../modules/otp/otp.route'
import { NotificationRoutes } from '../modules/notification/notification.route'
import { contentsRoutes } from '../modules/contents/contents.route'
import { TaskRoutes } from '../modules/task/task.route'
import { RoomRoutes } from '../modules/room/room.route'

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
    path: '/tasks',
    route: TaskRoutes,
  },
  {
    path: '/rooms',
    route: RoomRoutes,
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
