import { Router } from 'express'
import { ListController } from './item.controller'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import zodValidationRequest from '../../middleware/validateRequest'
import { ListValidation } from './item.validation'

const router = Router()

router.post(
  '/',
  auth(USER_ROLE.user),
  zodValidationRequest(ListValidation.createValidationSchema),
  ListController.insertIntoDB,
)

router.put(
  '/:id',
  auth(USER_ROLE.user),
  zodValidationRequest(ListValidation.updateValidationSchema),
  ListController.updateIntoDB,
)

router.get(
  '',
  auth(USER_ROLE.user),
  ListController.getAllIntoDB,
)

router.get(
  '/:id',
  auth(USER_ROLE.user),
  ListController.getAIntoDB,
)

router.delete(
  '/:id',
  auth(USER_ROLE.user),
  ListController.deleteAIntoDB,
)

export const ListRoutes = router
