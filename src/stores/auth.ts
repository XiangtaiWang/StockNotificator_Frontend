import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";


export const useAuthStore = defineStore("auth", () => {
    const token = ref<string | null>(localStorage.getItem("jwt_token"));
    const isAuthenticated = computed(()=> token.value !== null);

    function setToken(newToken: string){
        token.value = newToken;
        localStorage.setItem("jwt_token", newToken);
    }

    function logOut(){
        const router = useRouter()
        token.value = null;
        localStorage.removeItem("jwt_token");
        router.push('/login');
    }

    return {token, isAuthenticated, setToken, logOut}
});