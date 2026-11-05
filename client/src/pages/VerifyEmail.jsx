import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

function VerifyEmail() {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/auth/verify-email/${token}`
        );

        setSuccess(true);
        setMessage(response.data.message);
      } catch (error) {
        setSuccess(false);
        setMessage(
          error.response?.data?.message ||
            "Email verification failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        {loading ? (
          <>
            <h2>Verifying Your Email...</h2>
            <p>Please wait while we verify your SkillNest account.</p>
          </>
        ) : (
          <>
            <h2>
              {success ? "Email Verified!" : "Verification Failed"}
            </h2>

            <p className="auth-message">{message}</p>

            {success && (
              <Link to="/login" className="nav-button">
                Go to Login
              </Link>
            )}

            {!success && (
              <Link to="/register" className="nav-button">
                Back to Register
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;