"use client"

export default function FullscreenLoader() {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <div className="text-center">
                <div className="mb-2 text-lg font-medium">Loading...</div>
                <div className="h-1 w-40 overflow-hidden rounded bg-muted">
                    <div className="h-full w-1/2 animate-pulse bg-primary" />
                </div>
            </div>
        </div>
    )
}
