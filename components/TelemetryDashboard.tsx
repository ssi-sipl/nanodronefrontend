"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  MapPin,
  Target,
  Gauge,
  Satellite,
  Navigation,
  Activity,
} from "lucide-react";
import socket from "@/lib/socket";

interface TelemetryData {
  altitude?: number;
  lat?: number;
  lon?: number;
  distanceToTarget?: number;
  speed?: number;
  gps?: string;
  satCount?: number;
}

export default function TelemetryDashboard() {
  const [data, setData] = useState<TelemetryData>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("telemetry", (incomingData: TelemetryData) => {
      console.log("Telemetry data received:", incomingData);
      setData(incomingData);
    });

    return () => {
      socket.off("telemetry");
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);

  const getGpsStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "connected":
      case "active":
      case "good":
        return "bg-green-500";
      case "searching":
      case "weak":
        return "bg-yellow-500";
      case "disconnected":
      case "lost":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatCoordinate = (coord?: number) => {
    if (coord === undefined || coord === null) return "-";
    return coord.toFixed(6);
  };

  const formatDistance = (distance?: number) => {
    if (distance === undefined || distance === null) return "-";
    return `${distance.toFixed(1)} m`;
  };

  const formatSpeed = (speed?: number) => {
    if (speed === undefined || speed === null) return "-";
    return `${speed.toFixed(1)} m/s`;
  };

  const formatAltitude = (altitude?: number) => {
    if (altitude === undefined || altitude === null) return "-";
    return `${altitude.toFixed(1)} m`;
  };

  return (
    <div className="p-4 space-y-6 mt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Drone Telemetry</h1>
          {/* <p className="text-muted-foreground">
            Real-time flight data monitoring
          </p> */}
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm font-medium">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Altitude */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Altitude</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAltitude(data.altitude)}
            </div>
            <p className="text-xs text-muted-foreground">Above sea level</p>
          </CardContent>
        </Card>

        {/* Speed */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Speed</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatSpeed(data.speed)}</div>
            <p className="text-xs text-muted-foreground">Ground speed</p>
          </CardContent>
        </Card>

        {/* Distance to Target */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Distance to Target
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDistance(data.distanceToTarget)}
            </div>
            <p className="text-xs text-muted-foreground">
              Straight line distance
            </p>
          </CardContent>
        </Card>

        {/* GPS Status */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GPS Status</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={`${getGpsStatusColor(data.gps)} text-white border-0`}
              >
                {data.gps || "Unknown"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Signal status</p>
          </CardContent>
        </Card>

        {/* Satellite Count */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satellites</CardTitle>
            <Satellite className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.satCount ?? "-"}</div>
            <p className="text-xs text-muted-foreground">
              Connected satellites
            </p>
          </CardContent>
        </Card>

        {/* Latitude */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latitude</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCoordinate(data.lat)}
            </div>
            <p className="text-xs text-muted-foreground">Degrees North</p>
          </CardContent>
        </Card>

        {/* Longitude */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Longitude</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCoordinate(data.lon)}
            </div>
            <p className="text-xs text-muted-foreground">Degrees East</p>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={`${
                  isConnected ? "bg-green-500" : "bg-red-500"
                } text-white border-0`}
              >
                {isConnected ? "Online" : "Offline"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Telemetry link</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
