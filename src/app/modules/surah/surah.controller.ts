import { Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import { SurahService } from './surah.service'
import sendResponse from '../../utils/sendResponse'

const getSurahs = catchAsync(async (req: Request, res: Response) => {
  const result = await SurahService.getSurahs(req.query, req.user._id)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Surahs retrieved successfully!',
    meta: result.meta,
    data: result.data,
  })
})

const getSurahVerses = catchAsync(async (req: Request, res: Response) => {
  const result = await SurahService.getSurahVerses(
    req.params.surahNumber as string,
    req.query,
  )

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Surah verses fetched successfully',
    meta: result.meta,
    data: result.data,
  })
})

const memorizeSurah = catchAsync(async (req: Request, res: Response) => {
  const result = await SurahService.memorizeSurah(
    req.params.id as string,
    req.user._id,
  )

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Surah memorized successfully',
    data: result,
  })
})

export const SurahController = {
  getSurahs,
  getSurahVerses,
  memorizeSurah,
}
