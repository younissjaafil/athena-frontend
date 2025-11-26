import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Payment.css";

function PaymentFailure() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const agentId = searchParams.get("agentId");
  const errorMessage = searchParams.get("error") || "Payment was not completed";
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Countdown and redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/student");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleRetry = () => {
    if (agentId) {
      navigate(`/student`);
    } else {
      navigate("/student");
    }
  };

  const handleGoBack = () => {
    navigate("/student");
  };

  return (
    <div className="payment-page">
      <div className="payment-container failure">
        <div className="payment-icon">❌</div>
        <h1>Payment Failed</h1>
        <p className="payment-message">{errorMessage}</p>
        <div className="payment-details">
          <p className="error-info">
            Don't worry - no charges were made to your account.
          </p>
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
        <div className="button-group">
          <button onClick={handleRetry} className="retry-btn">
            🔄 Try Again
          </button>
          <button onClick={handleGoBack} className="back-btn">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentFailure;
