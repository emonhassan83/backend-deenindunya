import { Router } from 'express'
import { PrayerController } from './prayer.controller'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import zodValidationRequest from '../../middleware/validateRequest'
import { PrayerValidation } from './prayer.validation'

const router = Router()

// Create 5 prayers for a date (bulk create)
router.post(
  '/',
  auth(USER_ROLE.user),
  zodValidationRequest(PrayerValidation.createBulkValidationSchema),
  PrayerController.createBulkPrayers,
)

// Get prayer times based on location
router.get(
  '/times',
  auth(USER_ROLE.user),
  PrayerController.getPrayerTimes,
)

// Get prayers by date
router.get(
  '/',
  auth(USER_ROLE.user),
  PrayerController.getPrayersByDate,
)

// Completed payers
router.patch(
  '/completed',
  auth(USER_ROLE.user),
  PrayerController.completedPayers,
)

// Toggle prayer status
router.patch(
  '/toggle/:prayerName',
  auth(USER_ROLE.user),
  zodValidationRequest(PrayerValidation.togglePrayerStatusValidationSchema),
  PrayerController.togglePrayerStatus,
)

export const PrayerRoutes = router
