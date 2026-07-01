import { Router } from 'express'
import { EventController } from './event.controller'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import zodValidationRequest from '../../middleware/validateRequest'
import { EventValidation } from './event.validation'

const router = Router()

router.post(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.user),
  zodValidationRequest(EventValidation.createValidationSchema),
  EventController.insertIntoDB,
)

router.put(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.user),
  zodValidationRequest(EventValidation.updateValidationSchema),
  EventController.updateIntoDB,
)

router.get(
  '/has-events',
  auth(USER_ROLE.user),
  EventController.getAllEventsByMonth,
)

router.get(
  '/islamic-event',
  auth(USER_ROLE.admin),
  EventController.getIslamicEvents,
)

router.get(
  '/events-by-date',
  auth(USER_ROLE.user),
  EventController.getEventsByDate,
)

router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.admin),
  EventController.deleteAIntoDB,
)

export const EventRoutes = router
