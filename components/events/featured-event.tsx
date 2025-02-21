import { Users, Heart, Share2 } from "lucide-react"
import ImageFallback from "../image-fallback"

interface FeaturedEventProps {
  event: {
    title: string
    image: string
    date: string
    location: string
    attendees: number
    description: string
  }
}

export const FeaturedEvent = ({ event }: FeaturedEventProps) => {
  return (
    <div className="mb-12 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow">
      <div className="relative h-[400px] md:h-[500px] group">
        <ImageFallback
          src={event.image || "/placeholder.svg"}
          fallbackSrc="/placeholder.svg?height=500&width=1000"
          alt={event.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
              <span className="font-bold">{event.date}</span>
            </div>
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{event.attendees}+ Going</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
          <p className="text-white/80 mb-4 max-w-2xl">{event.description}</p>
          <div className="flex items-center gap-4">
            <button className="bg-[#5850EC] px-6 py-3 rounded-xl font-medium hover:bg-[#6C63FF] transition-colors">
              Get Tickets
            </button>
            <button className="bg-white/20 backdrop-blur p-3 rounded-lg hover:bg-white/30 transition-colors">
              <Heart className="w-6 h-6" />
            </button>
            <button className="bg-white/20 backdrop-blur p-3 rounded-lg hover:bg-white/30 transition-colors">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

