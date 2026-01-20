import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/Login.vue'
import StockNotificationSettingMgmt from '../views/StockNotificationSettingMgmt.vue'
import { useAuthStore } from '@/stores/auth'
import Home from '@/views/Home.vue'
import Logout from '@/views/Logout.vue'
import RegisterAccount from '@/views/RegisterAccount.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    
    {
      path: '/notificationMgmt',
      name: 'notificationMgmt',
      meta: {requireAuth:true},
      component: StockNotificationSettingMgmt,
    },
    {
      path: '/',
      name: 'home',
      meta: {requireAuth:true},
      component: Home,
    },
    {
      path: '/logout',
      name: 'logout',
      meta: {requireAuth:true},
      component: Logout,
    },
    {
      path: '/registerAccount',
      name: 'registerAccount',
      component: RegisterAccount,
    }
  ],
})

router.beforeEach((to, from, next)=> {
  const authStore = useAuthStore();
  console.log(authStore.isAuthenticated);
  
  if (to.meta.requireAuth && !authStore.isAuthenticated) {
    next('/login');
  }else if(to.name==="Login" && authStore.isAuthenticated){
    next('/NotificationMgmt');
  }else{
    next();
  }

})


export default router
