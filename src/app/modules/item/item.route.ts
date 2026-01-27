import { Router } from 'express'
import { ItemController } from './item.controller'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import zodValidationRequest from '../../middleware/validateRequest'
import { ItemValidation } from './item.validation'

const router = Router()

router.post(
  '/',
  auth(USER_ROLE.user),
  zodValidationRequest(ItemValidation.createValidationSchema),
  ItemController.insertIntoDB,
)

router.patch(
  '/status/:id',
  auth(USER_ROLE.user),
  ItemController.updateIntoDB,
)

router.get(
  '/',
  auth(USER_ROLE.user),
  ItemController.getAllIntoDB,
)

router.get(
  '/:id',
  auth(USER_ROLE.user),
  ItemController.getAIntoDB,
)

router.delete(
  '/:id',
  auth(USER_ROLE.user),
  ItemController.deleteAIntoDB,
)

export const ItemRoutes = router
