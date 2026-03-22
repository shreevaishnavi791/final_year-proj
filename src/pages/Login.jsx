import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.email, formData.password, formData.name);
      }
      navigate("/");
    } catch (err) {
      console.error("Auth Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="company-name">Amirthaa User Login</h1>
          <p className="company-subtitle">
            {isLogin ? "Welcome Back!" : "Join Us Today"}
          </p>
          <div className="divider"></div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}

          {!isLogin && (
            <Input
              label="Full Name"
              type="text"
              name="name"
              id="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}

          <Input
            label="Email"
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            id="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className="login-actions">
            <Link to="/forgot-password" disabled className="forgot-password">
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? (
              <div className="flex-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                <span>Please wait...</span>
              </div>
            ) : isLogin ? (
              "Login"
            ) : (
              "Create Account"
            )}
          </Button>

          <div className="auth-toggle">
            Don't have an account?
            <Link to="/register" className="toggle-btn">
              Join Us
            </Link>
          </div>

          <div className="back-link-container">
            <Link to="/" className="back-link">
              Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
