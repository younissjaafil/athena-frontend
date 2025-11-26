import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./UserChat.css";

function UserChat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const agentId = searchParams.get("agentId");
  const paymentStatus = searchParams.get("payment");

  const [userData, setUserData] = useState(null);
  const [agent, setAgent] = useState(null);
  const [agentInfo, setAgentInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentBanner, setPaymentBanner] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const API_BASE_URL =
    process.env.REACT_APP_AGENT_API_URL || "https://agent.athena-ai.pro";
  const CHAT_API_URL =
    process.env.REACT_APP_CHAT_API_URL || "https://agent-chat-alpha.vercel.app";

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check authentication and get agent details
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (!storedUserData) {
      navigate("/");
      return;
    }

    const user = JSON.parse(storedUserData);
    setUserData(user);

    if (!agentId) {
      setError("No agent selected");
      return;
    }

    // Handle payment callback from Whish
    if (paymentStatus === "success") {
      // Payment successful - save to localStorage and show success banner
      const paidAgents = JSON.parse(localStorage.getItem("paidAgents") || "[]");
      if (!paidAgents.includes(agentId)) {
        paidAgents.push(agentId);
        localStorage.setItem("paidAgents", JSON.stringify(paidAgents));
      }
      setPaymentBanner({
        type: "success",
        message: "Payment successful! You now have access to this agent.",
      });
      // Clear URL params
      window.history.replaceState({}, "", `/chat?agentId=${agentId}`);
    } else if (paymentStatus === "failed") {
      setPaymentBanner({
        type: "error",
        message: "Payment failed. Please try again.",
      });
      window.history.replaceState({}, "", `/chat?agentId=${agentId}`);
    }

    // Fetch agent details and check payment
    const initializeChat = async () => {
      try {
        // Fetch agent details
        const response = await fetch(`${API_BASE_URL}/agents`);
        const result = await response.json();
        console.log("Chat - API Response:", result);

        let selectedAgent = null;
        if (result.success && result.data && result.data.agents) {
          selectedAgent = result.data.agents.find(
            (a) => a.id === agentId || a.id.toString() === agentId
          );
        }

        if (!selectedAgent) {
          setError("Agent not found");
          setIsFetchingHistory(false);
          return;
        }

        // Check pricing
        try {
          const pricingResponse = await fetch(
            `${API_BASE_URL}/api/agents/${selectedAgent.id}/pricing`
          );
          if (pricingResponse.ok) {
            const pricingResult = await pricingResponse.json();
            if (pricingResult.success && pricingResult.data) {
              selectedAgent = {
                ...selectedAgent,
                role: pricingResult.data.role || "free",
                priceAmount: pricingResult.data.priceAmount,
                priceCurrency: pricingResult.data.priceCurrency || "USD",
                requiresPayment: pricingResult.data.requiresPayment,
              };
            }
          }
        } catch (err) {
          console.log("Could not fetch pricing:", err);
        }

        setAgent(selectedAgent);

        // Check if agent requires payment
        const paidAgents = JSON.parse(
          localStorage.getItem("paidAgents") || "[]"
        );
        if (
          selectedAgent.role === "paid" &&
          !paidAgents.includes(agentId) &&
          paymentStatus !== "success"
        ) {
          // Check payment status from backend
          try {
            const statusResponse = await fetch(
              `${API_BASE_URL}/api/agents/${selectedAgent.id}/payment/status?userId=${user.user_id}`
            );
            if (statusResponse.ok) {
              const statusResult = await statusResponse.json();
              if (statusResult.success && statusResult.data?.hasPaid) {
                // User has paid - update localStorage
                paidAgents.push(agentId);
                localStorage.setItem("paidAgents", JSON.stringify(paidAgents));
              } else {
                // Show payment required
                setPaymentInfo({
                  agentId: selectedAgent.id,
                  amount: selectedAgent.priceAmount,
                  currency: selectedAgent.priceCurrency,
                  agentName: selectedAgent.name,
                });
                setShowPaymentModal(true);
                setIsFetchingHistory(false);
                return;
              }
            }
          } catch (err) {
            console.log("Could not check payment status:", err);
            // Show payment modal as fallback
            setPaymentInfo({
              agentId: selectedAgent.id,
              amount: selectedAgent.priceAmount,
              currency: selectedAgent.priceCurrency,
              agentName: selectedAgent.name,
            });
            setShowPaymentModal(true);
            setIsFetchingHistory(false);
            return;
          }
        }

        // Fetch chat history
        await fetchChatHistory(user.user_id, agentId);
      } catch (err) {
        console.error("Error initializing chat:", err);
        setError("Failed to load agent details");
        setIsFetchingHistory(false);
      }
    };

    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, agentId, paymentStatus]);

  const fetchChatHistory = async (userId, agentId) => {
    setIsFetchingHistory(true);
    try {
      const params = new URLSearchParams({
        userId: userId,
        agentId: agentId,
        limit: "50",
        offset: "0",
      });

      const response = await fetch(
        `${API_BASE_URL}/v1/chai/getHistory?${params}`
      );
      const result = await response.json();

      if (result.success && result.data && result.data.messages) {
        const formattedMessages = result.data.messages.map((msg) => ({
          text: msg.text || msg.content,
          isUser: msg.role === "user" || msg.isUser,
          timestamp: msg.timestamp,
        }));
        setMessages(formattedMessages);
      }
    } catch (err) {
      console.error("Error fetching chat history:", err);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      text: inputValue,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${CHAT_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.user_id,
          agentId: agentId,
          message: userMessage.text,
        }),
      });

      // Handle 402 Payment Required
      if (response.status === 402) {
        const result = await response.json();
        setPaymentInfo({
          agentId: agentId,
          amount: result.data?.amount || agent?.priceAmount,
          currency: result.data?.currency || agent?.priceCurrency || "USD",
          agentName: agent?.name,
        });
        setShowPaymentModal(true);
        // Remove the user message since we can't send it
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Store agent info from response if available
        if (result.agent && !agentInfo) {
          setAgentInfo(result.agent);
        }

        const agentMessage = {
          text: result.response,
          isUser: false,
          timestamp: result.timestamp || new Date().toISOString(),
        };
        setMessages((prev) => [...prev, agentMessage]);
      } else {
        throw new Error(result.error || "Failed to get response");
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage = {
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      setError(err.message);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleInitiatePayment = async () => {
    if (!paymentInfo || !userData) return;

    setPaymentLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/agents/${paymentInfo.agentId}/payment/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userData.user_id,
            successRedirectUrl: `https://athena-ai.pro/payment/success?agentId=${paymentInfo.agentId}`,
            failureRedirectUrl: `https://athena-ai.pro/payment/failure?agentId=${paymentInfo.agentId}`,
            successCallbackUrl: "https://athena-ai.pro/api/payment/success",
            failureCallbackUrl: "https://athena-ai.pro/api/payment/failure",
          }),
        }
      );

      const result = await response.json();
      console.log("Payment create response:", result);

      if (result.success && result.data?.collectUrl) {
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
    navigate("/student");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleBackToDashboard = () => {
    navigate("/student");
  };

  if (error && !agent) {
    return (
      <div className="user-chat-container">
        <div className="chat-error-screen">
          <div className="error-icon">⚠️</div>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={handleBackToDashboard} className="back-btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-chat-container">
      {/* Header */}
      <div className="chat-header">
        <button onClick={handleBackToDashboard} className="back-button">
          ← Back
        </button>
        <div className="agent-info">
          <div className="agent-avatar">🤖</div>
          <div className="agent-details">
            <h2>{agent?.name || agentInfo?.name || "AI Assistant"}</h2>
            <p className="agent-status">
              <span className="status-dot"></span> Online • Agent ID:{" "}
              <code>{agentInfo?.agentId || agentId}</code>
            </p>
          </div>
        </div>
        <div className="header-actions">
          <span className="user-badge">{userData?.username}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages-area">
        {isFetchingHistory ? (
          <div className="loading-history">
            <div className="spinner">⏳</div>
            <p>Loading conversation...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-chat">
            <div className="welcome-bot">🤖</div>
            <h3>Start a conversation with {agent?.name || "AI Assistant"}</h3>
            <p>
              {agent?.description ||
                "I'm here to help you with your questions!"}
            </p>
            <div className="suggested-prompts">
              <button
                className="prompt-btn"
                onClick={() => setInputValue("Tell me about your capabilities")}
              >
                💡 What can you help me with?
              </button>
              <button
                className="prompt-btn"
                onClick={() => setInputValue("Explain a concept to me")}
              >
                📚 Help me learn something
              </button>
              <button
                className="prompt-btn"
                onClick={() => setInputValue("I have a question")}
              >
                ❓ Ask a question
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${
                  msg.isUser ? "user-message" : "agent-message"
                } ${msg.isError ? "error-message" : ""}`}
              >
                {!msg.isUser && (
                  <div className="message-avatar">
                    {msg.isError ? "⚠️" : "🤖"}
                  </div>
                )}
                <div className="message-content">
                  <div className="message-text">{msg.text}</div>
                  <div className="message-timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                {msg.isUser && (
                  <div className="message-avatar user-avatar">
                    {userData?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="message agent-message typing-indicator">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        {paymentBanner && (
          <div className={`payment-banner ${paymentBanner.type}`}>
            {paymentBanner.type === "success" ? "✅" : "⚠️"}{" "}
            {paymentBanner.message}
            <button
              className="banner-close"
              onClick={() => setPaymentBanner(null)}
            >
              ×
            </button>
          </div>
        )}
        {error && !isFetchingHistory && (
          <div className="error-banner">⚠️ {error}</div>
        )}
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${agent?.name || "AI Assistant"}...`}
            disabled={isLoading}
            rows="1"
            className="chat-input"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="send-button"
          >
            {isLoading ? "⏳" : "➤"}
          </button>
        </div>
        <div className="input-footer">
          <small>
            🧠 Powered by ATHENA AI • {agent?.model_type || "GPT-4"} • 📚
            Trained on instructor documents (Agent:{" "}
            {agentInfo?.agentId?.substring(0, 8) || agentId?.substring(0, 8)}
            ...)
          </small>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && paymentInfo && (
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
                  <h4>{paymentInfo.agentName || agent?.name}</h4>
                  <p>{agent?.description}</p>
                </div>
              </div>
              <div className="price-display">
                <span className="currency">{paymentInfo.currency}</span>
                <span className="amount">{paymentInfo.amount?.toFixed(2)}</span>
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

export default UserChat;
