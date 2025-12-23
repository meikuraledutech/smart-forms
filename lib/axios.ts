import axios from "axios"
import { useAuthStore } from "./auth-store"
import { API_BASE_URL } from "./api"

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
    },
})

// Separate axios instance for refresh token (no interceptors)
export const refreshApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
    },
})

/*
========================
 REQUEST INTERCEPTOR
========================
*/
api.interceptors.request.use((config) => {
    const { accessToken } = useAuthStore.getState()

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
})

/*
========================
 RESPONSE INTERCEPTOR
========================
*/
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        const store = useAuthStore.getState()

        // If unauthorized & not already retried
        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true

            const newAccessToken = await store.refreshAccessToken()

            if (newAccessToken) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                return api(originalRequest)
            }

            // Refresh failed - logout and reject
            store.logout()
            return Promise.reject(error)
        }

        // For non-401 errors, just reject without logging out
        return Promise.reject(error)
    }
)

export default api
