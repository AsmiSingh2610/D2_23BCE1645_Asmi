// ── Signup Page ───────────────────────────────────────────────
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      return setError("Passwords do not match.");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <span style={styles.icon}>⬡</span>
          <h1 style={styles.title}>DigiLand</h1>
          <p className="text-muted text-sm" style={{ marginTop: 6 }}>
            Create your account
          </p>
        </div>

        <div className="card" style={styles.card}>
          <h2 style={styles.formTitle}>Create Account</h2>

          {error && <div className="msg-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Rajesh Kumar"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating...</>
                : "Create Account"}
            </button>
          </form>

          <hr className="divider" />
          <button
            className="btn btn-outline btn-full"
            onClick={() => alert("Google OAuth will be enabled in Phase 2.")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>

          <p className="text-center text-sm text-muted" style={{ marginTop: 20 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--accent)" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: { width: "100%", maxWidth: 420, padding: "0 16px" },
  header: { textAlign: "center", marginBottom: 28 },
  icon: { fontSize: 36, color: "var(--accent)", display: "block" },
  title: { fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 8 },
  card: { padding: 28 },
  formTitle: { fontSize: 18, fontWeight: 700, marginBottom: 20 },
};

export default Signup;
