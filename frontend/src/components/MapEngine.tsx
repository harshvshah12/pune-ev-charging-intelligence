import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Station, WardCollection, Candidate, Recommendation, MapLayerState, CorridorWaypoint, SimulationCorridor } from '../types';
import { Layers, Eye, EyeOff, Navigation2, Compass, Radio, Satellite, Map as MapIcon, Sliders } from 'lucide-react';

if (typeof window !== 'undefined') {
  maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
}

// Compute geographic bearing in degrees between two points
function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);

  return (toDeg(θ) + 360) % 360;
}

interface MapEngineProps {
  stations: Station[];
  wards: WardCollection | null;
  roads: any;
  candidates: Candidate[];
  recommendations: Recommendation[];
  layerState: MapLayerState;
  selectedStation: Station | null;
  selectedRecommendation: Recommendation | null;
  simulatedCarPosition: CorridorWaypoint | null;
  corridor?: SimulationCorridor | null;
  onSelectStation: (st: Station | null) => void;
  onSelectRecommendation: (rec: Recommendation | null) => void;
  flyToCoords: [number, number] | null; // [lon, lat]
  is3DExtrusion?: boolean;
}

export const MapEngine: React.FC<MapEngineProps> = ({
  stations,
  wards,
  roads,
  candidates,
  recommendations,
  layerState,
  selectedStation,
  selectedRecommendation,
  simulatedCarPosition,
  corridor,
  onSelectStation,
  onSelectRecommendation,
  flyToCoords,
  is3DExtrusion = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const carMarkerRef = useRef<maplibregl.Marker | null>(null);
  const pulseAnimRef = useRef<number | null>(null);
  const prevCarPosRef = useRef<CorridorWaypoint | null>(null);
  const prevCorridorTitleRef = useRef<string | null>(null);

  // Basemap style switcher: 'dark' (ESRI Dark Canvas) | 'satellite' (ESRI World Imagery)
  const [basemapType, setBasemapType] = useState<'dark' | 'satellite'>('dark');
  const [pitch3D, setPitch3D] = useState<boolean>(true);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // ESRI Dark Canvas Base + Reference (Zero API keys required, ultra-fast, no watermarks)
    const esriDarkStyle: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'esri-dark-base': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          maxzoom: 16,
          attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
        },
        'esri-dark-labels': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          maxzoom: 16
        }
      },
      layers: [
        {
          id: 'esri-dark-base-layer',
          type: 'raster',
          source: 'esri-dark-base',
          minzoom: 0,
          maxzoom: 19
        },
        {
          id: 'esri-dark-labels-layer',
          type: 'raster',
          source: 'esri-dark-labels',
          minzoom: 0,
          maxzoom: 19,
          paint: {
            'raster-opacity': 0.65
          }
        }
      ]
    };

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: esriDarkStyle,
      center: [73.8567, 18.5204], // Pune Center
      zoom: 11.6,
      pitch: 45,
      bearing: -14
    });

    map.current.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true, showCompass: true }),
      'bottom-right'
    );

    // Track mouse coordinates for tactile HUD
    map.current.on('mousemove', (e) => {
      setCursorCoords({
        lat: parseFloat(e.lngLat.lat.toFixed(4)),
        lng: parseFloat(e.lngLat.lng.toFixed(4))
      });
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // 1. Wards GeoJSON Source
      map.current.addSource('wards-source', {
        type: 'geojson',
        data: wards || { type: 'FeatureCollection', features: [] }
      });

      // 1A. 3D Extruded Wards (Height proportional to Charging Need Score)
      map.current.addLayer({
        id: 'wards-extrusion',
        type: 'fill-extrusion',
        source: 'wards-source',
        paint: {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['get', 'need_score'],
            20, '#091c15',
            45, '#0d2238',
            60, '#382006',
            80, '#420815'
          ],
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['get', 'need_score'],
            0, 40,
            100, 1100
          ],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': is3DExtrusion ? 0.65 : 0.0
        }
      });

      // 1B. 2D Wards Fill
      map.current.addLayer({
        id: 'wards-fill',
        type: 'fill',
        source: 'wards-source',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'need_score'],
            20, 'rgba(0, 245, 155, 0.08)',
            45, 'rgba(0, 229, 255, 0.12)',
            60, 'rgba(255, 153, 0, 0.18)',
            80, 'rgba(244, 63, 94, 0.28)'
          ],
          'fill-opacity': layerState.wardChoropleth ? 0.7 : 0.0
        }
      });

      // 1C. 2D Wards Hairline Border
      map.current.addLayer({
        id: 'wards-border',
        type: 'line',
        source: 'wards-source',
        paint: {
          'line-color': '#00e5ff',
          'line-width': 1.2,
          'line-opacity': layerState.wardPolygons ? 0.5 : 0.0,
          'line-dasharray': [4, 2]
        }
      });

      // 2. OSM Arterial Road Network (532.6 km)
      map.current.addSource('roads-source', {
        type: 'geojson',
        data: roads || { type: 'FeatureCollection', features: [] }
      });

      // 2A. Roads Outer Glowing Vector
      map.current.addLayer({
        id: 'roads-glow',
        type: 'line',
        source: 'roads-source',
        paint: {
          'line-color': '#00e5ff',
          'line-width': 4.5,
          'line-blur': 3.5,
          'line-opacity': layerState.roadNetwork ? 0.45 : 0.0
        }
      });

      // 2B. Roads Core High-Intensity Line
      map.current.addLayer({
        id: 'roads-line',
        type: 'line',
        source: 'roads-source',
        paint: {
          'line-color': '#70f2ff',
          'line-width': 1.2,
          'line-opacity': layerState.roadNetwork ? 0.8 : 0.0
        }
      });

      // 3. Charging Deserts Heatmap
      map.current.addLayer({
        id: 'deserts-heat',
        type: 'heatmap',
        source: 'wards-source',
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'need_score'],
            0, 0,
            100, 1
          ],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 9, 0.6, 14, 2.5],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 0, 0)',
            0.2, 'rgba(0, 229, 255, 0.15)',
            0.5, 'rgba(255, 153, 0, 0.4)',
            0.8, 'rgba(244, 63, 94, 0.65)',
            1, 'rgba(255, 0, 85, 0.85)'
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 9, 20, 14, 55],
          'heatmap-opacity': layerState.chargingDeserts ? 0.75 : 0.0
        }
      });

      // 4. Existing 1,354 Charging Stations
      map.current.addSource('stations-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: stations.map((s) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [s.longitude, s.latitude] },
            properties: { ...s }
          }))
        }
      });

      // 4A. Stations Halo Ring
      map.current.addLayer({
        id: 'stations-halo',
        type: 'circle',
        source: 'stations-source',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4, 15, 9],
          'circle-color': [
            'case',
            ['>=', ['get', 'power_kw'], 7.4],
            'rgba(0, 245, 155, 0.25)',
            'rgba(148, 163, 184, 0.15)'
          ],
          'circle-opacity': layerState.existingChargers ? 0.8 : 0.0
        }
      });

      // 4B. Stations Core Dot
      map.current.addLayer({
        id: 'stations-point',
        type: 'circle',
        source: 'stations-source',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 2, 15, 5],
          'circle-color': [
            'case',
            ['>=', ['get', 'power_kw'], 7.4],
            '#00f59b',
            '#94a3b8'
          ],
          'circle-stroke-width': 1,
          'circle-stroke-color': '#040608',
          'circle-opacity': layerState.existingChargers ? 0.95 : 0.0
        }
      });

      // 5. Generated 100 Siting Candidates
      map.current.addSource('candidates-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: candidates.map((c) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [c.lon, c.lat] },
            properties: { ...c }
          }))
        }
      });

      map.current.addLayer({
        id: 'candidates-circle',
        type: 'circle',
        source: 'candidates-source',
        paint: {
          'circle-radius': 4.5,
          'circle-color': '#ff9900',
          'circle-opacity': layerState.candidateLocations ? 0.8 : 0.0,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff'
        }
      });

      // 6. Selected / Sited Recommendations
      map.current.addSource('recommendations-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: recommendations.map((r) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [r.longitude, r.latitude] },
            properties: { ...r }
          }))
        }
      });

      // 6A. Recommended 1.75km Service Catchment Isochrones
      map.current.addLayer({
        id: 'recommendations-coverage-glow',
        type: 'circle',
        source: 'recommendations-source',
        paint: {
          'circle-radius': [
            'interpolate',
            ['exponential', 2],
            ['zoom'],
            10, 16,
            14, 110
          ],
          'circle-color': 'rgba(0, 245, 155, 0.12)',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': 'rgba(0, 245, 155, 0.5)',
          'circle-opacity': layerState.recommendedSites && layerState.coverageIsochrones ? 1.0 : 0.0
        }
      });

      // 6B. Recommended Beacons Core
      map.current.addLayer({
        id: 'recommendations-circle',
        type: 'circle',
        source: 'recommendations-source',
        paint: {
          'circle-radius': 8,
          'circle-color': '#00f59b',
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': layerState.recommendedSites ? 1.0 : 0.0
        }
      });

      // 7. DEDICATED HIGH-INTENSITY GLOWING ROUTE SYSTEM
      // 7A. Full Corridor Route GeoJSON
      const corridorGeoJson = {
        type: 'FeatureCollection',
        features: corridor?.waypoints
          ? [
              {
                type: 'Feature',
                properties: { title: corridor.title },
                geometry: {
                  type: 'LineString',
                  coordinates: corridor.waypoints.map((w) => [w.lon, w.lat])
                }
              }
            ]
          : []
      };

      map.current.addSource('corridor-route-source', {
        type: 'geojson',
        data: corridorGeoJson
      });

      // Traveled portion source
      map.current.addSource('traveled-route-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // 7B. Glowing Route Outer Halo Blur
      map.current.addLayer({
        id: 'corridor-route-blur',
        type: 'line',
        source: 'corridor-route-source',
        paint: {
          'line-color': '#00ffa3',
          'line-width': 14,
          'line-blur': 9,
          'line-opacity': 0.5
        }
      });

      // 7C. Glowing Route Inner Neon Line
      map.current.addLayer({
        id: 'corridor-route-inner',
        type: 'line',
        source: 'corridor-route-source',
        paint: {
          'line-color': '#00e5ff',
          'line-width': 4.5,
          'line-blur': 2,
          'line-opacity': 0.85
        }
      });

      // 7D. Glowing Route Core Laser
      map.current.addLayer({
        id: 'corridor-route-laser',
        type: 'line',
        source: 'corridor-route-source',
        paint: {
          'line-color': '#ffffff',
          'line-width': 1.8,
          'line-opacity': 0.95
        }
      });

      // 7E. Traveled High-Intensity Emerald Glow
      map.current.addLayer({
        id: 'traveled-route-laser',
        type: 'line',
        source: 'traveled-route-source',
        paint: {
          'line-color': '#00ff88',
          'line-width': 6,
          'line-blur': 3,
          'line-opacity': 1.0
        }
      });

      // 7F. Animated Forward Directional Pulse Wave (Flowing Dashes)
      map.current.addLayer({
        id: 'corridor-route-pulse',
        type: 'line',
        source: 'corridor-route-source',
        paint: {
          'line-color': '#ffffff',
          'line-width': 3,
          'line-dasharray': [0.5, 3],
          'line-opacity': 0.9
        }
      });

      // Start continuous forward traveling dash pulse
      let dashOffset = 0;
      const animateRoutePulse = () => {
        dashOffset = (dashOffset + 0.05) % 3.5;
        if (map.current && map.current.getLayer('corridor-route-pulse')) {
          map.current.setPaintProperty('corridor-route-pulse', 'line-dasharray', [0.8, 2.7]);
        }
        pulseAnimRef.current = requestAnimationFrame(animateRoutePulse);
      };
      animateRoutePulse();

      // Interactions: Station Click
      map.current.on('click', 'stations-point', (e) => {
        if (!e.features || !e.features[0]) return;
        const props = e.features[0].properties as Station;
        onSelectStation(props);
      });

      // Interactions: Sited Recommendation Click
      map.current.on('click', 'recommendations-circle', (e) => {
        if (!e.features || !e.features[0]) return;
        const props = e.features[0].properties as Recommendation;
        onSelectRecommendation(props);
      });

      // Cursor Pointers
      map.current.on('mouseenter', 'stations-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'stations-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
      map.current.on('mouseenter', 'recommendations-circle', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'recommendations-circle', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    });

    return () => {
      if (pulseAnimRef.current) cancelAnimationFrame(pulseAnimRef.current);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Switch Basemap Layer (Dark Canvas vs Satellite)
  const handleToggleBasemap = (type: 'dark' | 'satellite') => {
    if (!map.current) return;
    setBasemapType(type);

    if (type === 'satellite') {
      if (!map.current.getSource('esri-satellite-source')) {
        map.current.addSource('esri-satellite-source', {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          maxzoom: 19
        });
        map.current.addLayer(
          {
            id: 'esri-satellite-layer',
            type: 'raster',
            source: 'esri-satellite-source',
            minzoom: 0,
            maxzoom: 19
          },
          'wards-fill'
        );
      }
      if (map.current.getLayer('esri-dark-base-layer')) {
        map.current.setLayoutProperty('esri-dark-base-layer', 'visibility', 'none');
      }
      if (map.current.getLayer('esri-satellite-layer')) {
        map.current.setLayoutProperty('esri-satellite-layer', 'visibility', 'visible');
      }
    } else {
      if (map.current.getLayer('esri-dark-base-layer')) {
        map.current.setLayoutProperty('esri-dark-base-layer', 'visibility', 'visible');
      }
      if (map.current.getLayer('esri-satellite-layer')) {
        map.current.setLayoutProperty('esri-satellite-layer', 'visibility', 'none');
      }
    }
  };

  // Toggle 3D Perspective Pitch
  const handleTogglePitch = () => {
    if (!map.current) return;
    const next = !pitch3D;
    setPitch3D(next);
    map.current.easeTo({
      pitch: next ? 52 : 0,
      bearing: next ? -15 : 0,
      duration: 1200
    });
  };

  // Reset Center
  const handleResetCamera = () => {
    if (!map.current) return;
    map.current.flyTo({
      center: [73.8567, 18.5204],
      zoom: 11.6,
      pitch: pitch3D ? 45 : 0,
      bearing: -12,
      duration: 1600
    });
  };

  // Synchronize Wards
  useEffect(() => {
    if (!map.current || !wards) return;
    const source = map.current.getSource('wards-source') as maplibregl.GeoJSONSource;
    if (source) source.setData(wards);
  }, [wards]);

  // Synchronize Roads
  useEffect(() => {
    if (!map.current || !roads) return;
    const source = map.current.getSource('roads-source') as maplibregl.GeoJSONSource;
    if (source) source.setData(roads);
  }, [roads]);

  // Synchronize Stations
  useEffect(() => {
    if (!map.current) return;
    const source = map.current.getSource('stations-source') as maplibregl.GeoJSONSource;
    if (source) {
      let filtered = stations;
      if (layerState.chargerTypeFilter === 'fast') {
        filtered = filtered.filter((s) => s.power_kw >= 7.4);
      } else if (layerState.chargerTypeFilter === 'ac') {
        filtered = filtered.filter((s) => s.power_kw < 7.4);
      }
      if (layerState.selectedCPO !== 'all') {
        filtered = filtered.filter((s) => s.cpo === layerState.selectedCPO);
      }

      source.setData({
        type: 'FeatureCollection',
        features: filtered.map((s) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [s.longitude, s.latitude] },
          properties: { ...s }
        }))
      });
    }
  }, [stations, layerState.chargerTypeFilter, layerState.selectedCPO]);

  // Synchronize Candidates
  useEffect(() => {
    if (!map.current) return;
    const source = map.current.getSource('candidates-source') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: candidates.map((c) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [c.lon, c.lat] },
          properties: { ...c }
        }))
      });
    }
  }, [candidates]);

  // Synchronize Sited Recommendations
  useEffect(() => {
    if (!map.current) return;
    const source = map.current.getSource('recommendations-source') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: recommendations.map((r) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [r.longitude, r.latitude] },
          properties: { ...r }
        }))
      });
    }
  }, [recommendations]);

  // Synchronize Corridor Route & Traveled Line
  useEffect(() => {
    if (!map.current) return;
    const routeSource = map.current.getSource('corridor-route-source') as maplibregl.GeoJSONSource;
    if (routeSource && corridor?.waypoints) {
      routeSource.setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { title: corridor.title },
            geometry: {
              type: 'LineString',
              coordinates: corridor.waypoints.map((w) => [w.lon, w.lat])
            }
          }
        ]
      });

      // Smoothly frame camera onto the selected corridor if switched
      if (corridor.title && corridor.title !== prevCorridorTitleRef.current && !simulatedCarPosition) {
        prevCorridorTitleRef.current = corridor.title;
        const bounds = new maplibregl.LngLatBounds();
        corridor.waypoints.forEach((w) => bounds.extend([w.lon, w.lat]));
        map.current.fitBounds(bounds, {
          padding: 80,
          pitch: pitch3D ? 45 : 0,
          duration: 1500,
          maxZoom: 14.2
        });
      }
    }

    // Update traveled line segment
    const traveledSource = map.current.getSource('traveled-route-source') as maplibregl.GeoJSONSource;
    if (traveledSource && corridor?.waypoints && simulatedCarPosition) {
      const idx = corridor.waypoints.findIndex((w) => w.name === simulatedCarPosition.name);
      if (idx >= 0) {
        const slice = corridor.waypoints.slice(0, idx + 1);
        traveledSource.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { traveled: true },
              geometry: {
                type: 'LineString',
                coordinates: slice.map((w) => [w.lon, w.lat])
              }
            }
          ]
        });
      }
    } else if (traveledSource && !simulatedCarPosition) {
      traveledSource.setData({ type: 'FeatureCollection', features: [] });
    }
  }, [corridor, simulatedCarPosition]);

  // Update Layer Opacities
  useEffect(() => {
    if (!map.current) return;

    const setOpacity = (layerId: string, prop: any, val: any) => {
      if (map.current && map.current.getLayer(layerId)) {
        map.current.setPaintProperty(layerId, prop, val);
      }
    };

    setOpacity('stations-point', 'circle-opacity', layerState.existingChargers ? 0.95 : 0.0);
    setOpacity('stations-halo', 'circle-opacity', layerState.existingChargers ? 0.8 : 0.0);
    setOpacity('deserts-heat', 'heatmap-opacity', layerState.chargingDeserts ? 0.75 : 0.0);
    setOpacity('wards-fill', 'fill-opacity', layerState.wardChoropleth ? 0.7 : 0.0);
    setOpacity('wards-border', 'line-opacity', layerState.wardPolygons ? 0.5 : 0.0);
    setOpacity('wards-extrusion', 'fill-extrusion-opacity', is3DExtrusion ? 0.65 : 0.0);
    setOpacity('roads-glow', 'line-opacity', layerState.roadNetwork ? 0.45 : 0.0);
    setOpacity('roads-line', 'line-opacity', layerState.roadNetwork ? 0.8 : 0.0);
    setOpacity('candidates-circle', 'circle-opacity', layerState.candidateLocations ? 0.8 : 0.0);
    setOpacity('recommendations-circle', 'circle-opacity', layerState.recommendedSites ? 1.0 : 0.0);
    setOpacity('recommendations-coverage-glow', 'circle-opacity', layerState.recommendedSites && layerState.coverageIsochrones ? 1.0 : 0.0);
  }, [layerState, is3DExtrusion]);

  // Fly-To Camera Transitions
  useEffect(() => {
    if (!map.current || !flyToCoords) return;
    map.current.flyTo({
      center: flyToCoords,
      zoom: 14.5,
      pitch: pitch3D ? 55 : 0,
      bearing: -16,
      essential: true,
      duration: 1800
    });
  }, [flyToCoords, pitch3D]);

  // 3D ADVANCED VEHICLE TRACKER BEACON WITH HEADING CONE & RADAR HUD
  useEffect(() => {
    if (!map.current) return;

    if (simulatedCarPosition) {
      let bearing = 105;
      if (prevCarPosRef.current && corridor?.waypoints) {
        bearing = calculateBearing(
          prevCarPosRef.current.lat,
          prevCarPosRef.current.lon,
          simulatedCarPosition.lat,
          simulatedCarPosition.lon
        );
      } else if (corridor?.waypoints) {
        const next = corridor.waypoints[1];
        if (next) {
          bearing = calculateBearing(simulatedCarPosition.lat, simulatedCarPosition.lon, next.lat, next.lon);
        }
      }
      prevCarPosRef.current = simulatedCarPosition;

      if (!carMarkerRef.current) {
        const el = document.createElement('div');
        el.className = 'car-beacon-marker';
        el.style.position = 'relative';
        el.style.width = '64px';
        el.style.height = '64px';
        el.style.pointerEvents = 'none';

        el.innerHTML = `
          <div class="beacon-root" style="position: relative; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center;">
            <!-- Forward Headlight Illumination Cone -->
            <div class="headlight-cone" style="position: absolute; top: -45px; left: 12px; width: 40px; height: 55px; background: linear-gradient(to top, rgba(0, 245, 155, 0.4), rgba(0, 229, 255, 0)); clip-path: polygon(30% 100%, 70% 100%, 100% 0%, 0% 0%); transform-origin: bottom center; transform: rotate(${bearing}deg); filter: blur(2px);"></div>

            <!-- Pulsating Radar Rings -->
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; border: 2px solid #00f59b; animation: car-sonar 1.8s infinite linear; opacity: 0.6;"></div>
            <div style="position: absolute; width: 46px; height: 46px; border-radius: 50%; border: 1px dashed rgba(0, 229, 255, 0.5); animation: car-sonar 2.4s infinite linear; opacity: 0.4;"></div>

            <!-- Vehicle Arrow Pointer -->
            <div style="position: relative; z-index: 10; width: 22px; height: 22px; background: #00f59b; border: 2px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px #00f59b; transform: rotate(${bearing}deg);">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#040608" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 19 21 12 17 5 21 12 2" fill="#040608"></polygon>
              </svg>
            </div>

            <!-- Tactical Flight Telemetry HUD Chip -->
            <div style="position: absolute; top: -38px; left: 50%; transform: translateX(-50%); background: rgba(8, 12, 20, 0.92); border: 1px solid rgba(0, 245, 155, 0.4); border-radius: 6px; padding: 2px 6px; font-family: monospace; font-size: 9px; font-weight: bold; white-space: nowrap; color: #ffffff; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 14px rgba(0,0,0,0.8); z-index: 20;">
              <span style="color: #00f59b;">${simulatedCarPosition.speed_kmh} KM/H</span>
              <span style="color: #64748b;">·</span>
              <span style="color: #38bdf8;">${simulatedCarPosition.soc_pct}%</span>
            </div>
          </div>
        `;

        carMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([simulatedCarPosition.lon, simulatedCarPosition.lat])
          .addTo(map.current);
      } else {
        carMarkerRef.current.setLngLat([simulatedCarPosition.lon, simulatedCarPosition.lat]);
        // Update headlight angle and telemetry tag
        const cone = carMarkerRef.current.getElement().querySelector('.headlight-cone') as HTMLElement;
        if (cone) cone.style.transform = `rotate(${bearing}deg)`;
        const pointer = carMarkerRef.current.getElement().querySelector('.beacon-root > div:nth-child(4)') as HTMLElement;
        if (pointer) pointer.style.transform = `rotate(${bearing}deg)`;
        const hud = carMarkerRef.current.getElement().querySelector('.beacon-root > div:last-child') as HTMLElement;
        if (hud) {
          hud.innerHTML = `
            <span style="color: #00f59b;">${simulatedCarPosition.speed_kmh} KM/H</span>
            <span style="color: #64748b;">·</span>
            <span style="color: #38bdf8;">${simulatedCarPosition.soc_pct}%</span>
          `;
        }
      }
    } else {
      if (carMarkerRef.current) {
        carMarkerRef.current.remove();
        carMarkerRef.current = null;
      }
    }
  }, [simulatedCarPosition, corridor?.waypoints]);

  return (
    <div className="relative w-full h-full min-h-[580px] overflow-hidden rounded-2xl border border-white/10 bg-[#040608] shadow-2xl">
      <div ref={mapContainer} className="w-full h-full absolute inset-0" />

      {/* Top Floating Spatial HUD Deck */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left Telemetry Tag */}
        <div className="glass-panel px-3.5 py-2 rounded-xl text-xs font-mono-tech text-slate-200 flex items-center gap-2.5 pointer-events-auto border border-white/10 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400"></span>
          <span className="font-bold tracking-wider text-white">PUNE METRO 3D COMMAND TWIN</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400">1,354 CHARGING NODES</span>
          {cursorCoords && (
            <>
              <span className="text-slate-500 hidden sm:inline">|</span>
              <span className="text-slate-400 hidden sm:inline font-mono">
                {cursorCoords.lat}°N, {cursorCoords.lng}°E
              </span>
            </>
          )}
        </div>

        {/* Right Tactical Control Switches */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Basemap Switcher */}
          <div className="glass-panel p-1 rounded-xl border border-white/10 flex items-center gap-1 text-[11px] font-mono-tech shadow-lg">
            <button
              onClick={() => handleToggleBasemap('dark')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                basemapType === 'dark'
                  ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
              title="ESRI Dark Obsidian Canvas (Zero Key Required)"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Obsidian</span>
            </button>
            <button
              onClick={() => handleToggleBasemap('satellite')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                basemapType === 'satellite'
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
              title="ESRI Orbital Satellite Imagery"
            >
              <Satellite className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Orbital</span>
            </button>
          </div>

          {/* 3D Pitch Switcher */}
          <button
            onClick={handleTogglePitch}
            className={`glass-panel px-3 py-2 rounded-xl text-xs font-mono-tech flex items-center gap-1.5 cursor-pointer transition-all border border-white/10 shadow-lg ${
              pitch3D ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20' : 'text-slate-300 hover:bg-white/10'
            }`}
            title="Toggle 3D Oblique Pitch Camera"
          >
            <Navigation2 className={`w-3.5 h-3.5 ${pitch3D ? 'rotate-45 text-emerald-400' : 'text-slate-400'}`} />
            <span>3D PITCH: {pitch3D ? '45°' : 'TOP'}</span>
          </button>

          {/* Reset Camera */}
          <button
            onClick={handleResetCamera}
            className="glass-panel p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 cursor-pointer shadow-lg transition-all"
            title="Reset Viewport to Pune Center"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Bottom Left Legend Strip */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="glass-panel px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-mono-tech text-slate-300 flex items-center gap-3 shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f59b] shadow-sm shadow-[#00f59b]"></span>
            <span>Fast PCS (≥7.4 kW)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8]"></span>
            <span>AC Slow (≤3.3 kW)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff9900] shadow-sm shadow-[#ff9900]"></span>
            <span>Candidate Hub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 rounded bg-[#00e5ff] shadow-sm shadow-[#00e5ff]"></span>
            <span>OSM Arterial</span>
          </div>
        </div>
      </div>
    </div>
  );
};
