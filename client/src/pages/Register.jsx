
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = () => {
    const password = formData.password;
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  };

  const strength = getPasswordStrength();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== confirmPassword) {
      setError("Passwords do not match. Please check again.");
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the Terms & Conditions.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );

      if (response.data.success) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setMessage(
          "Registration successful! Please check your email and click the verification link before logging in."
        );

        setFormData({
          name: "",
          email: "",
          password: "",
        });

        setConfirmPassword("");
        setTermsAccepted(false);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-recovery-page">
      <form
        className="password-recovery-card register-card"
        onSubmit={handleSubmit}
      >
        <Link to="/" className="register-home-link">
          ← Back to Home
        </Link>



        <h2>Create Your Account</h2>

        <p className="password-recovery-description">
          Join SkillNest and start building your skills.
          Your learning journey begins here.
        </p>

        <label htmlFor="register-name">Full Name</label>

        <input
          id="register-name"
          type="text"
          name="name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
          autoComplete="name"
          required
        />

        <label htmlFor="register-email">Email Address</label>

        <input
          id="register-email"
          type="email"
          name="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          required
        />

        <label htmlFor="register-password">Password</label>

        <div className="password-input-wrapper">
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
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

        {formData.password && (
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

        <label htmlFor="confirm-register-password">
          Confirm Password
        </label>

        <div className="password-input-wrapper">
          <input
            id="confirm-register-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("");
            }}
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


        <div className="register-terms">
          <input
            id="register-terms"
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => {
              setTermsAccepted(e.target.checked);
              setError("");
            }}
            required
          />

          <label htmlFor="register-terms">
            I agree to SkillNest's{" "}
            <Link to="/terms" target="_blank" rel="noopener noreferrer">
              Terms & Conditions
            </Link>
            {" "}and{" "}
            <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </Link>.
          </label>
        </div>


        <button
          type="submit"
          className="password-recovery-button"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
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

        <p className="register-login-text">
          Already have an account?{" "}
          <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
