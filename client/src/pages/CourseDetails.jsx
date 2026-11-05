
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import EnrollButton from "../components/EnrollButton";

function CourseDetails() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/courses/${courseId}`
        );

        setCourse(response.data.course);
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

  if (loading) {
    return <p className="status-message">Loading course details...</p>;
  }

  if (error || !course) {
    return (
      <div className="learning-error">
        <p>{error || "Course not found."}</p>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="course-details-page">
      <nav className="learning-navbar">
        <Link to="/" className="brand">
          SkillNest<span>.</span>
        </Link>
        <Link to="/">← Back to Courses</Link>
      </nav>

      <main className="course-details-main">
        <div className="course-details-layout">
          <div className="course-details-info">
            <p className="eyebrow">{course.category}</p>
            <h1>{course.title}</h1>
            <p>{course.description}</p>

            <p><strong>Instructor:</strong> {course.instructor}</p>
            <p><strong>Level:</strong> {course.level}</p>
            <h2>₹{course.price}</h2>

            <EnrollButton courseId={course._id} />
          </div>

          <img
            src={course.thumbnail || "https://placehold.co/600x400"}
            alt={course.title}
            className="course-details-image"
          />
        </div>

        <section className="course-curriculum">
          <h2>Course Curriculum</h2>

          {course.modules?.length ? (
            course.modules.map((module, index) => (
              <div className="curriculum-module" key={module._id || index}>
                <h3>Module {index + 1}: {module.title}</h3>

                {module.lessons?.map((lesson, lessonIndex) => (
                  <p key={lesson._id || lessonIndex}>
                    ▶ {lesson.title}
                    {lesson.duration > 0 && ` · ${lesson.duration} min`}
                  </p>
                ))}
              </div>
            ))
          ) : (
            <p>Course lessons will be available soon.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default CourseDetails;
