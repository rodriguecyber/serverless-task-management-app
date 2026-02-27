import { useState } from "react";
import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth";

export default function VerifyAccount({ username, onSuccess, onSignInClick }) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!code.trim()) {
      setError("Enter the verification code.");
      return;
    }
    setSubmitting(true);
    try {
      await confirmSignUp({
        username,
        confirmationCode: code.trim(),
      });
      onSuccess();
    } catch (err) {
      setError(err.message || err.name || "Verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResending(true);
    try {
      await resendSignUpCode({ username });
      setMessage("A new code was sent to your email.");
    } catch (err) {
      setError(err.message || err.name || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="page login-page">
      <section className="panel login-panel">
        <h1>Verify your account</h1>
        <p className="login-subtitle">
          We sent a verification code to <strong>{username}</strong>. Enter it below.
        </p>
        <form onSubmit={handleSubmit}>
          <label>
            Verification code
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              disabled={submitting}
              maxLength={6}
            />
          </label>
          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? "Verifying…" : "Verify"}
          </button>
        </form>
        <p className="auth-switch">
          Didn’t receive the code?{" "}
          <button
            type="button"
            className="link"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        </p>
        <p className="auth-switch">
          <button type="button" className="link" onClick={onSignInClick}>
            ← Back to sign in
          </button>
        </p>
      </section>
    </main>
  );
}
