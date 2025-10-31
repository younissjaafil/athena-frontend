import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Creator.css";
import AgentList from "./AgentList";
import AgentForm from "./AgentForm";

function Creator() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [view, setView] = useState("loading"); // loading, list, create, edit
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agents, setAgents] = useState([]);
  const [checkingAgents, setCheckingAgents] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData);
      setUserData(parsedData);
      // Check if user has existing agents
      checkUserAgents(parsedData.user_id);
    } else {
      // If no user data, redirect to login
      navigate("/");
    }
  }, [navigate]);

  const checkUserAgents = async (userId) => {
    setCheckingAgents(true);
    try {
      console.log("Checking agents for user_id:", userId);
      const url = `${process.env.REACT_APP_CREATOR_BASE_API_URL}/creator/agents?user_id=${userId}`;
      console.log("API URL:", url);

      const response = await fetch(url);

      if (response.ok) {
        const result = await response.json();
        console.log("Agents check result:", result);
        setAgents(result.data || []);
        // Always show list view first (AgentList handles empty state)
        setView("list");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData);
        // Default to list view if API fails
        setView("list");
      }
    } catch (err) {
      console.error("Failed to check agents:", err);
      // Default to list view if API fails
      setView("list");
    } finally {
      setCheckingAgents(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    navigate("/");
  };

  const handleCreateNew = () => {
    setSelectedAgent(null);
    setView("create");
  };

  const handleEdit = (agent) => {
    setSelectedAgent(agent);
    setView("edit");
  };

  const handleFormSuccess = (agent) => {
    // Refresh the agents list
    if (userData) {
      checkUserAgents(userData.user_id);
    }
    setSelectedAgent(null);
    setView("list");
  };

  const handleFormCancel = () => {
    setSelectedAgent(null);
    // If user has agents, go back to list. Otherwise, stay in create view
    if (agents.length > 0) {
      setView("list");
    }
  };

  // Show loading state while checking for agents
  if (checkingAgents) {
    return (
      <div className="creator-container">
        <div className="creator-header">
          <div className="header-content">
            <h1>ATHENA AI - Creator Studio</h1>
            <div className="user-info">
              {userData && (
                <>
                  <span className="user-name">
                    {userData.name || userData.username}
                  </span>
                  <span className="user-role">{userData.role}</span>
                </>
              )}
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        </div>
        <div className="creator-content">
          <div className="loading-container">
            <div className="loading-spinner-large">⏳</div>
            <p>Loading your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="creator-container">
      <div className="creator-header">
        <div className="header-content">
          <h1>ATHENA AI - Creator Studio</h1>
          <div className="user-info">
            {userData && (
              <>
                <span className="user-name">
                  {userData.name || userData.username}
                </span>
                <span className="user-role">{userData.role}</span>
              </>
            )}
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="creator-content">
        {view === "list" && (
          <>
            <div className="welcome-section">
              <h2>Agent Management</h2>
              <p className="welcome-description">
                Manage your AI agents for instruction, support, and
                administration
              </p>
            </div>
            <AgentList
              creatorId={userData.user_id}
              onEdit={handleEdit}
              onCreateNew={handleCreateNew}
            />
          </>
        )}

        {(view === "create" || view === "edit") && (
          <>
            <div className="welcome-section">
              <h2>
                {view === "create" ? "Create Your AI Agent" : "Edit Agent"}
              </h2>
              <p className="welcome-description">
                {view === "create"
                  ? "Set up your AI agent with domain expertise and personality"
                  : "Update your agent's configuration and settings"}
              </p>
            </div>
            <AgentForm
              existingAgent={selectedAgent}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
              creatorId={userData.user_id}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Creator;
