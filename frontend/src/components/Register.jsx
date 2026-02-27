import { useState } from "react";
import { signUp } from "aws-amplify/auth";

export default function Register({ onSuccess, onSignInClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await signUp({
        username: email.trim().toLowerCase(),
        password,
        options: {
          userAttributes: {
            email: email.trim().toLowerCase(),
          },
        },
      });
      onSuccess(email.trim().toLowerCase());
    } catch (err) {
      setError(err.message || err.name || "Sign up failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page login-page">
      <section className="panel login-panel">
        <h1>Create account</h1>
        <p className="login-subtitle">Register for Task Management</p>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={submitting}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              disabled={submitting}
            />
          </label>
          <label>
            Confirm password
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              disabled={submitting}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account?{" "}
          <button type="button" className="link" onClick={onSignInClick}>
            Sign in
          </button>
        </p>
      </section>
    </main>
  );
}
