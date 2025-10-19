import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./StudentDashboard.css";

function StudentDashboard() {
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
            Continue your learning journey with Athena AI
          </p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-icon">📚</div>
            <h3>My Courses</h3>
            <p>Access your enrolled courses and learning materials</p>
            <button className="card-action-btn">View Courses</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📝</div>
            <h3>Assignments</h3>
            <p>Check and submit your pending assignments</p>
            <button className="card-action-btn">View Assignments</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🎯</div>
            <h3>Quizzes</h3>
            <p>Take quizzes and test your knowledge</p>
            <button className="card-action-btn">Start Quiz</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📊</div>
            <h3>My Progress</h3>
            <p>Track your learning progress and achievements</p>
            <button className="card-action-btn">View Progress</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🤖</div>
            <h3>AI Tutor</h3>
            <p>Get personalized help from your AI assistant</p>
            <button className="card-action-btn">Chat Now</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🏆</div>
            <h3>Achievements</h3>
            <p>View your badges and accomplishments</p>
            <button className="card-action-btn">View Badges</button>
          </div>
        </div>

        <div className="upcoming-section">
          <h3>Upcoming Deadlines</h3>
          <div className="deadline-list">
            <div className="deadline-item urgent">
              <div className="deadline-icon">⚠️</div>
              <div className="deadline-details">
                <p className="deadline-title">Math Assignment #5</p>
                <p className="deadline-time">Due in 2 hours</p>
              </div>
              <button className="deadline-btn">Start</button>
            </div>
            <div className="deadline-item">
              <div className="deadline-icon">📝</div>
              <div className="deadline-details">
                <p className="deadline-title">Science Quiz - Chapter 3</p>
                <p className="deadline-time">Due tomorrow</p>
              </div>
              <button className="deadline-btn">Start</button>
            </div>
            <div className="deadline-item">
              <div className="deadline-icon">📖</div>
              <div className="deadline-details">
                <p className="deadline-title">History Essay</p>
                <p className="deadline-time">Due in 3 days</p>
              </div>
              <button className="deadline-btn">View</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
