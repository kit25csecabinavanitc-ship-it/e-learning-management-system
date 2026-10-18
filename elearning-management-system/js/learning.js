/**
 * LearnSphere - Interactive Course Learning Engine (learning.js)
 * Features: Two-zone Learning Stage, Syllabus Navigation, Video Player with Fallback,
 * Dynamic Lesson Completion Tracking, Dynamic Progress Bar, Notes Persistence.
 */

let currentCourse = null;
let currentLessons = [];
let currentLessonIndex = 0;
let currentEnrollment = null;

function initLearningStage() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id') || 'crs_5'; // Default to DBMS course

  const db = window.DB.get();
  const session = window.DB.getSession() || { id: "std_101", name: "Alex Johnson" };

  currentCourse = db.courses.find(c => c.id === courseId) || db.courses[4]; // DBMS course fallback

  // Find or create enrollment for this student
  currentEnrollment = db.enrollments.find(e => e.student_id === session.id && e.course_id === currentCourse.id);
  if (!currentEnrollment) {
    currentEnrollment = {
      enrollment_id: `enr_${Date.now()}`,
      student_id: session.id,
      course_id: currentCourse.id,
      enrolled_at: new Date().toISOString().split('T')[0],
      status: "in-progress",
      progress_percent: 0,
      completed_lessons: []
    };
    db.enrollments.push(currentEnrollment);
    window.DB.save(db);
  }

  // Get lessons for this course, or supply structured lessons if generic
  currentLessons = db.lessons.filter(l => l.course_id === currentCourse.id);
  if (currentLessons.length === 0) {
    currentLessons = [
      {
        id: `les_${currentCourse.id}_1`,
        course_id: currentCourse.id,
        module: "Module 1: Foundations",
        title: `Introduction to ${currentCourse.title}`,
        duration: "20 mins",
        videoUrl: "",
        content: `Welcome to the comprehensive masterclass on ${currentCourse.title}. In this module, we will explore theoretical foundations, architectural standards, and core development workflows used across modern industry environments.`,
        objectives: [
          "Understand high-level architecture and toolchains",
          "Set up developmental workflows and debugging principles",
          "Complete foundational code exercises"
        ]
      },
      {
        id: `les_${currentCourse.id}_2`,
        course_id: currentCourse.id,
        module: "Module 1: Foundations",
        title: `Core Architectural Principles of ${currentCourse.title}`,
        duration: "30 mins",
        videoUrl: "",
        content: `Building upon the basics, we analyze design patterns, performance optimization, and algorithmic execution. High cohesion and loose coupling ensure maintainability and testability at scale.`,
        objectives: [
          "Decompose complex systems into modular units",
          "Analyze computational complexity and storage trade-offs",
          "Implement robust error recovery strategies"
        ]
      },
      {
        id: `les_${currentCourse.id}_3`,
        course_id: currentCourse.id,
        module: "Module 2: Advanced Practice",
        title: `Practical Project Implementation & Case Studies`,
        duration: "45 mins",
        videoUrl: "",
        content: `Put theory into practice by developing a production-ready module. We synthesize API endpoints, state management, and relational database queries to construct a complete end-to-end subsystem.`,
        objectives: [
          "Execute real-world test cases and verify invariants",
          "Profile memory utilization and network latency",
          "Deploy build artifacts according to specification"
        ]
      }
    ];
  }

  // Header and Title Info
  const courseTitleEl = document.getElementById('stage-course-title');
  const courseCategoryEl = document.getElementById('stage-course-category');
  if (courseTitleEl) courseTitleEl.textContent = currentCourse.title;
  if (courseCategoryEl) courseCategoryEl.textContent = currentCourse.category;

  // Setup Syllabus Accordion
  renderSyllabus();

  // Load initial lesson
  loadLesson(0);

  // Setup Note Auto-Save
  initNotesEngine();

  // Setup Action Buttons
  setupControls();
}

function renderSyllabus() {
  const container = document.getElementById('syllabus-list-container');
  if (!container) return;

  const completedSet = new Set(currentEnrollment.completed_lessons || []);

  // Group lessons by module
  const modulesMap = {};
  currentLessons.forEach((lesson, index) => {
    const mod = lesson.module || "General Lessons";
    if (!modulesMap[mod]) modulesMap[mod] = [];
    modulesMap[mod].push({ ...lesson, originalIndex: index });
  });

  container.innerHTML = Object.keys(modulesMap).map((modName) => {
    const lessonsInMod = modulesMap[modName];
    return `
      <div class="syllabus-module">
        <div class="syllabus-module-header">
          <span>${modName}</span>
          <span style="font-size:0.75rem; color:var(--color-text-muted);">${lessonsInMod.length} lessons</span>
        </div>
        <ul class="lesson-list">
          ${lessonsInMod.map(item => {
            const isCompleted = completedSet.has(item.id);
            const isActive = item.originalIndex === currentLessonIndex;
            return `
              <li class="lesson-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" data-lesson-index="${item.originalIndex}">
                <div style="display:flex; align-items:center; gap:0.5rem; overflow:hidden;">
                  <span>${isCompleted ? '✓' : '○'}</span>
                  <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.title}</span>
                </div>
                <span style="font-size:0.75rem; color:var(--color-text-subtle); flex-shrink:0;">${item.duration}</span>
              </li>
            `;
          }).join('')}
        </ul>
      </div>
    `;
  }).join('');

  // Attach click listener to syllabus lessons
  container.querySelectorAll('.lesson-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.getAttribute('data-lesson-index'), 10);
      loadLesson(idx);
    });
  });

  updateProgressBar();
}

function loadLesson(index) {
  if (index < 0 || index >= currentLessons.length) return;
  currentLessonIndex = index;

  const lesson = currentLessons[index];

  // Update DOM details
  const titleEl = document.getElementById('lesson-title');
  const moduleEl = document.getElementById('lesson-module-tag');
  const durationEl = document.getElementById('lesson-duration-tag');
  const contentEl = document.getElementById('lesson-text-content');
  const objectivesEl = document.getElementById('lesson-objectives-list');
  const videoContainer = document.getElementById('video-stage-container');
  const completeBtn = document.getElementById('mark-complete-btn');

  if (titleEl) titleEl.textContent = lesson.title;
  if (moduleEl) moduleEl.textContent = lesson.module;
  if (durationEl) durationEl.textContent = lesson.duration;
  if (contentEl) contentEl.textContent = lesson.content;

  // Objectives
  if (objectivesEl) {
    objectivesEl.innerHTML = (lesson.objectives || []).map(obj => `
      <li style="display:flex; align-items:flex-start; gap:0.5rem; margin-bottom:0.375rem; font-size:0.9375rem;">
        <span style="color:var(--color-accent); font-weight:bold;">•</span>
        <span>${obj}</span>
      </li>
    `).join('');
  }

  // Video or Fallback
  if (videoContainer) {
    if (lesson.videoUrl) {
      videoContainer.innerHTML = `
        <video controls style="width:100%; height:100%; object-fit:cover;" onerror="this.parentElement.innerHTML='<div class=\\'video-fallback-banner\\'><h3>Interactive Lecture Content</h3><p>Video streaming unavailable in sandbox - lecture text and notes below are fully available.</p></div>'">
          <source src="${lesson.videoUrl}" type="video/mp4">
          Your browser does not support HTML5 video streaming.
        </video>
      `;
    } else {
      videoContainer.innerHTML = `
        <div class="video-fallback-banner">
          <div style="font-size:2.5rem; color:var(--color-accent);">🎓</div>
          <h3 style="font-size:1.25rem; font-weight:700;">Interactive Lecture Stage</h3>
          <p style="font-size:0.875rem; max-width:400px; color:#cbd5e1;">
            This interactive lecture lesson is delivered with step-by-step reading notes, architectural documentation, and self-assessment checks.
          </p>
        </div>
      `;
    }
  }

  // Update Complete Button state
  const isCompleted = (currentEnrollment.completed_lessons || []).includes(lesson.id);
  if (completeBtn) {
    if (isCompleted) {
      completeBtn.innerHTML = `<span>✓ Completed</span>`;
      completeBtn.className = "btn btn-sm btn-secondary";
    } else {
      completeBtn.innerHTML = `<span>Mark Lesson as Completed</span>`;
      completeBtn.className = "btn btn-sm btn-primary";
    }
  }

  // Update Prev / Next buttons
  const prevBtn = document.getElementById('prev-lesson-btn');
  const nextBtn = document.getElementById('next-lesson-btn');
  if (prevBtn) prevBtn.disabled = index === 0;
  if (nextBtn) nextBtn.disabled = index === currentLessons.length - 1;

  // Load Saved Note for this lesson
  loadNoteForLesson(lesson.id);

  // Re-highlight syllabus
  renderSyllabus();
}

function setupControls() {
  const prevBtn = document.getElementById('prev-lesson-btn');
  const nextBtn = document.getElementById('next-lesson-btn');
  const completeBtn = document.getElementById('mark-complete-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentLessonIndex > 0) loadLesson(currentLessonIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentLessonIndex < currentLessons.length - 1) loadLesson(currentLessonIndex + 1);
    });
  }

  if (completeBtn) {
    completeBtn.addEventListener('click', () => {
      toggleLessonCompletion();
    });
  }
}

function toggleLessonCompletion() {
  const lesson = currentLessons[currentLessonIndex];
  if (!lesson) return;

  const db = window.DB.get();
  const enrollmentIdx = db.enrollments.findIndex(e => e.enrollment_id === currentEnrollment.enrollment_id);
  if (enrollmentIdx === -1) return;

  if (!db.enrollments[enrollmentIdx].completed_lessons) {
    db.enrollments[enrollmentIdx].completed_lessons = [];
  }

  const list = db.enrollments[enrollmentIdx].completed_lessons;
  const isCompleted = list.includes(lesson.id);

  if (isCompleted) {
    db.enrollments[enrollmentIdx].completed_lessons = list.filter(id => id !== lesson.id);
    window.Toast.show('Lesson marked as incomplete.', 'info');
  } else {
    list.push(lesson.id);
    window.Toast.show(`Lesson marked as completed! (+${Math.round(100 / currentLessons.length)}% progress)`, 'success');
  }

  // Recalculate percent
  const percent = Math.round((db.enrollments[enrollmentIdx].completed_lessons.length / currentLessons.length) * 100);
  db.enrollments[enrollmentIdx].progress_percent = Math.min(100, percent);
  if (percent >= 100) {
    db.enrollments[enrollmentIdx].status = 'completed';
  } else {
    db.enrollments[enrollmentIdx].status = 'in-progress';
  }

  window.DB.save(db);
  currentEnrollment = db.enrollments[enrollmentIdx];

  loadLesson(currentLessonIndex);
  updateProgressBar();
}

function updateProgressBar() {
  const bar = document.getElementById('course-progress-bar');
  const text = document.getElementById('course-progress-text');
  if (bar && currentEnrollment) {
    bar.style.width = `${currentEnrollment.progress_percent}%`;
  }
  if (text && currentEnrollment) {
    text.textContent = `${currentEnrollment.progress_percent}% Completed (${(currentEnrollment.completed_lessons || []).length}/${currentLessons.length} lessons)`;
  }
}

// Student Personal Notes per Lesson
function initNotesEngine() {
  const textarea = document.getElementById('student-notes-area');
  const saveIndicator = document.getElementById('notes-save-indicator');
  if (!textarea) return;

  let timeoutId = null;
  textarea.addEventListener('input', () => {
    if (saveIndicator) saveIndicator.textContent = "Saving...";
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      saveNoteForCurrentLesson(textarea.value);
      if (saveIndicator) saveIndicator.textContent = "Saved to browser localStorage";
    }, 500);
  });
}

function getNotesKey(lessonId) {
  const session = window.DB.getSession() || { id: "std_101" };
  return `notes_${session.id}_${lessonId}`;
}

function loadNoteForLesson(lessonId) {
  const textarea = document.getElementById('student-notes-area');
  const saveIndicator = document.getElementById('notes-save-indicator');
  if (!textarea) return;
  textarea.value = localStorage.getItem(getNotesKey(lessonId)) || '';
  if (saveIndicator) saveIndicator.textContent = textarea.value ? "Saved note loaded" : "Autosaves as you type";
}

function saveNoteForCurrentLesson(content) {
  const lesson = currentLessons[currentLessonIndex];
  if (!lesson) return;
  localStorage.setItem(getNotesKey(lesson.id), content);
}

// Safe document ready initialization
if (window.onReady) {
  window.onReady(initLearningStage);
} else {
  document.addEventListener('DOMContentLoaded', initLearningStage);
}
