import { Router } from 'express'
import { SurahController } from './surah.controller'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'

const router = Router()

// Get prayer times based on location
router.get('/', SurahController.getSurahs)

// Get prayers by date
router.get('/:surahNumber/verses', SurahController.getSurahVerses)

export const SurahRoutes = router
