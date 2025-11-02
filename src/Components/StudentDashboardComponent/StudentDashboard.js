import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./StudentDashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "https://agent-chat-alpha.vercel.app";

  useEffect(() => {
    // Get user data from localStorage
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
      // Fetch available agents
      fetchAgents();
    } else {
      // If no user data, redirect to login
      navigate("/");
    }
  }, [navigate]);

  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/agents`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log("API Response:", result);

      // API returns agents in result.data.agents array
      if (result.success && result.data && Array.isArray(result.data.agents)) {
        console.log(
          "Setting agents from result.data.agents:",
          result.data.agents
        );
        setAgents(result.data.agents);
      } else if (result.success && Array.isArray(result.data)) {
        console.log("Setting agents from result.data:", result.data);
        setAgents(result.data);
      } else if (Array.isArray(result)) {
        // Fallback: in case the API returns array directly
        console.log("Setting agents from result array:", result);
        setAgents(result);
      } else {
        console.log("No agents found, setting empty array");
        setAgents([]);
      }
    } catch (err) {
      console.error("Error fetching agents:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    navigate("/");
  };

  const handleChatWithAgent = (agentId) => {
    navigate(`/chat?agentId=${agentId}`);
  };

  return (
    <div className="student-dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>ATHENA AI - Student Dashboard</h1>
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

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome Back, {userData?.username || "Student"}!</h2>
          <p className="welcome-description">
            Chat with AI assistants created by your instructors
          </p>
        </div>

        {/* Agents Section */}
        <div className="agents-section">
          <h3 className="section-title">
            <span className="icon">🤖</span> Available AI Assistants
          </h3>

          {loading ? (
            <div className="loading-state">
              <div className="spinner-large">⏳</div>
              <p>Loading AI assistants...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <p>Failed to load agents: {error}</p>
              <button onClick={fetchAgents} className="retry-btn">
                Retry
              </button>
            </div>
          ) : agents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🤷</div>
              <p>No AI assistants available yet</p>
              <small>Check back later for new assistants!</small>
            </div>
          ) : (
            <div className="agents-grid">
              {agents.map((agent) => (
                <div key={agent.id} className="agent-card">
                  <div className="agent-card-header">
                    <div className="agent-icon">🤖</div>
                    <div className="agent-badge">GPT-4</div>
                  </div>

                  <div className="agent-card-body">
                    <h4 className="agent-name">{agent.name}</h4>
                    <p className="agent-description">
                      {agent.description || "AI Assistant ready to help you"}
                    </p>

                    <div className="agent-metadata">
                      <div className="metadata-item">
                        <span className="metadata-label">Agent ID:</span>
                        <span className="metadata-value">{agent.agentId}</span>
                      </div>
                      <div className="metadata-item">
                        <span className="metadata-label">Temperature:</span>
                        <span className="metadata-value">
                          {agent.temperature}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="agent-card-footer">
                    <button
                      onClick={() => handleChatWithAgent(agent.agentId)}
                      className="chat-with-agent-btn"
                    >
                      💬 Chat with me
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats Section */}
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon">🤖</div>
            <div className="stat-content">
              <h4>{agents.length}</h4>
              <p>Available Assistants</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-content">
              <h4>24/7</h4>
              <p>Always Online</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <h4>Instant</h4>
              <p>Response Time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
