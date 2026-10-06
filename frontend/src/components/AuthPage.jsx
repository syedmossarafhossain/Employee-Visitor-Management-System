import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await onAuth(mode, form);
    } catch (error) {
      const apiMessage = error.response?.data?.message;
      const networkMessage = !error.response
        ? "Cannot connect to the backend. Make sure the server is running at http://localhost:5000."
        : apiMessage || "Authentication failed. Please try again.";

      console.error("Password authentication error:", error);
      setMessage({
        type: "error",
        text: networkMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (response) => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      await onAuth("google", { credential: response.credential });
    } catch (error) {
      const apiMessage = error.response?.data?.message;
      const networkMessage = !error.response
        ? "Cannot connect to the backend. Make sure the server is running at http://localhost:5000."
        : apiMessage || "Google authentication failed.";

      console.error("Google authentication error:", error);
      setMessage({
        type: "error",
        text: networkMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo"><ShieldCheck size={28} /></div>
          <div>
            <strong>VisitorDesk</strong>
            <span>Employee Visitor Management</span>
          </div>
        </div>

        <div className="auth-heading">
          <p className="eyebrow">SECURE ACCESS</p>
          <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p>
            {mode === "login"
              ? "Sign in to access the visitor management dashboard."
              : "Register to access your organization’s visitor portal."}
          </p>
        </div>

        {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

        <form onSubmit={submit} className="auth-form">
          {mode === "register" && (
            <label className="field">
              <span>Full Name</span>
              <div className="input-icon">
                <UserRound size={17} />
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                />
              </div>
            </label>
          )}

          <label className="field">
            <span>Email Address</span>
            <div className="input-icon">
              <Mail size={17} />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Password</span>
            <div className="input-icon">
              <LockKeyhole size={17} />
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 6 characters"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={6}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>

          <button className="primary-btn auth-submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="auth-divider"><span>OR</span></div>

        <div className="google-btn">
          <GoogleLogin
            onSuccess={handleGoogle}
            onError={() => setMessage({ type: "error", text: "Google sign-in was cancelled or failed." })}
            useOneTap={false}
            width="100%"
          />
        </div>

        <p className="auth-switch">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setMessage({ type: "", text: "" });
            }}
          >
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </p>

        <p className="auth-note">
          The email configured as <b>ADMIN_EMAIL</b> receives administrator access.
        </p>
      </div>
    </div>
  );
}
