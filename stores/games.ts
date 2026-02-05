import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', () => {
  // 取得 Supabase 客戶端與目前使用者
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  // --- 狀態 (State) ---
  const gold = ref(0)
  const productionRate = ref(0)
  const clickPower = ref(1)
  const lastSaveTime = ref(0) // 紀錄最後存檔時間

  // --- 動作 (Actions) ---
  
  // 1. 手動點擊
  function clickResource() {
    gold.value += clickPower.value
  }

  // 2. 升級產能
  function upgradeProduction() {
    if (gold.value >= 10) {
      gold.value -= 10
      productionRate.value += 1
    }
  }

  // 3. 遊戲心跳
  function processTick(dt: number) {
    if (productionRate.value > 0) {
      gold.value += productionRate.value * dt
    }
  }

  // 4. [新增] 存檔功能 (Save)
  async function saveGame() {

    if (!user.value?.id) {
      console.warn('使用者尚未登入或 ID 未就緒，跳過存檔')
      return 
    }

    const saveData = {
      gold: gold.value,
      productionRate: productionRate.value,
      clickPower: clickPower.value,
      lastSaveTime: Date.now()
    }

    const { error } = await client
      .from('profiles')
      .update({ 
        save_data: saveData,
        updated_at: new Date().toISOString() 
      })
      .eq('id', user.value.id) // 這裡現在安全了

    if (error) {
      console.error('存檔失敗:', error)
    } else {
      console.log('存檔成功！', saveData)
      lastSaveTime.value = saveData.lastSaveTime
    }
  }

  // 5. [新增] 讀檔功能 (Load)
  async function loadGame() {
    if (!user.value?.id) {
      console.warn('使用者尚未準備好，跳過讀檔')
      return 
    }// 沒登入就不讀檔

    const { data, error } = await client
      .from('profiles')
      .select('save_data')
      .eq('id', user.value.id)
      .single()

    if (error) {
      console.error('讀檔失敗:', error)
      return
    }

    if (data?.save_data) {
      const save = data.save_data as any
      
      // 恢復數值
      gold.value = save.gold || 0
      productionRate.value = save.productionRate || 0
      clickPower.value = save.clickPower || 1
      
      // [離線收益計算]
      // 如果上次有存檔時間，計算這段時間產生了多少錢
      if (save.lastSaveTime) {
        const now = Date.now()
        const offlineSeconds = (now - save.lastSaveTime) / 1000
        
        if (offlineSeconds > 0 && productionRate.value > 0) {
          const offlineGains = offlineSeconds * productionRate.value
          gold.value += offlineGains
          console.log(`你離線了 ${offlineSeconds.toFixed(1)} 秒，獲得了 ${offlineGains.toFixed(0)} 金幣！`)
        }
      }
    }
  }

  return {
    gold,
    productionRate,
    clickPower,
    clickResource,
    upgradeProduction,
    processTick,
    saveGame,  // 匯出 save
    loadGame   // 匯出 load
  }
})