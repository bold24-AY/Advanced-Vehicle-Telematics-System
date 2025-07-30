"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Search, Download, Clock, MapPin } from "lucide-react"
import type { Anomaly, Vehicle } from "../types/vehicle"

interface AnomalyMonitorProps {
  anomalies: Anomaly[]
  vehicles: Vehicle[]
}

export default function AnomalyMonitor({ anomalies, vehicles }: AnomalyMonitorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [vehicleFilter, setVehicleFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Filter anomalies
  const filteredAnomalies = anomalies.filter((anomaly) => {
    const matchesSearch =
      anomaly.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anomaly.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = severityFilter === "all" || anomaly.severity.toString() === severityFilter
    const matchesVehicle = vehicleFilter === "all" || anomaly.vehicleId.toString() === vehicleFilter
    const matchesType = typeFilter === "all" || anomaly.type === typeFilter

    return matchesSearch && matchesSeverity && matchesVehicle && matchesType
  })

  // Get unique anomaly types
  const anomalyTypes = [...new Set(anomalies.map((a) => a.type))]

  const getSeverityColor = (severity: number) => {
    if (severity >= 4) return "bg-red-500"
    if (severity >= 3) return "bg-yellow-500"
    if (severity >= 2) return "bg-blue-500"
    return "bg-green-500"
  }

  const getSeverityLabel = (severity: number) => {
    if (severity >= 4) return "CRITICAL"
    if (severity >= 3) return "HIGH"
    if (severity >= 2) return "MEDIUM"
    return "LOW"
  }

  const exportAnomalies = () => {
    const csvContent = [
      "Timestamp,Vehicle ID,Type,Description,Severity,Value,Location",
      ...filteredAnomalies.map(
        (a) =>
          `${a.timestamp},${a.vehicleId},${a.type},${a.description},${a.severity},${a.value},${a.location || "N/A"}`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `anomalies_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Anomaly Monitor
          </CardTitle>
          <CardDescription>
            Real-time anomaly detection and analysis - {filteredAnomalies.length} of {anomalies.length} anomalies shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search anomalies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="5">Critical (5)</SelectItem>
                <SelectItem value="4">High (4)</SelectItem>
                <SelectItem value="3">Medium (3)</SelectItem>
                <SelectItem value="2">Low (2)</SelectItem>
                <SelectItem value="1">Info (1)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Vehicle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id.toString()}>
                    Vehicle {v.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {anomalyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={exportAnomalies} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Anomaly Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{anomalies.filter((a) => a.severity >= 4).length}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High</p>
                <p className="text-2xl font-bold text-yellow-600">{anomalies.filter((a) => a.severity === 3).length}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Medium</p>
                <p className="text-2xl font-bold text-blue-600">{anomalies.filter((a) => a.severity === 2).length}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{anomalies.length}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anomaly List */}
      <Card>
        <CardHeader>
          <CardTitle>Anomaly Details</CardTitle>
          <CardDescription>Detailed view of detected anomalies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredAnomalies.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No anomalies match the current filters</p>
            ) : (
              filteredAnomalies.map((anomaly, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                  <div className={`w-3 h-3 rounded-full mt-2 ${getSeverityColor(anomaly.severity)}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{anomaly.type}</h4>
                        <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                      </div>
                      <Badge variant="outline">{getSeverityLabel(anomaly.severity)}</Badge>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(anomaly.timestamp).toLocaleString()}
                      </div>
                      <div>Vehicle {anomaly.vehicleId}</div>
                      <div>Value: {anomaly.value.toFixed(2)}</div>
                      {anomaly.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {anomaly.location}
                        </div>
                      )}
                      {anomaly.mlScore && <div>ML Score: {anomaly.mlScore.toFixed(2)}</div>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
