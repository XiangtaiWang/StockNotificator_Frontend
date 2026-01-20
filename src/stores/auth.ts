import { defineStore } from "pinia";
import { computed, ref } from "vue";


export const useAuthStore = defineStore("auth", () => {
    const token = ref<string | null>(localStorage.getItem("jwt_token"));
    const isAuthenticated = computed(()=> token.value !== null);

    function setToken(newToken: string){
        token.value = newToken;
        localStorage.setItem("jwt_token", newToken);
    }

    function logOut(){
        token.value = null;
        localStorage.removeItem("jwt_token");
    }

    return {token, isAuthenticated, setToken, logOut}
});