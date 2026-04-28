import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { writeFileSync } from 'fs'
import { resolve } from 'path'
import type { Plugin } from 'vite'

function manifestApiPlugin(): Plugin {
  return {
    name: 'manifest-api',
    configureServer(server) {
      server.middlewares.use('/api/manifest', (req, res, next) => {
        // Only handle POST /<campaignId>
        if (req.method !== 'POST') { next(); return }

        const campaignId = req.url?.replace(/^\//, '').split('?')[0]
        if (!campaignId) { res.statusCode = 400; res.end('Missing campaignId'); return }

        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          try {
            const assets = JSON.parse(body)
            const filePath = resolve(
              __dirname,
              'src/campaigns',
              campaignId,
              'asset-manifest.json',
            )
            writeFileSync(filePath, JSON.stringify(assets, null, 2) + '\n', 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch (e) {
            res.statusCode = 500
            res.end(String(e))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), manifestApiPlugin()],
})
