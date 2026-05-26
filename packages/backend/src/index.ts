import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCors from '@fastify/cors'
import { config } from './config.js'
import { authRoutes } from './routes/auth.js'
import { gameRoutes } from './routes/game.js'
import { socialRoutes } from './routes/social.js'
import { startWorldTickWorker, initWorldTickQueue } from './queue/worldTickWorker.js'
import { startActionWorker } from './action/actionWorker.js'
import { runMigrations } from './db/migrate.js'

const app = Fastify({
  logger: { level: config.isDev ? 'info' : 'warn' },
})

await app.register(fastifyCors, {
  origin: config.isDev ? '*' : ['https://your-domain.com'],
})

await app.register(fastifyJwt, {
  secret: config.jwtSecret,
})

await app.register(authRoutes)
await app.register(gameRoutes)
await app.register(socialRoutes)

app.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
}))

const start = async () => {
  try {
    // 起動前にDBマイグレーションを実行
    app.log.info('DBマイグレーション実行中...')
    await runMigrations()
    app.log.info('DBマイグレーション完了')

    await app.listen({ port: config.port, host: '0.0.0.0' })
    app.log.info(`サーバー起動: http://0.0.0.0:${config.port}`)

    await initWorldTickQueue()
    startWorldTickWorker()
    startActionWorker()
    app.log.info('バックグラウンドワーカー起動完了')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
