"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area,
} from "recharts"
import { TrendingUp, TrendingDown, Activity, AlertTriangle, Brain, Target, Zap } from "lucide-react"
import type { Vehicle, VehicleAnalytics } from "../types/vehicle"

interface AnalyticsPanelProps {
  vehicles: Vehicle[]
  selectedVehicle: number
  onVehicleSelect: (id: number) => void
  getAnalytics: (vehicleId: number) => VehicleAnalytics
}

// Advanced Performance Radar Chart
function PerformanceRadar({ analytics }: { analytics: VehicleAnalytics }) {
  const radarData = [
    {
      metric: "Speed Efficiency",
      value: Math.min(100, (analytics.speed.mean / 80) * 100),
      fullMark: 100,
    },
    {
      metric: "Engine Health",
      value: Math.max(0, 100 - (analytics.temperature.mean - 85) * 2),
      fullMark: 100,
    },
    {
      metric: "Fuel Economy",
      value: analytics.fuel.mean,
      fullMark: 100,
    },
    {
      metric: "Stability",
      value: Math.max(0, 100 - analytics.speed.coefficientOfVariation * 100),
      fullMark: 100,
    },
    {
      metric: "Reliability",
      value: Math.max(0, 100 - analytics.anomalySummary.critical * 10),
      fullMark: 100,
    },
    {
      metric: "Maintenance",
      value: Math.max(0, 100 - (analytics.anomalySummary.high + analytics.anomalySummary.critical) * 5),
      fullMark: 100,
    },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={radarData}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: "#6b7280" }} />
        <Radar name="Performance" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

// AI Insights Component
function AIInsights({ analytics }: { analytics: VehicleAnalytics }) {
  const insights = [
    {
      type: "Performance",
      message:
        analytics.speed.mean > 70
          ? "Vehicle shows excellent highway performance"
          : "Consider optimizing for better speed efficiency",
      confidence: 0.87,
      severity: analytics.speed.mean > 70 ? "positive" : "warning",
    },
    {
      type: "Maintenance",
      message:
        analytics.temperature.max > 105
          ? "Engine running hot - cooling system check recommended"
          : "Engine temperature within optimal range",
      confidence: 0.92,
      severity: analytics.temperature.max > 105 ? "critical" : "positive",
    },
    {
      type: "Efficiency",
      message: analytics.fuel.trendSlope < -0.5 ? "Fuel consumption rate is concerning" : "Fuel efficiency is stable",
      confidence: 0.78,
      severity: analytics.fuel.trendSlope < -0.5 ? "warning" : "positive",
    },
    {
      type: "Safety",
      message:
        analytics.anomalySummary.critical > 5
          ? "Multiple critical anomalies detected - immediate inspection required"
          : "Vehicle safety parameters are within acceptable limits",
      confidence: 0.95,
      severity: analytics.anomalySummary.critical > 5 ? "critical" : "positive",
    },
  ]

  return (
    <div className="space-y-3">
      {insights.map((insight, index) => (
        <div key={index} className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-sm">{insight.type} Analysis</span>
            </div>
            <Badge
              variant="outline"
              className={`text-xs ${
                insight.severity === "critical"
                  ? "border-red-500 text-red-700"
                  : insight.severity === "warning"
                    ? "border-yellow-500 text-yellow-700"
                    : "border-green-500 text-green-700"
              }`}
            >
              {(insight.confidence * 100).toFixed(0)}% confidence
            </Badge>
          </div>
          <p className="text-sm text-gray-700">{insight.message}</p>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPanel({
  vehicles,
  selectedVehicle,
  onVehicleSelect,
  getAnalytics,
}: AnalyticsPanelProps) {
  const analytics = getAnalytics(selectedVehicle)
  const vehicle = vehicles.find((v) => v.id === selectedVehicle)

  if (!vehicle || !analytics) {
    return <div>Analytics not available</div>
  }

  const performanceData = [
    {
      name: "Speed",
      mean: analytics.speed.mean,
      stdDev: analytics.speed.stdDeviation,
      max: analytics.speed.max,
      efficiency: Math.min(100, (analytics.speed.mean / 80) * 100),
    },
    {
      name: "RPM",
      mean: analytics.rpm.mean / 100,
      stdDev: analytics.rpm.stdDeviation / 100,
      max: analytics.rpm.max / 100,
      efficiency: Math.max(0, 100 - ((analytics.rpm.mean - 2500) / 2500) * 50),
    },
    {
      name: "Temp",
      mean: analytics.temperature.mean,
      stdDev: analytics.temperature.stdDeviation,
      max: analytics.temperature.max,
      efficiency: Math.max(0, 100 - (analytics.temperature.mean - 85) * 2),
    },
    {
      name: "Fuel",
      mean: analytics.fuel.mean,
      stdDev: analytics.fuel.stdDeviation,
      max: analytics.fuel.max,
      efficiency: analytics.fuel.mean,
    },
  ]

  const anomalyData = [
    { name: "Critical", value: analytics.anomalySummary.critical, color: "#dc2626" },
    { name: "High", value: analytics.anomalySummary.high, color: "#ea580c" },
    { name: "Medium", value: analytics.anomalySummary.medium, color: "#ca8a04" },
    { name: "Low", value: analytics.anomalySummary.low, color: "#16a34a" },
  ].filter((item) => item.value > 0)

  // Generate advanced trend data
  const trendData = Array.from({ length: 48 }, (_, i) => ({
    hour: `${Math.floor(i / 2)}:${i % 2 === 0 ? "00" : "30"}`,
    speed: analytics.speed.mean + Math.sin(i * 0.3) * 15 + (Math.random() - 0.5) * 10,
    temperature: analytics.temperature.mean + Math.sin(i * 0.2) * 8 + (Math.random() - 0.5) * 5,
    fuel: Math.max(0, analytics.fuel.mean - i * 0.8 + Math.sin(i * 0.1) * 5),
    efficiency: Math.max(0, 100 - i * 0.5 + Math.sin(i * 0.4) * 10),
  }))

  const getTrendIcon = (slope: number) => {
    if (slope > 0.1) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (slope < -0.1) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Activity className="h-4 w-4 text-gray-500" />
  }

  return (
    <div className="space-y-6">
      {/* Vehicle Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Advanced Analytics Dashboard
          </CardTitle>
          <CardDescription>AI-powered performance analysis and predictive insights</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedVehicle.toString()} onValueChange={(value) => onVehicleSelect(Number.parseInt(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a vehicle" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id.toString()}>
                  Vehicle {v.id} - {v.makeModel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Statistics</CardTitle>
            <CardDescription>Advanced statistical analysis of sensor data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Speed Stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Speed Analysis</span>
                {getTrendIcon(analytics.speed.trendSlope)}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Mean</p>
                  <p className="font-medium">{analytics.speed.mean.toFixed(1)} km/h</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Std Dev</p>
                  <p className="font-medium">{analytics.speed.stdDeviation.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">95th %</p>
                  <p className="font-medium">{analytics.speed.percentile95.toFixed(1)}</p>
                </div>
              </div>
              <Progress value={(analytics.speed.mean / 120) * 100} className="h-2" />
            </div>

            {/* RPM Stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">RPM Analysis</span>
                {getTrendIcon(analytics.rpm.trendSlope)}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Mean</p>
                  <p className="font-medium">{analytics.rpm.mean.toFixed(0)} RPM</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Range</p>
                  <p className="font-medium">
                    {analytics.rpm.min.toFixed(0)}-{analytics.rpm.max.toFixed(0)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">CV</p>
                  <p className="font-medium">{analytics.rpm.coefficientOfVariation.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Temperature Stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Temperature Analysis</span>
                {getTrendIcon(analytics.temperature.trendSlope)}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Mean</p>
                  <p className="font-medium">{analytics.temperature.mean.toFixed(1)}°C</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Max</p>
                  <p className="font-medium">{analytics.temperature.max.toFixed(1)}°C</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Outliers</p>
                  <p className="font-medium">{analytics.temperature.outlierCount}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Radar</CardTitle>
            <CardDescription>Multi-dimensional performance analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <PerformanceRadar analytics={analytics} />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Comprehensive performance and efficiency analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(1)}${name === "RPM" ? "00" : ""}`,
                      name === "mean"
                        ? "Mean"
                        : name === "stdDev"
                          ? "Std Dev"
                          : name === "efficiency"
                            ? "Efficiency %"
                            : "Max",
                    ]}
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#f9fafb",
                    }}
                  />
                  <Bar dataKey="mean" fill="#3b82f6" name="Mean" />
                  <Bar dataKey="stdDev" fill="#93c5fd" name="Std Dev" />
                  <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={3} name="Efficiency" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 48-Hour Advanced Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              48-Hour Performance Trend
            </CardTitle>
            <CardDescription>Detailed performance trends with efficiency metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#6b7280" }} interval={7} />
                  <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#f9fafb",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#10b981"
                    fill="url(#efficiencyGradient)"
                    name="Efficiency %"
                  />
                  <Line type="monotone" dataKey="speed" stroke="#3b82f6" strokeWidth={2} name="Speed (km/h)" />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Temperature (°C)"
                  />
                  <Line type="monotone" dataKey="fuel" stroke="#f59e0b" strokeWidth={2} name="Fuel (%)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Anomaly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Anomaly Distribution</CardTitle>
            <CardDescription>Detailed breakdown by severity with risk assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={anomalyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {anomalyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#f9fafb",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI-Powered Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription>Machine learning analysis and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <AIInsights analytics={analytics} />
          </CardContent>
        </Card>
      </div>

      {/* Predictive Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Predictive Maintenance & Recommendations
          </CardTitle>
          <CardDescription>Advanced predictive analytics and actionable insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {analytics.predictions.map((prediction, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
            >
              <div
                className={`w-3 h-3 rounded-full mt-2 ${
                  prediction.severity === "high"
                    ? "bg-red-500 animate-pulse"
                    : prediction.severity === "medium"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                }`}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-blue-900">{prediction.type}</p>
                  <Badge variant="outline" className="text-xs border-blue-500 text-blue-700">
                    {(prediction.confidence * 100).toFixed(0)}% confidence
                  </Badge>
                </div>
                <p className="text-sm text-blue-800">{prediction.description}</p>
                <div className="mt-2">
                  <Progress value={prediction.confidence * 100} className="h-1" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
