import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Creator.css";

function Creator() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    } else {
      // If no user data, redirect to login
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    navigate("/");
  };

  return (
    <div className="creator-container">
      <div className="creator-header">
        <div className="header-content">
          <h1>ATHENA AI - Creator Studio</h1>
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

      <div className="creator-content">
        <div className="welcome-section">
          <h2>Welcome to Creator Studio</h2>
          <p className="welcome-description">
            Create, manage, and publish educational content for your students
          </p>
        </div>

        <div className="creator-grid">
          <div className="creator-card">
            <div className="card-icon">📝</div>
            <h3>Create Content</h3>
            <p>Design interactive lessons, quizzes, and learning materials</p>
            <button className="card-action-btn">Start Creating</button>
          </div>

          <div className="creator-card">
            <div className="card-icon">📚</div>
            <h3>My Content</h3>
            <p>View and manage all your created educational content</p>
            <button className="card-action-btn">View Content</button>
          </div>

          <div className="creator-card">
            <div className="card-icon">👥</div>
            <h3>Student Progress</h3>
            <p>Track student performance and learning analytics</p>
            <button className="card-action-btn">View Analytics</button>
          </div>

          <div className="creator-card">
            <div className="card-icon">🎯</div>
            <h3>Assignments</h3>
            <p>Create and manage assignments for your students</p>
            <button className="card-action-btn">Manage</button>
          </div>

          <div className="creator-card">
            <div className="card-icon">🤖</div>
            <h3>AI Assistant</h3>
            <p>Use AI to generate content and learning materials</p>
            <button className="card-action-btn">Open AI Tools</button>
          </div>

          <div className="creator-card">
            <div className="card-icon">📊</div>
            <h3>Reports</h3>
            <p>Generate detailed reports on student performance</p>
            <button className="card-action-btn">View Reports</button>
          </div>
        </div>

        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">✅</div>
              <div className="activity-details">
                <p className="activity-title">New lesson published</p>
                <p className="activity-time">2 hours ago</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">👥</div>
              <div className="activity-details">
                <p className="activity-title">15 students completed quiz</p>
                <p className="activity-time">5 hours ago</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📝</div>
              <div className="activity-details">
                <p className="activity-title">Assignment graded</p>
                <p className="activity-time">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Creator;
