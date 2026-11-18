import { Router } from 'express'
import { SunnahController } from './sunnah.controller'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import zodValidationRequest from '../../middleware/validateRequest'
import { SunnahValidation } from './sunnah.validation'

const router = Router()

// Admin routes
router.post(
  '/',
  auth(USER_ROLE.admin),
  zodValidationRequest(SunnahValidation.createValidationSchema),
  SunnahController.insertIntoDB,
)

router.put(
  '/:id',
  auth(USER_ROLE.admin),
  zodValidationRequest(SunnahValidation.updateValidationSchema),
  SunnahController.updateIntoDB,
)

router.delete('/:id', auth(USER_ROLE.admin), SunnahController.deleteAIntoDB)

// Get User View Sunnahs (todaysSunnah + sunnahList with category filtering & pagination)
router.get(
  '/user-view',
  auth(USER_ROLE.admin, USER_ROLE.user),
  SunnahController.getUserViewSunnahs,
)

// Get all Sunnahs (Admin view only - excludes isMemorized & updatedAt)
router.get(
  '/',
  auth(USER_ROLE.admin),
  SunnahController.getAllIntoDB,
)

// Get single Sunnah by ID
router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.user),
  SunnahController.getASunnah,
)

// User Toggle Memorized status
router.patch(
  '/memorize/:id',
  auth(USER_ROLE.user),
  SunnahController.toggleAsMemorized,
)

export const SunnahRoutes = router
