/**
 * LearnSphere - Quiz & Assessment Engine (quiz.js)
 * Step-by-step MCQ runner, dynamic scoring, explanatory answer breakdown,
 * relational quiz_attempts table storage, and past history display.
 */

let activeQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = {}; // { qIndex: selectedOptionIndex }
let isSubmitted = false;

function initQuizEngine() {
  const quizCard = document.getElementById('quiz-card-container');
  if (!quizCard) return;

  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('course') || 'crs_5';

  const db = window.DB.get();
  const session = window.DB.getSession() || { id: "std_101", name: "Alex Johnson" };

  // Select quiz matching course, or fallback to DBMS certification quiz
  activeQuiz = db.quizzes.find(q => q.course_id === courseId) || db.quizzes[0];

  const titleEl = document.getElementById('quiz-main-title');
  if (titleEl) titleEl.textContent = activeQuiz.title;

  currentQuestionIndex = 0;
  userAnswers = {};
  isSubmitted = false;

  renderQuestion();
  renderQuizHistory(session.id);
}

function renderQuestion() {
  const container = document.getElementById('quiz-interactive-area');
  if (!container || !activeQuiz) return;

  const total = activeQuiz.questions.length;
  const q = activeQuiz.questions[currentQuestionIndex];
  const selected = userAnswers[currentQuestionIndex];

  // Update step indicator
  const stepEl = document.getElementById('quiz-step-indicator');
  if (stepEl) {
    stepEl.textContent = `Question ${currentQuestionIndex + 1} of ${total}`;
  }

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1.5rem;">
      <h3 class="quiz-question-text">${currentQuestionIndex + 1}. ${q.question}</h3>
      
      <div class="quiz-options-list">
        ${q.options.map((opt, oIdx) => `
          <label class="quiz-option-label ${selected === oIdx ? 'selected' : ''}" data-opt-idx="${oIdx}">
            <input type="radio" name="quiz_opt_${currentQuestionIndex}" value="${oIdx}" ${selected === oIdx ? 'checked' : ''} />
            <span>${opt}</span>
          </label>
        `).join('')}
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; padding-top:1.5rem; border-top:1px solid var(--color-border);">
        <button id="quiz-prev-btn" class="btn btn-sm btn-secondary" ${currentQuestionIndex === 0 ? 'disabled' : ''}>Previous</button>
        <div>
          ${
            currentQuestionIndex === total - 1
              ? `<button id="quiz-submit-btn" class="btn btn-sm btn-primary">Submit Assessment</button>`
              : `<button id="quiz-next-btn" class="btn btn-sm btn-primary">Next Question</button>`
          }
        </div>
      </div>
    </div>
  `;

  // Attach radio selection listeners to both input and label
  container.querySelectorAll('.quiz-option-label').forEach(label => {
    label.addEventListener('click', () => {
      const optIdx = parseInt(label.getAttribute('data-opt-idx'), 10);
      userAnswers[currentQuestionIndex] = optIdx;
      const radio = label.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      container.querySelectorAll('.quiz-option-label').forEach((lbl, idx) => {
        if (idx === optIdx) lbl.classList.add('selected');
        else lbl.classList.remove('selected');
      });
    });
  });

  // Navigation handlers
  const prevBtn = document.getElementById('quiz-prev-btn');
  const nextBtn = document.getElementById('next-btn'); // Fallback or check
  const actualNextBtn = document.getElementById('quiz-next-btn');
  const submitBtn = document.getElementById('quiz-submit-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
      }
    });
  }

  if (actualNextBtn) {
    actualNextBtn.addEventListener('click', () => {
      if (userAnswers[currentQuestionIndex] === undefined) {
        window.Toast.show('Please select an answer before proceeding to the next question.', 'error');
        return;
      }
      if (currentQuestionIndex < total - 1) {
        currentQuestionIndex++;
        renderQuestion();
      }
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      if (userAnswers[currentQuestionIndex] === undefined) {
        window.Toast.show('Please select an answer before submitting.', 'error');
        return;
      }
      calculateAndRenderResults();
    });
  }
}

function calculateAndRenderResults() {
  const container = document.getElementById('quiz-interactive-area');
  const stepEl = document.getElementById('quiz-step-indicator');
  if (!container || !activeQuiz) return;

  let correctCount = 0;
  const total = activeQuiz.questions.length;

  activeQuiz.questions.forEach((q, idx) => {
    if (userAnswers[idx] === q.correctIndex) {
      correctCount++;
    }
  });

  const percentage = Math.round((correctCount / total) * 100);
  const passed = percentage >= (activeQuiz.passingScore || 70);

  // Record Attempt to Database
  const session = window.DB.getSession() || { id: "std_101", name: "Alex Johnson" };
  const db = window.DB.get();

  const newAttempt = {
    attempt_id: `att_${Date.now()}`,
    student_id: session.id,
    quiz_id: activeQuiz.id,
    course_id: activeQuiz.course_id,
    score: percentage,
    total_questions: total,
    passed: passed,
    completed_at: new Date().toISOString().split('T')[0]
  };

  if (!db.quiz_attempts) db.quiz_attempts = [];
  db.quiz_attempts.push(newAttempt);

  // If passed with >= 80%, generate certificate if not existing
  if (passed && percentage >= 80) {
    if (!db.certificates) db.certificates = [];
    const existingCert = db.certificates.find(c => c.student_id === session.id && c.course_id === activeQuiz.course_id);
    if (!existingCert) {
      const course = db.courses.find(c => c.id === activeQuiz.course_id);
      db.certificates.push({
        certificate_id: `cert_${Date.now().toString().slice(-4)}`,
        student_id: session.id,
        student_name: session.name,
        course_id: activeQuiz.course_id,
        course_title: course ? course.title : "Academic Mastery",
        issued_date: new Date().toISOString().split('T')[0],
        grade: percentage >= 90 ? "A+ with Distinction" : "A (Honors)"
      });
      window.Toast.show("Congratulations! You passed and earned a Verified Certificate!", "success");
    }
  }

  window.DB.save(db);

  if (stepEl) stepEl.textContent = "Assessment Complete";

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:2rem;">
      <div class="quiz-result-score-box">
        <div style="font-size:0.875rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:${passed ? 'var(--color-success)' : 'var(--color-danger)'};">
          ${passed ? '✓ Passing Grade Achieved' : 'Needs Review - Retake Available'}
        </div>
        <div class="quiz-score-number tabular-nums">${percentage}%</div>
        <p style="font-size:1rem; color:var(--color-text-muted);">
          You answered <strong>${correctCount} out of ${total}</strong> questions correctly (Passing Score: ${activeQuiz.passingScore || 70}%).
        </p>
        <div style="display:flex; gap:0.75rem; margin-top:0.5rem;">
          <button id="retake-quiz-btn" class="btn btn-sm btn-secondary">Retake Assessment</button>
          <a href="dashboard.html" class="btn btn-sm btn-primary">Return to Dashboard</a>
        </div>
      </div>

      <div style="border-top:1px solid var(--color-border); padding-top:1.5rem;">
        <h4 style="font-size:1.125rem; font-weight:700; margin-bottom:1rem; color:var(--color-text-main);">
          Answer Key & Technical Explanations
        </h4>
        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          ${activeQuiz.questions.map((q, qIdx) => {
            const userChoice = userAnswers[qIdx];
            const isCorrect = userChoice === q.correctIndex;
            return `
              <div style="padding:1.25rem; background-color:var(--color-surface); border:1px solid ${isCorrect ? 'var(--color-border)' : 'var(--color-border)'}; border-radius:var(--radius-sm);">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.5rem;">
                  <strong style="font-size:0.9375rem; color:var(--color-text-main);">Question ${qIdx + 1}: ${q.question}</strong>
                  <span style="font-size:0.75rem; font-weight:700; padding:0.2rem 0.5rem; border-radius:var(--radius-sm); ${isCorrect ? 'background-color:var(--color-success-bg); color:var(--color-success);' : 'background-color:var(--color-danger-bg); color:var(--color-danger);'}">
                    ${isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <div style="font-size:0.875rem; margin-bottom:0.5rem;">
                  <div>Your answer: <span style="font-weight:600; color:${isCorrect ? 'var(--color-success)' : 'var(--color-danger)'};">${q.options[userChoice] !== undefined ? q.options[userChoice] : 'Unanswered'}</span></div>
                  ${!isCorrect ? `<div>Correct answer: <span style="font-weight:600; color:var(--color-success);">${q.options[q.correctIndex]}</span></div>` : ''}
                </div>
                <div style="font-size:0.8125rem; background-color:var(--color-surface-hover); padding:0.75rem; border-radius:var(--radius-sm); color:var(--color-text-muted); line-height:1.5;">
                  <strong>Explanation:</strong> ${q.explanation}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  document.getElementById('retake-quiz-btn')?.addEventListener('click', () => {
    currentQuestionIndex = 0;
    userAnswers = {};
    renderQuestion();
  });

  renderQuizHistory(session.id);
}

function renderQuizHistory(studentId) {
  const container = document.getElementById('quiz-history-container');
  if (!container) return;

  const db = window.DB.get();
  const attempts = (db.quiz_attempts || []).filter(a => a.student_id === studentId);

  if (attempts.length === 0) {
    container.innerHTML = `<p style="font-size:0.875rem; color:var(--color-text-muted);">No prior assessment attempts recorded.</p>`;
    return;
  }

  container.innerHTML = `
    <table class="data-table" style="font-size:0.8125rem;">
      <thead>
        <tr>
          <th>Date</th>
          <th>Score</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        ${attempts.map(att => `
          <tr>
            <td class="tabular-nums">${att.completed_at}</td>
            <td class="tabular-nums font-semibold">${att.score}%</td>
            <td>
              <span style="font-weight:600; color:${att.passed ? 'var(--color-success)' : 'var(--color-danger)'};">
                ${att.passed ? 'PASSED' : 'FAILED'}
              </span>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// Safe document ready initialization
if (window.onReady) {
  window.onReady(initQuizEngine);
} else {
  document.addEventListener('DOMContentLoaded', initQuizEngine);
}
