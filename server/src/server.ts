import { createServer, Server } from 'http'
import app from './app'
import mongoose from 'mongoose'
import config from './app/config'
import { errorlogger, logger } from './app/utils/logger'
import initializeSocketIO from './socket'
import colors from 'colors';
import { connectRedis } from './app/config/redis.config'
import { startWorkers } from './app/worker'

const server: Server = createServer(app)
export const io = initializeSocketIO(server)

async function main() {
  try {
    await connectRedis()
    await mongoose.connect(config.database_url as string)

    logger.info('Connected to database')

    startWorkers()

    server.listen(Number(config.port), '0.0.0.0', () => {
      console.log(
        colors.italic.green.bold(
          `💫 Simple Server Listening on  http://${config?.ip}:${config.port} `,
        ),
      );
      logger.info(`app is listening on  http://${config?.ip}:${config.port}`)
    })

    console.log(
      colors.yellow.bold(
        `⚡Socket.io running on  http://${config.ip}:${config.port}`,
      ),
    );
    logger.info(`Socket is listening on http://${config.ip}:${config.port}`)

    //@ts-ignore
    global.socketio = io
  } catch (err) {
    console.log(err)
    errorlogger.error(err)
  }
}

main()

process.on('unhandledRejection', (err) => {
  console.log(`😈 unahandledRejection is detected , shutting down ...`, err)
  errorlogger.error(err)
  if (server) {
    server.close(() => {
      process.exit(1)
    })
  }
  process.exit(1)
})

process.on('uncaughtException', () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`)
  errorlogger.error('uncaughtException is detected')
  process.exit(1)
})
