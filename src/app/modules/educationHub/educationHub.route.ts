import { Router } from 'express'
import { EducationHubController } from './educationHub.controller'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'

const router = Router()

// memorize a Surah
router.patch(
  '/read/:id',
  auth(USER_ROLE.user),
  EducationHubController.readLesson,
)

// Get list of all modules
router.get('/modules', auth(USER_ROLE.user), EducationHubController.getModules)

router.get(
  '/lesson/:moduleId',
  auth(USER_ROLE.user),
  EducationHubController.getModuleLessons,
)

export const EducationHubRoutes = router
