import catchAsync from '../../utils/catchAsync'
import httpStatus from 'http-status'
import sendResponse from '../../utils/sendResponse'
import { NotificationService } from './notification.service'

const createNotification = catchAsync(async (req, res) => {
  const result = await NotificationService.createNotificationIntoDB(req.body)

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Notification create successfully!',
    data: result,
  })
})

const getAllNotifications = catchAsync(async (req, res) => {
  req.query['receiver'] = req.user._id 
  const result = await NotificationService.getAllNotificationFromDB(req.query)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Notifications retrieved successfully!',
    meta: result.meta,
    data: result.result,
  })
})

const markAsDoneNotification = catchAsync(async (req, res) => {
  const result = await NotificationService.markAsDoneFromDB(req?.user?._id)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification marked as read successfully',
    data: result,
  })
})

const deleteANotification = catchAsync(async (req, res) => {
  const result = await NotificationService.deleteANotificationFromDB(
    req.params.id as string,
  )

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Notification delete successfully!',
    data: result,
  })
})

const deleteAllNotifications = catchAsync(async (req, res) => {
  const result = await NotificationService.deleteAllNotificationsFromDB(req.user._id )

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Notifications delete successfully!',
    data: result,
  })
})

export const NotificationControllers = {
  createNotification,
  getAllNotifications,
  markAsDoneNotification,
  deleteANotification,
  deleteAllNotifications
}
