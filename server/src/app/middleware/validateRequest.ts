import { NextFunction, Request, Response } from 'express'
import { ZodTypeAny } from 'zod'
import catchAsync from '../utils/catchAsync'

const zodValidationRequest = (schema: ZodTypeAny) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // validation
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
      cookies: req.cookies,
    })
    next()
  })
}

export default zodValidationRequest