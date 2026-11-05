
import { useEffect, useState } from "react";
import axios from "axios";
import { Routes, Route, Link } from "react-router-dom";
import EnrollButton from "./components/EnrollButton";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import "./App.css";
import StudentDashboard from "./pages/StudentDashboard";
import CourseLearning from "./pages/CourseLearning";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCourseForm from "./pages/AdminCourseForm";
import EditCourse from "./pages/EditCourse";
import CourseDetails from "./pages/CourseDetails";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import VerifyEmail from "./pages/VerifyEmail";

const API_URL = "http://localhost:5000/api";

function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_URL}/courses`);
        setCourses(response.data.courses || []);
      } catch {
        setError("Unable to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="brand">
          SkillNest<span>.</span>
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <a href="#courses">Courses</a>
          <a href="#about">About</a>
        </div>

        <div className="auth-nav">
          <Link to="/login" className="login-link">
            Login
          </Link>

          <Link to="/login" className="login-link">
            Admin Login
          </Link>

          <Link to="/register" className="nav-button">
            Join Now
          </Link>
        </div>
      </nav>

      <section className="hero-section" id="home">
        <div className="hero-content">
          <p className="eyebrow">YOUR LEARNING JOURNEY STARTS HERE</p>
          <h1>
            Learn New Skills.
            <br />
            Build Your <span>Future.</span>
          </h1>
          <p className="hero-description">
            Discover practical courses, learn from structured lessons,
            and take the next step towards your career goals.
          </p>
          <a href="#courses" className="hero-button">
            Explore Courses →
          </a>
        </div>

        <div className="hero-visual">
          <div className="learning-card">
            <div className="learning-icon">✦</div>
            <h3>Keep Learning</h3>
            <p>Small steps. Big achievements.</p>
            <div className="progress-track">
              <div className="progress-fill"></div>
            </div>
            <small>Grow your skills every day</small>
          </div>
        </div>
      </section>

      <section className="courses-section" id="courses">
        <div className="section-heading">
          <p className="eyebrow">START LEARNING TODAY</p>
          <h2>Explore Our Courses</h2>
          <p>Choose a course and begin building your skills.</p>
        </div>

        {loading && <p className="status-message">Loading courses...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && courses.length === 0 && (
          <p className="status-message">No published courses available yet.</p>
        )}

        <div className="course-grid">
          {courses.map((course) => (
            <article className="course-card" key={course._id}>
              <Link to={`/courses/${course._id}`}>
                <img
                  src={course.thumbnail || "https://placehold.co/600x400"}
                  alt={course.title}
                  className="course-image"
                />
              </Link>

              <div className="course-content">
                <span className="course-category">{course.category}</span>
                <h3>
                  <Link to={`/courses/${course._id}`} className="course-title-link">
                    {course.title}
                  </Link>
                </h3>
                <p className="course-description">{course.description}</p>

                <div className="course-details">
                  <span>{course.level}</span>
                  <strong>₹{course.price}</strong>
                </div>

                <EnrollButton courseId={course._id} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section" id="about">
        <h2>Learn. Grow. Achieve.</h2>
        <p>
          SkillNest helps learners develop practical skills through
          structured online courses.
        </p>
      </section>


      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>SkillNest.</h3>
            <p>Learn something new every day.</p>
          </div>

          <div className="footer-links">
            <Link to="/terms">Terms & Conditions</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Join Now</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 SkillNest. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/learning/:courseId" element={<CourseLearning />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/courses/new" element={<AdminCourseForm />} />
      <Route
        path="/admin/courses/edit/:courseId"
        element={<EditCourse />}
      />
      <Route path="/courses/:courseId" element={<CourseDetails />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    </Routes>
  );
}

export default App;
