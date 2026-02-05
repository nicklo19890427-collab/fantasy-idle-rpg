// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
  ],
  // 新增 Supabase 的設定區塊
  supabase: {
    // 先關閉自動轉址，讓我們手動控制登入時機
    redirect: false
  }
})