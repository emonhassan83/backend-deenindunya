import express from 'express'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import { ExerciseControllers } from './exercises.controller'
import zodValidationRequest from '../../middleware/validateRequest'
import { ExerciseValidation } from './exercises.validation'

const router = express.Router()

// Create exercise (Authenticated users)
router.post(
  '/',
  auth(USER_ROLE.user, USER_ROLE.admin),
  zodValidationRequest(ExerciseValidation.createValidationSchema),
  ExerciseControllers.insertIntoDB
)

// Update exercise (Authenticated users)
router.put(
  '/:id',
  auth(USER_ROLE.user, USER_ROLE.admin),
  zodValidationRequest(ExerciseValidation.updateValidationSchema),
  ExerciseControllers.updateExercise
)

// Toggle completion status (Authenticated users)
router.patch(
  '/:id/toggle',
  auth(USER_ROLE.user, USER_ROLE.admin),
  ExerciseControllers.toggleComplete
)

// Delete exercise (Authenticated users)
router.delete(
  '/:id',
  auth(USER_ROLE.user, USER_ROLE.admin),
  ExerciseControllers.deleteExercise
)

// Get all user exercises (Authenticated users)
router.get(
  '/',
  auth(USER_ROLE.user, USER_ROLE.admin),
  ExerciseControllers.getAllExercises
)

export const ExerciseRoutes = router