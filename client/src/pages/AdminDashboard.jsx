
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);
  const [enrollmentError, setEnrollmentError] = useState("");
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token || user.role !== "admin") {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/courses/admin/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCourses(response.data.courses || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load courses."
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchEnrollments = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/enrollments/admin/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setEnrollments(response.data.enrollments || []);
      } catch (err) {
        setEnrollmentError(
          err.response?.data?.message ||
          "Unable to load student enrollments."
        );
      } finally {
        setEnrollmentsLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/auth/admin/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUsers(response.data.users || []);
      } catch (err) {
        setUsersError(
          err.response?.data?.message ||
          "Unable to load registered users."
        );
      } finally {
        setUsersLoading(false);
      }
    };

    fetchCourses();
    fetchEnrollments();
    fetchUsers();
  }, [navigate, user.role]);

  const publishedCourses = courses.filter(
    (course) => course.isPublished
  ).length;

  const draftCourses = courses.length - publishedCourses;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="admin-dashboard">
      <nav className="admin-navbar">
        <Link to="/" className="brand">
          SkillNest<span>.</span>
          <small> ADMIN</small>
        </Link>

        <div className="admin-nav-actions">
          <span>{user.name || "Administrator"}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="admin-main">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">ADMINISTRATION</p>
            <h1>Admin Dashboard</h1>
            <p>Manage courses and learning content.</p>
          </div>

          <button
            className="admin-add-button"
            onClick={() => navigate("/admin/courses/new")}
          >
            + Add New Course
          </button>
        </div>

        <section className="admin-stats">
          <div className="admin-stat-card">
            <span>Total Courses</span>
            <h2>{courses.length}</h2>
          </div>

          <div className="admin-stat-card">
            <span>Published Courses</span>
            <h2>{publishedCourses}</h2>
          </div>

          <div className="admin-stat-card">
            <span>Unpublished Courses</span>
            <h2>{draftCourses}</h2>
          </div>
        </section>

        <section className="admin-course-section">
          <h2>Course Management</h2>

          {loading && <p>Loading courses...</p>}

          {error && <p className="error-message">{error}</p>}

          {!loading && !error && courses.length === 0 && (
            <p>No courses available yet.</p>
          )}

          {!loading && !error && courses.length > 0 && (
            <div className="admin-table-wrapper">
              <table className="admin-course-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id}>
                      <td data-label="Course">{course.title}</td>

                      <td data-label="Category">{course.category}</td>

                      <td data-label="Price">₹{course.price}</td>

                      <td data-label="Status">
                        <span
                          className={
                            course.isPublished
                              ? "admin-status published"
                              : "admin-status draft"
                          }
                        >
                          {course.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>

                      <td data-label="Actions">
                        <button
                          className="admin-edit-button"
                          onClick={() =>
                            navigate(`/admin/courses/edit/${course._id}`)
                          }
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin-course-section">
          <h2>Enrollment Management</h2>

          {enrollmentsLoading && <p>Loading enrollments...</p>}

          {enrollmentError && (
            <p className="error-message">{enrollmentError}</p>
          )}

          {!enrollmentsLoading &&
            !enrollmentError &&
            enrollments.length === 0 && (
              <p>No student enrollments available yet.</p>
            )}

          {!enrollmentsLoading &&
            !enrollmentError &&
            enrollments.length > 0 && (
              <div className="admin-table-wrapper">
                <table className="admin-course-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Email</th>
                      <th>Course</th>
                      <th>Payment Status</th>
                      <th>Progress</th>
                      <th>Enrollment Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment._id}>
                        <td data-label="Student">
                          {enrollment.student?.name || "Unknown"}
                        </td>

                        <td data-label="Email">
                          {enrollment.student?.email || "Unavailable"}
                        </td>

                        <td data-label="Course">
                          {enrollment.course?.title || "Course unavailable"}
                        </td>

                        <td data-label="Payment Status">
                          {enrollment.paymentStatus}
                        </td>

                        <td data-label="Progress">
                          {enrollment.progress || 0}%
                        </td>

                        <td data-label="Enrollment Date">
                          {enrollment.enrolledAt
                            ? new Date(enrollment.enrolledAt).toLocaleDateString()
                            : "Unavailable"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </section>

        <section className="admin-course-section">
          <h2>User Management</h2>

          {usersLoading && <p>Loading registered users...</p>}

          {usersError && (
            <p className="error-message">{usersError}</p>
          )}

          {!usersLoading && !usersError && users.length === 0 && (
            <p>No registered users found.</p>
          )}

          {!usersLoading && !usersError && users.length > 0 && (
            <div className="admin-table-wrapper">
              <table className="admin-course-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Email Verification</th>
                    <th>Registration Date</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td data-label="Name">{user.name}</td>

                      <td data-label="Email">{user.email}</td>

                      <td data-label="Role">{user.role}</td>

                      <td data-label="Email Verification">
                        {user.isEmailVerified ? "Verified" : "Not Verified"}
                      </td>

                      <td data-label="Registration Date">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "Unavailable"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
