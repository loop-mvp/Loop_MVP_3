import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function jsonResponseMiddleware(handlerLoader) {
  return async (req, res) => {
    try {
      const chunks = []
      for await (const chunk of req) {
        chunks.push(chunk)
      }

      const rawBody = Buffer.concat(chunks).toString('utf8')
      req.body = rawBody ? JSON.parse(rawBody) : {}

      const handlerModule = await handlerLoader()
      const handler = handlerModule?.default

      if (typeof handler !== 'function') {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Local API handler is not available' }))
        return
      }

      res.status = code => {
        res.statusCode = code
        return res
      }

      res.json = payload => {
        if (!res.headersSent) {
          res.setHeader('Content-Type', 'application/json')
        }
        res.end(JSON.stringify(payload))
        return res
      }

      await handler(req, res)
    } catch (error) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: error?.message || 'Local API middleware failed' }))
    }
  }
}

function localApiPlugin() {
  return {
    name: 'loop-local-api',
    configureServer(server) {
      server.middlewares.use('/api/website-context', jsonResponseMiddleware(() => import('./api/website-context.js')))
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [react(), localApiPlugin()],
  }
})
