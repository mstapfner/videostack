import { Card } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

const projectTypes = [
  {
    id: 1,
    title: "Create new storyboard",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    image: "/dramatic-mountain-volcano-sunset-landscape.jpg",
    href: "/storyboard/new/concept",
  },
  {
    id: 2,
    title: "Generate Video",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    image: "/epic-mountain-peak-dramatic-sky.jpg",
    href: "/create",
  },
]

export function StartNewProject() {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Start a New Project</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {projectTypes.map((type) => (
          <Link key={type.id} href={type.href}>
            <Card className="relative overflow-hidden border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer group h-[220px]">
              <Image
                src={type.image || "/placeholder.svg"}
                alt={type.title}
                fill
                className="object-cover brightness-75 group-hover:brightness-90 transition-all"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white text-xl font-semibold mb-1">{type.title}</h3>
                <p className="text-neutral-300 text-sm">{type.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
