import express from 'express'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import { AffirmationControllers } from './affirmations.controller'
import zodValidationRequest from '../../middleware/validateRequest'
import { AffirmationValidation } from './affirmations.validation'

const router = express.Router()

// Create affirmation (Admin only)
router.post(
  '/',
  auth(USER_ROLE.admin),
  zodValidationRequest(AffirmationValidation.createValidationSchema),
  AffirmationControllers.insertIntoDB,
)

// Update affirmation (Admin only)
router.put(
  '/:id',
  auth(USER_ROLE.admin),
  zodValidationRequest(AffirmationValidation.updateValidationSchema),
  AffirmationControllers.updateAffirmation,
)

// Delete affirmation (Admin only)
router.delete(
  '/:id',
  auth(USER_ROLE.admin),
  AffirmationControllers.deleteAffirmation,
)

// Get random/daily faith-inspired affirmation (Accessible for users to start each day)
router.get('/random', AffirmationControllers.getARandomAffermation)

// Get all affirmations (Admin view only)
router.get(
  '/',
  auth(USER_ROLE.admin),
  AffirmationControllers.getAllAffirmations,
)

// Get single affirmation by ID (Admin view only)
router.get(
  '/:id',
  auth(USER_ROLE.admin),
  AffirmationControllers.getSingleAffirmation,
)

export const AffirmationRoutes = router
