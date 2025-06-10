'use client'


import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'

// ⛔ Important : évite le SSR ici
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
})

interface MapSelectorProps {
  initialCoordinates?: { lat: number; lng: number } | null
  onCoordinatesChange: (lat: number | null, lng: number | null) => void
}

export default function MapSelector({ initialCoordinates, onCoordinatesChange }: MapSelectorProps) {
  const defaultPosition: [number, number] = [5.348, -4.007] // Default position (Abidjan, CI)
  const [position, setPosition] = useState<[number, number] | null>(
    initialCoordinates ? [initialCoordinates.lat, initialCoordinates.lng] : null
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [triggerSearch, setTriggerSearch] = useState('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setTriggerSearch(searchQuery)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleCoordinatesChange = ({ lat, lng }: { lat: number; lng: number }) => {
    const newPosition: [number, number] = [lat, lng]
    setPosition(newPosition)
    onCoordinatesChange(lat, lng)
  }

  // Handle map click to clear coordinates
  const handleMapClick = () => {
    setPosition(null)
    onCoordinatesChange(null, null)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Rechercher une adresse..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button onClick={handleSearch} size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-96 w-full rounded-lg border overflow-hidden">
        {isClient ? (
          <LeafletMap
            position={position}
            triggerSearch={triggerSearch}
            setCoordinates={handleCoordinatesChange}
            onMapClick={handleMapClick}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted">
            <p>Chargement de la carte...</p>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Cliquez sur la carte ou recherchez une adresse pour définir l’emplacement de l’établissement.
      </p>
    </div>
  )
}
