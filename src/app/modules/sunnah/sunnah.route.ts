import { Router } from 'express'
import { SunnahController } from './sunnah.controller'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import zodValidationRequest from '../../middleware/validateRequest'
import { SunnahValidation } from './sunnah.validation'

const router = Router()

router.post(
  '/',
  auth(USER_ROLE.admin),
  zodValidationRequest(SunnahValidation.createValidationSchema),
  SunnahController.insertIntoDB,
)

router.put(
  '/:id',
  auth(USER_ROLE.admin),
  zodValidationRequest(SunnahValidation.updateValidationSchema),
  SunnahController.updateIntoDB,
)

router.get('/', auth(USER_ROLE.admin), SunnahController.getAllIntoDB)

router.delete('/:id', auth(USER_ROLE.user), SunnahController.deleteAIntoDB)

// User Logs
router.post('/logs/:id', auth(USER_ROLE.user), SunnahController.toggleLogs)

router.get('/user', auth(USER_ROLE.user), SunnahController.getUserSunnahs)

export const SunnahRoutes = router
