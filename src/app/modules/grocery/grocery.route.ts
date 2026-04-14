import { Router } from 'express'
import { GroceryController } from './grocery.controller'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import zodValidationRequest from '../../middleware/validateRequest'
import { GroceryValidation } from './grocery.validation'

const router = Router()

router.post(
  '/',
  auth(USER_ROLE.user),
  zodValidationRequest(GroceryValidation.createValidationSchema),
  GroceryController.insertIntoDB,
)

router.patch(
  '/toggle/:id',
  auth(USER_ROLE.user),
  GroceryController.toggleComplete,
)

router.get(
  '/',
  auth(USER_ROLE.user),
  GroceryController.getAllIntoDB,
)

router.delete(
  '/:id',
  auth(USER_ROLE.user),
  GroceryController.deleteAIntoDB,
)

export const GroceryRoutes = router
