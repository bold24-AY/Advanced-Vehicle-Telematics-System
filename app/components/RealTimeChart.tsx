"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { AlertTriangle, TrendingUp, TrendingDown, Zap } from "lucide-react"
import type { Vehicle } from "../types/vehicle"

interface RealTimeChartProps {
  vehicle: Vehicle
}

interface DataPoint {
  time: string
  timestamp: number
  speed: number
  rpm: number
  temperature: number
  fuelLevel: number
  acceleration: number
  brakePressure: number
  oilPressure: number
  batteryVoltage: number
}

// Advanced Speedometer with perfect needle
function AdvancedSpeedometer({
  value,
  max,
  unit,
  label,
  color,
  dangerZone = 0.8,
  warningZone = 0.6,
}: {
  value: number
  max: number
  unit: string
  label: string
  color: string
  dangerZone?: number
  warningZone?: number
}) {
  const percentage = Math.min((value / max) * 100, 100)
  const angle = (percentage / 100) * 270 - 135 // -135 to 135 degrees for 270° arc

  // Calculate needle position with perfect precision
  const needleLength = 45
  const centerX = 80
  const centerY = 80
  const needleX = centerX + Math.cos((angle * Math.PI) / 180) * needleLength
  const needleY = centerY + Math.sin((angle * Math.PI) / 180) * needleLength

  // Generate tick marks
  const ticks = []
  for (let i = 0; i <= 10; i++) {
    const tickAngle = -135 + i * 27 // 270° / 10 = 27° per tick
    const tickRadius = 55
    const tickX1 = centerX + Math.cos((tickAngle * Math.PI) / 180) * tickRadius
    const tickY1 = centerY + Math.sin((tickAngle * Math.PI) / 180) * tickRadius
    const tickX2 = centerX + Math.cos((tickAngle * Math.PI) / 180) * (tickRadius - (i % 2 === 0 ? 8 : 4))
    const tickY2 = centerY + Math.sin((tickAngle * Math.PI) / 180) * (tickRadius - (i % 2 === 0 ? 8 : 4))

    ticks.push(
      <line
        key={i}
        x1={tickX1}
        y1={tickY1}
        x2={tickX2}
        y2={tickY2}
        stroke="#374151"
        strokeWidth={i % 2 === 0 ? 2 : 1}
      />,
    )

    // Add numbers for major ticks
    if (i % 2 === 0) {
      const labelRadius = tickRadius - 15
      const labelX = centerX + Math.cos((tickAngle * Math.PI) / 180) * labelRadius
      const labelY = centerY + Math.sin((tickAngle * Math.PI) / 180) * labelRadius
      ticks.push(
        <text
          key={`label-${i}`}
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-medium fill-gray-600"
        >
          {Math.round((i / 10) * max)}
        </text>,
      )
    }
  }

  return (
    <div className="flex flex-col items-center p-4">
      <div className="relative w-40 h-32 mb-4">
        <svg width="160" height="128" viewBox="0 0 160 128" className="overflow-visible">
          {/* Outer ring */}
          <circle cx="80" cy="80" r="60" fill="none" stroke="#e5e7eb" strokeWidth="2" />

          {/* Background arc segments */}
          <path
            d="M 25 80 A 55 55 0 0 1 135 80"
            fill="none"
            stroke="#10b981"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${warningZone * 173} ${(1 - warningZone) * 173}`}
          />
          <path
            d="M 25 80 A 55 55 0 0 1 135 80"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${warningZone * 173} ${(dangerZone - warningZone) * 173} ${(1 - dangerZone) * 173}`}
            strokeDashoffset={-warningZone * 173}
          />
          <path
            d="M 25 80 A 55 55 0 0 1 135 80"
            fill="none"
            stroke="#ef4444"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(1 - dangerZone) * 173} ${dangerZone * 173}`}
            strokeDashoffset={-dangerZone * 173}
          />

          {/* Progress arc */}
          <path
            d="M 25 80 A 55 55 0 0 1 135 80"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 173} 173`}
            className="transition-all duration-700 ease-out"
            filter="drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))"
          />

          {/* Tick marks and labels */}
          {ticks}

          {/* Perfect needle with shadow */}
          <defs>
            <filter id="needle-shadow">
              <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Needle base circle */}
          <circle cx="80" cy="80" r="6" fill="#1f2937" filter="url(#needle-shadow)" />

          {/* Main needle */}
          <line
            x1="80"
            y1="80"
            x2={needleX}
            y2={needleY}
            stroke="#dc2626"
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            filter="url(#needle-shadow)"
          />

          {/* Needle tip */}
          <circle cx={needleX} cy={needleY} r="2" fill="#dc2626" />

          {/* Center dot */}
          <circle cx="80" cy="80" r="3" fill="#ffffff" />
        </svg>
      </div>

      <div className="text-center space-y-1">
        <div className="text-3xl font-bold" style={{ color }}>
          {value.toFixed(1)}
        </div>
        <div className="text-sm text-muted-foreground font-medium">
          {label} ({unit})
        </div>
        {percentage > dangerZone * 100 && (
          <div className="flex items-center gap-1 text-red-500 text-xs">
            <AlertTriangle className="h-3 w-3" />
            DANGER ZONE
          </div>
        )}
      </div>
    </div>
  )
}

// Digital display component
function DigitalDisplay({
  label,
  value,
  unit,
  color,
  trend,
}: {
  label: string
  value: number
  unit: string
  color: string
  trend?: number
}) {
  return (
    <div className="bg-black rounded-lg p-3 border border-gray-700">
      <div className="text-green-400 text-xs font-mono mb-1">{label}</div>
      <div className="flex items-center justify-between">
        <div className="text-green-400 font-mono text-lg">
          {value.toFixed(1)} {unit}
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center text-xs ${trend > 0 ? "text-red-400" : trend < 0 ? "text-blue-400" : "text-gray-400"}`}
          >
            {trend > 0 ? <TrendingUp className="h-3 w-3" /> : trend < 0 ? <TrendingDown className="h-3 w-3" /> : null}
            {Math.abs(trend).toFixed(1)}
          </div>
        )}
      </div>
    </div>
  )
}

// Warning lights component
function WarningLights({ vehicle }: { vehicle: Vehicle }) {
  const warnings = [
    {
      label: "ENGINE",
      active: vehicle.currentReading.temperature > 100,
      color: "text-red-500",
      icon: "🔥",
    },
    {
      label: "OIL",
      active: vehicle.currentReading.oilPressure < 2,
      color: "text-yellow-500",
      icon: "🛢️",
    },
    {
      label: "BATTERY",
      active: vehicle.currentReading.batteryVoltage < 12,
      color: "text-red-500",
      icon: "🔋",
    },
    {
      label: "ABS",
      active: vehicle.currentReading.absActive,
      color: "text-orange-500",
      icon: "⚠️",
    },
    {
      label: "TRACTION",
      active: vehicle.currentReading.tractionControlActive,
      color: "text-blue-500",
      icon: "🛡️",
    },
    {
      label: "FUEL",
      active: vehicle.currentReading.fuelLevel < 15,
      color: "text-yellow-500",
      icon: "⛽",
    },
  ]

  return (
    <div className="bg-black rounded-lg p-4 border border-gray-700">
      <div className="text-green-400 text-xs font-mono mb-3">WARNING LIGHTS</div>
      <div className="grid grid-cols-3 gap-2">
        {warnings.map((warning, index) => (
          <div
            key={index}
            className={`flex flex-col items-center p-2 rounded transition-all duration-300 ${
              warning.active ? `${warning.color} bg-gray-800 animate-pulse` : "text-gray-600 bg-gray-900"
            }`}
          >
            <div className="text-lg mb-1">{warning.icon}</div>
            <div className="text-xs font-mono">{warning.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RealTimeChart({ vehicle }: RealTimeChartProps) {
  const [data, setData] = useState<DataPoint[]>([])
  const [activeMetric, setActiveMetric] = useState("speed")

  useEffect(() => {
    // Initialize with realistic data points
    const initialData: DataPoint[] = []
    const now = Date.now()

    for (let i = 29; i >= 0; i--) {
      const timestamp = now - i * 2000
      const time = new Date(timestamp).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })

      initialData.push({
        time,
        timestamp,
        speed: Math.max(0, vehicle.currentReading.speed + (Math.random() - 0.5) * 20),
        rpm: Math.max(0, vehicle.currentReading.rpm + (Math.random() - 0.5) * 1000),
        temperature: Math.max(0, vehicle.currentReading.temperature + (Math.random() - 0.5) * 10),
        fuelLevel: Math.max(0, Math.min(100, vehicle.currentReading.fuelLevel - Math.random() * 0.5)),
        acceleration: (Math.random() - 0.5) * 6,
        brakePressure: Math.random() * 10,
        oilPressure: 2 + Math.random() * 4,
        batteryVoltage: 11.5 + Math.random() * 3,
      })
    }

    setData(initialData)
  }, [vehicle.id])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const time = new Date(now).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })

      const lastPoint = data[data.length - 1]
      const newPoint: DataPoint = {
        time,
        timestamp: now,
        speed: Math.max(0, vehicle.currentReading.speed + (Math.random() - 0.5) * 15),
        rpm: Math.max(0, vehicle.currentReading.rpm + (Math.random() - 0.5) * 800),
        temperature: Math.max(0, vehicle.currentReading.temperature + (Math.random() - 0.5) * 8),
        fuelLevel: Math.max(0, Math.min(100, (lastPoint?.fuelLevel || 50) - Math.random() * 0.2)),
        acceleration: (Math.random() - 0.5) * 4,
        brakePressure: Math.random() * 8,
        oilPressure: 2 + Math.random() * 3,
        batteryVoltage: 11.8 + Math.random() * 2.4,
      }

      setData((prev) => {
        const updated = [...prev, newPoint]
        return updated.slice(-30) // Keep last 30 points
      })
    }, 1500) // Update every 1.5 seconds for smoother animation

    return () => clearInterval(interval)
  }, [vehicle, data])

  const getMetricConfig = (metric: string) => {
    switch (metric) {
      case "speed":
        return {
          color: "#3b82f6",
          unit: "km/h",
          label: "Speed",
          dataKey: "speed",
          max: 200,
          dangerZone: 0.85,
          warningZone: 0.65,
        }
      case "rpm":
        return {
          color: "#10b981",
          unit: "RPM",
          label: "Engine RPM",
          dataKey: "rpm",
          max: 8000,
          dangerZone: 0.9,
          warningZone: 0.7,
        }
      case "temperature":
        return {
          color: "#ef4444",
          unit: "°C",
          label: "Engine Temperature",
          dataKey: "temperature",
          max: 120,
          dangerZone: 0.83,
          warningZone: 0.75,
        }
      case "fuelLevel":
        return {
          color: "#f59e0b",
          unit: "%",
          label: "Fuel Level",
          dataKey: "fuelLevel",
          max: 100,
          dangerZone: 0.15,
          warningZone: 0.25,
        }
      default:
        return {
          color: "#6b7280",
          unit: "",
          label: "Unknown",
          dataKey: "speed",
          max: 100,
          dangerZone: 0.8,
          warningZone: 0.6,
        }
    }
  }

  const config = getMetricConfig(activeMetric)
  const currentValue = data.length > 0 ? data[data.length - 1][config.dataKey as keyof DataPoint] : 0
  const previousValue = data.length > 1 ? data[data.length - 2][config.dataKey as keyof DataPoint] : currentValue
  const trend = typeof currentValue === "number" && typeof previousValue === "number" ? currentValue - previousValue : 0

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          Advanced Real-Time Telemetry
        </CardTitle>
        <CardDescription>Live automotive dashboard for Vehicle {vehicle.id}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeMetric} onValueChange={setActiveMetric} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="speed">Speed</TabsTrigger>
            <TabsTrigger value="rpm">RPM</TabsTrigger>
            <TabsTrigger value="temperature">Temperature</TabsTrigger>
            <TabsTrigger value="fuelLevel">Fuel</TabsTrigger>
          </TabsList>

          <TabsContent value={activeMetric} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Speedometer */}
              <div className="lg:col-span-1">
                <AdvancedSpeedometer
                  value={typeof currentValue === "number" ? currentValue : 0}
                  max={config.max}
                  unit={config.unit}
                  label={config.label}
                  color={config.color}
                  dangerZone={config.dangerZone}
                  warningZone={config.warningZone}
                />
              </div>

              {/* Digital Displays */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <DigitalDisplay
                    label="CURRENT"
                    value={typeof currentValue === "number" ? currentValue : 0}
                    unit={config.unit}
                    color={config.color}
                    trend={typeof trend === "number" ? trend : undefined}
                  />
                  <DigitalDisplay
                    label="AVERAGE"
                    value={
                      data.length > 0
                        ? data.reduce((sum, point) => sum + (point[config.dataKey as keyof DataPoint] as number), 0) /
                          data.length
                        : 0
                    }
                    unit={config.unit}
                    color={config.color}
                  />
                  <DigitalDisplay
                    label="MAXIMUM"
                    value={
                      data.length > 0
                        ? Math.max(...data.map((point) => point[config.dataKey as keyof DataPoint] as number))
                        : 0
                    }
                    unit={config.unit}
                    color={config.color}
                  />
                  <DigitalDisplay
                    label="MINIMUM"
                    value={
                      data.length > 0
                        ? Math.min(...data.map((point) => point[config.dataKey as keyof DataPoint] as number))
                        : 0
                    }
                    unit={config.unit}
                    color={config.color}
                  />
                </div>

                {/* Warning Lights */}
                <WarningLights vehicle={vehicle} />
              </div>
            </div>

            {/* Advanced Chart with Area Fill */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`gradient-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={config.color} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    interval="preserveStartEnd"
                    stroke="#6b7280"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    stroke="#6b7280"
                    domain={["dataMin - 5", "dataMax + 5"]}
                  />
                  <Tooltip
                    labelFormatter={(label) => `Time: ${label}`}
                    formatter={(value: number) => [`${value.toFixed(2)} ${config.unit}`, config.label]}
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#f9fafb",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={config.dataKey}
                    stroke={config.color}
                    strokeWidth={2}
                    fill={`url(#gradient-${activeMetric})`}
                    dot={false}
                    activeDot={{ r: 4, fill: config.color, strokeWidth: 2, stroke: "#ffffff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: config.color }} />
                <span className="text-sm font-medium text-white">{config.label} Monitor</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <span>Last Update: {data.length > 0 ? data[data.length - 1].time : "--:--:--"}</span>
                <Badge variant="outline" className="font-mono text-white border-gray-600">
                  {typeof currentValue === "number" ? currentValue.toFixed(2) : "--"} {config.unit}
                </Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
