import { create } from "zustand"
import api, { refreshApi } from "@/lib/axios"

type User = {
    id: string
    email: string
    role: string
}

type AuthState = {
    accessToken: string | null
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean

    login: (username: string, password: string) => Promise<void>
    logout: () => void
    initAuth: () => Promise<void>
    refreshAccessToken: () => Promise<string | null>
}

export const useAuthStore = create<AuthState>((set, get) => ({
    accessToken: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,

    /*
    ========================
     LOGIN
    ========================
    */
    login: async (email, password) => {
        const res = await api.post("/auth/login", {
            email,
            password,
        })

        const { access_token, refresh_token, user } = res.data

        localStorage.setItem("refresh_token", refresh_token)
        localStorage.setItem("user", JSON.stringify(user))

        set({
            accessToken: access_token,
            user: user,
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
        localStorage.removeItem("user")
        set({
            accessToken: null,
            user: null,
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
        const userStr = localStorage.getItem("user")

        if (!refreshToken) {
            set({ isLoading: false })
            return
        }

        try {
            const res = await refreshApi.post("/auth/refresh", {
                refresh_token: refreshToken,
            })

            const user = userStr ? JSON.parse(userStr) : null

            set({
                accessToken: res.data.access_token,
                user: user,
                isAuthenticated: true,
                isLoading: false,
            })
        } catch {
            localStorage.removeItem("refresh_token")
            localStorage.removeItem("user")
            set({
                accessToken: null,
                user: null,
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
        const userStr = localStorage.getItem("user")
        if (!refreshToken) return null

        try {
            const res = await refreshApi.post("/auth/refresh", {
                refresh_token: refreshToken,
            })

            const user = userStr ? JSON.parse(userStr) : null

            set({
                accessToken: res.data.access_token,
                user: user,
                isAuthenticated: true,
            })

            return res.data.access_token
        } catch {
            get().logout()
            return null
        }
    },
}))
