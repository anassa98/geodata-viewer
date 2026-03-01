import React, { useRef, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "./MapView.css";

// Fix default marker icon paths for webpack/CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const DEFAULT_CENTER = [40.74, -73.99]; // NYC
const DEFAULT_ZOOM = 13;

function FitBounds({ geojson }) {
  const map = useMap();
  useEffect(() => {
    if (!geojson || !geojson.features?.length) return;
    try {
      const layer = L.geoJSON(geojson);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      }
    } catch {
      // ignore invalid geojson
    }
  }, [geojson, map]);
  return null;
}

export default function MapView({ geojson, styleMap, onFeatureClick }) {
  const geoJsonRef = useRef(null);
  // Unique key forces GeoJSON layer re-render when data changes
  const key = geojson ? JSON.stringify(geojson).length : "empty";

  const style = (feature) => {
    const layerId = feature.properties?.layer;
    const s = styleMap?.[layerId] || {};
    return {
      color: s.color || "#3388ff",
      weight: s.weight || 2,
      opacity: s.opacity ?? 0.8,
      fillColor: s.fillColor || s.color || "#3388ff",
      fillOpacity: s.fillOpacity ?? 0.35,
    };
  };

  const onEachFeature = (feature, layer) => {
    // Hover highlight
    layer.on("mouseover", () => {
      if (layer.setStyle) {
        layer.setStyle({ weight: 4, fillOpacity: 0.6 });
      }
    });
    layer.on("mouseout", () => {
      if (geoJsonRef.current) {
        geoJsonRef.current.resetStyle(layer);
      }
    });
    // Click to select
    layer.on("click", () => {
      onFeatureClick(feature);
    });
    // Tooltip with name
    const name = feature.properties?.name;
    if (name) {
      layer.bindTooltip(name, { sticky: true });
    }
  };

  const pointToLayer = (feature, latlng) => {
    const layerId = feature.properties?.layer;
    const s = styleMap?.[layerId] || {};
    return L.circleMarker(latlng, {
      radius: 7,
      color: s.color || "#e74c3c",
      weight: 2,
      fillColor: s.fillColor || s.color || "#e74c3c",
      fillOpacity: s.fillOpacity ?? 0.7,
    });
  };

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="map"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {geojson && (
        <>
          <GeoJSON
            key={key}
            ref={geoJsonRef}
            data={geojson}
            style={style}
            pointToLayer={pointToLayer}
            onEachFeature={onEachFeature}
          />
          <FitBounds geojson={geojson} />
        </>
      )}
    </MapContainer>
  );
}
