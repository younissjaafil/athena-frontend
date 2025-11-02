import { useState, useEffect } from "react";
import "./AgentForm.css";

function AgentForm({ existingAgent, onSuccess, onCancel, instructorId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    avatar_url: "",
    model_type: "gpt-5",
    temperature: 0.7,
    visibility: "private",
  });

  // Populate form if editing existing agent
  useEffect(() => {
    if (existingAgent) {
      setFormData({
        name: existingAgent.name || "",
        description: existingAgent.description || "",
        avatar_url: existingAgent.avatar_url || "",
        model_type: existingAgent.model_type || "gpt-5",
        temperature: existingAgent.temperature || 0.7,
        visibility: existingAgent.visibility || "private",
      });
    }
  }, [existingAgent]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        instructor_id: instructorId,
        ...formData,
        temperature: parseFloat(formData.temperature),
      };

      // Use the creator-specific URL if it exists, otherwise use the new unified API
      const newApiBaseUrl = `${process.env.REACT_APP_BASE_API_URL}/api/creator/agents`;
      const oldApiBaseUrl = `${process.env.REACT_APP_CREATOR_BASE_API_URL}/creator/agents`;
      const baseUrl = process.env.REACT_APP_CREATOR_BASE_API_URL
        ? oldApiBaseUrl
        : newApiBaseUrl;

      const url = existingAgent ? `${baseUrl}/${existingAgent.id}` : baseUrl;

      const method = existingAgent ? "PUT" : "POST";

      console.log("Submitting agent to:", url);
      console.log("Payload:", payload);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData);
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Agent saved successfully:", result);
      setSuccessMessage(
        existingAgent
          ? "Agent updated successfully!"
          : "Agent created successfully!"
      );

      // Call success callback after a short delay to show message
      setTimeout(() => {
        onSuccess(result.data);
      }, 1500);
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agent-form-container">
      <div className="agent-form-header">
        <h2>{existingAgent ? "Edit Agent" : "Create New Agent"}</h2>
        <button onClick={onCancel} className="close-btn" disabled={loading}>
          ✕
        </button>
      </div>

      {error && (
        <div className="form-message error-message">
          <span className="message-icon">⚠️</span>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="form-message success-message">
          <span className="message-icon">✅</span>
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="agent-form">
        {/* Agent Name */}
        <div className="form-group">
          <label htmlFor="name">Agent Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Dr. Smith's CS101 Assistant"
            required
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your agent's purpose and expertise"
            rows="4"
            disabled={loading}
          />
        </div>

        {/* Avatar URL */}
        <div className="form-group">
          <label htmlFor="avatar_url">Avatar URL (optional)</label>
          <input
            type="url"
            id="avatar_url"
            name="avatar_url"
            value={formData.avatar_url}
            onChange={handleInputChange}
            placeholder="https://example.com/avatar.png"
            disabled={loading}
          />
        </div>

        {/* Model Type */}
        <div className="form-group">
          <label htmlFor="model_type">AI Model</label>
          <select
            id="model_type"
            name="model_type"
            value={formData.model_type}
            onChange={handleInputChange}
            disabled={loading}
          >
            <option value="gpt-5">GPT-5</option>
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="claude-3">Claude 3</option>
          </select>
        </div>

        {/* Temperature */}
        <div className="form-group">
          <label htmlFor="temperature">
            Creativity Level (Temperature: {formData.temperature})
          </label>
          <input
            type="range"
            id="temperature"
            name="temperature"
            min="0"
            max="2"
            step="0.1"
            value={formData.temperature}
            onChange={handleInputChange}
            disabled={loading}
          />
          <div className="temperature-labels">
            <span>Focused (0)</span>
            <span>Balanced (1)</span>
            <span>Creative (2)</span>
          </div>
        </div>

        {/* Visibility */}
        <div className="form-group">
          <label htmlFor="visibility">Visibility</label>
          <select
            id="visibility"
            name="visibility"
            value={formData.visibility}
            onChange={handleInputChange}
            disabled={loading}
          >
            <option value="private">
              🔒 Private - Only you can see this agent
            </option>
            <option value="campus">
              🏫 Campus - All students on your campus
            </option>
            <option value="public">
              🌍 Public - Anyone can use this agent
            </option>
          </select>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-btn"
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="loading-spinner">⏳</span>
            ) : existingAgent ? (
              "Update Agent"
            ) : (
              "Create Agent"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AgentForm;
