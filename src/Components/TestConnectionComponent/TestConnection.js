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
        `${process.env.REACT_APP_BASE_API_URL}/test/users`
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
            <p className="count">
              <strong>Total Count:</strong> {data.count}
            </p>
          </div>

          <div className="users-section">
            <h4>👥 Users ({data.data.length})</h4>
            <div className="users-grid">
              {data.data.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-id">ID: {user.id}</div>
                  <div className="user-name">@{user.username}</div>
                  <div className="user-created">
                    Created: {new Date(user.created_at).toLocaleString()}
                  </div>
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
