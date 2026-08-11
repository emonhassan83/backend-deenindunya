import { findAdmin } from '../../utils/findAdmin'
import { messages } from '../notification/notification.constant'
import { NotificationService } from '../notification/notification.service'
import { modeType } from '../notification/notification.interface'

export const paymentNotifyToAdmin = async (
  type: 'SUCCESS' | 'REFUND',
  payment: any,
) => {
  const admin = await findAdmin()

  // Define message and description based on type
  const message =
    type === 'SUCCESS'
      ? messages.paymentManagement.paymentSuccess
      : messages.paymentManagement.paymentRefunded

  const description =
    type === 'SUCCESS'
      ? `A payment of $${payment.amount} has been successfully received. Transaction ID: ${payment.revenueCatTransactionId}.`
      : `A refund of $${payment.amount} has been successfully processed. Refund Transaction ID: ${payment.revenueCatTransactionId}.`

  // Create a notification entry
  await NotificationService.createNotificationIntoDB({
    receiver: admin?._id,
    message,
    description,
    reference: payment.subscription,
    model_type: modeType.Payment,
  })
}

export const paymentNotifyToUser = async (
  type: 'SUCCESS' | 'REFUND',
  payment: any,
) => {
  // Define message and description based on type
  const message =
    type === 'SUCCESS'
      ? messages.paymentManagement.paymentSuccess
      : messages.paymentManagement.paymentRefunded

  const description =
    type === 'SUCCESS'
      ? `Your payment of $${payment.amount} has been successfully processed. Transaction ID: ${payment.revenueCatTransactionId}.`
      : `A refund of $${payment.amount} has been issued to your account. Refund Transaction ID: ${payment.revenueCatTransactionId}.`

  // Create a notification entry
  await NotificationService.createNotificationIntoDB({
    receiver: payment?.user,
    message,
    description,
    reference: payment.subscription,
    model_type: modeType.Payment,
  })
}
