import { useGameStore } from '~~/stores/games'

export const useGameLoop = () => {
  const store = useGameStore()
  let lastTime = 0
  let animationFrameId: number | null = null

  const loop = (currentTime: number) => {
    // 如果是第一次執行，重置時間
    if (!lastTime) lastTime = currentTime

    // 計算時間差 (Delta Time)，單位轉換成「秒」
    const dt = (currentTime - lastTime) / 1000
    lastTime = currentTime

    // 執行遊戲邏輯
    store.processTick(dt)

    // 預約下一幀
    animationFrameId = requestAnimationFrame(loop)
  }

  const startGame = () => {
    if (animationFrameId) return
    lastTime = 0
    animationFrameId = requestAnimationFrame(loop)
  }

  const stopGame = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  return {
    startGame,
    stopGame
  }
}