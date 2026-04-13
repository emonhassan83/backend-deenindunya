import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import QueryBuilder from '../../builder/QueryBuilder'
import { Event } from './event.models'
import { TEvent } from './event.interface'

// Create a new Project
const insertIntoDB = async (payload: TEvent) => {
  const exist = await Event.findOne({
    title: payload.title,
  })
  if (exist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Event already exists')
  }

  const result = await Event.create(payload)
  if (!result)
    throw new AppError(httpStatus.BAD_REQUEST, 'Event creation failed')

  return result
}

// Get all assign project data
const getAllIntoDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(Event.find({ isDeleted: false }), query)
    .search(['title'])
    .filter()
    .paginate()
    .sort()
    .fields()

  const data = await qb.modelQuery
  const meta = await qb.countTotal()

  return { data, meta }
}

const updateIntoDB = async (id: string, payload: Partial<TEvent>) => {
  const exist = await Event.findById(id)
  if (!exist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found')
  }

  const result = await Event.findByIdAndUpdate(id, payload, { new: true })
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Event not found')
  return result
}

// Delete Task
const deleteAIntoDB = async (id: string) => {
  const exist = await Event.findById(id)
  if (!exist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found')
  }

  const result = await Event.findByIdAndDelete(id)
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Event not found')
  return result
}

export const EventService = {
  insertIntoDB,
  getAllIntoDB,
  updateIntoDB,
  deleteAIntoDB,
}
