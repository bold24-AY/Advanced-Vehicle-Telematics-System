"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Car,
  Gauge,
  Thermometer,
  Fuel,
  MapPin,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import type { Vehicle, Anomaly } from "../types/vehicle"
import VehicleMap from "./VehicleMap"
import RealTimeChart from "./RealTimeChart"

interface VehicleDashboardProps {
  vehicles: Vehicle[]
  selectedVehicle: number
  onVehicleSelect: (id: number) => void
  anomalies: Anomaly[]
}

// Mini gauge component for dashboard
function MiniGauge({
  value,
  max,
  color,
  icon: Icon,
}: {
  value: number
  max: number
  color: string
  icon: React.ComponentType<{ className?: string }>
}) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12">
        <svg width="48" height="48" viewBox="0 0 48 48" className="transform -rotate-90">
          <circle cx="24" cy="24" r="18" fill="none" stroke="#e2e8f0" strokeWidth="4" />
          <circle
            cx="24"
            cy="24"
            r="18"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={`${(percentage / 100) * 113} 113`}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
    </div>
  )
}

export default function VehicleDashboard({
  vehicles,
  selectedVehicle,
  onVehicleSelect,
  anomalies,
}: VehicleDashboardProps) {
  const vehicle = vehicles.find((v) => v.id === selectedVehicle)
  const vehicleAnomalies = anomalies.filter((a) => a.vehicleId === selectedVehicle)
  const recentAnomalies = vehicleAnomalies.slice(0, 5)

  if (!vehicle) {
    return <div>Vehicle not found</div>
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case "NORMAL":
        return "bg-green-500"
      case "WARNING":
        return "bg-yellow-500"
      case "CRITICAL":
        return "bg-red-500"
      case "OFFLINE":
        return "bg-gray-500"
      case "MAINTENANCE":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStateIcon = (state: string) => {
    switch (state) {
      case "NORMAL":
        return <CheckCircle className="h-4 w-4" />
      case "WARNING":
        return <AlertTriangle className="h-4 w-4" />
      case "CRITICAL":
        return <XCircle className="h-4 w-4" />
      case "OFFLINE":
        return <Clock className="h-4 w-4" />
      case "MAINTENANCE":
        return <Activity className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Vehicle Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedVehicle.toString()} onValueChange={(value) => onVehicleSelect(Number.parseInt(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a vehicle" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id.toString()}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStateColor(v.state)}`} />
                    Vehicle {v.id} - {v.makeModel} ({v.licensePlate})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Vehicle {vehicle.id}</span>
              <Badge variant="outline" className="flex items-center gap-1">
                {getStateIcon(vehicle.state)}
                {vehicle.state}
              </Badge>
            </CardTitle>
            <CardDescription>{vehicle.makeModel}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">License Plate</p>
                <p className="font-medium">{vehicle.licensePlate}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Distance</p>
                <p className="font-medium">{vehicle.totalDistance.toFixed(1)} km</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg Speed</p>
                <p className="font-medium">{vehicle.avgSpeed.toFixed(1)} km/h</p>
              </div>
              <div>
                <p className="text-muted-foreground">Max Speed</p>
                <p className="font-medium">{vehicle.maxSpeed.toFixed(1)} km/h</p>
              </div>
              <div>
                <p className="text-muted-foreground">Harsh Events</p>
                <p className="font-medium">{vehicle.harshEvents}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Anomalies</p>
                <p className="font-medium">{vehicle.totalAnomalies}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Sensor Readings with Mini Gauges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Sensor Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MiniGauge value={vehicle.currentReading.speed} max={200} color="#3b82f6" icon={Gauge} />
                  <div>
                    <p className="text-sm font-medium">Speed</p>
                    <p className="text-lg font-bold">{vehicle.currentReading.speed.toFixed(1)} km/h</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MiniGauge value={vehicle.currentReading.rpm} max={8000} color="#10b981" icon={Activity} />
                  <div>
                    <p className="text-sm font-medium">RPM</p>
                    <p className="text-lg font-bold">{vehicle.currentReading.rpm.toFixed(0)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MiniGauge value={vehicle.currentReading.temperature} max={120} color="#ef4444" icon={Thermometer} />
                  <div>
                    <p className="text-sm font-medium">Temperature</p>
                    <p className="text-lg font-bold">{vehicle.currentReading.temperature.toFixed(1)}°C</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MiniGauge value={vehicle.currentReading.fuelLevel} max={100} color="#f59e0b" icon={Fuel} />
                    <div>
                      <p className="text-sm font-medium">Fuel Level</p>
                      <p className="text-lg font-bold">{vehicle.currentReading.fuelLevel.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Location</span>
                </div>
                <span className="font-medium text-xs">
                  {vehicle.currentReading.latitude.toFixed(4)}, {vehicle.currentReading.longitude.toFixed(4)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Anomalies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Anomalies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAnomalies.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent anomalies</p>
            ) : (
              <div className="space-y-3">
                {recentAnomalies.map((anomaly, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        anomaly.severity >= 4 ? "bg-red-500" : anomaly.severity >= 3 ? "bg-yellow-500" : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{anomaly.type}</p>
                      <p className="text-xs text-muted-foreground">{anomaly.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(anomaly.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts and Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealTimeChart vehicle={vehicle} />
        <VehicleMap vehicles={[vehicle]} />
      </div>
    </div>
  )
}
