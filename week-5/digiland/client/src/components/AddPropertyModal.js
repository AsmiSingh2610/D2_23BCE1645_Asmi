// ── AddPropertyModal ──────────────────────────────────────────
// Form to submit a new land record; parent refreshes list on success
import React, { useState } from "react";
import { propertyAPI } from "../utils/api";

const LAND_TYPES = ["Agricultural", "Residential", "Commercial", "Industrial", "Forest", "Other"];
const SOURCES    = ["DORIS", "DLRC", "CERSAI", "MCA21", "Manual", "Other"];

const INITIAL = {
  propertyId: "", ownerName: "", ownerAadhaar: "",
  state: "", district: "", village: "", surveyNumber: "", address: "",
  areaInAcres: "", landType: "Agricultural", marketValue: "",
  source: "Manual",
};

const AddPropertyModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        propertyId:   form.propertyId,
        ownerName:    form.ownerName,
        ownerAadhaar: form.ownerAadhaar,
        location: {
          state:        form.state,
          district:     form.district,
          village:      form.village,
          surveyNumber: form.surveyNumber,
          address:      form.address,
        },
        areaInAcres:  parseFloat(form.areaInAcres),
        landType:     form.landType,
        marketValue:  parseFloat(form.marketValue) || 0,
        source:       form.source,
      };

      const res = await propertyAPI.add(payload);
      setResult(res.data);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add property.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ──────────────────────────────────────────
  if (result) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className="text-center" style={{ padding: 8 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Property Registered</h3>
            <p className="text-muted text-sm" style={{ marginBottom: 16 }}>
              SHA-256 hash generated and stored in MongoDB.
              Blockchain sync is queued.
            </p>
            <div style={styles.hashBox}>
              <div className="text-xs text-muted" style={{ marginBottom: 4 }}>SHA-256 HASH</div>
              <div className="text-mono" style={{ fontSize: 11, color: "var(--accent)", wordBreak: "break-all" }}>
                {result.hashInfo?.hash}
              </div>
            </div>
            <button className="btn btn-primary btn-full" style={{ marginTop: 20 }} onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700 }}>Add Property Record</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {error && <div className="msg-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Property ID + Owner */}
          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Property ID *</label>
              <input name="propertyId" value={form.propertyId} onChange={handleChange}
                placeholder="DL-KA-MYS-001" required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Owner Name *</label>
              <input name="ownerName" value={form.ownerName} onChange={handleChange}
                placeholder="Rajesh Kumar" required />
            </div>
          </div>

          {/* Location */}
          <div style={styles.sectionLabel}>Location</div>
          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>State *</label>
              <input name="state" value={form.state} onChange={handleChange}
                placeholder="Karnataka" required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>District *</label>
              <input name="district" value={form.district} onChange={handleChange}
                placeholder="Mysuru" required />
            </div>
          </div>
          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Village</label>
              <input name="village" value={form.village} onChange={handleChange} placeholder="Hunsur" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Survey Number</label>
              <input name="surveyNumber" value={form.surveyNumber} onChange={handleChange} placeholder="123/4A" />
            </div>
          </div>

          {/* Property Details */}
          <div style={styles.sectionLabel}>Property Details</div>
          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Area (Acres) *</label>
              <input type="number" name="areaInAcres" value={form.areaInAcres}
                onChange={handleChange} placeholder="2.5" step="0.01" min="0" required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Market Value (₹)</label>
              <input type="number" name="marketValue" value={form.marketValue}
                onChange={handleChange} placeholder="5000000" min="0" />
            </div>
          </div>
          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Land Type</label>
              <select name="landType" value={form.landType} onChange={handleChange}>
                {LAND_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Data Source</label>
              <select name="source" value={form.source} onChange={handleChange}>
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Generating hash & saving...</>
              : "⬡ Register Property"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 200, padding: 16,
  },
  modal: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    maxHeight: "90vh",
    maxWidth: 640,
    overflowY: "auto",
    padding: 28,
    width: "100%",
  },
  row: { display: "flex", gap: 14 },
  sectionLabel: {
    color: "var(--accent)",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    marginBottom: 12,
    marginTop: 4,
    textTransform: "uppercase",
  },
  hashBox: {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "12px 16px",
    textAlign: "left",
    marginTop: 8,
  },
};

export default AddPropertyModal;
