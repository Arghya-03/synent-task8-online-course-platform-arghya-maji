
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/enrollments/my-enrollments",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setEnrollments(response.data.enrollments || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load your enrolled courses."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="student-dashboard">
      <nav className="dashboard-navbar">
        <Link to="/" className="brand">
          SkillNest<span>.</span>
        </Link>

        <div className="dashboard-nav-links">
          <Link to="/">Home</Link>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="dashboard-heading">
          <p className="eyebrow">STUDENT LEARNING SPACE</p>
          <h1>Welcome, {user.name || "Student"}!</h1>
          <p>Continue learning and make progress towards your goals.</p>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <span>Enrolled Courses</span>
            <h2>{enrollments.length}</h2>
          </div>

          <div className="stat-card">
            <span>Completed Courses</span>
            <h2>
              {enrollments.filter((item) => item.progress === 100).length}
            </h2>
          </div>

          <div className="stat-card">
            <span>Learning Progress</span>
            <h2>
              {enrollments.length
                ? Math.round(
                  enrollments.reduce(
                    (total, item) => total + item.progress,
                    0
                  ) / enrollments.length
                )
                : 0}%
            </h2>
          </div>
        </div>

        <section className="enrolled-section">
          <h2>My Enrolled Courses</h2>

          {loading && <p>Loading your courses...</p>}

          {error && <p className="error-message">{error}</p>}

          {!loading && !error && enrollments.length === 0 && (
            <div className="empty-state">
              <h3>No courses enrolled yet</h3>
              <p>Explore our courses and start your learning journey.</p>
              <Link to="/" className="hero-button">
                Explore Courses
              </Link>
            </div>
          )}

          <div className="enrolled-grid">
            {enrollments.map((enrollment) => (
              <article className="enrolled-card" key={enrollment._id}>
                <img
                  src={
                    enrollment.course?.thumbnail ||
                    "https://placehold.co/600x400"
                  }
                  alt={enrollment.course?.title || "Course"}
                />

                <div className="enrolled-card-content">
                  <span className="course-category">
                    {enrollment.course?.category || "Course"}
                  </span>

                  <h3>
                    {enrollment.course?.title || "Course unavailable"}
                  </h3>

                  <p>
                    {enrollment.course?.description ||
                      "Continue your learning journey."}
                  </p>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${enrollment.progress || 0}%` }}
                    />
                  </div>

                  <small>
                    {enrollment.progress || 0}% completed
                  </small>

                  <Link
                    to={`/learning/${enrollment.course?._id}`}
                    className="start-learning-button"
                  >
                    {enrollment.progress === 100
                      ? "Review Course"
                      : "Start Learning"}
                  </Link>
                  
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default StudentDashboard;
