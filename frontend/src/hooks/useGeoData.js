import { useState, useEffect, useCallback } from "react";
import { fetchLayers, fetchFeatures } from "../utils/api";

export default function useGeoData() {
  const [layers, setLayers] = useState([]);
  const [geojson, setGeojson] = useState(null);
  const [activeLayers, setActiveLayers] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load layers on mount
  useEffect(() => {
    fetchLayers()
      .then((data) => {
        setLayers(data);
        // Enable all layers by default
        setActiveLayers(new Set(data.map((l) => l.id)));
      })
      .catch((err) => setError(err.message));
  }, []);

  // Reload features when active layers change
  const loadFeatures = useCallback(async () => {
    if (activeLayers.size === 0) {
      setGeojson(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch features for each active layer, merge into one FeatureCollection
      const results = await Promise.all(
        [...activeLayers].map((id) => fetchFeatures(id))
      );
      const allFeatures = results.flatMap((fc) => fc.features ?? []);
      setGeojson({ type: "FeatureCollection", features: allFeatures });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeLayers]);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const toggleLayer = useCallback((layerId) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layerId)) next.delete(layerId);
      else next.add(layerId);
      return next;
    });
  }, []);

  return { layers, geojson, activeLayers, toggleLayer, loading, error, reload: loadFeatures };
}
