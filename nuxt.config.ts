export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: { compatibilityVersion: 4 },
  devServer: { port: 3002 },
  devtools: { enabled: true },
  modules: ['@nuxt/fonts', '@nuxtjs/color-mode', '@vueuse/nuxt', '@nuxt/eslint'],
  colorMode: {
    dataValue: 'color-mode',
    storageKey: 'showcase-color-mode',
    classSuffix: '',
  },
  app: {
    head: {
      script: [{
        key: 'color-pref-init',
        innerHTML: `(function(){try{var p=localStorage.getItem('showcase-color-mode')||'system';document.documentElement.setAttribute('data-color-pref',p)}catch(e){}})()`,
      }],
    },
  },
  css: ['~/assets/styles/main.css'],
  fonts: {
    families: [
      { name: 'Inter', provider: 'google' },
      { name: 'JetBrains Mono', provider: 'google' },
      { name: 'Montserrat', provider: 'google' },
    ],
  },
  vite: {
    optimizeDeps: {
      include: [
        'd3',
        '@vue/devtools-core',
        '@vue/devtools-kit',
        '@immx2/portfolio-nav',
      ]
    }
  }
})