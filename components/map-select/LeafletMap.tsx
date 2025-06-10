// components/LeafletMap.tsx
'use client'

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import { useEffect } from 'react'

const markerIcon = new Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

export function LocationSelector({ 
  setCoordinates, 
  onMapClick 
}: { 
  setCoordinates: (coords: { lat: number; lng: number }) => void,
  onMapClick?: () => void 
}) {
  useMapEvents({
    click(e) {
      setCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng })
      if (onMapClick) {
        onMapClick()
      }
    },
  })
  return null
}

export function SearchHandler({ query, setCoordinates }: { query: string; setCoordinates: (coords: { lat: number; lng: number }) => void }) {
  const map = useMap()

  useEffect(() => {
    if (!query) return
    const fetchLocation = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
        )
        const data = await res.json()
        if (data?.[0]) {
          const lat = parseFloat(data[0].lat)
          const lng = parseFloat(data[0].lon)
          map.setView([lat, lng], 15)
          setCoordinates({ lat, lng })
        }
      } catch (err) {
        console.error('Erreur de recherche :', err)
      }
    }
    fetchLocation()
  }, [query])

  return null
}

export default function LeafletMap({
  position,
  triggerSearch,
  setCoordinates,
  onMapClick,
}: {
  position: [number, number] | null
  triggerSearch: string
  setCoordinates: (coords: { lat: number; lng: number }) => void
  onMapClick?: () => void
}) {
  const defaultPosition: [number, number] = [5.348, -4.007] // Default position (Abidjan, CI)
  const mapPosition = position || defaultPosition

  if (typeof window === 'undefined') {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted">
        <p>Chargement de la carte...</p>
      </div>
    )
  }

  return (
    <MapContainer
      center={mapPosition}
      zoom={position ? 13 : 8}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationSelector setCoordinates={setCoordinates} onMapClick={onMapClick} />
      {triggerSearch && <SearchHandler query={triggerSearch} setCoordinates={setCoordinates} />}
      {position && <Marker position={position} icon={markerIcon} />}
    </MapContainer>
  )
}
