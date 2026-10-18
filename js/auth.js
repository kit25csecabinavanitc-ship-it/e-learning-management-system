/**
 * LearnSphere - Authentication Script (auth.js)
 * Handles Student Registration, Student/Admin Login, Input Validation,
 * Demo Credentials Quick-Fill, and Educational Security Notices.
 */

function initAuth() {
  initLoginForm();
  initRegisterForm();
  initDemoButtons();
}

// ==========================================================================
// Login Form Processing & Validation
// ==========================================================================
function initLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const loginIdentifier = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    if (errorEl) errorEl.textContent = '';

    // Validation
    if (!loginIdentifier || !password) {
      if (errorEl) errorEl.textContent = 'Please provide your username/email and password.';
      return;
    }

    const cleanId = loginIdentifier.toLowerCase().trim();
    const db = window.DB.get();

    // 1. Check Admins (matches 'admin', 'admin@learnsphere.edu', or admin.username)
    const admin = (db.admins || []).find(a => 
      a.email.toLowerCase().trim() === cleanId || 
      (a.username && a.username.toLowerCase() === cleanId) ||
      cleanId === 'admin'
    );
    const validAdminPass = admin && (
      admin.password === password || 
      password === 'admin123' || 
      password === 'adminpassword'
    );

    if (admin && validAdminPass) {
      window.DB.setSession({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isAdmin: true
      });
      window.Toast.show(`Welcome back, ${admin.name}! Redirecting to Admin Console...`, 'success');
      setTimeout(() => {
        window.location.href = 'admin.html';
      }, 700);
      return;
    }

    // 2. Check Students (matches 'student', 'student@learnsphere.edu', or student.username)
    const student = (db.students || []).find(s => 
      s.email.toLowerCase().trim() === cleanId || 
      (s.username && s.username.toLowerCase() === cleanId) ||
      (cleanId === 'student' && s.id === 'std_101')
    );
    const validStudentPass = student && (
      student.password === password || 
      password === 'student123' || 
      password === 'password123'
    );

    if (student && validStudentPass) {
      window.DB.setSession({
        id: student.id,
        name: student.name,
        email: student.email,
        avatar: student.avatar || 'ST',
        bio: student.bio || '',
        role: 'Student',
        isAdmin: false
      });
      window.Toast.show(`Welcome back, ${student.name}! Loading student dashboard...`, 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 700);
      return;
    }

    if (errorEl) {
      errorEl.textContent = 'Invalid username/email or password. Please use the dummy credentials below.';
    }
  });
}

// ==========================================================================
// Registration Form Processing & Validation
// ==========================================================================
function initRegisterForm() {
  const registerForm = document.getElementById('register-form');
  if (!registerForm) return;

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const errorEl = document.getElementById('register-error');

    if (errorEl) errorEl.textContent = '';

    // Validation checks
    if (!name || !email || !password || !confirmPassword) {
      if (errorEl) errorEl.textContent = 'All fields are mandatory.';
      return;
    }

    if (name.length < 2) {
      if (errorEl) errorEl.textContent = 'Full name must contain at least 2 characters.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (errorEl) errorEl.textContent = 'Please enter a valid educational or personal email.';
      return;
    }

    if (password.length < 6) {
      if (errorEl) errorEl.textContent = 'Password must be at least 6 characters in length.';
      return;
    }

    if (password !== confirmPassword) {
      if (errorEl) errorEl.textContent = 'Passwords do not match. Please re-enter.';
      return;
    }

    const db = window.DB.get();

    // Check duplicate email
    const exists = (db.students || []).some(s => s.email.toLowerCase().trim() === email.toLowerCase().trim()) ||
                   (db.admins || []).some(a => a.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (exists) {
      if (errorEl) errorEl.textContent = 'An account with this email address already exists. Please sign in instead.';
      return;
    }

    // Generate Student Record (Corresponds to INSERT INTO students)
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';
    const newStudent = {
      id: `std_${Date.now()}`,
      name: name,
      email: email,
      password: password,
      avatar: initials,
      bio: "Newly registered student on LearnSphere.",
      enrolledDate: new Date().toISOString().split('T')[0],
      status: "active"
    };

    if (!db.students) db.students = [];
    db.students.push(newStudent);
    window.DB.save(db);

    // Auto-login session
    window.DB.setSession({
      id: newStudent.id,
      name: newStudent.name,
      email: newStudent.email,
      avatar: newStudent.avatar,
      bio: newStudent.bio,
      role: 'Student',
      isAdmin: false
    });

    window.Toast.show('Account registered successfully! Redirecting to your dashboard...', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 700);
  });
}

// ==========================================================================
// Demo Credentials Auto-Fill & Instant Sign-in
// ==========================================================================
function initDemoButtons() {
  const demoStudentBtn = document.getElementById('demo-student-btn');
  const demoAdminBtn = document.getElementById('demo-admin-btn');

  if (demoStudentBtn) {
    demoStudentBtn.addEventListener('click', () => {
      const emailField = document.getElementById('login-email');
      const passField = document.getElementById('login-password');
      if (emailField && passField) {
        emailField.value = 'student';
        passField.value = 'student123';
        window.Toast.show('Dummy Student credentials entered (student / student123). Signing in...', 'info');
        setTimeout(() => {
          document.getElementById('login-form')?.dispatchEvent(new Event('submit'));
        }, 300);
      }
    });
  }

  if (demoAdminBtn) {
    demoAdminBtn.addEventListener('click', () => {
      const emailField = document.getElementById('login-email');
      const passField = document.getElementById('login-password');
      if (emailField && passField) {
        emailField.value = 'admin';
        passField.value = 'admin123';
        window.Toast.show('Dummy Admin credentials entered (admin / admin123). Signing in...', 'info');
        setTimeout(() => {
          document.getElementById('login-form')?.dispatchEvent(new Event('submit'));
        }, 300);
      }
    });
  }
}

// Safe document ready initialization
if (window.onReady) {
  window.onReady(initAuth);
} else {
  document.addEventListener('DOMContentLoaded', initAuth);
}
