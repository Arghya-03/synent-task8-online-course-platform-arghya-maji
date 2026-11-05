
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/forgot-password",
                { email }
            );

            setMessage(response.data.message);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to process your request. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="password-recovery-page">
            <form
                className="password-recovery-card"
                onSubmit={handleSubmit}
            >
                

                <h2>Forgot Password?</h2>

                <p className="password-recovery-description">
                    No worries! Enter your registered email address and
                    we'll send you a secure link to reset your password.
                </p>

                <label htmlFor="recovery-email">Email Address</label>

                <input
                    id="recovery-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                />

                <button
                    type="submit"
                    className="password-recovery-button"
                    disabled={loading}
                >
                    {loading ? "Sending Reset Link..." : "Send Reset Link"}
                </button>

                {message && (
                    <div className="recovery-feedback success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="recovery-feedback error">
                        {error}
                    </div>
                )}

                <div className="recovery-navigation-links">
                    <Link to="/login" className="recovery-back-link">
                        ← Back to Login
                    </Link>

                    <Link to="/" className="recovery-back-link">
                        Back to Home →
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default ForgotPassword;
