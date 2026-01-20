<script setup="ts">
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore()


authStore.logOut();

</script>
