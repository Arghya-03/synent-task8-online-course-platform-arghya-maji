
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

function getYouTubeEmbedUrl(url) {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");
    let videoId = "";

    if (hostname === "youtu.be") {
      videoId = parsedUrl.pathname.slice(1);
    } else if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtube-nocookie.com"
    ) {
      if (parsedUrl.pathname === "/watch") {
        videoId = parsedUrl.searchParams.get("v") || "";
      } else if (
        parsedUrl.pathname.startsWith("/embed/") ||
        parsedUrl.pathname.startsWith("/shorts/")
      ) {
        videoId = parsedUrl.pathname.split("/")[2] || "";
      }
    }

    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return null;
    }

    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}

function CourseLearning() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/enrollments/${courseId}/learning`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;
        setCourse(data.course);
        setCompletedLessons(data.enrollment.completedLessons || []);

        const savedLessonId = localStorage.getItem(
          `skillnest_active_lesson_${courseId}`
        );

        const allLessons = data.course.modules?.flatMap(
          (module) => module.lessons || []
        ) || [];

        const savedLesson = allLessons.find(
          (lesson) => String(lesson._id) === savedLessonId
        );

        const firstLesson = allLessons[0];

        setActiveLesson(savedLesson || firstLesson || null);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load this course."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, token]);

  const markLessonComplete = async () => {
    if (!activeLesson) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/enrollments/${courseId}/complete-lesson`,
        { lessonId: activeLesson._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCompletedLessons(
        response.data.enrollment.completedLessons || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update lesson progress."
      );
    }
  };

  if (loading) {
    return <p className="status-message">Loading your course...</p>;
  }

  if (error || !course) {
    return (
      <div className="learning-error">
        <p>{error || "Course not found."}</p>
        <Link to="/dashboard">Back to Dashboard</Link>
      </div>
    );
  }

  const totalLessons = course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );

  const progress = totalLessons
    ? Math.round((completedLessons.length / totalLessons) * 100)
    : 0;

  const isCompleted = activeLesson
    ? completedLessons.some(
      (id) => String(id) === String(activeLesson._id)
    )
    : false;

  const videoUrl = activeLesson?.videoUrl?.trim() || "";
  const youtubeEmbedUrl = getYouTubeEmbedUrl(videoUrl);

  const isDirectVideo =
    /\.(mp4|webm|ogg)(\?.*)?$/i.test(videoUrl);

  return (
    <div className="learning-page">
      <nav className="learning-navbar">
        <Link to="/" className="brand">
          SkillNest<span>.</span>
        </Link>
        <Link to="/dashboard">← My Dashboard</Link>
      </nav>

      <div className="learning-layout">
        <main className="lesson-area">
          <div className="learning-progress">
            <span>Course Progress</span>
            <strong>{progress}%</strong>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <h1>{course.title}</h1>

          {activeLesson ? (
            <>
              <div className="video-container">
                {youtubeEmbedUrl ? (
                  <iframe
                    key={activeLesson._id}
                    src={youtubeEmbedUrl}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="origin"
                    allowFullScreen
                  />
                ) : isDirectVideo ? (
                  <video
                    key={activeLesson._id}
                    controls
                    controlsList="nodownload"
                    src={videoUrl}
                  >
                    Your browser does not support video playback.
                  </video>
                ) : videoUrl ? (
                  <div className="video-placeholder">
                    <span>!</span>
                    <p>
                      Unsupported video URL. Please provide a valid
                      YouTube or direct MP4 video link.
                    </p>
                  </div>
                ) : (
                  <div className="video-placeholder">
                    <span>▶</span>
                    <p>Lesson video will be available soon.</p>
                  </div>
                )}
              </div>

              <h2>{activeLesson.title}</h2>

              <p className="lesson-description">
                {activeLesson.description}
              </p>

              <button
                className="complete-lesson-button"
                onClick={markLessonComplete}
                disabled={isCompleted}
              >
                {isCompleted
                  ? "✓ Lesson Completed"
                  : "Mark as Complete"}
              </button>
            </>
          ) : (
            <p>No lessons available in this course yet.</p>
          )}
        </main>

        <aside className="lesson-sidebar">
          <h2>Course Content</h2>

          {course.modules.map((module, moduleIndex) => (
            <div className="module-block" key={module._id}>
              <h3>
                Module {moduleIndex + 1}: {module.title}
              </h3>

              {module.lessons.map((lesson) => {
                const completed = completedLessons.some(
                  (id) => String(id) === String(lesson._id)
                );

                return (
                  <button
                    key={lesson._id}
                    className={`lesson-item ${activeLesson?._id === lesson._id ? "active" : ""
                      }`}
                    onClick={() => {
                      setActiveLesson(lesson);
                      localStorage.setItem(
                        `skillnest_active_lesson_${courseId}`,
                        String(lesson._id)
                      );
                    }}
                  >
                    <span>{completed ? "✓" : "▶"}</span>
                    <span>{lesson.title}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

export default CourseLearning;
