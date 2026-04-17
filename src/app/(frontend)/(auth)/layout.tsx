export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white min-h-[calc(100vh-320px)] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
