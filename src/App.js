import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./Components/LoginComponent/Login";
import Configuration from "./Components/ConfigurationComponent/Configuration";
import Creator from "./Components/CreatorComponent/Creator";
import StudentDashboard from "./Components/StudentDashboardComponent/StudentDashboard";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/configuration" element={<Configuration />} />
          <Route path="/creator" element={<Creator />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
