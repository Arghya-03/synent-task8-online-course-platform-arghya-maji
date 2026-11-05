
import { useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

function ResetPassword() {
    const { token } = useParams();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const getPasswordStrength = () => {
        let score = 0;

        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        return score;
    };

    const strength = getPasswordStrength();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (password !== confirmPassword) {
            setError("Your passwords do not match. Please try again.");
            return;
        }

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `http://localhost:5000/api/auth/reset-password/${token}`,
                { password }
            );

            setMessage(response.data.message);
            setSuccess(true);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to reset password. Please try again."
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
                

                <h2>Reset Your Password</h2>

                <p className="password-recovery-description">
                    Create a strong new password to keep your SkillNest
                    account safe and secure.
                </p>

                {!success && (
                    <>
                        <label htmlFor="new-password">New Password</label>

                        <div className="password-input-wrapper">
                            <input
                                id="new-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={8}
                                autoComplete="new-password"
                                required
                            />

                            <button
                                type="button"
                                className="password-visibility-button"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        {password && (
                            <div className="password-strength">
                                <div className="strength-bars">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <span
                                            key={level}
                                            className={
                                                level <= strength
                                                    ? `strength-level strength-${strength}`
                                                    : ""
                                            }
                                        />
                                    ))}
                                </div>

                                <small>
                                    Password strength:{" "}
                                    {strength <= 2
                                        ? "Weak"
                                        : strength <= 3
                                            ? "Fair"
                                            : strength <= 4
                                                ? "Good"
                                                : "Strong"}
                                </small>
                            </div>
                        )}

                        <label htmlFor="confirm-password">
                            Confirm Password
                        </label>

                        <div className="password-input-wrapper">
                            <input
                                id="confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Re-enter your new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                minLength={8}
                                autoComplete="new-password"
                                required
                            />

                            <button
                                type="button"
                                className="password-visibility-button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                            >
                                {showConfirmPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        <p className="password-hint">
                            Use at least 8 characters. A mix of letters,
                            numbers and symbols is recommended.
                        </p>

                        <button
                            type="submit"
                            className="password-recovery-button"
                            disabled={loading}
                        >
                            {loading ? "Updating Password..." : "Reset Password"}
                        </button>
                    </>
                )}

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

                {success && (
                    <Link to="/login" className="recovery-back-link">
                        Go to Login →
                    </Link>
                )}

                {!success && (
                    <div className="recovery-navigation-links">
                        <Link to="/login" className="recovery-back-link">
                            ← Back to Login
                        </Link>

                        <Link to="/" className="recovery-back-link">
                            Back to Home →
                        </Link>
                    </div>
                )}
            </form>
        </div>
    );
}

export default ResetPassword;
