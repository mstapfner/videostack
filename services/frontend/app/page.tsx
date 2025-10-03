import { Sidebar } from "@/components/sidebar"
import { RecentProjects } from "@/components/recent-projects"
import { StartNewProject } from "@/components/start-new-project"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />

      <main className="flex-1">
        <header className="flex items-center justify-end gap-3 p-6 border-b border-neutral-800">
          <Button className="bg-transparent border border-neutral-700 hover:bg-neutral-800 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Start New Project
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src="/diverse-user-avatars.png" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </header>

        <div className="p-8 space-y-12">
          <RecentProjects />
          <StartNewProject />
        </div>
      </main>
    </div>
  )
}
