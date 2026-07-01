import { Router } from 'express'
import { contentsController } from './contents.controller'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import zodValidationRequest from '../../middleware/validateRequest'
import { contentsValidation } from './contents.validation'

const router = Router()

router.put(
  '/',
  auth(USER_ROLE.admin),
  zodValidationRequest(contentsValidation.updateValidationSchema),
  contentsController.updateContents,
)

router.get('/', contentsController.getContents)

export const contentsRoutes = router
