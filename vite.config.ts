import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { cpSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const SRC = resolve(import.meta.dirname, 'data')
const DST = resolve(import.meta.dirname, 'public/data')

// Mirror data/ to public/data/ so Vite serves prices.json under the base path,
// and re-mirror on file change during dev. public/data/ is gitignored.
function syncDataPlugin(): Plugin {
  const sync = () => {
    mkdirSync(DST, { recursive: true })
    cpSync(SRC, DST, { recursive: true })
  }
  return {
    name: 'sync-data',
    buildStart() {
      sync()
    },
    configureServer(server) {
      sync()
      server.watcher.add(SRC)
      server.watcher.on('change', (path) => {
        if (path.startsWith(SRC)) sync()
      })
    },
  }
}

export default defineConfig({
  base: '/gas-tracker/',
  plugins: [react(), syncDataPlugin()],
  build: {
    outDir: 'dist',
  },
})
