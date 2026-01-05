// lib/api.ts

// const DEV_API_URL = "https://7ca0cf1a82a3.ngrok-free.app"
const DEV_API_URL = "https://68908f4abcec.ngrok-free.app";
function normalize(url: string) {
  return url.replace(/\/+$/, "");
}

const base =
  process.env.NODE_ENV === "development"
    ? DEV_API_URL
    : process.env.NEXT_PUBLIC_API_URL || "";

export const API_BASE_URL = normalize(base);
