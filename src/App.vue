<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore()
</script>

<template>
  <div class="app-layout">
    <header>
      <div class="wrapper">
        <nav v-if="authStore.isAuthenticated">
          <RouterLink to="/">主頁</RouterLink>
          <RouterLink to="/notificationMgmt">通知設定</RouterLink>
          <RouterLink to="/logout">登出</RouterLink>
        </nav>
        <nav v-else>

          <RouterLink to="/login">登入</RouterLink>
          <RouterLink to="/registerAccount">註冊</RouterLink>
      </nav>
      </div>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

header {
  width: 20%;
  background-color: transparent;
  border-right: 1px solid var(--color-border);
  padding: 20px 0;
  line-height: 1.5;
}

.wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

nav {
  display: flex;
  flex-direction: column;
  width: 100%;
  font-size: 14px;
}

nav a {
  display: block;
  padding: 15px 20px;
  text-decoration: none;
  color: var(--color-text);
  border-left: 4px solid transparent;
  transition: all 0.3s;
}

nav a:hover {
  background-color: transparent;
  border-left-color: #4CAF50;
}

nav a.router-link-exact-active {
  background-color: transparent;
  border-left-color: #4CAF50;
  color: #af984c;
  font-weight: 600;
}

main {
  width: 80%;
  overflow-y: auto;
  padding: 20px;
}

@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }

  header {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }

  nav {
    flex-direction: row;
  }

  nav a {
    border-left: none;
    border-bottom: 2px solid transparent;
    flex: 1;
    text-align: center;
  }

  nav a:hover {
    border-bottom-color: #4CAF50;
    border-left: none;
  }

  nav a.router-link-exact-active {
    border-bottom-color: #4CAF50;
  }

  main {
    width: 100%;
  }
}
</style>

