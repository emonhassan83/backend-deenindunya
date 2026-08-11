import { Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import { subscriptionService } from './subscription.service'
import sendResponse from '../../utils/sendResponse'

const syncRevenueCatSubscription = catchAsync(
  async (req: Request, res: Response) => {
    const result = await subscriptionService.syncRevenueCatSubscription(
      req.user._id,
      req.body,
    )

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'RevenueCat subscription synced successfully!',
      data: result,
    })
  },
)

const handleRevenueCatWebhook = catchAsync(
  async (req: Request, res: Response) => {
    const result = await subscriptionService.handleRevenueCatWebhook(req.body, {
      authorization: req.headers.authorization,
      webhookSecret: req.headers['x-revenuecat-webhook-secret'],
    })

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'RevenueCat webhook processed successfully!',
      data: result,
    })
  },
)

const getAllSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await subscriptionService.getAllSubscription(req.query)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All subscriptions fetched successfully !',
    meta: result?.meta,
    data: result?.data,
  })
})

const getMySubscription = catchAsync(async (req: Request, res: Response) => {
  req.query['user'] = req.user._id
  const result = await subscriptionService.getAllSubscription(req.query)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My subscriptions fetched successfully !',
    data: result?.data[0],
  })
})

const getSubscriptionById = catchAsync(async (req: Request, res: Response) => {
  const result = await subscriptionService.getSubscriptionById(req.params.id as string)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subscription fetched successfully !',
    data: result,
  })
})

export const subscriptionController = {
  syncRevenueCatSubscription,
  handleRevenueCatWebhook,
  getAllSubscription,
  getSubscriptionById,
  getMySubscription,
}
