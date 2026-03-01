import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const api = axios.create({ baseURL: API_BASE });

export async function fetchLayers() {
  const { data } = await api.get("/layers/");
  return data.results ?? data;
}

export async function fetchFeatures(layerId) {
  const params = {};
  if (layerId) params.layer = layerId;
  const { data } = await api.get("/features/bbox_geojson/", { params });
  return data;
}

export async function fetchFeaturesByBBox(bbox, layerId) {
  const params = { in_bbox: bbox };
  if (layerId) params.layer = layerId;
  const { data } = await api.get("/features/bbox_geojson/", { params });
  return data;
}
