/**
 * LearnSphere - Course Catalog & Enrollment Engine (courses.js)
 * Manages Course Search, Category/Level Filters, Dynamic Rendering,
 * and Student Course Enrollment with LocalStorage Persistence.
 */

let currentCategory = 'all';
let currentSearchTerm = '';
let currentLevel = 'all';

function initCourseCatalog() {
  const catalogGrid = document.getElementById('courses-grid');
  if (!catalogGrid) return;

  const searchInput = document.getElementById('course-search-input');
  const levelSelect = document.getElementById('course-level-select');
  const filterTabs = document.querySelectorAll('.filter-tab-btn');

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchTerm = e.target.value.toLowerCase().trim();
      renderFilteredCourses();
    });
  }

  // Level selector handler
  if (levelSelect) {
    levelSelect.addEventListener('change', (e) => {
      currentLevel = e.target.value;
      renderFilteredCourses();
    });
  }

  // Category filter tabs
  if (filterTabs.length > 0) {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentCategory = tab.getAttribute('data-category') || 'all';
        renderFilteredCourses();
      });
    });
  }

  renderFilteredCourses();
}

function renderFilteredCourses() {
  const catalogGrid = document.getElementById('courses-grid');
  const resultsCountEl = document.getElementById('results-count');
  if (!catalogGrid) return;

  const db = window.DB.get();
  const session = window.DB.getSession();
  const studentEnrollments = session 
    ? db.enrollments.filter(e => e.student_id === session.id) 
    : [];

  const enrolledCourseIds = new Set(studentEnrollments.map(e => e.course_id));

  const filtered = db.courses.filter(course => {
    const matchesCategory = currentCategory === 'all' || 
      course.category.toLowerCase().replace(/\s+/g, '-') === currentCategory.toLowerCase();
    
    const matchesLevel = currentLevel === 'all' || 
      course.level.toLowerCase() === currentLevel.toLowerCase();

    const matchesSearch = !currentSearchTerm || 
      course.title.toLowerCase().includes(currentSearchTerm) ||
      course.instructor.toLowerCase().includes(currentSearchTerm) ||
      course.description.toLowerCase().includes(currentSearchTerm);

    return matchesCategory && matchesLevel && matchesSearch;
  });

  if (resultsCountEl) {
    resultsCountEl.textContent = `Showing ${filtered.length} ${filtered.length === 1 ? 'course' : 'courses'}`;
  }

  if (filtered.length === 0) {
    catalogGrid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 4rem 1.5rem; text-align: center; background-color: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
        <p style="font-size: 1.125rem; font-weight: 600; color: var(--color-text-main); margin-bottom: 0.5rem;">No courses match your search criteria</p>
        <p style="color: var(--color-text-muted); font-size: 0.875rem; margin-bottom: 1.5rem;">Try adjusting your keyword or reset filters to explore all available subjects.</p>
        <button id="reset-filters-btn" class="btn btn-sm btn-secondary">Reset All Filters</button>
      </div>
    `;
    document.getElementById('reset-filters-btn')?.addEventListener('click', () => {
      currentCategory = 'all';
      currentSearchTerm = '';
      currentLevel = 'all';
      const searchInput = document.getElementById('course-search-input');
      const levelSelect = document.getElementById('course-level-select');
      if (searchInput) searchInput.value = '';
      if (levelSelect) levelSelect.value = 'all';
      document.querySelectorAll('.filter-tab-btn').forEach((t, i) => {
        if (i === 0) t.classList.add('active');
        else t.classList.remove('active');
      });
      renderFilteredCourses();
    });
    return;
  }

  catalogGrid.innerHTML = filtered.map(course => {
    const isEnrolled = enrolledCourseIds.has(course.id);
    const thumbnailHtml = course.image
      ? `<img src="${course.image}" alt="${course.title}" class="course-card-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"/>
         <div class="course-thumb-fallback" style="display:none;">
           <div style="font-size:2rem; margin-bottom:0.25rem;">📚</div>
           <div style="font-weight:700; font-size:1.05rem;">${course.title}</div>
           <div style="font-size:0.75rem; opacity:0.8;">${course.category}</div>
         </div>`
      : `<div class="course-thumb-fallback">
           <div style="font-size:2rem; margin-bottom:0.25rem;">📚</div>
           <div style="font-weight:700; font-size:1.05rem;">${course.title}</div>
           <div style="font-size:0.75rem; opacity:0.8;">${course.category}</div>
         </div>`;

    return `
      <article class="course-card" data-id="${course.id}">
        <div class="course-card-thumb">
          ${thumbnailHtml}
        </div>
        <div class="course-card-body">
          <div class="course-meta-inline">
            <span>${course.category}</span>
            <span aria-hidden="true">·</span>
            <span>${course.level}</span>
            <span aria-hidden="true">·</span>
            <span class="tabular-nums">${course.duration}</span>
          </div>
          <h3 class="course-card-title">${course.title}</h3>
          <p class="course-card-desc">${course.description}</p>
          <div class="course-instructor">
            <span>Instructor: <strong>${course.instructor}</strong></span>
          </div>
        </div>
        <div class="course-card-footer">
          <div>
            <span class="course-price ${course.isFree ? 'free' : ''}">${course.price}</span>
            <div style="font-size:0.75rem; color:var(--color-text-muted);">★ ${course.rating.toFixed(1)} (${course.reviewsCount})</div>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <a href="course-details.html?id=${course.id}" class="btn btn-sm btn-secondary" title="View Syllabus">Details</a>
            ${
              isEnrolled
                ? `<a href="learn.html?id=${course.id}" class="btn btn-sm btn-accent">Continue</a>`
                : `<button class="btn btn-sm btn-primary enroll-action-btn" data-course-id="${course.id}">Enroll Now</button>`
            }
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Attach enrollment event listeners
  catalogGrid.querySelectorAll('.enroll-action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const courseId = e.currentTarget.getAttribute('data-course-id');
      handleCourseEnrollment(courseId);
    });
  });
}

// Handle Course Enrollment Action
function handleCourseEnrollment(courseId) {
  let session = window.DB.getSession();
  
  if (!session) {
    const proceedWithDemo = confirm("You are not currently signed in. Would you like to sign in as the Demo Student (Alex Johnson) to enroll immediately?");
    if (proceedWithDemo) {
      const db = window.DB.get();
      const demoStudent = db.students[0];
      session = {
        id: demoStudent.id,
        name: demoStudent.name,
        email: demoStudent.email,
        avatar: demoStudent.avatar,
        bio: demoStudent.bio,
        role: 'Student',
        isAdmin: false
      };
      window.DB.setSession(session);
      window.Toast.show("Signed in as Demo Student.", "info");
    } else {
      window.location.href = "login.html";
      return;
    }
  }

  const db = window.DB.get();
  const existing = db.enrollments.find(e => e.student_id === session.id && e.course_id === courseId);
  const course = db.courses.find(c => c.id === courseId);

  if (existing) {
    window.Toast.show(`You are already enrolled in "${course.title}". Opening learning portal...`, 'info');
    setTimeout(() => {
      window.location.href = `learn.html?id=${courseId}`;
    }, 600);
    return;
  }

  // Create new enrollment record (relational Enrollments entity)
  const newEnrollment = {
    enrollment_id: `enr_${Date.now()}`,
    student_id: session.id,
    course_id: courseId,
    enrolled_at: new Date().toISOString().split('T')[0],
    status: "in-progress",
    progress_percent: 0,
    completed_lessons: []
  };

  db.enrollments.push(newEnrollment);
  window.DB.save(db);

  window.Toast.show(`Successfully enrolled in "${course.title}"! Redirecting to course portal...`, 'success');
  
  // Refresh catalog buttons & redirect to learn page
  renderFilteredCourses();
  setTimeout(() => {
    window.location.href = `learn.html?id=${courseId}`;
  }, 800);
}

// Initialize safely
if (window.onReady) {
  window.onReady(initCourseCatalog);
} else {
  document.addEventListener('DOMContentLoaded', initCourseCatalog);
}

window.handleCourseEnrollment = handleCourseEnrollment;
