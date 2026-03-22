import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { Loader2, ShieldCheck } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error("Login attempt failed:", err);
      setError(err.message || "Failed to log in. Please check your credentials.");
      
      // Local fallback for demo purposes if Firebase isn't set up
      if (email === 'admin@amirthaa.com' && password === 'admin123') {
          localStorage.setItem('adminAuth', '1');
          navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-overlay"></div>
      <div className="login-card">
        <div className="login-header">
          <div className="logo-icon">
            <ShieldCheck size={32} />
          </div>
          <h1>Amirthaa Admin</h1>
          <p>Enterprise Resource Planning Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-banner">{error}</div>}
          
          <Input
            label="Admin Email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            id="admin-email"
            name="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            id="admin-password"
            name="password"
          />

          <Button 
            type="submit" 
            fullWidth 
            disabled={loading}
            className="login-submit-btn"
          >
            {loading ? (
              <span className="btn-content">
                <Loader2 className="animate-spin" size={18} />
                Verifying Credentials...
              </span>
            ) : "Access Portal"}
          </Button>
        </form>

        <div className="login-footer">
          <p>&copy; {new Date().getFullYear()} Minit Engineers India Private Limited</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
