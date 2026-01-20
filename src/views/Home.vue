<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '@/api/axios'

interface Profile {
  telegramUserName: string
  telegramHasBeenSet: boolean
}

const profile = ref<Profile | null>(null)
const isLoading = ref(false)
const message = ref('')
const telegramUsername = ref('')

// 載入Telegram設定
const loadProfile = async () => {
  try {
    isLoading.value = true
    const response = await apiClient.post<Profile>('/User/GetTelegram')
    profile.value = response.data
  } catch (error) {
    showMessage('載入設定失敗', 'error')
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

// 設定Telegram
const setTelegram = async () => {
  if (!telegramUsername.value.trim()) {
    showMessage('請填寫Telegram使用者名稱', 'error')
    return
  }

  try {
    isLoading.value = true
    if (telegramUsername.value.startsWith("@")) {
        telegramUsername.value = telegramUsername.value.substring(1)
    }
    const payload = {
      telegramUsername: telegramUsername.value.trim()
    }
    await apiClient.post('/User/SetTelegram', payload)
    showMessage('已送出設定請求，請稍候檢查您的Telegram', 'success')
    telegramUsername.value = ''
    // 稍停後重新載入
    setTimeout(() => {
      loadProfile()
    }, 2000)
  } catch (error) {
    showMessage('設定失敗', 'error')
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

// 顯示訊息
const showMessage = (msg: string, type: 'success' | 'error' | 'info') => {
  message.value = msg
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <div class="home-container">
    <h1>首頁</h1>

    <!-- 訊息提示 -->
    <div v-if="message" :class="['message', message.includes('失敗') || message.includes('錯誤') ? 'error' : 'success']">
      {{ message }}
    </div>

    <!-- 加載中 -->
    <div v-if="isLoading && !profile" class="loading-state">
      <p>載入中...</p>
    </div>

    <div v-if="profile && !isLoading" class="telegram-section">
      <h2>Telegram 通知設定</h2>

      <div v-if="!profile.telegramHasBeenSet" class="setup-section">
        <div class="instruction-block">
          <h3>如何設定 Telegram 通知</h3>
          <p>請按照以下步驟完成設定：</p>
          <ol>
            <li>在 Telegram 中搜尋機器人: <code>@StockNotificator_Bot</code></li>
            <li>點開機器人並傳送訊息: <code>hi</code></li>
            <li>稍等幾秒後在下方表單中填入您的 Telegram 使用者名稱並提交</li>
            <li>機器人會傳送訊息給您</li>
          </ol>
        </div>

        <!-- 設定表單 -->
        <div class="setup-form-block">
          <h3>填寫您的 Telegram 使用者名稱</h3>
          <form @submit.prevent="setTelegram" class="form-group">
            <div class="form-field">
              <label for="telegramUsername">Telegram 使用者名稱</label>
              <input
                id="telegramUsername"
                v-model="telegramUsername"
                type="text"
                placeholder="Telegram_Username"
                :disabled="isLoading"
                required
              />
            </div>

            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              {{ isLoading ? '設定中...' : '設定 Telegram' }}
            </button>
          </form>
        </div>
      </div>

      <!-- 已設定 -->
      <div v-else class="success-section">
        <div class="success-card">
          <h3>✓ Telegram 已設定</h3>
          <p class="username">
            <strong>使用者名稱:</strong> {{ profile.telegramUserName }}
          </p>
          <p class="description">
            您已成功設定 Telegram 通知。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #333;
  margin-bottom: 30px;
  font-size: 28px;
}

h2 {
  color: #555;
  margin-bottom: 20px;
  font-size: 20px;
  border-bottom: 2px solid #4CAF50;
  padding-bottom: 10px;
}

h3 {
  color: #666;
  margin-bottom: 15px;
  font-size: 16px;
}

/* 訊息提示 */
.message {
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
  animation: slideIn 0.3s ease-out;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@keyframes slideIn {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 加載狀態 */
.loading-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

/* Telegram 設定區塊 */
.telegram-section {
  background: white;
  border-radius: 8px;
  padding: 30px;
  border: 1px solid #e0e0e0;
}

/* 未設定區塊 */
.setup-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.instruction-block {
  background: #f0f8ff;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #4CAF50;
}

.instruction-block ol {
  margin: 15px 0 0 20px;
  padding: 0;
}

.instruction-block li {
  margin: 10px 0;
  line-height: 1.6;
}

.instruction-block code {
  background: #e8f5e9;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Courier New', monospace;
  color: #2e7d32;
  font-weight: 600;
}

.setup-form-block {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-field input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s;
}

.form-field input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
}

.form-field input:disabled {
  background: #f0f0f0;
  color: #999;
  cursor: not-allowed;
}

.form-field small {
  color: #999;
  font-size: 12px;
}

/* 按鈕樣式 */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
  font-family: inherit;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #45a049;
}

/* 已設定區塊 */
.success-section {
  display: flex;
  justify-content: center;
}

.success-card {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  padding: 30px;
  border-radius: 8px;
  border: 2px solid #28a745;
  text-align: center;
  max-width: 500px;
}

.success-card h3 {
  color: #155724;
  font-size: 20px;
  margin-bottom: 20px;
}

.username {
  background: white;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
}

.description {
  color: #155724;
  line-height: 1.6;
  margin: 0;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .home-container {
    padding: 15px;
  }

  h1 {
    font-size: 24px;
  }

  h2 {
    font-size: 18px;
  }

  .telegram-section {
    padding: 20px;
  }

  .instruction-block {
    padding: 15px;
  }

  .setup-form-block {
    padding: 15px;
  }

  .success-card {
    padding: 20px;
  }
}
</style>
