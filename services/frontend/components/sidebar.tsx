"use client"

import { Home, FolderOpen, Film, Wand2, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()

  const navItems = [
    { id: "home", label: "Home", icon: Home, href: "/app" },
    { id: "assets", label: "My Assets", icon: FolderOpen, href: "/assets" },
  ]

  const projectItems = [
    { id: "storyboard", label: "New Storyboard", icon: Film, href: "/storyboard/new/concept" },
    { id: "create", label: "Create Mode", icon: Wand2, href: "/create" },
  ]

  return (
    <aside className="w-[220px] h-screen bg-[#0a0a0a] border-r border-neutral-800 flex flex-col flex-shrink-0">
      <div className="flex-shrink-0 p-5 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path
                d="M7 8L3 12L7 16M17 8L21 12L17 16M14 4L10 20"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-white font-medium">Video Stack</span>
            <span className="text-blue-400 font-medium">.AI</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-5">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50",
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="space-y-2">
          <div className="px-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">New Project</div>
          <div className="space-y-1">
            {projectItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname?.startsWith(item.href)
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/50",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      <div className="flex-shrink-0 p-4 border-t border-neutral-800">
        <div className="mb-3 px-3">
          <div className="text-xs text-neutral-500">Signed in as</div>
          <div className="text-sm text-white truncate">
            {user?.email || 'User'}
          </div>
        </div>
        <Button
          onClick={logout}
          variant="ghost"
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800/50"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  )
}
