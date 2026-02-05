<template>
  <div class="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">

    <div v-if="!user" class="w-full max-w-md flex flex-col items-center">
      <h1 class="text-4xl font-bold text-yellow-500 mb-8 text-center drop-shadow-lg">
        Fantasy Idle
      </h1>
      <AuthForm />
    </div>

    <div v-else class="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700 relative">

      <button @click="logout"
        class="absolute top-4 right-4 text-xs text-gray-400 hover:text-white border border-gray-600 px-2 py-1 rounded">
        登出
      </button>

      <h1 class="text-3xl font-bold text-yellow-500 mb-2 text-center">Fantasy Idle</h1>
      <p class="text-gray-400 text-center mb-8">冒險者：{{ user.user_metadata.full_name || user.email }}</p>

      <div class="bg-gray-900 rounded-lg p-6 mb-6 text-center border border-gray-600">
        <div class="text-sm text-gray-400 mb-1">目前金幣</div>
        <div class="text-5xl font-mono text-yellow-400 font-bold mb-2">
          {{ Math.floor(store.gold) }}
        </div>
        <div class="text-sm text-green-400">
          +{{ store.productionRate }} / 秒
        </div>
      </div>

      <div class="space-y-4">
        <button @click="store.clickResource"
          class="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all rounded-lg font-bold text-lg shadow-lg">
          點擊賺錢 (+{{ store.clickPower }})
        </button>

        <button @click="store.upgradeProduction" :disabled="store.gold < 10"
          class="w-full py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-lg flex justify-between px-4 items-center">
          <span>雇用礦工 (每秒 +1)</span>
          <span class="text-yellow-400 font-mono">10 Gold</span>
        </button>
      </div>

    </div>
  </div>
</template>
<script setup lang="ts">
// 確保組件有被自動引入，或手動 import
import AuthForm from '~~/components/AuthForm.vue'

// 注意這裡的路徑：確認你的檔案是 game.ts 還是 games.ts
import { useGameStore } from '~~/stores/games'
import { useGameLoop } from '~~/composables/useGameLoop'

const store = useGameStore()
const user = useSupabaseUser()
const client = useSupabaseClient()
const { startGame, stopGame } = useGameLoop()

// 自動存檔的計時器
let autoSaveInterval: NodeJS.Timer | null = null

const logout = async () => {
  await client.auth.signOut()
  // 登出後，user 變數變為 null，watchEffect 會自動處理清理工作
}

// 【關鍵修正】改用 watchEffect 取代 onMounted
// 這樣無論是「剛重新整理」還是「剛登入成功」，都會觸發這段邏輯
watchEffect(() => {
  // 只有在「瀏覽器端」且「使用者已登入」時才執行
  if (import.meta.client && user.value) {
    console.log('偵測到使用者登入 (Client端)，開始讀檔...')

    startGame()

    store.loadGame().then(() => {
      if (!autoSaveInterval) {
        autoSaveInterval = setInterval(() => {
          store.saveGame()
        }, 30000)
      }
    })

  } else if (import.meta.client && !user.value) {
    // 只有在「瀏覽器端」且「使用者未登入」時才執行清理
    console.log('使用者未登入/已登出，重置遊戲...')

    stopGame()

    if (autoSaveInterval) {
      clearInterval(autoSaveInterval)
      autoSaveInterval = null
    }

    // 手動重置數據
    store.gold = 0
    store.productionRate = 0
  }
})
</script>