'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 修复Leaflet默认图标问题
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Waypoint {
  lat: number;
  lng: number;
  name: string;
  description?: string;
}

interface RouteMapPreviewProps {
  waypoints: Waypoint[];
  gpxData?: string;
  className?: string;
}

// 自动调整地图边界
function FitBounds({ waypoints }: { waypoints: Waypoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (waypoints.length === 0) return;

    if (waypoints.length === 1) {
      map.setView([waypoints[0].lat, waypoints[0].lng], 13);
    } else {
      const bounds = L.latLngBounds(
        waypoints.map(wp => [wp.lat, wp.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [waypoints, map]);

  return null;
}

// 解析GPX数据获取轨迹点
function parseGpxTrackPoints(gpxData: string): [number, number][] {
  try {
    const parser = new DOMParser();
    const xml = parser.parseFromString(gpxData, 'text/xml');
    const trackPoints = Array.from(xml.querySelectorAll('trkpt'));

    return trackPoints
      .map(pt => {
        const lat = parseFloat(pt.getAttribute('lat') || '0');
        const lon = parseFloat(pt.getAttribute('lon') || '0');
        if (lat && lon) return [lat, lon] as [number, number];
        return null;
      })
      .filter((p): p is [number, number] => p !== null);
  } catch {
    return [];
  }
}

export function RouteMapPreview({ waypoints, gpxData, className = '' }: RouteMapPreviewProps) {
  const trackPoints = gpxData ? parseGpxTrackPoints(gpxData) : [];

  // 如果没有数据，显示空状态
  if (waypoints.length === 0 && trackPoints.length === 0) {
    return (
      <div className={`flex items-center justify-center rounded-lg border bg-muted/30 p-8 ${className}`}>
        <p className="text-sm text-muted-foreground">上传GPX文件后显示地图预览</p>
      </div>
    );
  }

  // 计算中心点
  const center: [number, number] = waypoints.length > 0
    ? [waypoints[0].lat, waypoints[0].lng]
    : trackPoints.length > 0
      ? trackPoints[0]
      : [35.8617, 104.1954]; // 中国中心

  return (
    <div className={`rounded-lg overflow-hidden border ${className}`}>
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: '300px', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 自动调整边界 */}
        <FitBounds waypoints={waypoints} />

        {/* GPX轨迹线 */}
        {trackPoints.length > 0 && (
          <Polyline
            positions={trackPoints}
            color="#3b82f6"
            weight={3}
            opacity={0.8}
          />
        )}

        {/* 途经点标记 */}
        {waypoints.map((wp, index) => (
          <Marker key={index} position={[wp.lat, wp.lng]}>
            <Popup>
              <div className="text-sm">
                <p className="font-medium">{wp.name}</p>
                {wp.description && (
                  <p className="text-muted-foreground">{wp.description}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
