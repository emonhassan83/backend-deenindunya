import express from 'express'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import { GratitudeLogsControllers } from './gratitudeLogs.controller'
import zodValidationRequest from '../../middleware/validateRequest'
import { GratitudeLogsValidation } from './gratitudeLogs.validation'

const router = express.Router()

// Create gratitude log (Authenticated users)
router.post(
  '/',
  auth(USER_ROLE.user, USER_ROLE.admin),
  zodValidationRequest(GratitudeLogsValidation.createValidationSchema),
  GratitudeLogsControllers.insertIntoDB
)

// Update gratitude log (Authenticated users)
router.put(
  '/:id',
  auth(USER_ROLE.user, USER_ROLE.admin),
  zodValidationRequest(GratitudeLogsValidation.updateValidationSchema),
  GratitudeLogsControllers.updateGratitudeLog
)

// Delete gratitude log (Authenticated users)
router.delete(
  '/:id',
  auth(USER_ROLE.user, USER_ROLE.admin),
  GratitudeLogsControllers.deleteGratitudeLog
)

// Get all user gratitude logs (Authenticated users)
router.get(
  '/',
  auth(USER_ROLE.user, USER_ROLE.admin),
  GratitudeLogsControllers.getAllGratitudeLogs
)

export const GratitudeLogsRoutes = router