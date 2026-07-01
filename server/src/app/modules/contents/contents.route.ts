import { Router } from 'express'
import { contentsController } from './contents.controller'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import zodValidationRequest from '../../middleware/validateRequest'
import { contentsValidation } from './contents.validation'

const router = Router()

router.post(
  '/generals',
  auth(USER_ROLE.admin),
  zodValidationRequest(contentsValidation.updateGeneralsZodSchema),
  contentsController.updateGenerals,
)

router.post(
  '/:key',
  auth(USER_ROLE.admin),
  zodValidationRequest(contentsValidation.createOrUpdateContentZodSchema),
  contentsController.createOrUpdate,
)

router.get('/', contentsController.getContent)
router.get('/generals', contentsController.getContentGenerals)

export const contentsRoutes = router
