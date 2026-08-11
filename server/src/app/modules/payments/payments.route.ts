import { Router } from 'express'
import { paymentsController } from './payments.controller'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'

const router = Router()

router.get(
  '/dashboard-data',
  auth(USER_ROLE.admin),
  paymentsController.dashboardData,
)

router.get(
  '/reference/:referenceId',
  paymentsController.getAPaymentByReferenceId,
);

router.get('/:id', auth(USER_ROLE.admin), paymentsController.getAPayment)

export const paymentsRoutes = router
