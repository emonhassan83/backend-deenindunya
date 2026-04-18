import { Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import { paymentsService } from './payments.service'
import sendResponse from '../../utils/sendResponse'
import httpStatus from 'http-status'

const checkout = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.checkout(req.body)
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'payment link get successful',
  })
})

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.confirmPayment(req?.query)
  // res.redirect(
  //   `${config.payment_success_url}?subscriptionId=${result?.subscription}`,
  // )
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'payment successful',
  })
})

const dashboardData = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.dashboardData(req?.query)
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'dashboard data successful',
    meta: result.meta,
    data: result.data,
  })
})

const getAllPayments = catchAsync(async (req, res) => {
  const result = await paymentsService.getAllPaymentsFromDB(req.query)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Payments retrieved successfully!',
    meta: result.meta,
    data: result.data,
  })
})

const getAPayment = catchAsync(async (req, res) => {
  const result = await paymentsService.getAPaymentsFromDB(req.params.id)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Payment retrieved successfully!',
    data: result,
  })
})

const getAPaymentByReferenceId = catchAsync(async (req, res) => {
  const result = await paymentsService.getAPaymentByReferenceIdFromDB(
    req.params.referenceId,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Payment retrieved successfully!',
    data: result,
  });
});

const refundPayment = catchAsync(async (req, res) => {
  const result = await paymentsService.refundPayment(req.body)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Payment refund successfully!',
    data: result,
  })
})

export const paymentsController = {
  confirmPayment,
  checkout,
  dashboardData,
  getAllPayments,
  getAPayment,
  getAPaymentByReferenceId,
  refundPayment
}
