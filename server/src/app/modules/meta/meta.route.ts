import express from 'express'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'
import { MetaControllers } from './meta.controller'

const router = express.Router()

router.get('/admin', auth(USER_ROLE.admin), MetaControllers.adminMeta)

router.get('/user', auth(USER_ROLE.user), MetaControllers.userMeta)

export const metaRoutes = router
