import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./Components/LoginComponent/Login";
import Configuration from "./Components/ConfigurationComponent/Configuration";
import Creator from "./Components/CreatorComponent/Creator";
import StudentDashboard from "./Components/StudentDashboardComponent/StudentDashboard";
import TrainAgent from "./Components/TrainAgentComponent/TrainAgent";
import UserChat from "./Components/UserChatComponent/UserChat";
import PaymentSuccess from "./Components/PaymentComponent/PaymentSuccess";
import PaymentFailure from "./Components/PaymentComponent/PaymentFailure";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/configuration" element={<Configuration />} />
          <Route path="/creator" element={<Creator />} />
          <Route path="/train" element={<TrainAgent />} />
          <Route path="/chat" element={<UserChat />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
