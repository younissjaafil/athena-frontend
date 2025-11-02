import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AgentList.css";

function AgentList({ instructorId, onEdit, onCreateNew }) {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const fetchAgents = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching agents for instructor_id:", instructorId);

      // Try the new API endpoint structure first, fallback to old structure if needed
      const newApiUrl = `${process.env.REACT_APP_BASE_API_URL}/api/creator/agents?instructor_id=${instructorId}`;
      const oldApiUrl = `${process.env.REACT_APP_CREATOR_BASE_API_URL}/creator/agents?instructor_id=${instructorId}`;

      // Use the creator-specific URL if it exists, otherwise use the new unified API
      const url = process.env.REACT_APP_CREATOR_BASE_API_URL
        ? oldApiUrl
        : newApiUrl;
      console.log("API URL:", url);

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error Response:", errorData);
        console.error("Response status:", response.status);
        console.error("Response URL:", url);
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Agents fetched successfully:", result);
      setAgents(result.data || []);
    } catch (err) {
      console.error("Fetch agents error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructorId]);

  const handleDelete = async (agentId) => {
    if (!window.confirm("Are you sure you want to delete this agent?")) {
      return;
    }

    setDeleteLoading(agentId);
    try {
      // Use the same URL pattern as fetchAgents
      const newApiUrl = `${process.env.REACT_APP_BASE_API_URL}/api/creator/agents/${agentId}?instructor_id=${instructorId}`;
      const oldApiUrl = `${process.env.REACT_APP_CREATOR_BASE_API_URL}/creator/agents/${agentId}?instructor_id=${instructorId}`;
      const url = process.env.REACT_APP_CREATOR_BASE_API_URL
        ? oldApiUrl
        : newApiUrl;

      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove deleted agent from list
      setAgents((prev) => prev.filter((agent) => agent.id !== agentId));
    } catch (err) {
      alert(`Failed to delete agent: ${err.message}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case "public":
        return "�";
      case "campus":
        return "🏫";
      case "private":
      default:
        return "🔒";
    }
  };

  const getVisibilityLabel = (visibility) => {
    switch (visibility) {
      case "public":
        return "Public";
      case "campus":
        return "Campus";
      case "private":
      default:
        return "Private";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="agent-list-loading">
        <div className="loading-spinner-large">⏳</div>
        <p>Loading your agents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agent-list-error">
        <div className="error-icon">⚠️</div>
        <h3>Failed to load agents</h3>
        <p>{error}</p>
        <button onClick={fetchAgents} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="agent-list-empty">
        <div className="empty-icon">🤖</div>
        <h3>No Agents Yet</h3>
        <p>Create your first AI agent to get started</p>
        <button onClick={onCreateNew} className="create-first-btn">
          Create Your First Agent
        </button>
      </div>
    );
  }

  return (
    <div className="agent-list-container">
      <div className="agent-list-header">
        <div>
          <h2>My Agents</h2>
          <p className="agent-count">
            {agents.length} {agents.length === 1 ? "agent" : "agents"} active
          </p>
        </div>
        <button onClick={onCreateNew} className="create-new-btn">
          + Create New Agent
        </button>
      </div>

      <div className="agent-grid">
        {agents.map((agent) => (
          <div key={agent.id} className="agent-card">
            <div className="agent-card-header">
              <div className="agent-type-badge">
                <span className="agent-icon">🤖</span>
                <span className="agent-type-label">
                  {getVisibilityLabel(agent.visibility)}
                </span>
                <span className="visibility-icon">
                  {getVisibilityIcon(agent.visibility)}
                </span>
              </div>
              <div className="agent-actions">
                <button
                  onClick={() => navigate(`/train?agentId=${agent.id}`)}
                  className="train-btn"
                  disabled={deleteLoading === agent.id}
                  title="Train Agent"
                >
                  📚
                </button>
                <button
                  onClick={() => onEdit(agent)}
                  className="edit-btn"
                  disabled={deleteLoading === agent.id}
                  title="Edit Agent"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(agent.id)}
                  className="delete-btn"
                  disabled={deleteLoading === agent.id}
                  title="Delete Agent"
                >
                  {deleteLoading === agent.id ? "⏳" : "🗑️"}
                </button>
              </div>
            </div>

            <div className="agent-card-content">
              <h3 className="agent-name">{agent.name}</h3>

              {agent.description && (
                <p className="agent-description">{agent.description}</p>
              )}

              <div className="agent-details">
                <div className="agent-detail-item">
                  <span className="detail-icon">🧠</span>
                  <span className="detail-text">
                    {agent.model_type || "gpt-5"}
                  </span>
                </div>

                <div className="agent-detail-item">
                  <span className="detail-icon">🌡️</span>
                  <span className="detail-text">
                    Temp: {agent.temperature || 0.7}
                  </span>
                </div>
              </div>

              <div className="agent-card-footer">
                <span className="agent-date">
                  Created {formatDate(agent.created_at)}
                </span>
                {agent.instructor_name && (
                  <span className="agent-instructor">
                    by {agent.instructor_name}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AgentList;
