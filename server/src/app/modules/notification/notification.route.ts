import express from 'express'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import { NotificationControllers } from './notification.controller'

const router = express.Router()

router.post(
  '/',
  auth(USER_ROLE.admin),
  NotificationControllers.createNotification,
)

router.delete(
  '/my-notifications',
  auth(USER_ROLE.admin, USER_ROLE.user),
  NotificationControllers.deleteAllNotifications,
)

router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.user),
  NotificationControllers.deleteANotification,
)

router.patch(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.user),

  NotificationControllers.markAsDoneNotification,
)

router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.user),
  NotificationControllers.getAllNotifications,
)

export const NotificationRoutes = router
