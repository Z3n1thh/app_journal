import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  let base = '/'
  if (command === 'build' && process.env.GITHUB_PAGES === 'true') base = '/app_journal/'
  else if (command === 'build') base = './'

  return {
    plugins: [react()],
    base,
  }
})
