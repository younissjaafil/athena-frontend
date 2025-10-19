import { useState } from "react";
import "./Login.css";

function Login() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [focusedInput, setFocusedInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="login-container">
      {/* Starry Background */}
      <div className="stars-background">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Main Content */}
      <div className="login-content">
        {/* Left Side - Branding with AI Visualization */}
        <div className="branding-side">
          <div className="brand-logo">ATHENA AI</div>

          {/* AI Brain Visualization */}
          <div className="ai-visual">
            <div className="ai-core">
              <div className="core-ring ring-1"></div>
              <div className="core-ring ring-2"></div>
              <div className="core-ring ring-3"></div>
              <div className="core-center">
                <svg viewBox="0 0 100 100" className="brain-icon">
                  <path
                    d="M 50 20 L 65 35 L 80 35 L 80 50 L 65 65 L 50 80 L 35 65 L 20 50 L 20 35 L 35 35 Z"
                    fill="url(#brainGradient)"
                    className="brain-path"
                  />
                  <defs>
                    <linearGradient
                      id="brainGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#00d4ff" />
                      <stop offset="100%" stopColor="#0099ff" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Floating Particles */}
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                }}
              ></div>
            ))}
          </div>

          <div className="tagline">
            Your personalized AI mind that thinks,
            <br />
            speaks, and evolves with you
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="form-side">
          <div className="form-card">
            {/* Tabs */}
            <div className="auth-tabs">
              <button
                className={`tab ${isSignIn ? "active" : ""}`}
                onClick={() => setIsSignIn(true)}
              >
                Sign in
              </button>
              <button
                className={`tab ${!isSignIn ? "active" : ""}`}
                onClick={() => setIsSignIn(false)}
              >
                Sign up
              </button>
            </div>

            {/* Welcome Text */}
            <div className="welcome-text">
              {isSignIn
                ? "Welcome back! Please login to your account"
                : "Create your Athena AI account"}
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput("")}
                  placeholder="ani@gmail.com"
                  required
                  className={focusedInput === "email" ? "focused" : ""}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedInput("password")}
                    onBlur={() => setFocusedInput("")}
                    placeholder="••••••••••••"
                    required
                    className={focusedInput === "password" ? "focused" : ""}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {isSignIn && (
                <div className="form-options">
                  <label className="remember-checkbox">
                    <input type="checkbox" />
                    <span>Remember Me</span>
                  </label>
                  <button type="button" className="forgot-link">
                    Forgot Password?
                  </button>
                </div>
              )}

              <button type="submit" className="login-button">
                {isSignIn ? "Login" : "Create Account"}
              </button>

              <div className="signup-prompt">
                {isSignIn ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignIn(false)}
                      className="signup-link"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignIn(true)}
                      className="signup-link"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>

              <div className="divider">
                <span>OR</span>
              </div>

              <div className="social-login">
                <button type="button" className="social-btn google-btn">
                  <svg viewBox="0 0 24 24" className="social-icon">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </button>
                <button type="button" className="social-btn facebook-btn">
                  <svg
                    viewBox="0 0 24 24"
                    className="social-icon"
                    fill="#1877F2"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
