import express from 'express'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import { WaterIntakeControllers } from './waterIntake.controller'
import zodValidationRequest from '../../middleware/validateRequest'
import { WaterIntakeValidation } from './waterIntake.validation'

const router = express.Router()

// Log water intake (Authenticated users)
router.post(
  '/',
  auth(USER_ROLE.user, USER_ROLE.admin),
  zodValidationRequest(WaterIntakeValidation.createValidationSchema),
  WaterIntakeControllers.insertIntoDB
)

// Set daily water target (Authenticated users)
router.patch(
  '/daily-target',
  auth(USER_ROLE.user, USER_ROLE.admin),
  zodValidationRequest(WaterIntakeValidation.setDailyTargetValidationSchema),
  WaterIntakeControllers.setDailyTarget
)

// Get all user water intake records (Authenticated users)
router.get(
  '/',
  auth(USER_ROLE.user, USER_ROLE.admin),
  WaterIntakeControllers.getAllWaterIntakes
)

export const WaterIntakeRoutes = router
