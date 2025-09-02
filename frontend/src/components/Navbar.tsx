import ModeToggle from "@/components/mode-toggle"

export default function Navbar() {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b">
      <h1 className="text-lg font-semibold">Tracklyn</h1>
      <ModeToggle />  {/* ✅ Dark mode toggle button */}
    </div>
  )
}