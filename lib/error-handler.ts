import { AxiosError } from "axios"

/**
 * Handles API errors and returns user-friendly error messages
 */
export function getErrorMessage(error: unknown): string {
    // Check if it's an axios error
    if (error && typeof error === "object" && "isAxiosError" in error) {
        const axiosError = error as AxiosError

        // Network errors (backend down, connection lost)
        if (!axiosError.response) {
            if (axiosError.code === "ECONNREFUSED") {
                return "Unable to connect to server. Please try again later."
            }
            if (axiosError.code === "ECONNABORTED" || axiosError.code === "ETIMEDOUT") {
                return "Request timed out. Please check your connection and try again."
            }
            return "Network error. Please check your connection and try again."
        }

        // Server responded with an error
        const status = axiosError.response.status

        // Server errors (5xx) - our fault
        if (status >= 500) {
            if (status === 503) {
                return "Service temporarily unavailable. Please try again in a moment."
            }
            return "Something went wrong on our end. Please try again later."
        }

        // Client errors (4xx) - return null to let caller handle specific cases
        return ""
    }

    // Fetch API errors
    if (error instanceof TypeError && error.message === "Failed to fetch") {
        return "Unable to connect to server. Please try again later."
    }

    // Unknown error
    return "An unexpected error occurred. Please try again."
}

/**
 * Checks if error is a network/connection error
 */
export function isNetworkError(error: unknown): boolean {
    if (error && typeof error === "object" && "isAxiosError" in error) {
        const axiosError = error as AxiosError
        return !axiosError.response
    }
    if (error instanceof TypeError && error.message === "Failed to fetch") {
        return true
    }
    return false
}

/**
 * Checks if error is a server error (5xx)
 */
export function isServerError(error: unknown): boolean {
    if (error && typeof error === "object" && "isAxiosError" in error) {
        const axiosError = error as AxiosError
        return (axiosError.response?.status ?? 0) >= 500
    }
    return false
}
