<template>
  <div class="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
    <div class="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">

      <h1 class="text-3xl font-bold text-yellow-500 mb-2 text-center">Fantasy Idle</h1>
      <p class="text-gray-400 text-center mb-8">開始你的冒險</p>

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
import { useGameStore } from '~~/stores/games'
import { useGameLoop } from '~~/composables/useGameLoop'

const store = useGameStore()
const { startGame, stopGame } = useGameLoop()

// 當元件掛載時，啟動遊戲迴圈
onMounted(() => {
  startGame()
})

// 當元件卸載時，停止迴圈 (避免記憶體洩漏)
onUnmounted(() => {
  stopGame()
})
</script>