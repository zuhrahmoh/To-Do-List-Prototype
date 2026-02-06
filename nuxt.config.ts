// https://nuxt.com/docs/api/configuration/nuxt-config
const isProd = process.env.NODE_ENV === 'production'
const host = process.env.NUXT_HOST ?? '0.0.0.0'
const portFromEnv = Number.parseInt(process.env.PORT ?? '3002', 10)
const port = Number.isFinite(portFromEnv) ? portFromEnv : 3002
const hmrHost = host === '0.0.0.0' ? 'localhost' : host

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: !isProd },
  modules: ['@pinia/nuxt'],
  devServer: {
    host,
    port,
  },
  vite: {
    server: {
      strictPort: true,
      hmr: {
        host: hmrHost,
        port: 24679,
        clientPort: 24679,
      },
    },
  },
})
