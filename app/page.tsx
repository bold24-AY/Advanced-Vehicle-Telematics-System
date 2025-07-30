"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Car, Activity, AlertTriangle, Gauge, Pause, BarChart3, Shield, Zap } from "lucide-react"
import VehicleDashboard from "./components/VehicleDashboard"
import AnalyticsPanel from "./components/AnalyticsPanel"
import AnomalyMonitor from "./components/AnomalyMonitor"
import SystemControls from "./components/SystemControls"
import { useVehicleData } from "./hooks/useVehicleData"

export default function VehicleTelematicsSystem() {
  const {
    vehicles,
    anomalies,
    systemStats,
    isRunning,
    isPaused,
    toggleSimulation,
    pauseResume,
    exportData,
    getVehicleAnalytics,
  } = useVehicleData()

  const [selectedVehicle, setSelectedVehicle] = useState<number>(1)
  const [activeTab, setActiveTab] = useState("dashboard")

  // Get system overview stats
  const totalVehicles = vehicles.length
  const activeVehicles = vehicles.filter((v) => v.state !== "OFFLINE").length
  const criticalAlerts = anomalies.filter((a) => a.severity >= 4).length
  const recentAnomalies = anomalies.filter((a) => {
    const now = new Date()
    const anomalyTime = new Date(a.timestamp)
    return now.getTime() - anomalyTime.getTime() < 5 * 60 * 1000 // Last 5 minutes
  }).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Car className="h-8 w-8 text-blue-600" />
              Advanced Vehicle Telematics System
            </h1>
            <p className="text-slate-600 mt-1">
              Real-time monitoring, ML-powered anomaly detection, and predictive analytics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isRunning ? "default" : "secondary"} className="px-3 py-1">
              {isRunning ? (
                <>
                  <Activity className="h-3 w-3 mr-1" />
                  Live
                </>
              ) : (
                <>
                  <Pause className="h-3 w-3 mr-1" />
                  Stopped
                </>
              )}
            </Badge>
            {isPaused && (
              <Badge variant="outline" className="px-3 py-1">
                <Pause className="h-3 w-3 mr-1" />
                Paused
              </Badge>
            )}
          </div>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVehicles}</div>
              <p className="text-xs text-muted-foreground">
                {activeVehicles} active, {totalVehicles - activeVehicles} offline
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{criticalAlerts}</div>
              <p className="text-xs text-muted-foreground">{recentAnomalies} in last 5 minutes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Points</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalReadings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{systemStats.readingsPerSecond}/sec current rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{Math.round(systemStats.systemHealth)}%</div>
              <Progress value={systemStats.systemHealth} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts Banner */}
        {criticalAlerts > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>{criticalAlerts} critical alerts</strong> require immediate attention. Check the Anomaly Monitor
              for details.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="anomalies" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Anomalies
            </TabsTrigger>
            <TabsTrigger value="controls" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Controls
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <VehicleDashboard
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              onVehicleSelect={setSelectedVehicle}
              anomalies={anomalies}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsPanel
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              onVehicleSelect={setSelectedVehicle}
              getAnalytics={getVehicleAnalytics}
            />
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-4">
            <AnomalyMonitor anomalies={anomalies} vehicles={vehicles} />
          </TabsContent>

          <TabsContent value="controls" className="space-y-4">
            <SystemControls
              isRunning={isRunning}
              isPaused={isPaused}
              systemStats={systemStats}
              onToggleSimulation={toggleSimulation}
              onPauseResume={pauseResume}
              onExportData={exportData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
