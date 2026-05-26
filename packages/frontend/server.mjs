/**
 * 本番用静的ファイルサーバー
 * distディレクトリを配信し、/apiをバックエンドにプロキシする
 */
import { createServer } from 'http'
import { readFileSync, existsSync } from 'fs'
import { join, extname, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST_DIR = join(__dirname, 'dist')
const PORT = parseInt(process.env.PORT || '3000')
const BACKEND_URL = 'https://backend-production-ecce.up.railway.app'

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

const server = createServer(async (req, res) => {
  const url = req.url || '/'

  // /api/* はバックエンドにプロキシ
  if (url.startsWith('/api/')) {
    const targetUrl = `${BACKEND_URL}${url}`
    try {
      const chunks = []
      req.on('data', chunk => chunks.push(chunk))
      await new Promise(resolve => req.on('end', resolve))
      const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined

      const headers = { ...req.headers }
      delete headers['host']
      delete headers['connection']

      const response = await fetch(targetUrl, {
        method: req.method,
        headers: {
          ...headers,
          'host': 'backend-production-ecce.up.railway.app',
        },
        body: body && body.length > 0 ? body : undefined,
      })

      res.writeHead(response.status, Object.fromEntries(response.headers))
      const buffer = await response.arrayBuffer()
      res.end(Buffer.from(buffer))
    } catch (err) {
      console.error('Proxy error:', err)
      res.writeHead(502)
      res.end('Bad Gateway')
    }
    return
  }

  // 静的ファイルを配信
  let filePath = join(DIST_DIR, url === '/' ? 'index.html' : url)

  // ファイルが存在しない場合はindex.htmlを返す（SPA）
  if (!existsSync(filePath)) {
    filePath = join(DIST_DIR, 'index.html')
  }

  try {
    const content = readFileSync(filePath)
    const ext = extname(filePath)
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(content)
  } catch {
    res.writeHead(404)
    res.end('Not Found')
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`フロントエンドサーバー起動: port ${PORT}`)
})
