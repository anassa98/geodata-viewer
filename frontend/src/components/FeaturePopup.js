import React from "react";
import "./FeaturePopup.css";

export default function FeaturePopup({ feature, onClose }) {
  const { properties, geometry } = feature;
  const geomType = geometry?.type || "Unknown";

  return (
    <div className="feature-popup">
      <div className="popup-header">
        <h3>{properties?.name || "Unnamed Feature"}</h3>
        <button className="popup-close" onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="popup-body">
        <span className="geom-badge">{geomType}</span>
        <table>
          <tbody>
            {Object.entries(properties || {})
              .filter(([k]) => !["name", "layer", "layer_name"].includes(k))
              .map(([k, v]) => (
                <tr key={k}>
                  <td className="pk">{k}</td>
                  <td className="pv">
                    {typeof v === "object" ? JSON.stringify(v) : String(v)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
