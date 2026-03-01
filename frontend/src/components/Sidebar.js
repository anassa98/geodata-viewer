import React from "react";
import "./Sidebar.css";

export default function Sidebar({
  layers,
  activeLayers,
  onToggle,
  loading,
  error,
  onReload,
  selectedFeature,
}) {
  return (
    <aside className="sidebar">
      <h1 className="sidebar-title">GeoData Viewer</h1>

      {error && <div className="sidebar-error">{error}</div>}

      <section className="sidebar-section">
        <h2>Layers</h2>
        {layers.length === 0 && <p className="muted">No layers found.</p>}
        <ul className="layer-list">
          {layers.map((layer) => (
            <li key={layer.id} className="layer-item">
              <label>
                <input
                  type="checkbox"
                  checked={activeLayers.has(layer.id)}
                  onChange={() => onToggle(layer.id)}
                />
                <span
                  className="layer-swatch"
                  style={{ background: layer.style?.color || "#3388ff" }}
                />
                <span className="layer-name">{layer.name}</span>
                <span className="layer-count">{layer.feature_count}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      {selectedFeature && (
        <section className="sidebar-section">
          <h2>Selected Feature</h2>
          <div className="feature-detail">
            <strong>{selectedFeature.properties?.name || "Unnamed"}</strong>
            <table>
              <tbody>
                {Object.entries(selectedFeature.properties || {})
                  .filter(([k]) => !["name", "layer", "layer_name"].includes(k))
                  .map(([k, v]) => (
                    <tr key={k}>
                      <td className="prop-key">{k}</td>
                      <td className="prop-val">
                        {typeof v === "object" ? JSON.stringify(v) : String(v)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="sidebar-footer">
        <button className="btn-reload" onClick={onReload} disabled={loading}>
          {loading ? "Loading..." : "Reload Data"}
        </button>
      </div>
    </aside>
  );
}
