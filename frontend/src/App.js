import React, { useState } from "react";
import useGeoData from "./hooks/useGeoData";
import MapView from "./components/MapView";
import Sidebar from "./components/Sidebar";
import FeaturePopup from "./components/FeaturePopup";
import "./App.css";

export default function App() {
  const { layers, geojson, activeLayers, toggleLayer, loading, error, reload } =
    useGeoData();
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Build a layerId -> style lookup
  const styleMap = {};
  layers.forEach((l) => {
    styleMap[l.id] = l.style || {};
  });

  return (
    <div className="app">
      <Sidebar
        layers={layers}
        activeLayers={activeLayers}
        onToggle={toggleLayer}
        loading={loading}
        error={error}
        onReload={reload}
        selectedFeature={selectedFeature}
      />
      <main className="map-container">
        <MapView
          geojson={geojson}
          styleMap={styleMap}
          onFeatureClick={setSelectedFeature}
        />
        {selectedFeature && (
          <FeaturePopup
            feature={selectedFeature}
            onClose={() => setSelectedFeature(null)}
          />
        )}
      </main>
    </div>
  );
}
