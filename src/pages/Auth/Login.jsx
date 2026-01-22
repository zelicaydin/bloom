import { useState, useEffect } from "react";
import { useAuth } from "../../store/AuthContext";
import { validateEmail } from "../../utils/validation";
import { hashPasswordAsync } from "../../utils/hash";
import RememberMeModal from "../../components/ui/RememberMeModal";

const Login = ({ navigate }) => {
  const { login, setRememberMe } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showRememberModal, setShowRememberModal] = useState(false);

  // Clear errors when user types
  useEffect(() => {
    if (errors.email && email) setErrors((prev) => ({ ...prev, email: "" }));
    if (errors.password && password) setErrors((prev) => ({ ...prev, password: "" }));
    if (submitError) setSubmitError("");
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const newErrors = {};

    // Validate email
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate password
    if (!password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Hash password before checking (same as signup)
      const hashedPassword = await hashPasswordAsync(password);
      const result = await login(email, hashedPassword);

      if (result.success) {
        setShowRememberModal(true);
      } else {
        setSubmitError(result.error || "Login failed");
      }
    } catch (error) {
      setSubmitError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showRememberModal && (
        <RememberMeModal
          onRemember={() => {
            setRememberMe(true);
            navigate("/");
          }}
          onDontRemember={() => {
            setRememberMe(false);
            navigate("/");
          }}
        />
      )}
      <section style={styles.container}>
        <div style={styles.formWrapper}>
        <h1 style={styles.title}>Log In</h1>
        <p style={styles.subtitle}>Welcome back to Bloom</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {submitError && (
            <div style={styles.errorBox}>{submitError}</div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              style={{
                ...styles.input,
                borderColor: errors.email ? "#ff4444" : "rgba(255,255,255,0.2)",
              }}
            />
            {errors.email && (
              <span style={styles.errorText}>{errors.email}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  ...styles.input,
                  width: "100%",
                  paddingRight: "48px",
                  borderColor: errors.password ? "#ff4444" : "rgba(255,255,255,0.2)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
                onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.9)"}
                onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.6)"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span style={styles.errorText}>{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...styles.submitButton,
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p style={styles.switchText}>
          Don't have an account?{" "}
          <span
            style={styles.link}
            onClick={() => navigate("/signup")}
          >
            Sign up
          </span>
        </p>
      </div>
    </section>
    </>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px",
    paddingTop: "160px",
    paddingBottom: "80px",
    backgroundColor: "#141414",
    boxSizing: "border-box",
  },
  formWrapper: {
    width: "100%",
    maxWidth: "440px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 600,
    color: "#fff",
    marginBottom: "8px",
    letterSpacing: "-0.04em",
  },
  subtitle: {
    fontSize: "1rem",
    color: "rgba(255,255,255,0.6)",
    marginBottom: "40px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "0.9rem",
    color: "rgba(255,255,255,0.8)",
    fontWeight: 500,
  },
  input: {
    background: "rgba(44, 44, 44, 1)",
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "14px 16px",
    fontSize: "1rem",
    color: "#fff",
    outline: "none",
    transition: "border-color 0.2s",
    borderRadius: 0,
  },
  passwordWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  passwordToggle: {
    position: "absolute",
    right: "12px",
    background: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.6)",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.2s",
  },
  errorText: {
    fontSize: "0.85rem",
    color: "#ff4444",
    marginTop: "-4px",
  },
  errorBox: {
    background: "rgba(255, 68, 68, 0.1)",
    border: "1px solid #ff4444",
    padding: "12px 16px",
    color: "#ff4444",
    fontSize: "0.9rem",
  },
  submitButton: {
    background: "#fff",
    color: "#000",
    border: "none",
    padding: "14px 24px",
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "opacity 0.2s",
    marginTop: "8px",
  },
  switchText: {
    marginTop: "32px",
    textAlign: "center",
    color: "rgba(255,255,255,0.6)",
    fontSize: "0.9rem",
  },
  link: {
    color: "#fff",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default Login;
