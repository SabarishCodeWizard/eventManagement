import React, { useState, useEffect } from "react";
import { auth, signInWithGoogle } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import "../styles/StudentLogin.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StudentLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        navigate("/student-dashboard");
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Signed in with Google");
    } catch (error) {
      toast.error("Google Sign-In Failed");
      console.error("Error signing in with Google:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warn("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      // Here you could use Firebase's signInWithEmailAndPassword(auth, email, password)
      console.log("Email:", email);
      console.log("Password:", password);
      toast.success("Login successful");
      navigate("/student-dashboard");
    } catch (error) {
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome to Student Portal</h2>
        <p className="login-text">
          Sign in using your Google account to explore upcoming events, register for activities, and stay updated with all the latest happenings.
        </p>

        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter your email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="login-options">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              Remember Me
            </label>
            <a href="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="or-text">OR</p>

        <button className="google-signin-btn" onClick={handleGoogleSignIn} disabled={loading}>
          <FcGoogle />
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>
      </div>
    </div>
  );
};

export default StudentLogin;
