// ── Dashboard Page ────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from "react";
import { propertyAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";
import AddPropertyModal from "../components/AddPropertyModal";

// ── Status badge helper ───────────────────────────────────────
const BlockchainBadge = ({ status }) => {
  const map = {
    confirmed: ["badge-green", "On-Chain ✓"],
    pending:   ["badge-amber", "Pending"],
    failed:    ["badge-red",   "Failed"],
  };
  const [cls, label] = map[status] || ["badge-grey", status];
  return <span className={`badge ${cls}`}>{label}</span>;
};

const IntegrityBadge = ({ tampered, verified }) => {
  if (!verified) return <span className="badge badge-grey">Unverified</span>;
  return tampered
    ? <span className="badge badge-red">⚠ Tampered</span>
    : <span className="badge badge-green">✓ Intact</span>;
};

// ── Dashboard ─────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [verifying, setVerifying]   = useState(null); // propertyId being verified
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ── Fetch data ────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search.trim()) params.ownerName = search.trim();

      const [propRes, statRes] = await Promise.all([
        propertyAPI.getAll(params),
        propertyAPI.getStats(),
      ]);

      setProperties(propRes.data.properties);
      setTotalPages(propRes.data.pages);
      setStats(statRes.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Verify integrity of a single property ─────────────────
  const handleVerify = async (propertyId) => {
    setVerifying(propertyId);
    try {
      const res = await propertyAPI.verify(propertyId);
      const { isIntact } = res.data;
      alert(isIntact
        ? `✅ Property ${propertyId}: Data is INTACT. No tampering detected.`
        : `⚠️ ALERT: Property ${propertyId} has been TAMPERED! Hash mismatch found.`
      );
      fetchData(); // refresh to show updated isTampered flag
    } catch (err) {
      alert("Verification failed: " + (err.response?.data?.error || err.message));
    } finally {
      setVerifying(null);
    }
  };

  // ── Format currency ────────────────────────────────────────
  const formatINR = (val) =>
    val ? `₹${(val / 100000).toFixed(1)}L` : "—";

  return (
    <div style={styles.page}>
      {/* ── Page Header ─────────────────────────────────────── */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Land Records</h1>
          <p className="text-muted text-sm">
            Welcome back, <strong style={{ color: "var(--text)" }}>{user?.name}</strong>
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ gap: 8 }}
        >
          ＋ Add Property
        </button>
      </div>

      {/* ── Stats Row ────────────────────────────────────────── */}
      <div style={styles.statsGrid}>
        <StatCard label="Total Properties"   value={stats?.total     ?? "—"} icon="🏘️" />
        <StatCard label="On-Chain Confirmed"  value={stats?.confirmed  ?? "—"} icon="⛓️" accent="var(--green)" />
        <StatCard label="Awaiting Blockchain" value={stats?.pending    ?? "—"} icon="⏳" accent="var(--amber)" />
        <StatCard label="Tamper Alerts"       value={stats?.tampered   ?? "—"} icon="⚠️" accent="var(--red)" />
      </div>

      {/* ── Search + Table ───────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={styles.toolbar}>
          <input
            style={styles.searchInput}
            placeholder="Search by owner name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <button className="btn btn-outline btn-sm" onClick={fetchData}>
            Refresh
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex-center" style={{ padding: 48 }}>
            <span className="spinner" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center text-muted" style={{ padding: 48 }}>
            No property records found.
            <br />
            <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }}
              onClick={() => setShowModal(true)}>
              Add First Property
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Property ID</th>
                  <th>Owner</th>
                  <th>Location</th>
                  <th>Type / Area</th>
                  <th>Value</th>
                  <th>SHA-256 Hash</th>
                  <th>Blockchain</th>
                  <th>Integrity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <span className="text-mono fw-600" style={{ color: "var(--accent)", fontSize: 12 }}>
                        {p.propertyId}
                      </span>
                    </td>
                    <td>{p.ownerName}</td>
                    <td>
                      <span style={{ fontSize: 12 }}>
                        {p.location?.district}, {p.location?.state}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-blue" style={{ marginBottom: 4, display: "inline-block" }}>
                        {p.landType}
                      </span>
                      <br />
                      <span className="text-sm text-muted">{p.areaInAcres} ac</span>
                    </td>
                    <td className="text-sm">{formatINR(p.marketValue)}</td>
                    <td>
                      <span className="hash-chip" title={p.dataHash}>
                        {p.dataHash?.slice(0, 20)}…
                      </span>
                    </td>
                    <td>
                      <BlockchainBadge status={p.blockchainStatus} />
                    </td>
                    <td>
                      <IntegrityBadge
                        tampered={p.isTampered}
                        verified={!!p.lastVerified}
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleVerify(p.propertyId)}
                        disabled={verifying === p.propertyId}
                        title="Re-compute SHA-256 and compare with stored hash"
                      >
                        {verifying === p.propertyId
                          ? <span className="spinner" style={{ width: 12, height: 12 }} />
                          : "Verify"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button className="btn btn-outline btn-sm"
              disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              ← Prev
            </button>
            <span className="text-muted text-sm">Page {page} of {totalPages}</span>
            <button className="btn btn-outline btn-sm"
              disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── Info Banner ──────────────────────────────────────── */}
      <div style={styles.infoBanner}>
        <span style={{ color: "var(--accent)", fontSize: 16 }}>ℹ</span>
        <span className="text-sm text-muted">
          Each property record is hashed with <strong style={{ color: "var(--text)" }}>SHA-256</strong> at creation.
          Click <strong style={{ color: "var(--text)" }}>Verify</strong> to re-compute the hash and detect any off-chain tampering.
          Hashes are also stored on an <strong style={{ color: "var(--text)" }}>Ethereum smart contract</strong> for immutable proof.
        </span>
      </div>

      {/* ── Add Property Modal ───────────────────────────────── */}
      {showModal && (
        <AddPropertyModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchData(); }}
        />
      )}
    </div>
  );
};

const styles = {
  page: { maxWidth: 1200, margin: "0 auto", padding: "28px 24px 48px" },
  pageHeader: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "space-between", marginBottom: 24,
    flexWrap: "wrap", gap: 12,
  },
  pageTitle: { fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16, marginBottom: 24,
  },
  toolbar: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "14px 16px", borderBottom: "1px solid var(--border)",
  },
  searchInput: {
    flex: 1, background: "var(--bg)", border: "1px solid var(--border)",
    borderRadius: "var(--radius)", color: "var(--text)",
    fontFamily: "var(--sans)", fontSize: 13,
    outline: "none", padding: "8px 12px",
  },
  pagination: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 16, padding: "14px 16px", borderTop: "1px solid var(--border)",
  },
  infoBanner: {
    display: "flex", alignItems: "flex-start", gap: 12,
    background: "rgba(61,127,255,0.06)",
    border: "1px solid rgba(61,127,255,0.18)",
    borderRadius: "var(--radius)",
    marginTop: 20, padding: "14px 18px",
  },
};

export default Dashboard;
