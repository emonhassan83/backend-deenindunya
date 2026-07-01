import express from 'express'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import { AmbitionControllers } from './ambitions.controller'
import zodValidationRequest from '../../middleware/validateRequest'
import { AmbitionValidation } from './ambitions.validation'

const router = express.Router()

// Create ambition (Authenticated users)
router.post(
  '/',
  auth(USER_ROLE.user, USER_ROLE.admin),
  zodValidationRequest(AmbitionValidation.createValidationSchema),
  AmbitionControllers.insertIntoDB
)

// Toggle completion status (Authenticated users)
router.patch(
  '/toggle/:id',
  auth(USER_ROLE.user, USER_ROLE.admin),
  AmbitionControllers.toggleComplete
)

// Delete ambition (Authenticated users)
router.delete(
  '/:id',
  auth(USER_ROLE.user, USER_ROLE.admin),
  AmbitionControllers.deleteAmbition
)

// Get all user ambitions (Authenticated users)
router.get(
  '/',
  auth(USER_ROLE.user),
  AmbitionControllers.getAllAmbitions
)

export const AmbitionRoutes = router