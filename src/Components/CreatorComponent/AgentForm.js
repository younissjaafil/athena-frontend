import { useState, useEffect } from "react";
import "./AgentForm.css";

function AgentForm({ existingAgent, onSuccess, onCancel, creatorId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [voiceLoading, setVoiceLoading] = useState(false);

  const [formData, setFormData] = useState({
    agent_type: "instructor",
    domain: "",
    campus: "",
    region: "Lebanon",
    courses: [],
    personality: {
      tone: "friendly",
      formality: "professional",
    },
  });

  const [selectedVoice, setSelectedVoice] = useState("");
  const [voiceSaved, setVoiceSaved] = useState(false);
  const [courseInput, setCourseInput] = useState("");

  // Voice options with display names
  const voiceOptions = [
    { id: "English_Graceful_Lady", name: "English Graceful Lady" },
    { id: "English_Insightful_Speaker", name: "English Insightful Speaker" },
    { id: "English_radiant_girl", name: "English Radiant Girl" },
    { id: "English_Persuasive_Man", name: "English Persuasive Man" },
    {
      id: "moss_audio_6dc281eb-713c-11f0-a447-9613c873494c",
      name: "Moss Audio 1",
    },
    {
      id: "moss_audio_570551b1-735c-11f0-b236-0adeeecad052",
      name: "Moss Audio 2",
    },
    {
      id: "moss_audio_ad5baf92-735f-11f0-8263-fe5a2fe98ec8",
      name: "Moss Audio 3",
    },
    { id: "English_Lucky_Robot", name: "English Lucky Robot" },
  ];

  // Populate form if editing existing agent
  useEffect(() => {
    if (existingAgent) {
      setFormData({
        agent_type: existingAgent.agent_type || "instructor",
        domain: existingAgent.domain || "",
        campus: existingAgent.campus || "",
        region: existingAgent.region || "Lebanon",
        courses: existingAgent.courses || [],
        personality: existingAgent.personality || {
          tone: "friendly",
          formality: "professional",
        },
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

  const handlePersonalityChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      personality: {
        ...prev.personality,
        [name]: value,
      },
    }));
  };

  const handleAddCourse = () => {
    if (courseInput.trim() && !formData.courses.includes(courseInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        courses: [...prev.courses, courseInput.trim()],
      }));
      setCourseInput("");
    }
  };

  const handleRemoveCourse = (courseToRemove) => {
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.filter((course) => course !== courseToRemove),
    }));
  };

  const handleVoiceChange = (e) => {
    setSelectedVoice(e.target.value);
    setVoiceSaved(false);
  };

  const handleSaveVoice = async () => {
    if (!selectedVoice) {
      setError("Please select a voice first");
      return;
    }

    setVoiceLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_CREATOR_BASE_API_URL}/creator/clone_builtin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: creatorId,
            voice_id: selectedVoice,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      setVoiceSaved(true);
      setSuccessMessage("Voice saved successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

      console.log("Voice saved:", result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setVoiceLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        creator_id: creatorId,
        ...formData,
      };

      const url = existingAgent
        ? `${process.env.REACT_APP_CREATOR_BASE_API_URL}/creator/agents/${existingAgent.id}`
        : `${process.env.REACT_APP_CREATOR_BASE_API_URL}/creator/agents`;

      const method = existingAgent ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
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
        {/* Agent Type */}
        <div className="form-group">
          <label htmlFor="agent_type">Agent Type *</label>
          <select
            id="agent_type"
            name="agent_type"
            value={formData.agent_type}
            onChange={handleInputChange}
            required
            disabled={loading}
          >
            <option value="instructor">Instructor</option>
            <option value="it_support">IT Support</option>
            <option value="administration">Administration</option>
          </select>
        </div>

        {/* Domain */}
        <div className="form-group">
          <label htmlFor="domain">Domain/Subject *</label>
          <input
            type="text"
            id="domain"
            name="domain"
            value={formData.domain}
            onChange={handleInputChange}
            placeholder="e.g., Computer Science, Mathematics"
            required
            disabled={loading}
          />
        </div>

        {/* Campus */}
        <div className="form-group">
          <label htmlFor="campus">Campus *</label>
          <input
            type="text"
            id="campus"
            name="campus"
            value={formData.campus}
            onChange={handleInputChange}
            placeholder="e.g., Main Campus, North Campus"
            required
            disabled={loading}
          />
        </div>

        {/* Region */}
        <div className="form-group">
          <label htmlFor="region">Region</label>
          <input
            type="text"
            id="region"
            name="region"
            value={formData.region}
            onChange={handleInputChange}
            placeholder="e.g., Lebanon"
            disabled={loading}
          />
        </div>

        {/* Courses */}
        <div className="form-group">
          <label htmlFor="courseInput">Courses</label>
          <div className="course-input-group">
            <input
              type="text"
              id="courseInput"
              value={courseInput}
              onChange={(e) => setCourseInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCourse();
                }
              }}
              placeholder="e.g., CS101, CS102"
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleAddCourse}
              className="add-course-btn"
              disabled={loading || !courseInput.trim()}
            >
              Add
            </button>
          </div>
          <div className="course-tags">
            {formData.courses.map((course) => (
              <span key={course} className="course-tag">
                {course}
                <button
                  type="button"
                  onClick={() => handleRemoveCourse(course)}
                  className="remove-course-btn"
                  disabled={loading}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Voice Selection */}
        <div className="form-group">
          <label htmlFor="voice">Voice Selection</label>
          <div className="voice-selection-group">
            <select
              id="voice"
              name="voice"
              value={selectedVoice}
              onChange={handleVoiceChange}
              disabled={loading || voiceLoading}
              className="voice-select"
            >
              <option value="">Select a voice</option>
              {voiceOptions.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleSaveVoice}
              className="save-voice-btn"
              disabled={loading || voiceLoading || !selectedVoice || voiceSaved}
            >
              {voiceLoading ? (
                <span className="loading-spinner">⏳</span>
              ) : voiceSaved ? (
                "✅ Saved"
              ) : (
                "Save Voice"
              )}
            </button>
          </div>
        </div>

        {/* Personality - Tone */}
        <div className="form-group">
          <label htmlFor="tone">Personality Tone</label>
          <select
            id="tone"
            name="tone"
            value={formData.personality.tone}
            onChange={handlePersonalityChange}
            disabled={loading}
          >
            <option value="friendly">Friendly</option>
            <option value="professional">Professional</option>
            <option value="enthusiastic">Enthusiastic</option>
            <option value="supportive">Supportive</option>
            <option value="strict">Strict</option>
          </select>
        </div>

        {/* Personality - Formality */}
        <div className="form-group">
          <label htmlFor="formality">Formality Level</label>
          <select
            id="formality"
            name="formality"
            value={formData.personality.formality}
            onChange={handlePersonalityChange}
            disabled={loading}
          >
            <option value="casual">Casual</option>
            <option value="professional">Professional</option>
            <option value="formal">Formal</option>
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
