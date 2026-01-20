<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '@/api/axios'

interface StockNotificationSetting {
  stockCode: string
  intervalMinute: number
  isEditing?: boolean
  originalData?: StockNotificationSetting
}

interface StockNotificationSettingsModel {
  stockNotificationSettings: StockNotificationSetting[]
}

const settings = ref<StockNotificationSetting[]>([])
const newSetting = ref({
  stockCode: '',
  intervalMinute: null as number | null
})
const isLoading = ref(false)
const message = ref('')
const hasLoaded = ref(false)

// 載入設定
const loadSettings = async () => {
  try {
    isLoading.value = true
    const response = await apiClient.post<StockNotificationSettingsModel>('/User/GetStockNotifications')
    settings.value = response.data.stockNotificationSettings || []
    hasLoaded.value = true
  } catch (error) {
    showMessage('載入設定失敗', 'error')
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

// 新增設定
const addSetting = () => {
  if (!newSetting.value.stockCode || !newSetting.value.intervalMinute) {
    showMessage('請填寫所有欄位', 'error')
    return
  }

  if (newSetting.value.intervalMinute < 1 || newSetting.value.intervalMinute > 180) {
    showMessage('通知間隔必須在 1 到 180 分鐘之間', 'error')
    return
  }

  const setting: StockNotificationSetting = {
    stockCode: newSetting.value.stockCode.toUpperCase(),
    intervalMinute: newSetting.value.intervalMinute
  }

  const isDuplicate = settings.value.some(
    s => s.stockCode === setting.stockCode
  )

  if (isDuplicate) {
    showMessage('此股票代號已存在', 'error')
    return
  }

  settings.value.push(setting)
  newSetting.value = { stockCode: '', intervalMinute: null }
  showMessage('設定已新增', 'success')
}

// 開始編輯
const hasChanges = (index: number): boolean => {
  const setting = settings.value[index]!
  if (!setting.isEditing || !setting.originalData) {
    return false
  }
  return setting.stockCode !== setting.originalData.stockCode || 
         setting.intervalMinute !== setting.originalData.intervalMinute
}

const startEdit = (index: number) => {
  if(settings.value[index]!==undefined){
    settings.value[index].isEditing = true
    settings.value[index].originalData = { ...settings.value[index] }
  }

}

// 取消編輯
const cancelEdit = (index: number) => {
  const setting = settings.value[index]
  if(setting!==undefined){
    if (setting.originalData) {
      settings.value[index] = { ...setting.originalData }
    }
    
    setting.isEditing = false
    setting.originalData = undefined
}
}

// 刪除設定
const deleteSetting = (index: number) => {
  if (confirm('確定要刪除此設定嗎？')) {
    settings.value.splice(index, 1)
    showMessage('設定已刪除', 'success')
  }
}

// 保存所有設定到後端
const saveAllSettings = async () => {
  try {
    isLoading.value = true

    // 驗證所有設定
    for (const setting of settings.value) {
      if (!setting.stockCode || !setting.intervalMinute) {
        showMessage('請檢查所有欄位是否已填寫', 'error')
        return
      }
      if (setting.intervalMinute < 1 || setting.intervalMinute > 180) {
        showMessage('通知間隔必須在 1 到 180 分鐘之間', 'error')
        
        return
      }
    }

    const payload: StockNotificationSettingsModel = {
      stockNotificationSettings: settings.value.map(s => ({
        stockCode: s.stockCode,
        intervalMinute: s.intervalMinute
      }))
    }

    const response = await apiClient.post('/User/SetStockNotifications', payload)
    
    if (response.status === 200) {
      showMessage('所有設定已成功保存', 'success')
      // 清除編輯狀態
      settings.value.forEach(s => {
        s.isEditing = false
        s.originalData = undefined
      })
    } else {
      showMessage('保存設定失敗', 'error')
    }
  } catch (error) {
    showMessage('保存設定時發生錯誤', 'error')
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
  loadSettings()
})
</script>

<template>
  <div class="stock-notification-container">
    <h1>股票通知設定</h1>

    <!-- 訊息提示 -->


    <!-- 新增設定區塊 -->
    <div class="add-setting-section">
      <h2>新增通知設定</h2>
      <form @submit.prevent="addSetting" class="form-group">
        <div class="form-row">
          <div class="form-field">
            <label for="stockCode">股票代號</label>
            <input
              id="stockCode"
              v-model="newSetting.stockCode"
              type="text"
              placeholder="例如: 0050"
              maxlength="10"
              required
            />
          </div>

          <div class="form-field">
            <label for="intervalMinute">通知間隔(分鐘)</label>
            <input
              id="intervalMinute"
              v-model.number="newSetting.intervalMinute"
              type="number"
              min="1"
              max="180"
              placeholder="1-180分鐘"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            新增
          </button>
        </div>
      </form>
    </div>

    <!-- 設定列表 -->
    <div class="setting-list-section">
      <h2>現有通知設定</h2>

      <div v-if="settings.length === 0" class="empty-state">
        <p>尚未設定任何通知</p>
      </div>

      <div v-else class="settings-wrapper">
        <!-- 網頁版：表格 -->
        <table class="settings-table desktop-view">
          <thead>
            <tr>
              <th>股票代號</th>
              <th>通知間隔</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(setting, index) in settings" :key="index">
              <td>
                <span v-if="!setting.isEditing">{{ setting.stockCode }}</span>
                <input
                  v-else
                  v-model="setting.stockCode"
                  type="text"
                  class="edit-input"
                  maxlength="10"
                />
              </td>
              <td>
                <span v-if="!setting.isEditing">{{ setting.intervalMinute }}分鐘</span>
                <input
                  v-else
                  v-model.number="setting.intervalMinute"
                  type="number"
                  min="1"
                  max="180"
                  class="edit-input"
                />
              </td>
              <td class="action-buttons">
                <button
                  v-if="!setting.isEditing"
                  @click="startEdit(index)"
                  class="btn btn-secondary"
                >
                  編輯
                </button>
                <button
                  v-if="setting.isEditing && hasChanges(index)"
                  @click="settings[index]!.isEditing = false"
                  class="btn btn-primary"
                >
                  保存
                </button>
                <button
                  v-if="setting.isEditing && !hasChanges(index)"
                  @click="cancelEdit(index)"
                  class="btn btn-secondary"
                >
                  取消
                </button>
                <button @click="deleteSetting(index)" class="btn btn-danger">
                  刪除
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 手機版：卡片 -->
        <div class="settings-cards mobile-view">
          <div v-for="(setting, index) in settings" :key="index" class="setting-card">
            <div class="card-field">
              <label>股票代號</label>
              <span v-if="!setting.isEditing">{{ setting.stockCode }}</span>
              <input
                v-else
                v-model="setting.stockCode"
                type="text"
                class="edit-input"
                maxlength="10"
              />
            </div>

            <div class="card-field">
              <label>通知間隔</label>
              <span v-if="!setting.isEditing">{{ setting.intervalMinute }}分鐘</span>
              <input
                v-else
                v-model.number="setting.intervalMinute"
                type="number"
                min="1"
                max="180"
                class="edit-input"
              />
            </div>

            <div class="card-actions">
              <button
                v-if="!setting.isEditing"
                @click="startEdit(index)"
                class="btn btn-secondary"
              >
                編輯
              </button>
              <button
                v-if="setting.isEditing && hasChanges(index)"
                @click="settings[index]!.isEditing = false"
                class="btn btn-primary"
              >
                編輯完成
              </button>
              <button
                v-if="setting.isEditing && !hasChanges(index)"
                @click="cancelEdit(index)"
                class="btn btn-secondary"
              >
                取消
              </button>
              <button @click="deleteSetting(index)" class="btn btn-danger">
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 保存所有設定按鈕 -->
    <div class="save-section">
      <button
        @click="saveAllSettings"
        class="btn btn-save"
        :disabled="isLoading || (settings.length === 0 && !hasLoaded)"
      >
        {{ isLoading ? '保存中...' : '保存所有設定' }}
      </button>
    </div>
    <div v-if="message" :class="['message', message.includes('失敗') || message.includes('錯誤') ? 'error' : 'success']">
      {{ message }}
    </div>
  </div>
</template>

<style scoped>
.stock-notification-container {
  max-width: 1000px;
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
  margin-top: 25px;
  margin-bottom: 15px;
  font-size: 18px;
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

/* 新增設定區塊 */
.add-setting-section {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  border: 1px solid #e0e0e0;
}

.form-group {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.form-row {
  display: flex;
  gap: 15px;
  align-items: flex-end;
  width: 100%;
  flex-wrap: wrap;
}

.form-field {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 150px;
}

.form-field label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
}

.form-field input,
.form-field select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.form-field input:focus,
.form-field select:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
}

/* 按鈕樣式 */
.btn {
  padding: 10px 16px;
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

.btn-secondary {
  background: #2196F3;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #0b7dda;
}

.btn-danger {
  background: #f44336;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #da190b;
}

.btn-save {
  background: #4CAF50;
  color: white;
  padding: 12px 32px;
  font-size: 16px;
}

.btn-save:hover:not(:disabled) {
  background: #45a049;
}

/* 設定列表 */
.setting-list-section {
  margin-bottom: 30px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.settings-wrapper {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

/* 網頁版表格 */
.settings-table {
  width: 100%;
  border-collapse: collapse;
}

.settings-table thead {
  background: #f5f5f5;
}

.settings-table th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
  font-size: 14px;
}

.settings-table td {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.settings-table tbody tr:hover {
  background: #fafafa;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons .btn {
  padding: 6px 12px;
  font-size: 12px;
}

/* 編輯輸入框 */
.edit-input,
.edit-select {
  padding: 6px 10px;
  border: 2px solid #4CAF50;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.edit-input:focus,
.edit-select:focus {
  outline: none;
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
}

/* 手機版卡片 */
.settings-cards {
  display: none;
  flex-direction: column;
  gap: 15px;
  padding: 15px;
}

.setting-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
}

.card-field {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.card-field label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
}

.card-field input,
.card-field select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.card-actions .btn {
  flex: 1;
  min-width: 80px;
}

/* 保存區塊 */
.save-section {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .stock-notification-container {
    padding: 15px;
  }

  h1 {
    font-size: 24px;
  }

  .form-row {
    flex-direction: column;
  }

  .form-field {
    width: 100%;
  }

  .btn-primary {
    width: 100%;
  }

  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: flex;
  }

  .settings-table {
    font-size: 12px;
  }

  .settings-table th,
  .settings-table td {
    padding: 10px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .btn {
    width: 100%;
  }
}
</style>

<script lang="ts">
function formatInterval(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} 分鐘`
  } else if (minutes === 60) {
    return '1 小時'
  } else {
    return `${Math.round(minutes / 60)} 小時`
  }
}
</script>