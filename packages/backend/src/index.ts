import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCors from '@fastify/cors'
import { config } from './config.js'
import { authRoutes } from './routes/auth.js'
import { gameRoutes } from './routes/game.js'
import { socialRoutes } from './routes/social.js'
import { pvpRoutes } from './routes/pvp.js'
import { runMigrations } from './db/migrate.js'

const app = Fastify({
  logger: true,
})

await app.register(fastifyCors, {
  origin: true,
  credentials: true,
})

await app.register(fastifyJwt, {
  secret: config.jwtSecret,
})

await app.register(authRoutes)
await app.register(gameRoutes)
await app.register(socialRoutes)
await app.register(pvpRoutes)

app.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
}))

const start = async () => {
  try {
    app.log.info('DBマイグレーション実行中...')
    await runMigrations()
    app.log.info('DBマイグレーション完了')

    await app.listen({ port: config.port, host: '0.0.0.0' })
    app.log.info(`サーバー起動完了: port ${config.port}`)

    // ワーカーはサーバー起動後に非同期で開始（失敗してもサーバーは継続）
    try {
      const { startWorldTickWorker, initWorldTickQueue } = await import('./queue/worldTickWorker.js')
      const { startActionWorker } = await import('./action/actionWorker.js')
      await initWorldTickQueue()
      startWorldTickWorker()
      startActionWorker()
      app.log.info('バックグラウンドワーカー起動完了')
    } catch {
      console.warn('ワーカー起動失敗（サーバーは継続）')
    }
  } catch (error) {
    console.error('起動エラー:', error)
    process.exit(1)
  }
}

start()
