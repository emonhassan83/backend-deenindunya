import express from 'express'
import validateRequest from '../../middleware/validateRequest'
import { AuthControllers } from './auth.controller'
import { AuthValidation } from './auth.validation'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import config from '../../config'

const router = express.Router()

const validateRefreshOrigin: express.RequestHandler = (req, res, next) => {
  const origin = req.get('origin')

  if (!origin || !config.client_origins.includes(origin)) {
    res.status(403).json({
      success: false,
      statusCode: 403,
      message: 'Origin is not allowed',
    })
    return
  }

  next()
}

router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema),
  AuthControllers.loginUser,
)

router.post(
  '/google',
  validateRequest(AuthValidation.googleZodValidationSchema),
  AuthControllers.registerWithGoogle,
)

router.post(
  '/apple',
  validateRequest(AuthValidation.appleZodValidationSchema),
  AuthControllers.registerWithApple,
)

router.post(
  '/change-password',
  auth(USER_ROLE.admin, USER_ROLE.user),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthControllers.changePassword,
)

router.post(
  '/refresh-token',
  validateRefreshOrigin,
  // validateRequest(AuthValidation.refreshTokenValidationSchema),
  AuthControllers.refreshToken,
)

router.post(
  '/forget-password',
  validateRequest(AuthValidation.forgetPasswordValidationSchema),
  AuthControllers.forgetPassword,
)

router.post(
  '/reset-password',
  validateRequest(AuthValidation.resetPasswordValidationSchema),
  AuthControllers.resetPassword,
)

export const AuthRoutes = router
