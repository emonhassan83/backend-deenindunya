import { Router } from 'express'
import { SurahController } from './surah.controller'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'

const router = Router()

// memorize a Surah
router.patch(
  '/memorize/:id',
  auth(USER_ROLE.user),
  SurahController.memorizeSurah,
)

// Get list of all Surahs
router.get('/', auth(USER_ROLE.user), SurahController.getSurahs)

// Get verses of a specific Surah by surah number (1-114)
router.get(
  '/:surahNumber/verses',
  auth(USER_ROLE.user),
  SurahController.getSurahVerses,
)

export const SurahRoutes = router
