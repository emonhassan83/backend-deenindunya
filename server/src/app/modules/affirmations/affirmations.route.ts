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
  AffirmationControllers.insertIntoDB
)

// Update affirmation (Admin only)
router.put(
  '/:id',
  auth(USER_ROLE.admin),
  zodValidationRequest(AffirmationValidation.updateValidationSchema),
  AffirmationControllers.updateAffirmation
)

// Delete affirmation (Admin only)
router.delete(
  '/:id',
  auth(USER_ROLE.admin),
  AffirmationControllers.deleteAffirmation
)

// Get all affirmations (Public)
router.get('/', AffirmationControllers.getAllAffirmations)

// Get random affirmation (Public)
router.get('/random', AffirmationControllers.getARandomAffermation)

// Get single affirmation (Public)
router.get('/:id', AffirmationControllers.getSingleAffirmation)

export const AffirmationRoutes = router
