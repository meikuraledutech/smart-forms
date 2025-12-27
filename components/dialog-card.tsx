interface DialogCardProps {
  children: React.ReactNode
  onClick?: () => void
}

export function DialogCard({ children, onClick }: DialogCardProps) {
  return (
    <div
      className="px-4 py-3 rounded-lg border bg-card hover:bg-accent hover:border-primary cursor-pointer transition-colors"
      onClick={onClick}
    >
      {children}
    </div>
  )
}
