import express from 'express'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import { MoodLogsControllers } from './moodLogs.controller'
import zodValidationRequest from '../../middleware/validateRequest'
import { MoodLogsValidation } from './moodLogs.validation'

const router = express.Router()

// Log mood (Authenticated users) - Creates new or updates existing for the day
router.post(
  '/',
  auth(USER_ROLE.user, USER_ROLE.admin),
  zodValidationRequest(MoodLogsValidation.createValidationSchema),
  MoodLogsControllers.insertIntoDB
)

// Get all user mood logs (Authenticated users)
router.get(
  '/',
  auth(USER_ROLE.user, USER_ROLE.admin),
  MoodLogsControllers.getAllMoodLogs
)

export const MoodLogsRoutes = router