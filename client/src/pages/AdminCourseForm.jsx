
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function AdminCourseForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    level: "Beginner",
    instructor: "",
    thumbnail: "",
    isPublished: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/courses",
        {
          ...formData,
          price: Number(formData.price),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Course created successfully!");

      setTimeout(() => {
        navigate("/admin");
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create course."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-page">
      <nav className="admin-navbar">
        <Link to="/" className="brand">
          SkillNest<span>.</span>
          <small> ADMIN</small>
        </Link>

        <Link to="/admin" className="admin-back-link">
          ← Back to Dashboard
        </Link>
      </nav>

      <main className="admin-form-main">
        <div className="admin-form-heading">
          <p className="eyebrow">COURSE MANAGEMENT</p>
          <h1>Add New Course</h1>
          <p>Create a new learning opportunity for students.</p>
        </div>

        <form className="admin-course-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Course Title *</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter course title"
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what students will learn"
              rows="4"
              required
            />
          </div>

          <div className="admin-form-grid">
            <div className="form-group">
              <label>Category *</label>
              <input
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Web Development"
                required
              />
            </div>

            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                name="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
                required
              />
            </div>

            <div className="form-group">
              <label>Difficulty Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label>Instructor *</label>
              <input
                name="instructor"
                value={formData.instructor}
                onChange={handleChange}
                placeholder="Instructor name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Thumbnail Image URL</label>
            <input
              name="thumbnail"
              type="url"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="https://example.com/course-image.jpg"
            />
          </div>

          <label className="publish-option">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
            />
            Publish this course immediately
          </label>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <button
            type="submit"
            className="admin-submit-button"
            disabled={loading}
          >
            {loading ? "Creating Course..." : "Create Course"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default AdminCourseForm;
