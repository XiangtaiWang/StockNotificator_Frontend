

<template>
  <div class="login-view">
    <h1 class="login-type-section">先登入！！！</h1>
    <form @submit.prevent="handleLogin">
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/api/axios';

const router = useRouter();
const authStore = useAuthStore();

const account = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMsg = ref('');

const handleLogin = async () => {
  isLoading.value = true;
  errorMsg.value = '';
  
  try {
    const response = await apiClient.post('User/login', {
      account: account.value,
      password: password.value
    });
    
    const isSuccessful = response.data.isSuccessful;
    if (isSuccessful) {
      const token = response.data.token;
      authStore.setToken(token);
      router.push('/');
    }else{
      errorMsg.value = response.data.message || '登入失敗，請檢查帳密';
    }
  }finally {
    isLoading.value = false;
  }


};
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