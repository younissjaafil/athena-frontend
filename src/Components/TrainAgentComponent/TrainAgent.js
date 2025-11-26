import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./TrainAgent.css";

function TrainAgent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const agentIdFromUrl = searchParams.get("agentId");
  const [userData, setUserData] = useState(null);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData);
      setUserData(parsedData);
      console.log("User data:", parsedData); // Debug log
      // Use the same field as Creator component for consistency
      const creatorId = parsedData.id || parsedData.user_id;
      console.log("Using creator_id:", creatorId); // Debug log
      fetchUserAgents(creatorId);
    } else {
      // If no user data, redirect to login
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchUserAgents = async (instructorId) => {
    setLoading(true);
    try {
      console.log("Fetching agents for creator_id:", instructorId);

      // Use the creator-specific URL if it exists, otherwise use the new unified API
      const newApiUrl = `${process.env.REACT_APP_BASE_API_URL}/api/creator/agents?creator_id=${instructorId}`;
      const oldApiUrl = `${process.env.REACT_APP_CREATOR_BASE_API_URL}/creator/agents?creator_id=${instructorId}`;
      const url = process.env.REACT_APP_CREATOR_BASE_API_URL
        ? oldApiUrl
        : newApiUrl;

      console.log("API URL:", url);

      const response = await fetch(url);

      if (response.ok) {
        const result = await response.json();
        console.log("Agents fetched:", result);
        const fetchedAgents = result.data || [];
        console.log("Fetched agents array:", fetchedAgents); // Debug log
        setAgents(fetchedAgents);

        // Auto-select agent if agentId is in URL
        if (agentIdFromUrl && fetchedAgents.length > 0) {
          const agentToSelect = fetchedAgents.find(
            (agent) => agent.id.toString() === agentIdFromUrl.toString()
          );
          if (agentToSelect) {
            console.log("Auto-selecting agent:", agentToSelect);
            setSelectedAgent(agentToSelect);
          } else {
            console.warn("Agent with ID not found:", agentIdFromUrl);
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData);
        console.error("Response status:", response.status);
      }
    } catch (err) {
      console.error("Failed to fetch agents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    navigate("/");
  };

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    setSelectedFile(null);
    setUploadStatus(null);
    setUploadError(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type (PDF)
      if (file.type !== "application/pdf") {
        setUploadError("Please select a PDF file");
        setSelectedFile(null);
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setUploadError("File size must be less than 10MB");
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setUploadError(null);
      setUploadStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedAgent) {
      return;
    }

    setUploadLoading(true);
    setUploadError(null);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Try different identifier strategies based on what the training API might accept
      // Priority: agent_id (UUID) > agentId > numeric id > name
      const agentIdentifier =
        selectedAgent.agent_id ||
        selectedAgent.agentId ||
        selectedAgent.id.toString();

      formData.append("agent_id", agentIdentifier);

      console.log("Training agent with identifier:", agentIdentifier);
      console.log("Full agent details:", selectedAgent);
      console.log("Available agent fields:", Object.keys(selectedAgent));

      // Use environment variable for train API URL, fallback to production URL
      const trainApiUrl =
        process.env.REACT_APP_TRAIN_API_URL ||
        "https://train-agent.vercel.app/train";
      console.log("Train API URL:", trainApiUrl);

      const response = await fetch(trainApiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Upload error:", errorData);
        console.error("Tried agent identifier:", agentIdentifier);

        // Provide helpful error message
        let errorMessage =
          errorData.message ||
          errorData.error ||
          `Upload failed! status: ${response.status}`;
        if (errorMessage.includes("Agent not found")) {
          errorMessage = `Agent not found in training system. The agent may need to be registered with the training API first. Tried identifier: ${agentIdentifier}`;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Upload successful:", result);
      setUploadStatus(result);
      setSelectedFile(null);

      // Reset file input
      const fileInput = document.getElementById("file-upload");
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload document");
    } finally {
      setUploadLoading(false);
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="train-agent-container">
        <div className="train-agent-header">
          <div className="header-content">
            <h1>ATHENA AI - Train Your Agent</h1>
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
        <div className="train-agent-content">
          <div className="loading-container">
            <div className="loading-spinner-large">⏳</div>
            <p>Loading your agents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="train-agent-container">
      <div className="train-agent-header">
        <div className="header-content">
          <h1>ATHENA AI - Train Your Agent</h1>
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

      <div className="train-agent-content">
        <div className="welcome-section">
          <h2>Train Your AI Agent</h2>
          <p className="welcome-description">
            {selectedAgent
              ? `Upload documents to train ${
                  selectedAgent.name || selectedAgent.domain || "your agent"
                }`
              : "Select an agent and upload documents to enhance their knowledge base"}
          </p>
          {agentIdFromUrl && (
            <button
              onClick={() => navigate("/creator")}
              className="back-to-agents-btn"
            >
              ← Back to Agent List
            </button>
          )}
        </div>

        {agents.length === 0 ? (
          <div className="no-agents-message">
            <div className="empty-icon">🤖</div>
            <h3>No Agents Found</h3>
            <p>Create an agent first before training</p>
            <button
              onClick={() => navigate("/creator")}
              className="create-agent-btn"
            >
              Go to Creator Studio
            </button>
          </div>
        ) : (
          <div className="training-workspace">
            {/* Show agent selection only if no agent is pre-selected from URL */}
            {!agentIdFromUrl && (
              <div className="agent-selection-section">
                <h3>Select Agent to Train</h3>
                <div className="agent-selection-grid">
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      className={`agent-selection-card ${
                        selectedAgent?.id === agent.id ? "selected" : ""
                      }`}
                      onClick={() => handleAgentSelect(agent)}
                    >
                      <div className="agent-selection-icon">🤖</div>
                      <div className="agent-selection-info">
                        <h4>{agent.name || agent.domain || "Unnamed Agent"}</h4>
                        <span className="agent-selection-type">
                          {getVisibilityLabel(agent.visibility || "private")}
                        </span>
                        {agent.description && (
                          <p className="agent-description-preview">
                            {agent.description.substring(0, 60)}
                            {agent.description.length > 60 ? "..." : ""}
                          </p>
                        )}
                      </div>
                      {selectedAgent?.id === agent.id && (
                        <div className="selected-indicator">✓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Section */}
            {selectedAgent && (
              <div className="upload-section">
                <div className="upload-card">
                  <div className="upload-header">
                    <h3>Upload Training Document</h3>
                    <p>Upload PDF documents to train your agent</p>
                  </div>

                  <div className="upload-area">
                    <input
                      type="file"
                      id="file-upload"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="file-input"
                    />
                    <label htmlFor="file-upload" className="file-upload-label">
                      <div className="upload-icon">📄</div>
                      <div className="upload-text">
                        <span className="upload-prompt">
                          Click to select a PDF file
                        </span>
                        <span className="upload-hint">
                          Maximum file size: 10MB
                        </span>
                      </div>
                    </label>
                  </div>

                  {selectedFile && (
                    <div className="selected-file-info">
                      <div className="file-details">
                        <span className="file-icon">📄</span>
                        <div className="file-info">
                          <span className="file-name">{selectedFile.name}</span>
                          <span className="file-size">
                            {formatFileSize(selectedFile.size)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleUpload}
                        disabled={uploadLoading}
                        className="upload-btn"
                      >
                        {uploadLoading ? "⏳ Uploading..." : "Upload Document"}
                      </button>
                    </div>
                  )}

                  {uploadError && (
                    <div className="upload-error">
                      <span className="error-icon">⚠️</span>
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {uploadStatus && uploadStatus.success && (
                    <div className="upload-success">
                      <span className="success-icon">✓</span>
                      <div className="success-details">
                        <span className="success-message">
                          {uploadStatus.message}
                        </span>
                        {uploadStatus.data && (
                          <div className="document-details">
                            <p>
                              <strong>Document ID:</strong>{" "}
                              {uploadStatus.data.documentId}
                            </p>
                            <p>
                              <strong>Pages:</strong>{" "}
                              {uploadStatus.data.metadata?.pages || "Success"}
                            </p>
                            <p>
                              <strong>Word Count:</strong>{" "}
                              {uploadStatus.data.metadata?.wordCount ||
                                "Success"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TrainAgent;
