export interface SensorReading {
  speed: number
  rpm: number
  temperature: number
  fuelLevel: number
  throttlePosition: number
  engineOn: boolean
  latitude: number
  longitude: number
  acceleration: number
  brakePressure: number
  oilPressure: number
  batteryVoltage: number
  odometer: number
  absActive: boolean
  tractionControlActive: boolean
}

export interface Vehicle {
  id: number
  makeModel: string
  licensePlate: string
  state: "NORMAL" | "WARNING" | "CRITICAL" | "OFFLINE" | "MAINTENANCE"
  lastSeen: string
  totalDistance: number
  avgSpeed: number
  maxSpeed: number
  harshEvents: number
  totalAnomalies: number
  currentReading: SensorReading
}

export interface Anomaly {
  timestamp: string
  vehicleId: number
  sensorName: string
  value: number
  type: string
  description: string
  severity: number
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "EMERGENCY"
  acknowledged: boolean
  location?: string
  mlScore?: number
}

export interface Statistics {
  mean: number
  median: number
  stdDeviation: number
  min: number
  max: number
  percentile95: number
  trendSlope: number
  coefficientOfVariation: number
  outlierCount: number
}

export interface VehicleAnalytics {
  speed: Statistics
  rpm: Statistics
  temperature: Statistics
  fuel: Statistics
  acceleration: Statistics
  anomalySummary: {
    critical: number
    high: number
    medium: number
    low: number
  }
  predictions: Array<{
    type: string
    description: string
    severity: "low" | "medium" | "high"
    confidence: number
  }>
}

export interface SystemStats {
  totalReadings: number
  totalAnomalies: number
  readingsPerSecond: number
  systemHealth: number
  memoryUsage: number
  cpuUsage: number
  uptime: string
  recentEvents: Array<{
    timestamp: string
    type: "info" | "warning" | "error"
    message: string
  }>
}

export interface Geofence {
  name: string
  centerLat: number
  centerLon: number
  radiusKm: number
  isRestricted: boolean
}
