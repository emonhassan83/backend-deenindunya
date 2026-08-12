import express from 'express'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import { MoodsControllers } from './moods.controller'
import zodValidationRequest from '../../middleware/validateRequest'
import { MoodsValidation } from './moods.validation'

const router = express.Router()

// Log mood (Authenticated users) - Creates new or updates existing for the day
router.post(
  '/',
  auth(USER_ROLE.admin),
  zodValidationRequest(MoodsValidation.createValidationSchema),
  MoodsControllers.insertIntoDB
)

router.post(
  '/logs',
  auth(USER_ROLE.user),
  zodValidationRequest(MoodsValidation.moodLogsValidationSchema),
  MoodsControllers.insertMoodLogs
)

router.put(
  '/:id',
  auth(USER_ROLE.admin),
  zodValidationRequest(MoodsValidation.updateValidationSchema),
  MoodsControllers.updateIntoDB,
)

router.delete(
  '/logs',
  auth(USER_ROLE.admin),
  MoodsControllers.deleteAFromDB
)

// Get all user mood logs (Authenticated users)
router.get(
  '/',
  auth(USER_ROLE.user, USER_ROLE.admin),
  MoodsControllers.getAllMoods
)

router.get(
  '/logs',
  auth(USER_ROLE.user),
  MoodsControllers.getAllMoodLogs
)

export const MoodsRoutes = router