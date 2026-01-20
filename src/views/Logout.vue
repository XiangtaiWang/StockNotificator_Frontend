<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const showConfirm = ref(true);

const confirmLogout = () => {
  authStore.logOut();
  router.push('/login');
};

const cancelLogout = () => {
  router.back();
};
</script>

<template>
  <div class="logout-container">
    <div v-if="showConfirm" class="confirmation-modal">
      <div class="modal-content">
        <h2>確認登出</h2>
        <p>您確定要登出嗎？</p>
        <div class="modal-actions">
          <button class="btn-confirm" @click="confirmLogout">確認登出</button>
          <button class="btn-cancel" @click="cancelLogout">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.logout-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: rgba(0, 0, 0, 0.5);
}

.confirmation-modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.modal-content h2 {
  margin: 0 0 1rem 0;
  color: #333;
}

.modal-content p {
  margin: 0 0 2rem 0;
  color: #666;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-confirm,
.btn-cancel {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-confirm {
  background: #dc3545;
  color: white;
}

.btn-confirm:hover {
  background: #c82333;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #5a6268;
}
</style>