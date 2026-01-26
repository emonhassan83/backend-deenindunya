import { Router } from 'express'
import { RoomController } from './room.controller'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import zodValidationRequest from '../../middleware/validateRequest'
import { RoomValidation } from './room.validation'

const router = Router()

router.post(
  '/',
  auth(USER_ROLE.user),
  zodValidationRequest(RoomValidation.createValidationSchema),
  RoomController.insertIntoDB,
)

router.put(
  '/:id',
  auth(USER_ROLE.user),
  zodValidationRequest(RoomValidation.updateValidationSchema),
  RoomController.updateIntoDB,
)

router.get(
  '',
  auth(USER_ROLE.user),
  RoomController.getAllIntoDB,
)

router.get(
  '/:id',
  auth(USER_ROLE.user),
  RoomController.getAIntoDB,
)

router.delete(
  '/:id',
  auth(USER_ROLE.user),
  RoomController.deleteAIntoDB,
)

export const RoomRoutes = router
