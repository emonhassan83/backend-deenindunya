import { Router } from 'express'
import { paymentsController } from './payments.controller'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'

const router = Router()

router.post('/checkout', auth(USER_ROLE.user), paymentsController.checkout)

router.get('/confirm-payment', paymentsController.confirmPayment)

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

router.patch('/refound-payment', paymentsController.refundPayment)

export const paymentsRoutes = router
