import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({ studentCount: 0, teacherCount: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminApi.getDashboard();
        setStats(data);
      } catch (err) {
        setError('Unable to load dashboard stats.');
      }
    };
    loadStats();
  }, []);

  return (
    <div className="dashboard-root">
      <div className="dashboard-header-row">
        <div>
          <h2 className="dashboard-title">Dashboard Overview</h2>
          <p className="dashboard-subtitle">
            Easily view and manage all student and teacher information from this dashboard.
          </p>
          {error && <p className="dashboard-error">{error}</p>}
        </div>
      </div>

      <div className="dashboard-stats-grid">
        <div className="dashboard-card">
          <div>
            <p className="dashboard-card-label">Total Students</p>
            <h3 className="dashboard-card-value">{stats.studentCount}</h3>
          </div>
          <div className="dashboard-card-icon dashboard-card-icon-blue">
            <span className="material-symbols-outlined">school</span>
          </div>
        </div>

        <div className="dashboard-card">
          <div>
            <p className="dashboard-card-label">Total Teachers</p>
            <h3 className="dashboard-card-value">{stats.teacherCount}</h3>
          </div>
          <div className="dashboard-card-icon dashboard-card-icon-purple">
            <span className="material-symbols-outlined">people</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;