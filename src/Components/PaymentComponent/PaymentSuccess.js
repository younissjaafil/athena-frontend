import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Payment.css";

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const agentId = searchParams.get("agentId");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Save paid agent to localStorage
    if (agentId) {
      const paidAgents = JSON.parse(localStorage.getItem("paidAgents") || "[]");
      if (!paidAgents.includes(agentId)) {
        paidAgents.push(agentId);
        localStorage.setItem("paidAgents", JSON.stringify(paidAgents));
      }
    }

    // Countdown and redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (agentId) {
            navigate(`/chat?agentId=${agentId}&payment=success`);
          } else {
            navigate("/student");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [agentId, navigate]);

  const handleContinue = () => {
    if (agentId) {
      navigate(`/chat?agentId=${agentId}&payment=success`);
    } else {
      navigate("/student");
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-container success">
        <div className="payment-icon">✅</div>
        <h1>Payment Successful!</h1>
        <p className="payment-message">
          Thank you for your purchase. You now have access to the AI assistant.
        </p>
        <div className="payment-details">
          {agentId && (
            <p className="agent-info">
              Agent ID: <code>{agentId.substring(0, 8)}...</code>
            </p>
          )}
        </div>
        <p className="redirect-notice">
          Redirecting in <span className="countdown">{countdown}</span>{" "}
          seconds...
        </p>
        <button onClick={handleContinue} className="continue-btn">
          Continue to Chat →
        </button>
      </div>
    </div>
  );
}

export default PaymentSuccess;
