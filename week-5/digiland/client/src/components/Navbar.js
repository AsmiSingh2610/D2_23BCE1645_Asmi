// ── Navbar Component ──────────────────────────────────────────
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Brand */}
        <Link to="/dashboard" style={styles.brand}>
          <span style={styles.brandIcon}>⬡</span>
          <span>DigiLand</span>
        </Link>

        {/* Right side */}
        {user && (
          <div style={styles.right}>
            <span style={styles.userInfo}>
              <span style={styles.dot} />
              {user.name}
              <span style={styles.role}>{user.role}</span>
            </span>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: "var(--surface)",
    borderBottom: "1px solid var(--border)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 24px",
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 800,
    fontSize: 18,
    color: "var(--text)",
    textDecoration: "none",
    letterSpacing: "-0.02em",
  },
  brandIcon: {
    fontSize: 22,
    color: "var(--accent)",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: "var(--muted)",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "var(--green)",
    display: "inline-block",
  },
  role: {
    background: "var(--accent-dim)",
    color: "var(--accent)",
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.06em",
    padding: "2px 6px",
    textTransform: "uppercase",
  },
};

export default Navbar;
