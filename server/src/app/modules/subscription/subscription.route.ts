import { Router } from 'express'
import { subscriptionController } from './subscription.controller'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import zodValidationRequest from '../../middleware/validateRequest'
import { subscriptionValidation } from './subscription.validation'

const router = Router()

router.post(
  '/sync/revenuecat',
  auth(USER_ROLE.admin, USER_ROLE.user),
  zodValidationRequest(subscriptionValidation.syncRevenueCatValidationSchema),
  subscriptionController.syncRevenueCatSubscription,
)

router.post(
  '/webhook/revenuecat',
  subscriptionController.handleRevenueCatWebhook,
)

router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.user),
  subscriptionController.updateSubscription,
)

router.get(
  '/my-subscriptions',
  auth(USER_ROLE.admin, USER_ROLE.user),
  subscriptionController.getMySubscription,
)

router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE?.user),
  subscriptionController.getSubscriptionById,
)

router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE?.user),
  subscriptionController.getAllSubscription,
)

export const SubscriptionRoutes = router
