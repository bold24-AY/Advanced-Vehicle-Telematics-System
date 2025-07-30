"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Square, Download, Settings, Activity, Database, Cpu, HardDrive, Wifi } from "lucide-react"
import type { SystemStats } from "../types/vehicle"

interface SystemControlsProps {
  isRunning: boolean
  isPaused: boolean
  systemStats: SystemStats
  onToggleSimulation: () => void
  onPauseResume: () => void
  onExportData: () => void
}

export default function SystemControls({
  isRunning,
  isPaused,
  systemStats,
  onToggleSimulation,
  onPauseResume,
  onExportData,
}: SystemControlsProps) {
  return (
    <div className="space-y-6">
      {/* System Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Controls
          </CardTitle>
          <CardDescription>Manage simulation and system operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={onToggleSimulation}
              variant={isRunning ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Square className="h-4 w-4" />
                  Stop Simulation
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Simulation
                </>
              )}
            </Button>

            {isRunning && (
              <Button onClick={onPauseResume} variant="outline" className="flex items-center gap-2 bg-transparent">
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause
                  </>
                )}
              </Button>
            )}

            <Button onClick={onExportData} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export Data (CSV + JSON)
            </Button>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">📊 Advanced Data Analysis</h4>
            <p className="text-sm text-blue-800 mb-2">
              After exporting CSV files, you can run advanced analysis using Python:
            </p>
            <code className="text-xs bg-blue-100 px-2 py-1 rounded">python scripts/analyze_telematics_data.py</code>
            <p className="text-xs text-blue-600 mt-1">
              This will generate comprehensive visualizations and insights from your exported data.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Processing Rate</span>
                <span className="text-sm font-medium">{systemStats.readingsPerSecond}/sec</span>
              </div>
              <Progress value={(systemStats.readingsPerSecond / 50) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">System Health</span>
                <span className="text-sm font-medium">{systemStats.systemHealth.toFixed(1)}%</span>
              </div>
              <Progress value={systemStats.systemHealth} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Memory Usage</span>
                <span className="text-sm font-medium">{systemStats.memoryUsage.toFixed(1)} MB</span>
              </div>
              <Progress value={(systemStats.memoryUsage / 1000) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">CPU Usage</span>
                <span className="text-sm font-medium">{systemStats.cpuUsage.toFixed(1)}%</span>
              </div>
              <Progress value={systemStats.cpuUsage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Readings</p>
                <p className="text-2xl font-bold">{systemStats.totalReadings.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Anomalies</p>
                <p className="text-2xl font-bold">{systemStats.totalAnomalies.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-lg font-medium">{systemStats.uptime}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data Rate</p>
                <p className="text-lg font-medium">{(systemStats.totalReadings / 3600).toFixed(1)}/hr</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Anomaly Detection Rate</span>
                <span className="text-sm font-medium">
                  {((systemStats.totalAnomalies / systemStats.totalReadings) * 100).toFixed(2)}%
                </span>
              </div>
              <Progress value={(systemStats.totalAnomalies / systemStats.totalReadings) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Components Status */}
      <Card>
        <CardHeader>
          <CardTitle>Component Status</CardTitle>
          <CardDescription>Status of system components and services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Cpu className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Data Processing</p>
                <Badge variant="outline" className="text-xs">
                  {isRunning ? "Active" : "Stopped"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Anomaly Detection</p>
                <Badge variant="outline" className="text-xs">
                  {isRunning ? "Active" : "Stopped"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <HardDrive className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Data Storage</p>
                <Badge variant="outline" className="text-xs">
                  Online
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Wifi className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Network</p>
                <Badge variant="outline" className="text-xs">
                  Connected
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent System Events */}
      <Card>
        <CardHeader>
          <CardTitle>System Events</CardTitle>
          <CardDescription>Recent system activities and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemStats.recentEvents.map((event, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    event.type === "error" ? "bg-red-500" : event.type === "warning" ? "bg-yellow-500" : "bg-green-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm">{event.message}</p>
                  <p className="text-xs text-muted-foreground">{event.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
