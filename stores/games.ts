import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', () => {
  // --- 狀態 (State) ---
  const gold = ref(0)
  const productionRate = ref(0) // 每秒自動產出多少錢
  const clickPower = ref(1)     // 點一下賺多少錢

  // --- 動作 (Actions) ---
  
  // 1. 手動點擊
  function clickResource() {
    gold.value += clickPower.value
  }

  // 2. 升級產能 (測試用，之後會移到獨立的升級系統)
  function upgradeProduction() {
    if (gold.value >= 10) {
      gold.value -= 10
      productionRate.value += 1
    }
  }

  // 3. 遊戲心跳 (每幀呼叫)
  // dt = delta time (距離上一幀過了幾秒)，確保在不同更新率的螢幕上速度一致
  function processTick(dt: number) {
    if (productionRate.value > 0) {
      gold.value += productionRate.value * dt
    }
  }

  return {
    gold,
    productionRate,
    clickPower,
    clickResource,
    upgradeProduction,
    processTick
  }
})