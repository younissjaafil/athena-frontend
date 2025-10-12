import { useState } from "react";
import "./TestConnection.css";

function TestConnection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_API_URL}/test`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="test-connection">
      <h2>Backend Connection Test</h2>

      <button
        onClick={testConnection}
        disabled={loading}
        className="test-button"
      >
        {loading ? "Testing Connection..." : "Test Connection"}
      </button>

      {error && (
        <div className="error-message">
          <h3>❌ Error</h3>
          <p>{error}</p>
        </div>
      )}

      {data && data.success && (
        <div className="success-container">
          <div className="success-header">
            <h3>✅ {data.message}</h3>
            <p className="timestamp">
              <strong>Timestamp:</strong>{" "}
              {new Date(data.timestamp).toLocaleString()}
            </p>
            <p className="version">
              <strong>Version:</strong> {data.version}
            </p>
          </div>

          <div className="stats-section">
            <h4>📊 Statistics</h4>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Total Users</span>
                <span className="stat-value">{data.data.stats.totalUsers}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Active Connections</span>
                <span className="stat-value">
                  {data.data.stats.activeConnections}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Uptime</span>
                <span className="stat-value">{data.data.stats.uptime}</span>
              </div>
            </div>
          </div>

          <div className="users-section">
            <h4>👥 Users ({data.data.users.length})</h4>
            <div className="users-grid">
              {data.data.users.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-id">ID: {user.id}</div>
                  <div className="user-name">{user.name}</div>
                  <div className="user-email">{user.email}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestConnection;
