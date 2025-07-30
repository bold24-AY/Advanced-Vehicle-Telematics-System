"use client"

import { useState, useEffect, useCallback } from "react"
import type { Vehicle, Anomaly, SystemStats, VehicleAnalytics, SensorReading } from "../types/vehicle"

// Vehicle models and license plates
const VEHICLE_DATA = [
  { makeModel: "Honda Civic", licensePlate: "ABC-123" },
  { makeModel: "Toyota Camry", licensePlate: "DEF-456" },
  { makeModel: "Ford F-150", licensePlate: "GHI-789" },
  { makeModel: "BMW X3", licensePlate: "JKL-012" },
  { makeModel: "Tesla Model 3", licensePlate: "MNO-345" },
  { makeModel: "Chevrolet Silverado", licensePlate: "PQR-678" },
  { makeModel: "Nissan Altima", licensePlate: "STU-901" },
  { makeModel: "Hyundai Elantra", licensePlate: "VWX-234" },
  { makeModel: "Mercedes C-Class", licensePlate: "YZA-567" },
  { makeModel: "Audi A4", licensePlate: "BCD-890" },
  { makeModel: "Volkswagen Jetta", licensePlate: "EFG-123" },
  { makeModel: "Subaru Outback", licensePlate: "HIJ-456" },
  { makeModel: "Mazda CX-5", licensePlate: "KLM-789" },
  { makeModel: "Jeep Wrangler", licensePlate: "NOP-012" },
  { makeModel: "Kia Sorento", licensePlate: "QRS-345" },
  { makeModel: "Volvo XC90", licensePlate: "TUV-678" },
  { makeModel: "Lexus RX", licensePlate: "WXY-901" },
  { makeModel: "Acura MDX", licensePlate: "ZAB-234" },
  { makeModel: "Infiniti Q50", licensePlate: "CDE-567" },
  { makeModel: "Cadillac Escalade", licensePlate: "FGH-890" },
]

const ANOMALY_TYPES = [
  "SPEED_OUT_OF_RANGE",
  "RPM_OUT_OF_RANGE",
  "TEMP_OUT_OF_RANGE",
  "SUDDEN_SPEED_CHANGE",
  "SUDDEN_RPM_CHANGE",
  "SUDDEN_TEMP_CHANGE",
  "ENGINE_STALL",
  "OVERHEATING_PATTERN",
  "ERRATIC_BEHAVIOR",
  "SENSOR_FAILURE",
  "FUEL_LEAK",
  "MAINTENANCE_REQUIRED",
  "GEOFENCE_VIOLATION",
  "HARSH_ACCELERATION",
  "HARSH_BRAKING",
]

export function useVehicleData() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalReadings: 0,
    totalAnomalies: 0,
    readingsPerSecond: 0,
    systemHealth: 98.5,
    memoryUsage: 245.7,
    cpuUsage: 23.4,
    uptime: "0h 0m",
    recentEvents: [],
  })
  const [isRunning, setIsRunning] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [startTime] = useState(new Date())

  // Initialize vehicles
  useEffect(() => {
    const initialVehicles: Vehicle[] = VEHICLE_DATA.slice(0, 20).map((data, index) => ({
      id: index + 1,
      makeModel: data.makeModel,
      licensePlate: data.licensePlate,
      state: "NORMAL" as const,
      lastSeen: new Date().toISOString(),
      totalDistance: Math.random() * 50000,
      avgSpeed: 45 + Math.random() * 30,
      maxSpeed: 80 + Math.random() * 40,
      harshEvents: Math.floor(Math.random() * 20),
      totalAnomalies: Math.floor(Math.random() * 50),
      currentReading: generateSensorReading(),
    }))

    setVehicles(initialVehicles)

    // Add some initial system events
    setSystemStats((prev) => ({
      ...prev,
      recentEvents: [
        {
          timestamp: new Date().toLocaleTimeString(),
          type: "info",
          message: "System initialized successfully",
        },
        {
          timestamp: new Date().toLocaleTimeString(),
          type: "info",
          message: `${initialVehicles.length} vehicles connected`,
        },
      ],
    }))
  }, [])

  // Generate realistic sensor reading
  const generateSensorReading = useCallback((): SensorReading => {
    return {
      speed: 20 + Math.random() * 100,
      rpm: 800 + Math.random() * 5200,
      temperature: 80 + Math.random() * 15,
      fuelLevel: 10 + Math.random() * 85,
      throttlePosition: Math.random() * 100,
      engineOn: Math.random() > 0.05,
      latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
      longitude: -74.006 + (Math.random() - 0.5) * 0.1,
      acceleration: (Math.random() - 0.5) * 6,
      brakePressure: Math.random() * 10,
      oilPressure: 2 + Math.random() * 4,
      batteryVoltage: 11.5 + Math.random() * 3,
      odometer: Math.floor(Math.random() * 200000),
      absActive: Math.random() > 0.9,
      tractionControlActive: Math.random() > 0.95,
    }
  }, [])

  // Generate anomaly
  const generateAnomaly = useCallback((vehicleId: number): Anomaly => {
    const type = ANOMALY_TYPES[Math.floor(Math.random() * ANOMALY_TYPES.length)]
    const severity = Math.floor(Math.random() * 5) + 1
    const value = Math.random() * 100

    const descriptions: Record<string, string> = {
      SPEED_OUT_OF_RANGE: "Vehicle speed exceeded safe limits",
      RPM_OUT_OF_RANGE: "Engine RPM outside normal operating range",
      TEMP_OUT_OF_RANGE: "Engine temperature abnormal",
      SUDDEN_SPEED_CHANGE: "Rapid acceleration or deceleration detected",
      SUDDEN_RPM_CHANGE: "Sudden RPM spike detected",
      SUDDEN_TEMP_CHANGE: "Rapid temperature change",
      ENGINE_STALL: "Engine stall pattern detected",
      OVERHEATING_PATTERN: "Progressive overheating detected",
      ERRATIC_BEHAVIOR: "Erratic driving pattern detected",
      SENSOR_FAILURE: "Sensor inconsistency detected",
      FUEL_LEAK: "Potential fuel leak detected",
      MAINTENANCE_REQUIRED: "Scheduled maintenance due",
      GEOFENCE_VIOLATION: "Vehicle entered restricted area",
      HARSH_ACCELERATION: "Harsh acceleration detected",
      HARSH_BRAKING: "Harsh braking detected",
    }

    return {
      timestamp: new Date().toISOString(),
      vehicleId,
      sensorName: type.toLowerCase().split("_")[0],
      value,
      type,
      description: descriptions[type] || "Unknown anomaly",
      severity,
      priority: severity >= 4 ? "CRITICAL" : severity >= 3 ? "HIGH" : severity >= 2 ? "MEDIUM" : "LOW",
      acknowledged: false,
      location: Math.random() > 0.7 ? "Downtown Area" : undefined,
      mlScore: Math.random() * 5,
    }
  }, [])

  // Simulation loop
  useEffect(() => {
    if (!isRunning || isPaused) return

    const interval = setInterval(() => {
      // Update vehicle data
      setVehicles((prev) =>
        prev.map((vehicle) => {
          const newReading = generateSensorReading()
          const updatedVehicle = {
            ...vehicle,
            currentReading: newReading,
            lastSeen: new Date().toISOString(),
            totalDistance: vehicle.totalDistance + newReading.speed / 3600, // Rough distance calculation
            avgSpeed: (vehicle.avgSpeed + newReading.speed) / 2,
            maxSpeed: Math.max(vehicle.maxSpeed, newReading.speed),
          }

          // Update vehicle state based on anomalies
          if (newReading.temperature > 105 || newReading.speed > 150) {
            updatedVehicle.state = "CRITICAL"
          } else if (newReading.temperature > 100 || newReading.speed > 130) {
            updatedVehicle.state = "WARNING"
          } else if (!newReading.engineOn) {
            updatedVehicle.state = "OFFLINE"
          } else {
            updatedVehicle.state = "NORMAL"
          }

          return updatedVehicle
        }),
      )

      // Generate anomalies (5% chance per vehicle per update)
      setAnomalies((prev) => {
        const newAnomalies = [...prev]
        vehicles.forEach((vehicle) => {
          if (Math.random() < 0.05) {
            const anomaly = generateAnomaly(vehicle.id)
            newAnomalies.push(anomaly)

            // Update vehicle anomaly count
            setVehicles((prevVehicles) =>
              prevVehicles.map((v) => (v.id === vehicle.id ? { ...v, totalAnomalies: v.totalAnomalies + 1 } : v)),
            )
          }
        })

        // Keep only last 1000 anomalies
        return newAnomalies.slice(-1000)
      })

      // Update system stats
      setSystemStats((prev) => {
        const now = new Date()
        const uptimeMs = now.getTime() - startTime.getTime()
        const hours = Math.floor(uptimeMs / (1000 * 60 * 60))
        const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60))

        return {
          ...prev,
          totalReadings: prev.totalReadings + vehicles.length,
          readingsPerSecond: Math.floor(Math.random() * 20) + 10,
          systemHealth: 95 + Math.random() * 5,
          memoryUsage: 200 + Math.random() * 100,
          cpuUsage: 15 + Math.random() * 20,
          uptime: `${hours}h ${minutes}m`,
        }
      })
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [isRunning, isPaused, vehicles, generateSensorReading, generateAnomaly, startTime])

  // Update total anomalies in system stats
  useEffect(() => {
    setSystemStats((prev) => ({
      ...prev,
      totalAnomalies: anomalies.length,
    }))
  }, [anomalies.length])

  const toggleSimulation = useCallback(() => {
    setIsRunning((prev) => !prev)
    setSystemStats((prev) => ({
      ...prev,
      recentEvents: [
        {
          timestamp: new Date().toLocaleTimeString(),
          type: "info",
          message: isRunning ? "Simulation stopped" : "Simulation started",
        },
        ...prev.recentEvents.slice(0, 9),
      ],
    }))
  }, [isRunning])

  const pauseResume = useCallback(() => {
    setIsPaused((prev) => !prev)
    setSystemStats((prev) => ({
      ...prev,
      recentEvents: [
        {
          timestamp: new Date().toLocaleTimeString(),
          type: "info",
          message: isPaused ? "Simulation resumed" : "Simulation paused",
        },
        ...prev.recentEvents.slice(0, 9),
      ],
    }))
  }, [isPaused])

  const exportData = useCallback(() => {
    // Export vehicles data as CSV
    const vehiclesCsvHeaders = [
      "Vehicle ID",
      "Make Model",
      "License Plate",
      "State",
      "Total Distance (km)",
      "Avg Speed (km/h)",
      "Max Speed (km/h)",
      "Harsh Events",
      "Total Anomalies",
      "Current Speed",
      "Current RPM",
      "Current Temperature",
      "Current Fuel Level",
      "Latitude",
      "Longitude",
      "Last Seen",
    ]

    const vehiclesCsvData = vehicles.map((vehicle) => [
      vehicle.id,
      vehicle.makeModel,
      vehicle.licensePlate,
      vehicle.state,
      vehicle.totalDistance.toFixed(2),
      vehicle.avgSpeed.toFixed(2),
      vehicle.maxSpeed.toFixed(2),
      vehicle.harshEvents,
      vehicle.totalAnomalies,
      vehicle.currentReading.speed.toFixed(2),
      vehicle.currentReading.rpm.toFixed(0),
      vehicle.currentReading.temperature.toFixed(2),
      vehicle.currentReading.fuelLevel.toFixed(2),
      vehicle.currentReading.latitude.toFixed(6),
      vehicle.currentReading.longitude.toFixed(6),
      vehicle.lastSeen,
    ])

    const vehiclesCsv = [vehiclesCsvHeaders.join(","), ...vehiclesCsvData.map((row) => row.join(","))].join("\n")

    // Export anomalies data as CSV
    const anomaliesCsvHeaders = [
      "Timestamp",
      "Vehicle ID",
      "Sensor Name",
      "Value",
      "Type",
      "Description",
      "Severity",
      "Priority",
      "Acknowledged",
      "Location",
      "ML Score",
    ]

    const anomaliesCsvData = anomalies.map((anomaly) => [
      anomaly.timestamp,
      anomaly.vehicleId,
      anomaly.sensorName,
      anomaly.value.toFixed(2),
      anomaly.type,
      `"${anomaly.description}"`, // Wrap in quotes to handle commas
      anomaly.severity,
      anomaly.priority,
      anomaly.acknowledged,
      anomaly.location || "",
      anomaly.mlScore?.toFixed(2) || "",
    ])

    const anomaliesCsv = [anomaliesCsvHeaders.join(","), ...anomaliesCsvData.map((row) => row.join(","))].join("\n")

    // Create and download vehicles CSV
    const vehiclesBlob = new Blob([vehiclesCsv], { type: "text/csv;charset=utf-8;" })
    const vehiclesUrl = window.URL.createObjectURL(vehiclesBlob)
    const vehiclesLink = document.createElement("a")
    vehiclesLink.href = vehiclesUrl
    vehiclesLink.download = `vehicles_data_${new Date().toISOString().split("T")[0]}.csv`
    vehiclesLink.click()
    window.URL.revokeObjectURL(vehiclesUrl)

    // Create and download anomalies CSV
    const anomaliesBlob = new Blob([anomaliesCsv], { type: "text/csv;charset=utf-8;" })
    const anomaliesUrl = window.URL.createObjectURL(anomaliesBlob)
    const anomaliesLink = document.createElement("a")
    anomaliesLink.href = anomaliesUrl
    anomaliesLink.download = `anomalies_data_${new Date().toISOString().split("T")[0]}.csv`
    anomaliesLink.click()
    window.URL.revokeObjectURL(anomaliesUrl)

    // Create and download system report JSON
    const systemReport = {
      exportTimestamp: new Date().toISOString(),
      systemStats,
      totalVehicles: vehicles.length,
      totalAnomalies: anomalies.length,
      vehicles: vehicles.map((v) => ({
        ...v,
        sensorReadings: {
          speed: v.currentReading.speed,
          rpm: v.currentReading.rpm,
          temperature: v.currentReading.temperature,
          fuelLevel: v.currentReading.fuelLevel,
          location: {
            latitude: v.currentReading.latitude,
            longitude: v.currentReading.longitude,
          },
        },
      })),
      recentAnomalies: anomalies.slice(-100), // Last 100 anomalies
    }

    const reportBlob = new Blob([JSON.stringify(systemReport, null, 2)], { type: "application/json" })
    const reportUrl = window.URL.createObjectURL(reportBlob)
    const reportLink = document.createElement("a")
    reportLink.href = reportUrl
    reportLink.download = `telematics_report_${new Date().toISOString().split("T")[0]}.json`
    reportLink.click()
    window.URL.revokeObjectURL(reportUrl)

    setSystemStats((prev) => ({
      ...prev,
      recentEvents: [
        {
          timestamp: new Date().toLocaleTimeString(),
          type: "info",
          message: "Data exported successfully (CSV + JSON files downloaded)",
        },
        ...prev.recentEvents.slice(0, 9),
      ],
    }))
  }, [vehicles, anomalies, systemStats])

  const getVehicleAnalytics = useCallback(
    (vehicleId: number): VehicleAnalytics => {
      const vehicle = vehicles.find((v) => v.id === vehicleId)
      const vehicleAnomalies = anomalies.filter((a) => a.vehicleId === vehicleId)

      if (!vehicle) {
        return {
          speed: {
            mean: 0,
            median: 0,
            stdDeviation: 0,
            min: 0,
            max: 0,
            percentile95: 0,
            trendSlope: 0,
            coefficientOfVariation: 0,
            outlierCount: 0,
          },
          rpm: {
            mean: 0,
            median: 0,
            stdDeviation: 0,
            min: 0,
            max: 0,
            percentile95: 0,
            trendSlope: 0,
            coefficientOfVariation: 0,
            outlierCount: 0,
          },
          temperature: {
            mean: 0,
            median: 0,
            stdDeviation: 0,
            min: 0,
            max: 0,
            percentile95: 0,
            trendSlope: 0,
            coefficientOfVariation: 0,
            outlierCount: 0,
          },
          fuel: {
            mean: 0,
            median: 0,
            stdDeviation: 0,
            min: 0,
            max: 0,
            percentile95: 0,
            trendSlope: 0,
            coefficientOfVariation: 0,
            outlierCount: 0,
          },
          acceleration: {
            mean: 0,
            median: 0,
            stdDeviation: 0,
            min: 0,
            max: 0,
            percentile95: 0,
            trendSlope: 0,
            coefficientOfVariation: 0,
            outlierCount: 0,
          },
          anomalySummary: { critical: 0, high: 0, medium: 0, low: 0 },
          predictions: [],
        }
      }

      // Generate mock analytics based on current data
      const mockStats = (base: number, variance: number) => ({
        mean: base + (Math.random() - 0.5) * variance,
        median: base + (Math.random() - 0.5) * variance * 0.8,
        stdDeviation: variance * 0.3 + Math.random() * variance * 0.2,
        min: base - variance * 0.8,
        max: base + variance * 1.2,
        percentile95: base + variance * 0.9,
        trendSlope: (Math.random() - 0.5) * 0.5,
        coefficientOfVariation: 0.1 + Math.random() * 0.3,
        outlierCount: Math.floor(Math.random() * 10),
      })

      return {
        speed: mockStats(vehicle.avgSpeed, 20),
        rpm: mockStats(3000, 1000),
        temperature: mockStats(90, 10),
        fuel: mockStats(50, 30),
        acceleration: mockStats(0, 2),
        anomalySummary: {
          critical: vehicleAnomalies.filter((a) => a.severity >= 4).length,
          high: vehicleAnomalies.filter((a) => a.severity === 3).length,
          medium: vehicleAnomalies.filter((a) => a.severity === 2).length,
          low: vehicleAnomalies.filter((a) => a.severity === 1).length,
        },
        predictions: [
          {
            type: "Maintenance Due",
            description: "Vehicle may require maintenance within 1000 km",
            severity: "medium",
            confidence: 0.75,
          },
          {
            type: "Fuel Efficiency",
            description: "Fuel consumption pattern suggests potential optimization",
            severity: "low",
            confidence: 0.65,
          },
          {
            type: "Temperature Trend",
            description: "Engine temperature showing gradual increase",
            severity: "medium",
            confidence: 0.82,
          },
        ],
      }
    },
    [vehicles, anomalies],
  )

  return {
    vehicles,
    anomalies,
    systemStats,
    isRunning,
    isPaused,
    toggleSimulation,
    pauseResume,
    exportData,
    getVehicleAnalytics,
  }
}
