"use client"

import { Home, FolderOpen, Film, Clock, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function Sidebar() {
  const [activeItem, setActiveItem] = useState("home")

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "assets", label: "My Assets", icon: FolderOpen },
  ]

  const projectItems = [
    { id: "storyboard", label: "New Storyboard", icon: Film },
    { id: "timeline", label: "New Timeline", icon: Clock },
    { id: "create", label: "Create Mode", icon: Wand2 },
  ]

  return (
    <aside className="w-[220px] bg-[#0a0a0a] border-r border-neutral-800 flex flex-col">
      <div className="p-6 border-b border-neutral-800">
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

      <nav className="flex-1 p-4 space-y-6">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveItem(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  activeItem === item.id
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50",
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            )
          })}
        </div>

        <div className="space-y-3">
          <div className="px-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">New Project</div>
          <div className="space-y-1">
            {projectItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveItem(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    activeItem === item.id
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/50",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      </nav>
    </aside>
  )
}
