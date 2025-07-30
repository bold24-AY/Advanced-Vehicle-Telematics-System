"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation } from "lucide-react"
import type { Vehicle } from "../types/vehicle"

interface VehicleMapProps {
  vehicles: Vehicle[]
}

export default function VehicleMap({ vehicles }: VehicleMapProps) {
  const getStateColor = (state: string) => {
    switch (state) {
      case "NORMAL":
        return "#10b981"
      case "WARNING":
        return "#f59e0b"
      case "CRITICAL":
        return "#ef4444"
      case "OFFLINE":
        return "#6b7280"
      case "MAINTENANCE":
        return "#3b82f6"
      default:
        return "#6b7280"
    }
  }

  // Simple map visualization - in a real app, you'd use Google Maps, Mapbox, etc.
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Vehicle Locations
        </CardTitle>
        <CardDescription>Real-time GPS tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative bg-slate-100 rounded-lg h-64 overflow-hidden">
          {/* Simple grid background to simulate map */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#94a3b8" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Vehicle markers */}
          {vehicles.map((vehicle) => {
            // Convert lat/lng to pixel coordinates (simplified)
            const x = ((vehicle.currentReading.longitude + 180) / 360) * 100
            const y = ((90 - vehicle.currentReading.latitude) / 180) * 100

            return (
              <div
                key={vehicle.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{
                  left: `${Math.max(5, Math.min(95, x))}%`,
                  top: `${Math.max(5, Math.min(95, y))}%`,
                }}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                  style={{ backgroundColor: getStateColor(vehicle.state) }}
                />

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Vehicle {vehicle.id} - {vehicle.state}
                  <br />
                  {vehicle.currentReading.speed.toFixed(1)} km/h
                </div>
              </div>
            )
          })}

          {/* Legend */}
          <div className="absolute bottom-2 left-2 bg-white rounded-lg p-2 shadow-lg">
            <div className="text-xs font-medium mb-1">Vehicle Status</div>
            <div className="space-y-1">
              {["NORMAL", "WARNING", "CRITICAL", "OFFLINE"].map((state) => (
                <div key={state} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getStateColor(state) }} />
                  <span className="text-xs">{state}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vehicle list */}
        <div className="mt-4 space-y-2">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getStateColor(vehicle.state) }} />
                <span className="text-sm font-medium">Vehicle {vehicle.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{vehicle.currentReading.speed.toFixed(1)} km/h</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
