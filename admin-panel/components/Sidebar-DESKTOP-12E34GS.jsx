// Sidebar.js
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [userData, setUserData] = useState({
    username: 'Aseema',
    email: '',
    registered: false,
  });
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    const savedData = localStorage.getItem('userData');
    if (savedData) {
      setUserData(JSON.parse(savedData));
    }

    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        localStorage.removeItem('userData');
        setUserData({
          username: 'Aseema',
          email: '',
          registered: false,
        });
        console.log('LocalStorage cleared!');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleNameClick = () => {
    console.log('Name clicked! Current state:', userData);
    setShowRegisterForm(true);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const newUserData = {
      username: formData.username,
      email: formData.email,
      registered: true,
    };
    setUserData(newUserData);
    localStorage.setItem('userData', JSON.stringify(newUserData));
    setShowRegisterForm(false);
    setFormData({ username: '', email: '', password: '' });
  };

  const linkClass = ({ isActive }) =>
    [
      'sidebar-link',
      isActive ? 'sidebar-link-active' : 'sidebar-link-inactive',
    ].join(' ');

  return (
    <>
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <span className="material-symbols-outlined">school</span>
          </div>
          <div>
            <h1 className="sidebar-logo-title">EduAdmin</h1>
            <p className="sidebar-logo-subtitle">Platform Manager</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="sidebar-nav">
          <NavLink to="/" className={linkClass} end>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="sidebar-link-text">Dashboard</span>
          </NavLink>

          <div className="sidebar-section-label">User Management</div>

          <NavLink to="/teachers" className={linkClass}>
            <span className="material-symbols-outlined">people</span>
            <span className="sidebar-link-text">Manage Teachers</span>
          </NavLink>

          <NavLink to="/students" className={linkClass}>
            <span className="material-symbols-outlined">school</span>
            <span className="sidebar-link-text">Manage Students</span>
          </NavLink>

          <div className="sidebar-section-label">System</div>

          <NavLink to="/roles" className={linkClass}>
            <span className="material-symbols-outlined">verified_user</span>
            <span className="sidebar-link-text">Roles & Permissions</span>
          </NavLink>
        </nav>

        {/* User Profile (Bottom) */}
        <div className="sidebar-profile">
          <div className="sidebar-profile-main">
            <div className="sidebar-profile-info">
              <button
                onClick={handleNameClick}
                className="sidebar-profile-name"
              >
                {userData.username}
              </button>
              {userData.registered && (
                <span className="material-symbols-outlined sidebar-profile-check">
                  check_circle
                </span>
              )}
            </div>
            <p className="sidebar-profile-role">
              {userData.registered ? 'Admin' : 'Admin'}
            </p>
          </div>
          <button className="sidebar-logout-button">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </aside>

      {/* Registration Form Overlay */}
      {showRegisterForm && (
        <div className="sidebar-overlay">
          <div className="sidebar-modal">
            <h2 className="sidebar-modal-title">Register Account</h2>
            <form onSubmit={handleRegister} className="sidebar-modal-form">
              <div>
                <label className="sidebar-modal-label">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="sidebar-modal-input"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="sidebar-modal-label">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="sidebar-modal-input"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="sidebar-modal-label">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="sidebar-modal-input"
                  placeholder="Enter password"
                />
              </div>
              <div className="sidebar-modal-actions">
                <button
                  type="submit"
                  className="sidebar-modal-primary-btn"
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegisterForm(false)}
                  className="sidebar-modal-secondary-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;