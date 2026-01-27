import { Router } from 'express'
import { TaskController } from './task.controller'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import zodValidationRequest from '../../middleware/validateRequest'
import { TaskValidation } from './task.validation'

const router = Router()

router.post(
  '/',
  auth(USER_ROLE.user),
  zodValidationRequest(TaskValidation.createValidationSchema),
  TaskController.insertIntoDB,
)

router.patch(
  '/status/:id',
  auth(USER_ROLE.user),
  TaskController.changedStatus,
)

router.get(
  '/',
  auth(USER_ROLE.user),
  TaskController.getAllIntoDB,
)

router.get(
  '/:id',
  auth(USER_ROLE.user),
  TaskController.getAIntoDB,
)

router.delete(
  '/:id',
  auth(USER_ROLE.user),
  TaskController.deleteAIntoDB,
)

export const TaskRoutes = router
