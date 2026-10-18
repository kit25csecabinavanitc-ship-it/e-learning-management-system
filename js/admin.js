/**
 * LearnSphere - Administrative Management Console (admin.js)
 * Full CRUD Operations for Courses (Create, Read, Update, Delete),
 * Student Directory Viewer, Enrollment Manager, Search & Reset.
 */

let editingCourseId = null;

function initAdminDashboard() {
  const adminPage = document.getElementById('admin-dashboard-page');
  if (!adminPage) return;

  const session = window.DB.getSession();
  // If not logged in as admin, prompt or notify
  if (!session || !session.isAdmin) {
    const proceedAsAdmin = confirm("You are not currently logged in as an administrator. Would you like to enter demo Administrator Mode as Dr. Evelyn Vance?");
    if (proceedAsAdmin) {
      window.DB.setSession({
        id: "adm_001",
        name: "Dr. Evelyn Vance",
        email: "admin@learnsphere.edu",
        role: "System Administrator",
        isAdmin: true
      });
      window.Toast.show("Switched to Admin Console.", "success");
    } else {
      window.location.href = "login.html";
      return;
    }
  }

  renderAdminStats();
  renderAdminCourses();
  renderAdminStudents();
  renderAdminEnrollments();

  setupCourseModal();
  setupDatabaseReset();
  setupAdminTabs();
}

function renderAdminStats() {
  const db = window.DB.get();
  
  const totalStudents = (db.students || []).length;
  const totalCourses = (db.courses || []).length;
  const totalEnrollments = (db.enrollments || []).length;
  const totalCertificates = (db.certificates || []).length;

  const statStudentsEl = document.getElementById('stat-total-students');
  const statCoursesEl = document.getElementById('stat-total-courses');
  const statEnrollmentsEl = document.getElementById('stat-total-enrollments');
  const statCertsEl = document.getElementById('stat-total-certificates');

  if (statStudentsEl) statStudentsEl.textContent = totalStudents;
  if (statCoursesEl) statCoursesEl.textContent = totalCourses;
  if (statEnrollmentsEl) statEnrollmentsEl.textContent = totalEnrollments;
  if (statCertsEl) statCertsEl.textContent = totalCertificates;
}

function renderAdminCourses(filterTerm = '') {
  const container = document.getElementById('admin-courses-tbody');
  if (!container) return;

  const db = window.DB.get();
  const filtered = (db.courses || []).filter(c => 
    !filterTerm || 
    c.title.toLowerCase().includes(filterTerm.toLowerCase()) ||
    c.instructor.toLowerCase().includes(filterTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(filterTerm.toLowerCase())
  );

  if (filtered.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem;">No courses found matching filter.</td></tr>`;
    return;
  }

  container.innerHTML = filtered.map(c => `
    <tr>
      <td style="font-family:var(--font-mono); font-size:0.75rem;">${c.id}</td>
      <td>
        <strong style="color:var(--color-text-main); font-size:0.9375rem;">${c.title}</strong>
        <div style="font-size:0.75rem; color:var(--color-text-muted);">${c.category} · ${c.duration}</div>
      </td>
      <td>${c.instructor}</td>
      <td><span style="font-size:0.8125rem;">${c.level}</span></td>
      <td class="tabular-nums font-semibold">${c.price}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-sm btn-secondary edit-course-btn" data-id="${c.id}" title="Edit Course">Edit</button>
          <button class="btn btn-sm btn-danger delete-course-btn" data-id="${c.id}" title="Delete Course">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');

  // Attach Edit and Delete handlers
  container.querySelectorAll('.edit-course-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openEditCourseModal(id);
    });
  });

  container.querySelectorAll('.delete-course-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      deleteCourse(id);
    });
  });
}

function renderAdminStudents() {
  const container = document.getElementById('admin-students-tbody');
  if (!container) return;

  const db = window.DB.get();
  container.innerHTML = (db.students || []).map(s => `
    <tr>
      <td style="font-family:var(--font-mono); font-size:0.75rem;">${s.id}</td>
      <td>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="width:24px; height:24px; border-radius:50%; background:var(--color-primary); color:#fff; display:inline-flex; align-items:center; justify-content:center; font-size:0.65rem; font-weight:700;">${s.avatar || 'ST'}</span>
          <strong style="color:var(--color-text-main);">${s.name}</strong>
        </div>
      </td>
      <td>${s.email}</td>
      <td class="tabular-nums">${s.enrolledDate}</td>
      <td>
        <span style="font-size:0.75rem; font-weight:700; color:var(--color-success); background-color:var(--color-success-bg); padding:0.2rem 0.5rem; border-radius:var(--radius-sm);">
          Active
        </span>
      </td>
    </tr>
  `).join('');
}

function renderAdminEnrollments() {
  const container = document.getElementById('admin-enrollments-tbody');
  if (!container) return;

  const db = window.DB.get();
  container.innerHTML = (db.enrollments || []).map(e => {
    const student = (db.students || []).find(s => s.id === e.student_id);
    const course = (db.courses || []).find(c => c.id === e.course_id);
    return `
      <tr>
        <td style="font-family:var(--font-mono); font-size:0.75rem;">${e.enrollment_id}</td>
        <td>${student ? student.name : e.student_id}</td>
        <td><strong>${course ? course.title : e.course_id}</strong></td>
        <td class="tabular-nums font-semibold">${e.progress_percent}%</td>
        <td class="tabular-nums">${e.enrolled_at}</td>
        <td>
          <span style="font-size:0.75rem; font-weight:700; color:${e.status === 'completed' ? 'var(--color-success)' : 'var(--color-accent)'};">
            ${e.status === 'completed' ? 'COMPLETED' : 'IN-PROGRESS'}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

// Course Create & Update Modal
function setupCourseModal() {
  const modal = document.getElementById('course-modal');
  const addBtn = document.getElementById('add-course-btn');
  const closeBtn = document.getElementById('close-course-modal-btn');
  const form = document.getElementById('course-crud-form');
  const searchInput = document.getElementById('admin-course-search');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderAdminCourses(e.target.value);
    });
  }

  if (addBtn && modal) {
    addBtn.addEventListener('click', () => {
      editingCourseId = null;
      document.getElementById('course-modal-title').textContent = "Create New Course Entity";
      form.reset();
      modal.classList.add('active');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      saveCourse();
    });
  }
}

function openEditCourseModal(courseId) {
  const db = window.DB.get();
  const course = (db.courses || []).find(c => c.id === courseId);
  if (!course) return;

  editingCourseId = courseId;
  const modal = document.getElementById('course-modal');
  document.getElementById('course-modal-title').textContent = `Edit Course: ${course.title}`;

  document.getElementById('course-title-input').value = course.title;
  document.getElementById('course-instructor-input').value = course.instructor;
  document.getElementById('course-category-input').value = course.category;
  document.getElementById('course-level-input').value = course.level;
  document.getElementById('course-duration-input').value = course.duration;
  document.getElementById('course-price-input').value = course.price;
  document.getElementById('course-desc-input').value = course.description;

  modal.classList.add('active');
}

function saveCourse() {
  const title = document.getElementById('course-title-input').value.trim();
  const instructor = document.getElementById('course-instructor-input').value.trim();
  const category = document.getElementById('course-category-input').value.trim();
  const level = document.getElementById('course-level-input').value;
  const duration = document.getElementById('course-duration-input').value.trim();
  const price = document.getElementById('course-price-input').value.trim();
  const desc = document.getElementById('course-desc-input').value.trim();

  if (!title || !instructor || !category || !duration || !price || !desc) {
    window.Toast.show("Please complete all required course attributes.", "error");
    return;
  }

  const db = window.DB.get();
  const isFree = price.toLowerCase() === 'free' || price === '0' || price === '₹0' || price === '$0' || price === '₹0.00' || price === '$0.00';
  let formattedPrice = isFree ? 'Free' : (price.startsWith('₹') ? price : `₹${price.replace(/[^0-9.]/g, '') || '499'}`);

  if (editingCourseId) {
    // UPDATE operation
    const cIdx = db.courses.findIndex(c => c.id === editingCourseId);
    if (cIdx !== -1) {
      db.courses[cIdx].title = title;
      db.courses[cIdx].instructor = instructor;
      db.courses[cIdx].category = category;
      db.courses[cIdx].level = level;
      db.courses[cIdx].duration = duration;
      db.courses[cIdx].price = formattedPrice;
      db.courses[cIdx].isFree = isFree;
      db.courses[cIdx].description = desc;
      window.Toast.show(`Course "${title}" updated successfully (SQL UPDATE).`, "success");
    }
  } else {
    // INSERT operation
    const newId = `crs_${Date.now().toString().slice(-4)}`;
    const newCourse = {
      id: newId,
      title: title,
      instructor: instructor,
      category: category,
      level: level,
      duration: duration,
      price: formattedPrice,
      isFree: isFree,
      rating: 5.0,
      reviewsCount: 1,
      description: desc,
      image: "/assets/images/hero_elearning_1792335663352.jpg",
      modulesCount: 4,
      totalLessons: 8
    };
    db.courses.push(newCourse);

    // Also add initial lessons for the newly created course
    if (!db.lessons) db.lessons = [];
    db.lessons.push(
      {
        id: `les_${newId}_1`,
        course_id: newId,
        module: "Module 1: Foundations",
        title: `Introduction to ${title}`,
        duration: "25 mins",
        videoUrl: "",
        content: `Welcome to the curriculum for ${title}. In this initial lecture, we explore key concepts, terminology, and practical design principles.`,
        objectives: ["Master core terminology", "Understand practical requirements", "Review architecture overview"]
      },
      {
        id: `les_${newId}_2`,
        course_id: newId,
        module: "Module 2: Practical Implementation",
        title: `Applied Engineering in ${title}`,
        duration: "35 mins",
        videoUrl: "",
        content: `Building upon the theoretical fundamentals, we examine concrete case studies and practical implementations.`,
        objectives: ["Analyze real-world scenarios", "Execute code exercises", "Review performance trade-offs"]
      }
    );

    window.Toast.show(`Course "${title}" added successfully (SQL INSERT).`, "success");
  }

  window.DB.save(db);
  document.getElementById('course-modal')?.classList.remove('active');
  renderAdminStats();
  renderAdminCourses();
}

function deleteCourse(courseId) {
  const db = window.DB.get();
  const course = (db.courses || []).find(c => c.id === courseId);
  if (!course) return;

  const confirmDelete = confirm(`Are you sure you want to delete course "${course.title}"? This simulates a SQL DELETE with cascade handling.`);
  if (!confirmDelete) return;

  // Filter out course and related foreign-keyed records (ON DELETE CASCADE)
  db.courses = db.courses.filter(c => c.id !== courseId);
  db.enrollments = (db.enrollments || []).filter(e => e.course_id !== courseId);
  db.lessons = (db.lessons || []).filter(l => l.course_id !== courseId);
  db.quizzes = (db.quizzes || []).filter(q => q.course_id !== courseId);
  db.quiz_attempts = (db.quiz_attempts || []).filter(a => a.course_id !== courseId);
  db.certificates = (db.certificates || []).filter(c => c.course_id !== courseId);
  window.DB.save(db);

  window.Toast.show(`Course "${course.title}" deleted (SQL DELETE CASCADE).`, "info");
  renderAdminStats();
  renderAdminCourses();
  renderAdminEnrollments();
}

function setupDatabaseReset() {
  document.getElementById('reset-demo-db-btn')?.addEventListener('click', () => {
    const confirmReset = confirm("Reset all students, courses, enrollments, and quiz attempts back to initial demo seeds?");
    if (confirmReset) {
      window.DB.reset();
      window.Toast.show("Demonstration database reset to initial seed state.", "success");
      setTimeout(() => window.location.reload(), 400);
    }
  });
}

function setupAdminTabs() {
  const tabs = document.querySelectorAll('.admin-nav-tab');
  const sections = document.querySelectorAll('.admin-section-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');
      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.style.display = 'none');

      tab.classList.add('active');
      const pane = document.getElementById(target);
      if (pane) pane.style.display = 'block';
    });
  });
}

// Safe document ready initialization
if (window.onReady) {
  window.onReady(initAdminDashboard);
} else {
  document.addEventListener('DOMContentLoaded', initAdminDashboard);
}
