import { Router } from 'express'
import { ReminderController } from './reminders.controller'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import zodValidationRequest from '../../middleware/validateRequest'
import { ReminderValidation } from './reminders.validation'

const router = Router()

router.post(
  '/',
  auth(USER_ROLE.user),
  zodValidationRequest(ReminderValidation.createValidationSchema),
  ReminderController.insertIntoDB,
)

router.patch(
  '/toggle/:id',
  auth(USER_ROLE.user),
  ReminderController.toggleCompleteIntoDB,
)

router.get(
  '/',
  auth(USER_ROLE.user),
  ReminderController.getAllIntoDB,
)

router.delete(
  '/:id',
  auth(USER_ROLE.user),
  ReminderController.deleteAIntoDB,
)

export const ReminderRoutes = router