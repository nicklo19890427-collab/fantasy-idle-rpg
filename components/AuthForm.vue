<template>
  <div class="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md">
    <h2 class="text-2xl font-bold text-white mb-6 text-center">
      {{ isSignUp ? '建立冒險者帳號' : '登入遊戲' }}
    </h2>

    <form @submit.prevent="handleAuth" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-1">Email</label>
        <input v-model="email" type="email" required
          class="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="hero@example.com" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-400 mb-1">密碼</label>
        <input v-model="password" type="password" required minlength="6"
          class="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="••••••" />
      </div>

      <div v-if="errorMsg" class="text-red-400 text-sm text-center bg-red-900/30 p-2 rounded">
        {{ errorMsg }}
      </div>

      <div v-if="successMsg" class="text-green-400 text-sm text-center bg-green-900/30 p-2 rounded">
        {{ successMsg }}
      </div>

      <button type="submit" :disabled="loading"
        class="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-white transition-all">
        <span v-if="loading">處理中...</span>
        <span v-else>{{ isSignUp ? '註冊帳號' : '開始冒險' }}</span>
      </button>

      <div class="text-center text-sm text-gray-400 mt-4">
        {{ isSignUp ? '已經有帳號了？' : '還沒有帳號？' }}
        <button type="button" @click="toggleMode" class="text-blue-400 hover:text-blue-300 underline ml-1">
          {{ isSignUp ? '登入' : '立即註冊' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// 預設為登入模式，點擊切換變成註冊模式
const isSignUp = ref(false)

const toggleMode = () => {
  isSignUp.value = !isSignUp.value
  errorMsg.value = ''
  successMsg.value = ''
}

const handleAuth = async () => {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    if (isSignUp.value) {
      // --- 註冊邏輯 ---
      const { error } = await client.auth.signUp({
        email: email.value,
        password: password.value,
        // 這裡可以順便把 metadata 寫進去，會被 trigger 抓去寫入 profiles 表
        options: {
          data: {
            full_name: email.value.split('@')[0] // 預設用 email 前綴當暱稱
          }
        }
      })
      if (error) throw error
      successMsg.value = '註冊成功！請去信箱收取驗證信。'
    } else {
      // --- 登入邏輯 ---
      const { error } = await client.auth.signInWithPassword({
        email: email.value,
        password: password.value
      })
      if (error) throw error
      // 登入成功後，Nuxt 的 useSupabaseUser 會自動更新，頁面會自動重整或切換
    }
  } catch (error: any) {
    errorMsg.value = error.message
  } finally {
    loading.value = false
  }
}
</script>