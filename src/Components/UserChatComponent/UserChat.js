import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./UserChat.css";

function UserChat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const agentId = searchParams.get("agentId");

  const [userData, setUserData] = useState(null);
  const [agent, setAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const API_BASE_URL = "https://agent-chat-alpha.vercel.app";

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

    // Fetch agent details
    const fetchAgentDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/agents`);
        const result = await response.json();
        console.log("Chat - API Response:", result);

        if (result.success && result.data && result.data.agents) {
          // API returns agents in result.data.agents array
          const selectedAgent = result.data.agents.find(
            (a) => a.agentId === agentId
          );
          console.log("Selected agent:", selectedAgent);
          if (selectedAgent) {
            setAgent(selectedAgent);
          } else {
            setError("Agent not found");
          }
        }
      } catch (err) {
        console.error("Error fetching agent details:", err);
        setError("Failed to load agent details");
      }
    };

    // Fetch chat history
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
        // Don't show error for history - just start fresh
      } finally {
        setIsFetchingHistory(false);
      }
    };

    fetchAgentDetails();
    fetchChatHistory(user.user_id, agentId);
  }, [navigate, agentId, API_BASE_URL]);

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
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.user_id,
          agentId: agentId,
          message: userMessage.text,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
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
            <h2>{agent?.name || "AI Assistant"}</h2>
            <p className="agent-status">
              <span className="status-dot"></span> Online
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
          <small>Powered by ATHENA AI • {agent?.model_type || "GPT-4"}</small>
        </div>
      </div>
    </div>
  );
}

export default UserChat;
