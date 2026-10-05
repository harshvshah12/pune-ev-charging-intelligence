import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Station, WardCollection, Candidate, Recommendation, MapLayerState, CorridorWaypoint } from '../types';

if (typeof window !== 'undefined') {
  maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
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
  onSelectStation: (st: Station | null) => void;
  onSelectRecommendation: (rec: Recommendation | null) => void;
  flyToCoords: [number, number] | null; // [lon, lat]
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
  onSelectStation,
  onSelectRecommendation,
  flyToCoords
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const carMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Dark Matter tile style
    const darkStyle: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'carto-dark': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }
      },
      layers: [
        {
          id: 'carto-dark-layer',
          type: 'raster',
          source: 'carto-dark',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    };

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: darkStyle,
      center: [73.8567, 18.5204], // Pune Center
      zoom: 11.4,
      pitch: 42,
      bearing: -12
    });

    map.current.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');

    map.current.on('load', () => {
      if (!map.current) return;

      // 1. Add Wards
      map.current.addSource('wards-source', {
        type: 'geojson',
        data: wards || { type: 'FeatureCollection', features: [] }
      });

      map.current.addLayer({
        id: 'wards-fill',
        type: 'fill',
        source: 'wards-source',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'need_score'],
            20, 'rgba(16, 185, 129, 0.08)',
            45, 'rgba(59, 130, 246, 0.12)',
            60, 'rgba(245, 158, 11, 0.18)',
            80, 'rgba(239, 68, 68, 0.28)'
          ],
          'fill-opacity': layerState.wardChoropleth ? 0.8 : 0.0
        }
      });

      map.current.addLayer({
        id: 'wards-border',
        type: 'line',
        source: 'wards-source',
        paint: {
          'line-color': '#06b6d4',
          'line-width': 1.2,
          'line-opacity': layerState.wardPolygons ? 0.6 : 0.0,
          'line-dasharray': [3, 2]
        }
      });

      // 2. Add OSM Arterial Roads
      map.current.addSource('roads-source', {
        type: 'geojson',
        data: roads || { type: 'FeatureCollection', features: [] }
      });

      map.current.addLayer({
        id: 'roads-glow',
        type: 'line',
        source: 'roads-source',
        paint: {
          'line-color': '#06b6d4',
          'line-width': 2.5,
          'line-opacity': layerState.roadNetwork ? 0.35 : 0.0,
          'line-blur': 1.5
        }
      });

      map.current.addLayer({
        id: 'roads-line',
        type: 'line',
        source: 'roads-source',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 1.2,
          'line-opacity': layerState.roadNetwork ? 0.75 : 0.0
        }
      });

      // 3. Add Existing Stations Heatmap (Charging Density)
      map.current.addSource('stations-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: stations.map(s => ({
            type: 'Feature',
            properties: s,
            geometry: {
              type: 'Point',
              coordinates: [s.longitude, s.latitude]
            }
          }))
        }
      });

      map.current.addLayer({
        id: 'stations-heat',
        type: 'heatmap',
        source: 'stations-source',
        maxzoom: 15,
        paint: {
          'heatmap-weight': 1,
          'heatmap-intensity': 0.8,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 0, 0)',
            0.2, 'rgba(6, 182, 212, 0.2)',
            0.5, 'rgba(16, 185, 129, 0.4)',
            0.8, 'rgba(245, 158, 11, 0.7)',
            1, 'rgba(239, 68, 68, 0.9)'
          ],
          'heatmap-radius': 18,
          'heatmap-opacity': layerState.chargingDeserts ? 0.6 : 0.0
        }
      });

      // Existing Stations Point Circles
      map.current.addLayer({
        id: 'stations-circle',
        type: 'circle',
        source: 'stations-source',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            10, 2.5,
            14, 5.5,
            17, 8
          ],
          'circle-color': [
            'case',
            ['>=', ['get', 'power_kw'], 30], '#10b981', // Fast DC (Emerald)
            ['>=', ['get', 'power_kw'], 7.4], '#06b6d4', // AC Type-2 (Cyan)
            '#3b82f6' // LEV AC Slow (Blue)
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 0.8,
          'circle-stroke-opacity': 0.7,
          'circle-opacity': layerState.existingChargers ? 0.9 : 0.0
        }
      });

      // 4. Candidate Locations Layer (Viable Nodes)
      map.current.addSource('candidates-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: candidates.map(c => ({
            type: 'Feature',
            properties: c,
            geometry: {
              type: 'Point',
              coordinates: [c.lon, c.lat]
            }
          }))
        }
      });

      map.current.addLayer({
        id: 'candidates-circle',
        type: 'circle',
        source: 'candidates-source',
        paint: {
          'circle-radius': 5,
          'circle-color': '#f59e0b',
          'circle-opacity': layerState.candidateLocations ? 0.8 : 0.0,
          'circle-stroke-color': '#fde68a',
          'circle-stroke-width': 1.2
        }
      });

      // 5. Recommended Stations Layer (Golden Hubs)
      map.current.addSource('recommendations-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: recommendations.map(r => ({
            type: 'Feature',
            properties: r,
            geometry: {
              type: 'Point',
              coordinates: [r.longitude, r.latitude]
            }
          }))
        }
      });

      // Coverage radius buffer circles (1.75km)
      map.current.addLayer({
        id: 'recommendations-coverage-glow',
        type: 'circle',
        source: 'recommendations-source',
        paint: {
          'circle-radius': [
            'interpolate', ['exponential', 2], ['zoom'],
            10, 18,
            12, 45,
            14, 110,
            16, 320
          ],
          'circle-color': 'rgba(234, 179, 8, 0.12)',
          'circle-stroke-color': '#eab308',
          'circle-stroke-width': 1.5,
          'circle-stroke-opacity': 0.8,
          'circle-opacity': (layerState.recommendedSites && layerState.coverageIsochrones) ? 1.0 : 0.0
        }
      });

      map.current.addLayer({
        id: 'recommendations-circle',
        type: 'circle',
        source: 'recommendations-source',
        paint: {
          'circle-radius': 9,
          'circle-color': '#eab308',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2.5,
          'circle-opacity': layerState.recommendedSites ? 1.0 : 0.0
        }
      });

      // Click on Existing Station
      map.current.on('click', 'stations-circle', (e) => {
        if (!e.features || !e.features[0]) return;
        const props = e.features[0].properties as Station;
        onSelectStation(props);
      });

      // Click on Recommendation
      map.current.on('click', 'recommendations-circle', (e) => {
        if (!e.features || !e.features[0]) return;
        const props = e.features[0].properties as Recommendation;
        onSelectRecommendation(props);
      });

      // Cursor changes
      map.current.on('mouseenter', 'stations-circle', () => { if (map.current) map.current.getCanvas().style.cursor = 'pointer'; });
      map.current.on('mouseleave', 'stations-circle', () => { if (map.current) map.current.getCanvas().style.cursor = ''; });
      map.current.on('mouseenter', 'recommendations-circle', () => { if (map.current) map.current.getCanvas().style.cursor = 'pointer'; });
      map.current.on('mouseleave', 'recommendations-circle', () => { if (map.current) map.current.getCanvas().style.cursor = ''; });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update Data Sources dynamically
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    if (map.current.getSource('stations-source')) {
      let filteredStations = stations;
      if (layerState.chargerTypeFilter === 'fast') {
        filteredStations = stations.filter(s => s.power_kw >= 7.4 || (s.charger_type && (s.charger_type.includes('CCS') || s.charger_type.includes('DC'))));
      } else if (layerState.chargerTypeFilter === 'ac') {
        filteredStations = stations.filter(s => !(s.charger_type && (s.charger_type.includes('CCS') || s.charger_type.includes('DC'))));
      }
      if (layerState.selectedCPO && layerState.selectedCPO !== 'all') {
        filteredStations = filteredStations.filter(s => s.cpo.toLowerCase().includes(layerState.selectedCPO.toLowerCase()));
      }

      (map.current.getSource('stations-source') as maplibregl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: filteredStations.map(s => ({
          type: 'Feature',
          properties: s,
          geometry: {
            type: 'Point',
            coordinates: [s.longitude, s.latitude]
          }
        }))
      });
    }

    if (map.current.getSource('recommendations-source')) {
      (map.current.getSource('recommendations-source') as maplibregl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: recommendations.map(r => ({
          type: 'Feature',
          properties: r,
          geometry: {
            type: 'Point',
            coordinates: [r.longitude, r.latitude]
          }
        }))
      });
    }
  }, [stations, recommendations, layerState.chargerTypeFilter, layerState.selectedCPO]);

  // Update Layer Visibilities
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const setOpacity = (layerId: string, prop: string, val: number) => {
      if (map.current && map.current.getLayer(layerId)) {
        map.current.setPaintProperty(layerId, prop as any, val);
      }
    };

    setOpacity('stations-circle', 'circle-opacity', layerState.existingChargers ? 0.9 : 0.0);
    setOpacity('stations-heat', 'heatmap-opacity', layerState.chargingDeserts ? 0.6 : 0.0);
    setOpacity('wards-fill', 'fill-opacity', layerState.wardChoropleth ? 0.8 : 0.0);
    setOpacity('wards-border', 'line-opacity', layerState.wardPolygons ? 0.6 : 0.0);
    setOpacity('roads-glow', 'line-opacity', layerState.roadNetwork ? 0.35 : 0.0);
    setOpacity('roads-line', 'line-opacity', layerState.roadNetwork ? 0.75 : 0.0);
    setOpacity('candidates-circle', 'circle-opacity', layerState.candidateLocations ? 0.8 : 0.0);
    setOpacity('recommendations-circle', 'circle-opacity', layerState.recommendedSites ? 1.0 : 0.0);
    setOpacity('recommendations-coverage-glow', 'circle-opacity', (layerState.recommendedSites && layerState.coverageIsochrones) ? 1.0 : 0.0);
  }, [layerState]);

  // Handle Fly-To Camera Transitions
  useEffect(() => {
    if (!map.current || !flyToCoords) return;
    map.current.flyTo({
      center: flyToCoords,
      zoom: 14.2,
      pitch: 55,
      bearing: -15,
      essential: true,
      duration: 1800
    });
  }, [flyToCoords]);

  // Handle Simulated Vehicle Marker
  useEffect(() => {
    if (!map.current) return;
    if (simulatedCarPosition) {
      if (!carMarkerRef.current) {
        const el = document.createElement('div');
        el.className = 'car-marker';
        el.innerHTML = `
          <div style="background: #10b981; color: #000; font-weight: bold; font-size: 10px; padding: 4px 8px; border-radius: 9999px; box-shadow: 0 0 16px #10b981; display: flex; align-items: center; gap: 4px;">
            <span style="display:inline-block; width: 6px; height: 6px; background:#fff; border-radius:50%;"></span>
            EV SIM
          </div>
        `;
        carMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([simulatedCarPosition.lon, simulatedCarPosition.lat])
          .addTo(map.current);
      } else {
        carMarkerRef.current.setLngLat([simulatedCarPosition.lon, simulatedCarPosition.lat]);
      }
    } else {
      if (carMarkerRef.current) {
        carMarkerRef.current.remove();
        carMarkerRef.current = null;
      }
    }
  }, [simulatedCarPosition]);

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden rounded-xl border border-white/10 bg-[#070a11]">
      <div ref={mapContainer} className="w-full h-full absolute inset-0" />
      
      {/* Map Compass & Quick Orientation Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
        <div className="glass-panel px-3 py-1.5 rounded-lg text-xs font-mono-tech text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>PUNE METRO 3D VIEWPORT · EPSG:4326</span>
        </div>
      </div>
    </div>
  );
};
