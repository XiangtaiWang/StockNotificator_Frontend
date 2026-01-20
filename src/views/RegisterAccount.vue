<template>
  <div class="login-view">
    <form @submit.prevent="register">
      <div class="login-type-section">
        <label>帳號</label>
        <input v-model="account" type="text" required>
      </div>

      <div class="login-type-section">
        <label>密碼</label>
        <input v-model="password" type="password" required>
      </div>
      <button type="submit" :disabled="isLoading">登入</button>
    </form>
    <p v-if="errorMsg">{{ errorMsg }}</p>
  </div>
</template>

<script setup lang="ts">
import apiClient from '@/api/axios';
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
const router = useRouter()
const authStore = useAuthStore()
const account = ref('');
const password = ref('')
;
const errorMsg = ref('');
const isLoading = ref(false);

const register = async ()=>{
    isLoading.value = true;
    errorMsg.value = '';
  
  try {
    const response = await apiClient.post('User/RegisterAccount', {
      account: account.value,
      password: password.value
    });
    
    const isSuccessful = response.data.isSuccessful;
    if (isSuccessful) {
      authStore.logOut()  
      router.push('/login');
    }else{
      errorMsg.value = response.data.message || '註冊失敗 請嘗試其他組合或是聯絡開發者確認';
    }
  }finally {
    isLoading.value = false;
  }

}

</script>

<style scoped>
.login-view{
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  
}

.login-type-section{
  width: 80%;
}
</style>