import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      setMessageType('error');
      setMessage('Please enter your email');
      return;
    }
    if (!formData.password.trim()) {
      setMessageType('error');
      setMessage('Please enter your password');
      return;
    }
    if (!formData.role) {
      setMessageType('error');
      setMessage('Please select a role');
      return;
    }

    const response = await onLogin({
      role: formData.role,
      email: formData.email,
      password: formData.password,
    });

    if (!response.success) {
      setMessageType('error');
      setMessage(response.message);
      return;
    }

    setMessageType('success');
    setMessage('Login successful. Redirecting...');
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-brand">
          <div className="brand-content">
            <h1 className="brand-title">Project Way</h1>
            <p className="brand-subtitle">Collaborative Education Platform</p>
            <div className="brand-features">
              <div className="feature-item">
                <span className="feature-icon">📚</span>
                <span>Learn Together</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">👥</span>
                <span>Share Ideas</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🚀</span>
                <span>Grow Fast</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-wrapper">
          <div className="login-form-content">
            <h2 className="form-title">Welcome Back</h2>
            <p className="form-subtitle">Sign in to your account</p>

            <form className="login-form" onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  <span className="label-icon">👤</span>
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <span className="label-icon">📧</span>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <span className="label-icon">🔐</span>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Role Selection */}
              <div className="form-group">
                <label htmlFor="role" className="form-label">
                  <span className="label-icon">🎯</span>
                  Select Your Role
                </label>
                <select
                  id="role"
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Message Display */}
              {message && (
                <div className={`message ${messageType}`}>
                  <span className="message-icon">
                    {messageType === 'success' ? '✓' : '⚠'}
                  </span>
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <button type="submit" className="login-button">
                <span className="button-icon">→</span>
                Sign In
              </button>
            </form>

            <p className="form-footer">
              Protected by enterprise-grade security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;