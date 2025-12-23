import { create } from "zustand"
import api from "@/lib/axios"

type AuthState = {
    accessToken: string | null
    isAuthenticated: boolean
    isLoading: boolean

    login: (username: string, password: string) => Promise<void>
    logout: () => void
    initAuth: () => Promise<void>
    refreshAccessToken: () => Promise<string | null>
}

export const useAuthStore = create<AuthState>((set, get) => ({
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,

    /*
    ========================
     LOGIN
    ========================
    */
    login: async (username, password) => {
        const res = await api.post("/auth/login", {
            username,
            password,
        })

        const { access_token, refresh_token } = res.data

        localStorage.setItem("refresh_token", refresh_token)

        set({
            accessToken: access_token,
            isAuthenticated: true,
        })
    },

    /*
    ========================
     LOGOUT
    ========================
    */
    logout: () => {
        localStorage.removeItem("refresh_token")
        set({
            accessToken: null,
            isAuthenticated: false,
        })
    },

    /*
    ========================
     INIT AUTH (on app load)
    ========================
    */
    initAuth: async () => {
        const refreshToken = localStorage.getItem("refresh_token")

        if (!refreshToken) {
            set({ isLoading: false })
            return
        }

        try {
            const res = await api.post("/auth/refresh", {
                refresh_token: refreshToken,
            })

            set({
                accessToken: res.data.access_token,
                isAuthenticated: true,
                isLoading: false,
            })
        } catch {
            localStorage.removeItem("refresh_token")
            set({
                accessToken: null,
                isAuthenticated: false,
                isLoading: false,
            })
        }
    },

    /*
    ========================
     REFRESH ACCESS TOKEN
    ========================
    */
    refreshAccessToken: async () => {
        const refreshToken = localStorage.getItem("refresh_token")
        if (!refreshToken) return null

        try {
            const res = await api.post("/auth/refresh", {
                refresh_token: refreshToken,
            })

            set({
                accessToken: res.data.access_token,
                isAuthenticated: true,
            })

            return res.data.access_token
        } catch {
            get().logout()
            return null
        }
    },
}))
