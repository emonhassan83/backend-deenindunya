import { Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import { paymentsService } from './payments.service'
import sendResponse from '../../utils/sendResponse'
import httpStatus from 'http-status'

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
  const result = await paymentsService.getAPaymentsFromDB(req.params.id as string)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Payment retrieved successfully!',
    data: result,
  })
})

const getAPaymentByReferenceId = catchAsync(async (req, res) => {
  const result = await paymentsService.getAPaymentByReferenceIdFromDB(
    req.params.referenceId as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Payment retrieved successfully!',
    data: result,
  });
});

export const paymentsController = {
  dashboardData,
  getAllPayments,
  getAPayment,
  getAPaymentByReferenceId,
}
