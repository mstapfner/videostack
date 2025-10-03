import { Card } from "@/components/ui/card"
import Image from "next/image"

const projects = [
  { id: 1, name: "File name", date: "10/08/2025" },
  { id: 2, name: "File name", date: "10/08/2025" },
  { id: 3, name: "File name", date: "10/08/2025" },
  { id: 4, name: "File name", date: "10/08/2025" },
]

export function RecentProjects() {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Recent Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="bg-neutral-900 border-neutral-800 overflow-hidden hover:border-neutral-700 transition-colors cursor-pointer"
          >
            <div className="aspect-video relative bg-neutral-800">
              <Image src="/customer-service-team-with-headsets.jpg" alt={project.name} fill className="object-cover" />
            </div>
            <div className="p-3">
              <h3 className="text-white font-medium mb-1 text-sm">{project.name}</h3>
              <p className="text-neutral-500 text-xs">{project.date}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
