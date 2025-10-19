import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Configuration.css";

function Configuration() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    } else {
      // If no user data, redirect to login
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    navigate("/");
  };

  return (
    <div className="configuration-container">
      <div className="config-header">
        <div className="header-content">
          <h1>ATHENA AI - Configuration</h1>
          <div className="user-info">
            {userData && (
              <>
                <span className="user-name">{userData.username}</span>
                <span className="user-role">{userData.role}</span>
              </>
            )}
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="config-content">
        <div className="config-section">
          <h2>System Configuration</h2>
          <p className="section-description">
            Configure system settings and manage administrative tasks
          </p>

          <div className="config-grid">
            <div className="config-card">
              <div className="card-icon">⚙️</div>
              <h3>General Settings</h3>
              <p>Configure general system parameters and preferences</p>
              <button className="card-action-btn">Configure</button>
            </div>

            <div className="config-card">
              <div className="card-icon">👥</div>
              <h3>User Management</h3>
              <p>Manage users, roles, and permissions</p>
              <button className="card-action-btn">Manage Users</button>
            </div>

            <div className="config-card">
              <div className="card-icon">🔐</div>
              <h3>Security Settings</h3>
              <p>Configure authentication and security policies</p>
              <button className="card-action-btn">Security</button>
            </div>

            <div className="config-card">
              <div className="card-icon">🤖</div>
              <h3>AI Configuration</h3>
              <p>Manage AI models and learning parameters</p>
              <button className="card-action-btn">AI Settings</button>
            </div>

            <div className="config-card">
              <div className="card-icon">📊</div>
              <h3>Analytics</h3>
              <p>View system analytics and performance metrics</p>
              <button className="card-action-btn">View Analytics</button>
            </div>

            <div className="config-card">
              <div className="card-icon">🔔</div>
              <h3>Notifications</h3>
              <p>Configure system notifications and alerts</p>
              <button className="card-action-btn">Setup Alerts</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Configuration;
