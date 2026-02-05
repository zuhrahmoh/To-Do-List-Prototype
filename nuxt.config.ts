// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  devServer: {
    host: '127.0.0.1',
    port: 3002,
  },
  vite: {
    server: {
      strictPort: true,
      hmr: {
        host: '127.0.0.1',
        port: 24679,
        clientPort: 24679,
      },
    },
  },
})
