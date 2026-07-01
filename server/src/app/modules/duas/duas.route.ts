import express from 'express'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import { DuasControllers } from './duas.controller'
import zodValidationRequest from '../../middleware/validateRequest'
import { DuasValidation } from './duas.validation'

const router = express.Router()

// Create dua (Admin only)
router.post(
  '/',
  auth(USER_ROLE.admin),
  zodValidationRequest(DuasValidation.createValidationSchema),
  DuasControllers.insertIntoDB
)

// Update dua (Admin only)
router.put(
  '/:id',
  auth(USER_ROLE.admin),
  zodValidationRequest(DuasValidation.updateValidationSchema),
  DuasControllers.updateDua
)

// Delete dua (Admin only)
router.delete(
  '/:id',
  auth(USER_ROLE.admin),
  DuasControllers.deleteDua
)

// Get all duas (Public - with filters)
router.get('/', DuasControllers.getAllDuas)

// Get single dua (Public)
router.get('/:id', DuasControllers.getSingleDua)

export const DuasRoutes = router