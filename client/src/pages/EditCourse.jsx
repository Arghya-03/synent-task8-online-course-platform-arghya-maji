
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";

function EditCourse() {
  const { courseId } = useParams();
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
    modules: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/courses/admin/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const course = response.data.courses.find(
          (item) => item._id === courseId
        );

        if (!course) {
          setError("Course not found.");
          return;
        }

        setFormData({
          title: course.title || "",
          description: course.description || "",
          category: course.category || "",
          price: course.price ?? "",
          level: course.level || "Beginner",
          instructor: course.instructor || "",
          thumbnail: course.thumbnail || "",
          isPublished: course.isPublished || false,
          modules: (course.modules || []).map((module) => ({
            ...module,
            lessons: (module.lessons || []).map((lesson) => ({
              ...lesson,
              videoUrl: lesson.videoUrl || "",
            })),
          })),
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load course details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addModule = () => {
    setFormData((previous) => ({
      ...previous,
      modules: [
        ...previous.modules,
        { title: "", lessons: [] },
      ],
    }));
  };

  const removeModule = (moduleIndex) => {
    setFormData((previous) => ({
      ...previous,
      modules: previous.modules.filter(
        (_, index) => index !== moduleIndex
      ),
    }));
  };

  const updateModuleTitle = (moduleIndex, value) => {
    setFormData((previous) => ({
      ...previous,
      modules: previous.modules.map((module, index) =>
        index === moduleIndex
          ? { ...module, title: value }
          : module
      ),
    }));
  };

  const addLesson = (moduleIndex) => {
    setFormData((previous) => ({
      ...previous,
      modules: previous.modules.map((module, index) =>
        index === moduleIndex
          ? {
              ...module,
              lessons: [
                ...module.lessons,
                {
                  title: "",
                  description: "",
                  videoUrl: "",
                  duration: 0,
                },
              ],
            }
          : module
      ),
    }));
  };

  const updateLesson = (moduleIndex, lessonIndex, field, value) => {
    setFormData((previous) => ({
      ...previous,
      modules: previous.modules.map((module, mIndex) =>
        mIndex === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, lIndex) =>
                lIndex === lessonIndex
                  ? { ...lesson, [field]: value }
                  : lesson
              ),
            }
          : module
      ),
    }));
  };

  const removeLesson = (moduleIndex, lessonIndex) => {
    setFormData((previous) => ({
      ...previous,
      modules: previous.modules.map((module, index) =>
        index === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.filter(
                (_, lessonIndexValue) =>
                  lessonIndexValue !== lessonIndex
              ),
            }
          : module
      ),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      const updatedModules = formData.modules.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) => ({
          ...lesson,
          duration: Number(lesson.duration) || 0,
        })),
      }));

      await axios.put(
        `http://localhost:5000/api/courses/${courseId}`,
        {
          ...formData,
          price: Number(formData.price),
          modules: updatedModules,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Course and curriculum updated successfully!");

      setTimeout(() => {
        navigate("/admin");
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update course."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="status-message">Loading course details...</p>;
  }

  if (error && !formData.title) {
    return (
      <div className="learning-error">
        <p>{error}</p>
        <Link to="/admin">Back to Admin Dashboard</Link>
      </div>
    );
  }

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
          <h1>Edit Course</h1>
          <p>Update course information, modules and lessons.</p>
        </div>

        <form className="admin-course-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Course Title *</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
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
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Thumbnail Image URL</label>
            <input
              name="thumbnail"
              type="text"
              value={formData.thumbnail}
              onChange={handleChange}
            />
          </div>

          <label className="publish-option">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
            />
            Publish this course
          </label>

          <hr />

          <div className="curriculum-heading">
            <div>
              <p className="eyebrow">LEARNING CONTENT</p>
              <h2>Course Curriculum</h2>
              <p>Add modules, lessons and video links.</p>
            </div>

            <button
              type="button"
              className="admin-submit-button"
              onClick={addModule}
            >
              + Add Module
            </button>
          </div>

          {formData.modules.map((module, moduleIndex) => (
            <div className="curriculum-module" key={module._id || moduleIndex}>
              <div className="curriculum-module-header">
                <h3>Module {moduleIndex + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeModule(moduleIndex)}
                  className="remove-button"
                >
                  Remove Module
                </button>
              </div>

              <div className="form-group">
                <label>Module Title *</label>
                <input
                  value={module.title}
                  onChange={(event) =>
                    updateModuleTitle(moduleIndex, event.target.value)
                  }
                  placeholder="Example: HTML and CSS Fundamentals"
                  required
                />
              </div>

              {module.lessons.map((lesson, lessonIndex) => (
                <div
                  className="curriculum-lesson"
                  key={lesson._id || lessonIndex}
                >
                  <div className="curriculum-module-header">
                    <h4>Lesson {lessonIndex + 1}</h4>
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() =>
                        removeLesson(moduleIndex, lessonIndex)
                      }
                    >
                      Remove Lesson
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Lesson Title *</label>
                    <input
                      value={lesson.title}
                      onChange={(event) =>
                        updateLesson(
                          moduleIndex,
                          lessonIndex,
                          "title",
                          event.target.value
                        )
                      }
                      placeholder="Example: Introduction to HTML"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Lesson Description</label>
                    <textarea
                      value={lesson.description || ""}
                      onChange={(event) =>
                        updateLesson(
                          moduleIndex,
                          lessonIndex,
                          "description",
                          event.target.value
                        )
                      }
                      rows="2"
                      placeholder="What will students learn?"
                    />
                  </div>

                  <div className="form-group">
                    <label>Video URL (YouTube or MP4)</label>
                    <input
                      type="url"
                      value={lesson.videoUrl || ""}
                      onChange={(event) =>
                        updateLesson(
                          moduleIndex,
                          lessonIndex,
                          "videoUrl",
                          event.target.value
                        )
                      }
                      placeholder="Paste a video URL"
                    />
                  </div>

                  <div className="form-group">
                    <label>Duration (minutes)</label>
                    <input
                      type="number"
                      min="0"
                      value={lesson.duration ?? 0}
                      onChange={(event) =>
                        updateLesson(
                          moduleIndex,
                          lessonIndex,
                          "duration",
                          event.target.value
                        )
                      }
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="admin-submit-button"
                onClick={() => addLesson(moduleIndex)}
              >
                + Add Lesson
              </button>
            </div>
          ))}

          {formData.modules.length === 0 && (
            <p className="status-message">
              No modules added yet. Click "Add Module" to create your curriculum.
            </p>
          )}

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <button
            type="submit"
            className="admin-submit-button"
            disabled={saving}
          >
            {saving ? "Saving Changes..." : "Update Course"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default EditCourse;
