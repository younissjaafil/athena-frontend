import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./StudentDashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paidAgents, setPaidAgents] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const API_BASE_URL =
    process.env.REACT_APP_AGENT_API_URL || "https://agent.athena-ai.pro";

  useEffect(() => {
    // Get user data from localStorage
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));

      // Load paid agents from localStorage
      const storedPaidAgents = localStorage.getItem("paidAgents");
      if (storedPaidAgents) {
        setPaidAgents(JSON.parse(storedPaidAgents));
      }

      // Fetch available agents
      fetchAgents();
    } else {
      // If no user data, redirect to login
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      let agentsList = [];
      // API returns agents in result.data.agents array
      if (result.success && result.data && Array.isArray(result.data.agents)) {
        agentsList = result.data.agents;
      } else if (result.success && Array.isArray(result.data)) {
        agentsList = result.data;
      } else if (Array.isArray(result)) {
        agentsList = result;
      }

      // Fetch pricing for each agent
      const agentsWithPricing = await Promise.all(
        agentsList.map(async (agent) => {
          try {
            const pricingResponse = await fetch(
              `${API_BASE_URL}/api/agents/${agent.agentId}/pricing`
            );
            if (pricingResponse.ok) {
              const pricingResult = await pricingResponse.json();
              if (pricingResult.success && pricingResult.data) {
                return {
                  ...agent,
                  role: pricingResult.data.role || "free",
                  priceAmount: pricingResult.data.priceAmount,
                  priceCurrency: pricingResult.data.priceCurrency || "USD",
                  requiresPayment: pricingResult.data.requiresPayment,
                };
              }
            }
          } catch (err) {
            console.log(
              `Could not fetch pricing for agent ${agent.agentId}:`,
              err
            );
          }
          // Default to free if pricing fetch fails
          return { ...agent, role: "free", requiresPayment: false };
        })
      );

      console.log("Agents with pricing:", agentsWithPricing);
      setAgents(agentsWithPricing);
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

  const handleChatWithAgent = (agent) => {
    // Check if agent requires payment and user hasn't paid
    if (agent.role === "paid" && !paidAgents.includes(agent.agentId)) {
      setSelectedAgent(agent);
      setShowPaymentModal(true);
      return;
    }
    navigate(`/chat?agentId=${agent.agentId}`);
  };

  const handleInitiatePayment = async () => {
    if (!selectedAgent || !userData) return;

    setPaymentLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/agents/${selectedAgent.agentId}/payment/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userData.user_id,
            successRedirectUrl: `https://athena-ai.pro/payment/success?agentId=${selectedAgent.agentId}`,
            failureRedirectUrl: `https://athena-ai.pro/payment/failure?agentId=${selectedAgent.agentId}`,
            successCallbackUrl: "https://athena-ai.pro/api/payment/success",
            failureCallbackUrl: "https://athena-ai.pro/api/payment/failure",
          }),
        }
      );

      const result = await response.json();
      console.log("Payment create response:", result);

      if (result.success && result.data?.collectUrl) {
        // Redirect to Whish payment page
        window.location.href = result.data.collectUrl;
      } else {
        throw new Error(result.message || "Failed to create payment");
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert(`Payment error: ${err.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedAgent(null);
  };

  const isAgentPaid = (agent) => {
    return agent.role === "paid" && !paidAgents.includes(agent.agentId);
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
              {agents.map((agent) => {
                const isPaid = isAgentPaid(agent);

                return (
                  <div
                    key={agent.id}
                    className={`agent-card ${isPaid ? "locked-agent" : ""}`}
                  >
                    <div className="agent-card-header">
                      <div className="agent-icon">{isPaid ? "🔒" : "🤖"}</div>
                      <div className="agent-badge">GPT-4</div>
                      {agent.role === "paid" && (
                        <div className="premium-badge">💎 Premium</div>
                      )}
                    </div>

                    <div className="agent-card-body">
                      <h4 className="agent-name">{agent.name}</h4>
                      <p className="agent-description">
                        {agent.description || "AI Assistant ready to help you"}
                      </p>

                      <div className="agent-metadata">
                        <div className="metadata-item">
                          <span className="metadata-label">📋 Agent ID:</span>
                          <span className="metadata-value metadata-id">
                            {agent.agentId?.substring(0, 8)}...
                          </span>
                        </div>
                        <div className="metadata-item">
                          <span className="metadata-label">
                            🌡️ Temperature:
                          </span>
                          <span className="metadata-value">
                            {agent.temperature}
                          </span>
                        </div>
                        {agent.role === "paid" && (
                          <div className="metadata-item">
                            <span className="metadata-label">💰 Price:</span>
                            <span className="metadata-value price-tag">
                              ${agent.priceAmount?.toFixed(2)}{" "}
                              {agent.priceCurrency}
                            </span>
                          </div>
                        )}
                        <div className="metadata-item metadata-full-width">
                          <span className="metadata-label">📚 Knowledge:</span>
                          <span className="metadata-value">
                            Trained on instructor documents
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="agent-card-footer">
                      {isPaid ? (
                        <button
                          onClick={() => handleChatWithAgent(agent)}
                          className="pay-btn"
                        >
                          💳 Unlock for ${agent.priceAmount?.toFixed(2)}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleChatWithAgent(agent)}
                          className="chat-with-agent-btn"
                        >
                          💬 Chat with me
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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

      {/* Payment Modal */}
      {showPaymentModal && selectedAgent && (
        <div className="modal-overlay" onClick={closePaymentModal}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon">💳</span>
              <h2>Payment Required</h2>
            </div>
            <div className="modal-body">
              <p>This AI assistant requires a one-time payment to access.</p>
              <div className="agent-preview">
                <div className="preview-icon">🤖</div>
                <div className="preview-info">
                  <h4>{selectedAgent.name}</h4>
                  <p>{selectedAgent.description}</p>
                </div>
              </div>
              <div className="price-display">
                <span className="currency">
                  {selectedAgent.priceCurrency || "USD"}
                </span>
                <span className="amount">
                  {selectedAgent.priceAmount?.toFixed(2)}
                </span>
              </div>
              <p className="payment-note">
                You will be redirected to Whish to complete payment securely.
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={closePaymentModal}
                disabled={paymentLoading}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleInitiatePayment}
                disabled={paymentLoading}
              >
                {paymentLoading ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
