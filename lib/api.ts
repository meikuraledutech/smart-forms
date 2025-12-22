// lib/api.ts

const DEV_API_URL = "https://219590kl-3030.inc1.devtunnels.ms"

function normalize(url: string) {
    return url.replace(/\/+$/, "")
}

const base =
    process.env.NODE_ENV === "development"
        ? DEV_API_URL
        : process.env.NEXT_PUBLIC_API_URL || ""

export const API_BASE_URL = normalize(base)
