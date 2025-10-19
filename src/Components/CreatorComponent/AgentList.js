import { useState, useEffect } from "react";
import "./AgentList.css";

function AgentList({ creatorId, onEdit, onCreateNew }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const fetchAgents = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_CREATOR_BASE_API_URL}/creator/agents?creator_id=${creatorId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setAgents(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorId]);

  const handleDelete = async (agentId) => {
    if (!window.confirm("Are you sure you want to delete this agent?")) {
      return;
    }

    setDeleteLoading(agentId);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_CREATOR_BASE_API_URL}/creator/agents/${agentId}?creator_id=${creatorId}`,
        {
          method: "DELETE",
        }
      );

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

  const getAgentTypeIcon = (type) => {
    switch (type) {
      case "instructor":
        return "👨‍🏫";
      case "it_support":
        return "🔧";
      case "administration":
        return "📋";
      default:
        return "🤖";
    }
  };

  const getAgentTypeLabel = (type) => {
    switch (type) {
      case "instructor":
        return "Instructor";
      case "it_support":
        return "IT Support";
      case "administration":
        return "Administration";
      default:
        return type;
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
                <span className="agent-icon">
                  {getAgentTypeIcon(agent.agent_type)}
                </span>
                <span className="agent-type-label">
                  {getAgentTypeLabel(agent.agent_type)}
                </span>
              </div>
              <div className="agent-actions">
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
              <h3 className="agent-domain">{agent.domain}</h3>

              <div className="agent-details">
                <div className="agent-detail-item">
                  <span className="detail-icon">🏫</span>
                  <span className="detail-text">{agent.campus}</span>
                </div>

                <div className="agent-detail-item">
                  <span className="detail-icon">🌍</span>
                  <span className="detail-text">{agent.region}</span>
                </div>
              </div>

              {agent.courses && agent.courses.length > 0 && (
                <div className="agent-courses">
                  <span className="courses-label">Courses:</span>
                  <div className="course-chips">
                    {agent.courses.slice(0, 3).map((course) => (
                      <span key={course} className="course-chip">
                        {course}
                      </span>
                    ))}
                    {agent.courses.length > 3 && (
                      <span className="course-chip more">
                        +{agent.courses.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {agent.personality && (
                <div className="agent-personality">
                  <span className="personality-trait">
                    🎭 {agent.personality.tone || "friendly"}
                  </span>
                  <span className="personality-trait">
                    📝 {agent.personality.formality || "professional"}
                  </span>
                </div>
              )}

              <div className="agent-card-footer">
                <span className="agent-date">
                  Created {formatDate(agent.created_at)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AgentList;
