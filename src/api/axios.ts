import axios from "axios";
import { useAuthStore } from "@/stores/auth";


const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
})


apiClient.interceptors.request.use((config) => {
    const store = useAuthStore();
    if(store.token){
        config.headers.Authorization = `Bearer ${store.token}`
    }
    return config;
}, (error) =>{
    return Promise.reject(error);
});

apiClient.interceptors.response.use(
    (response)=>response,
    (error) => {
        if (error.response?.status===401) {
            const store = useAuthStore();
            store.logOut();
        }
        return Promise.reject(error);
    }
)


export default apiClient