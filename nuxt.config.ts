// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules:[
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@nuxtjs/google-fonts',
    'nuxt-icon'
  ],
  googleFonts: {
    // display: "swap",
    families: {
      'Raleway': true,
      'Staatliches':true
    }
  },
})
