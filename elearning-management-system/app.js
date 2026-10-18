/**
 * LearnSphere - Global Core Application Script (app.js)
 * Provides: LocalStorage DBMS Seed State, Auth State, Theme Toggle, Toast Engine, Mobile Nav
 */

// Initial Seed Database for LocalStorage Demonstration
const INITIAL_DATABASE = {
  students: [
    {
      id: "std_101",
      username: "student",
      name: "Alex Johnson",
      email: "student@learnsphere.edu",
      password: "student123", // Dummy student password
      avatar: "AJ",
      bio: "Computer Science undergraduate passionate about full-stack web development and database architecture.",
      enrolledDate: "2026-01-15",
      status: "active"
    },
    {
      id: "std_102",
      username: "priya",
      name: "Priya Sharma",
      email: "priya@learnsphere.edu",
      password: "student123",
      avatar: "PS",
      bio: "Aspiring Data Engineer interested in relational databases and scalable analytics.",
      enrolledDate: "2026-02-01",
      status: "active"
    }
  ],
  admins: [
    {
      id: "adm_001",
      username: "admin",
      name: "Dr. Evelyn Vance",
      email: "admin@learnsphere.edu",
      password: "admin123", // Dummy admin password
      role: "System Administrator",
      department: "Computer Science"
    }
  ],
  courses: [
    {
      id: "crs_1",
      title: "HTML and CSS Fundamentals",
      instructor: "Prof. Michael Chang",
      category: "Web Development",
      level: "Beginner",
      duration: "14 Hours",
      price: "Free",
      isFree: true,
      rating: 4.8,
      reviewsCount: 340,
      description: "Master modern semantic HTML5, CSS3 Grid, Flexbox, responsive layouts, and cross-browser accessibility from scratch.",
      image: "/assets/images/hero_elearning_1792335663352.jpg",
      modulesCount: 5,
      totalLessons: 12
    },
    {
      id: "crs_2",
      title: "JavaScript for Beginners",
      instructor: "Sarah Jenkins, M.Sc.",
      category: "Web Development",
      level: "Beginner",
      duration: "18 Hours",
      price: "₹499",
      isFree: false,
      rating: 4.9,
      reviewsCount: 420,
      description: "Comprehensive introduction to JavaScript ES6+, DOM manipulation, asynchronous programming, APIs, and modern toolchains.",
      image: "/assets/images/course_javascript_1792336474007.jpg",
      modulesCount: 6,
      totalLessons: 15
    },
    {
      id: "crs_3",
      title: "Python Programming",
      instructor: "David Miller, Ph.D.",
      category: "Programming",
      level: "Beginner",
      duration: "20 Hours",
      price: "Free",
      isFree: true,
      rating: 4.9,
      reviewsCount: 512,
      description: "Learn Python fundamentals, data structures, object-oriented paradigms, and automated scripting with hands-on projects.",
      image: "/assets/images/course_python_1792336475548.jpg",
      modulesCount: 6,
      totalLessons: 16
    },
    {
      id: "crs_4",
      title: "Java Programming",
      instructor: "Dr. Alan Mercer",
      category: "Programming",
      level: "Intermediate",
      duration: "24 Hours",
      price: "₹499",
      isFree: false,
      rating: 4.7,
      reviewsCount: 290,
      description: "Master Java OOP concepts, inheritance, polymorphism, collections framework, exception handling, and multithreading.",
      image: "/assets/images/course_java_1792336475489.jpg",
      modulesCount: 7,
      totalLessons: 18
    },
    {
      id: "crs_5",
      title: "Database Management Systems",
      instructor: "Dr. Evelyn Vance",
      category: "Database",
      level: "Intermediate",
      duration: "22 Hours",
      price: "Free",
      isFree: true,
      rating: 5.0,
      reviewsCount: 680,
      description: "In-depth study of relational algebra, 3NF normalization, E-R modeling, SQL joins, ACID transactions, and indexing strategies.",
      image: "/assets/images/course_dbms_1792335663249.jpg",
      modulesCount: 8,
      totalLessons: 20
    },
    {
      id: "crs_6",
      title: "Data Structures and Algorithms",
      instructor: "Vikram Sen, M.Tech.",
      category: "Computer Science",
      level: "Intermediate",
      duration: "28 Hours",
      price: "₹499",
      isFree: false,
      rating: 4.9,
      reviewsCount: 460,
      description: "Deep dive into Arrays, Linked Lists, Trees, Graphs, Sorting, Dynamic Programming, and Big-O computational complexity.",
      image: "/assets/images/course_dsa_1792336474564.jpg",
      modulesCount: 8,
      totalLessons: 22
    },
    {
      id: "crs_7",
      title: "Artificial Intelligence",
      instructor: "Dr. Sophia Patel",
      category: "Data & AI",
      level: "Advanced",
      duration: "30 Hours",
      price: "₹499",
      isFree: false,
      rating: 4.9,
      reviewsCount: 385,
      description: "Explore machine learning algorithms, deep neural networks, computer vision, natural language processing, and ethical AI systems.",
      image: "/assets/images/course_ai_1792335663437.jpg",
      modulesCount: 8,
      totalLessons: 24
    },
    {
      id: "crs_8",
      title: "Cybersecurity Fundamentals",
      instructor: "Marcus Reynolds, CISSP",
      category: "Security",
      level: "Beginner",
      duration: "16 Hours",
      price: "Free",
      isFree: true,
      rating: 4.8,
      reviewsCount: 310,
      description: "Understand network security architecture, ethical hacking principles, cryptography, defense against cyber threats, and security policies.",
      image: "/assets/images/course_cybersecurity_1792335664633.jpg",
      modulesCount: 5,
      totalLessons: 14
    }
  ],
  enrollments: [
    {
      enrollment_id: "enr_001",
      student_id: "std_101",
      course_id: "crs_5",
      enrolled_at: "2026-02-10",
      status: "in-progress",
      progress_percent: 75,
      completed_lessons: ["les_501", "les_502", "les_503"]
    },
    {
      enrollment_id: "enr_002",
      student_id: "std_101",
      course_id: "crs_1",
      enrolled_at: "2026-01-20",
      status: "completed",
      progress_percent: 100,
      completed_lessons: ["les_101", "les_102", "les_103"]
    },
    {
      enrollment_id: "enr_003",
      student_id: "std_101",
      course_id: "crs_7",
      enrolled_at: "2026-03-01",
      status: "in-progress",
      progress_percent: 33,
      completed_lessons: ["les_701"]
    }
  ],
  lessons: [
    // DBMS Lessons
    {
      id: "les_501",
      course_id: "crs_5",
      module: "Module 1: Relational Foundations",
      title: "Introduction to Relational Database Concepts & Schema",
      duration: "25 mins",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      content: "A relational database organizes data into one or more tables (or 'relations') of columns and rows, with a unique key identifying each row. Tables are related using Primary Keys and Foreign Keys, ensuring structural integrity and referential constraints across entities.",
      objectives: [
        "Explain the Difference between File Systems and RDBMS",
        "Define Primary Keys, Foreign Keys, and Candidate Keys",
        "Understand schema definitions and table constraints"
      ]
    },
    {
      id: "les_502",
      course_id: "crs_5",
      module: "Module 1: Relational Foundations",
      title: "Entity-Relationship (E-R) Modeling and Cardinalities",
      duration: "35 mins",
      videoUrl: "",
      content: "Entity-Relationship Diagrams provide a conceptual blueprint of the database. Cardinalities define numerical relationships: One-to-One (1:1), One-to-Many (1:N), and Many-to-Many (M:N). In relational databases, M:N relationships are resolved using an associative junction table (such as Enrollments connecting Students and Courses).",
      objectives: [
        "Identify Entities, Attributes, and Relationships",
        "Map Cardinalities and Participation Constraints",
        "Decompose M:N relationships using Junction Tables"
      ]
    },
    {
      id: "les_503",
      course_id: "crs_5",
      module: "Module 2: Normalization & SQL Queries",
      title: "Database Normalization: 1NF, 2NF, 3NF and BCNF",
      duration: "40 mins",
      videoUrl: "",
      content: "Normalization minimizes data redundancy and eliminates insertion, update, and deletion anomalies. 1NF ensures atomic attribute values. 2NF removes partial functional dependencies on composite keys. 3NF removes transitive dependencies (non-prime attributes depending on non-prime attributes).",
      objectives: [
        "Detect Update, Insert, and Deletion Anomalies",
        "Decompose unnormalized relations into 3NF",
        "Validate loss-less join and dependency preservation"
      ]
    },
    {
      id: "les_504",
      course_id: "crs_5",
      module: "Module 2: Normalization & SQL Queries",
      title: "SQL Joins, Aggregations and Indexing Optimization",
      duration: "45 mins",
      videoUrl: "",
      content: "SQL queries leverage INNER JOIN, LEFT OUTER JOIN, and GROUP BY clauses to synthesize disparate relations. B-Tree and Hash indexes expedite row lookup times from O(N) linear scans to O(log N) logarithmic searches, balancing read performance against write overhead.",
      objectives: [
        "Construct complex Multi-table SQL Joins",
        "Calculate Aggregate metrics using GROUP BY & HAVING",
        "Design strategic B-Tree Indexes on Foreign Keys"
      ]
    },
    // HTML/CSS Lessons
    {
      id: "les_101",
      course_id: "crs_1",
      module: "Module 1: HTML5 Semantics",
      title: "Semantic Document Structure & Accessibility",
      duration: "20 mins",
      videoUrl: "",
      content: "HTML5 semantic elements like <header>, <main>, <article>, and <section> deliver machine-readable structure to assistive technologies and search engine crawlers.",
      objectives: ["Implement semantic page layout tags", "Comply with WCAG accessibility standards", "Configure viewport meta headers"]
    },
    {
      id: "les_102",
      course_id: "crs_1",
      module: "Module 2: CSS Layouts",
      title: "CSS Flexbox & 2-Dimensional CSS Grid",
      duration: "30 mins",
      videoUrl: "",
      content: "Modern responsive web applications rely on CSS Flexbox for 1-dimensional component alignment and CSS Grid for 2-dimensional macro page scaffolding.",
      objectives: ["Build resilient flex containers", "Master CSS Grid template areas", "Implement responsive media queries"]
    },
    {
      id: "les_103",
      course_id: "crs_1",
      module: "Module 3: Visual Polish",
      title: "Typography, Color Systems & Dark Mode",
      duration: "25 mins",
      videoUrl: "",
      content: "Creating distinctive, production-grade web interfaces requires typographic hierarchy, CSS custom properties, and dark mode theme switching.",
      objectives: ["Declare CSS custom property palettes", "Build light and dark theme toggles", "Optimize contrast ratios"]
    },
    // Python Lessons
    {
      id: "les_301",
      course_id: "crs_3",
      module: "Module 1: Python Basics",
      title: "Pythonic Syntax, Lists, Tuples, and Dictionaries",
      duration: "25 mins",
      videoUrl: "",
      content: "Python provides clean expressive syntax with built-in dynamic collections. Master list comprehensions, dictionary mappings, and hash lookups.",
      objectives: ["Write Pythonic loops and comprehensions", "Manipulate nested dictionary structures", "Handle exceptions gracefully"]
    },
    {
      id: "les_302",
      course_id: "crs_3",
      module: "Module 2: Data & Database Connections",
      title: "Connecting Python to Relational MySQL Databases",
      duration: "40 mins",
      videoUrl: "",
      content: "Learn to use MySQL connectors in Python (such as PyMySQL and SQLAlchemy) to execute parameterized queries, manage database connection pools, and prevent SQL injection vulnerabilities.",
      objectives: ["Connect to MySQL using connection cursors", "Execute parameterized INSERT and SELECT queries", "Commit and rollback ACID transactions"]
    },
    // AI Lessons
    {
      id: "les_701",
      course_id: "crs_7",
      module: "Module 1: AI Fundamentals",
      title: "Neural Networks, Weights & Gradient Descent",
      duration: "35 mins",
      videoUrl: "",
      content: "Artificial Neural Networks pass input activations through layered weight matrices, calculating loss and adjusting weights via backpropagation and gradient descent.",
      objectives: ["Understand perceptron math and activations", "Compute forward pass and loss functions", "Explain gradient descent optimization"]
    },
    {
      id: "les_702",
      course_id: "crs_7",
      module: "Module 2: Modern Deep Learning",
      title: "Transformers, Attention Mechanisms & Embeddings",
      duration: "45 mins",
      videoUrl: "",
      content: "Self-attention mechanisms calculate contextual token relevance across entire sequence vectors, powering modern natural language models and vector search databases.",
      objectives: ["Calculate scaled dot-product attention", "Understand high-dimensional vector embeddings", "Evaluate model latency and accuracy"]
    }
  ],
  quizzes: [
    {
      id: "qz_dbms",
      course_id: "crs_5",
      title: "Database Management Systems Certification Quiz",
      passingScore: 70,
      questions: [
        {
          id: "q1",
          question: "Which normal form requires that all non-key attributes are fully functionally dependent on the entire primary key, eliminating partial dependencies?",
          options: [
            "First Normal Form (1NF)",
            "Second Normal Form (2NF)",
            "Third Normal Form (3NF)",
            "Boyce-Codd Normal Form (BCNF)"
          ],
          correctIndex: 1,
          explanation: "Second Normal Form (2NF) mandates that the table is already in 1NF and no non-prime attribute is partially dependent on any candidate key of the table."
        },
        {
          id: "q2",
          question: "How is a Many-to-Many (M:N) relationship between two entities implemented in a standard Relational Database?",
          options: [
            "By adding an array column in both parent tables",
            "By establishing a separate associative (junction) table containing foreign keys to both parents",
            "By merging both entities into a single flat unnormalized table",
            "Relational databases cannot represent Many-to-Many relationships"
          ],
          correctIndex: 1,
          explanation: "In RDBMS, an M:N relationship is resolved using a junction table (e.g., 'Enrollments') with composite foreign keys pointing to the primary keys of both participating tables."
        },
        {
          id: "q3",
          question: "In ACID transaction properties, what does 'Atomicity' guarantee?",
          options: [
            "Transactions execute at the speed of atoms",
            "All operations within the transaction succeed completely, or none are applied at all",
            "Data is guaranteed to be encrypted at the physical layer",
            "Transactions are kept isolated from concurrent queries"
          ],
          correctIndex: 1,
          explanation: "Atomicity ('all-or-nothing') ensures that if any statement in a transaction fails, all previously executed steps in that transaction are rolled back."
        },
        {
          id: "q4",
          question: "Which SQL clause is used to filter records resulting from an aggregate function like COUNT() or AVG()?",
          options: [
            "WHERE",
            "HAVING",
            "GROUP BY",
            "ORDER BY"
          ],
          correctIndex: 1,
          explanation: "The HAVING clause was added to SQL because the WHERE keyword cannot be applied directly to aggregate functions."
        },
        {
          id: "q5",
          question: "What is the primary trade-off when creating multiple B-Tree indexes on database tables?",
          options: [
            "Queries become slower while writes become faster",
            "SELECT query lookups become faster, but INSERT/UPDATE/DELETE writes incur additional overhead",
            "It permanently disables foreign key referential integrity constraints",
            "Indexes require server rebooting after every query execution"
          ],
          correctIndex: 1,
          explanation: "Indexes speed up data retrieval (SELECTs) by maintaining ordered search structures, but slow down data modification operations (INSERT, UPDATE, DELETE) as index nodes must be rebalanced."
        }
      ]
    },
    {
      id: "qz_python",
      course_id: "crs_3",
      title: "Python & Database Scripting Assessment",
      passingScore: 70,
      questions: [
        {
          id: "py_q1",
          question: "How do parameterized SQL queries in Python prevent SQL Injection attacks?",
          options: [
            "By compiling queries to binary before transmission",
            "By treating input variables strictly as data literals rather than executable SQL syntax",
            "By converting all strings to uppercase",
            "Python does not support database parameterization"
          ],
          correctIndex: 1,
          explanation: "Parameterized queries ensure database drivers send query text and user inputs separately, neutralizing malicious code payloads."
        },
        {
          id: "py_q2",
          question: "Which Python data structure provides O(1) average time complexity for key lookups?",
          options: ["List", "Dictionary (dict)", "Tuple", "Linked List"],
          correctIndex: 1,
          explanation: "Python dictionaries are implemented using hash tables, offering amortized O(1) key lookup and insertion time."
        },
        {
          id: "py_q3",
          question: "What is the primary purpose of the 'with' statement in Python when working with database cursors?",
          options: [
            "It automatically commits transactions and closes the cursor/connection upon exit",
            "It doubles CPU clock speed",
            "It converts relational tables into JSON",
            "It encrypts variables with RSA"
          ],
          correctIndex: 0,
          explanation: "Context managers (with statement) ensure deterministic resource cleanup, closing connections even if an exception occurs."
        }
      ]
    },
    {
      id: "qz_cyber",
      course_id: "crs_8",
      title: "Cybersecurity & Relational Data Protection Quiz",
      passingScore: 70,
      questions: [
        {
          id: "cy_q1",
          question: "Why should passwords never be stored in plain text or MD5 in a relational database?",
          options: [
            "MD5 takes too much disk space in MySQL",
            "Plain text and MD5 are vulnerable to leaks and rainbow table collisions; slow algorithms like bcrypt are required",
            "MySQL automatically blocks MD5 hashes",
            "Passwords must be stored in plaintext for recovery"
          ],
          correctIndex: 1,
          explanation: "Algorithms like bcrypt incorporate salt and configurable work factors to thwart hardware-accelerated dictionary attacks."
        },
        {
          id: "cy_q2",
          question: "What is the principle of 'Least Privilege' in database user management?",
          options: [
            "Granting all database users administrative ROOT permissions",
            "Giving applications only the minimum necessary privileges (e.g. SELECT/INSERT) instead of full administrative rights",
            "Deleting the database every 24 hours",
            "Disabling database backups"
          ],
          correctIndex: 1,
          explanation: "Least privilege minimizes the potential blast radius of an application compromise."
        }
      ]
    }
  ],
  quiz_attempts: [
    {
      attempt_id: "att_001",
      student_id: "std_101",
      quiz_id: "qz_dbms",
      course_id: "crs_5",
      score: 80,
      total_questions: 5,
      passed: true,
      completed_at: "2026-03-05"
    }
  ],
  certificates: [
    {
      certificate_id: "cert_9941",
      student_id: "std_101",
      student_name: "Alex Johnson",
      course_id: "crs_1",
      course_title: "HTML and CSS Fundamentals",
      issued_date: "2026-02-01",
      grade: "A (95%)"
    }
  ],
  announcements: [
    {
      id: "anc_1",
      title: "DBMS Mid-Term Assessment Schedule",
      date: "Oct 24, 2026",
      category: "Exam",
      content: "The Relational Algebra and Normalization quiz will open for submissions starting this Friday."
    },
    {
      id: "anc_2",
      title: "New AI & Deep Learning Modules Released",
      date: "Oct 18, 2026",
      category: "Course Update",
      content: "Explore our latest interactive lessons on neural backpropagation and transformer architecture."
    }
  ],
  deadlines: [
    {
      id: "dl_1",
      title: "DBMS Normalization Assignment",
      course: "Database Management Systems",
      dueDate: "Tomorrow, 11:59 PM",
      urgent: true
    },
    {
      id: "dl_2",
      title: "HTML/CSS Responsive Portfolio Project",
      course: "HTML and CSS Fundamentals",
      dueDate: "In 4 Days",
      urgent: false
    }
  ]
};

// ==========================================================================
// Database Helper (Persistent LocalStorage Demonstration)
// ==========================================================================
const DB = {
  KEY: "learnsphere_db_v3",
  SESSION_KEY: "learnsphere_active_session",
  THEME_KEY: "learnsphere_theme",

  init() {
    if (!localStorage.getItem(this.KEY)) {
      localStorage.setItem(this.KEY, JSON.stringify(INITIAL_DATABASE));
    }
  },

  get() {
    this.init();
    try {
      const stored = JSON.parse(localStorage.getItem(this.KEY));
      // Ensure courses and lessons are populated
      if (!stored || !stored.courses || stored.courses.length === 0) {
        return INITIAL_DATABASE;
      }
      let modified = false;
      stored.courses.forEach(c => {
        if (!c.isFree && c.price.toLowerCase() !== 'free') {
          if (c.price !== '₹499') {
            c.price = '₹499';
            modified = true;
          }
        }
      });
      if (modified) {
        this.save(stored);
      }
      return stored;
    } catch (e) {
      console.error("Error reading localStorage DB:", e);
      return INITIAL_DATABASE;
    }
  },

  save(data) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving localStorage DB:", e);
    }
  },

  reset() {
    localStorage.setItem(this.KEY, JSON.stringify(INITIAL_DATABASE));
  },

  // Session handling (Student or Admin)
  getSession() {
    try {
      return JSON.parse(localStorage.getItem(this.SESSION_KEY));
    } catch (e) {
      return null;
    }
  },

  setSession(user) {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(this.SESSION_KEY);
  }
};

// Initialize DB on script load
DB.init();

// ==========================================================================
// Theme Manager (Light & Dark Mode)
// ==========================================================================
const ThemeManager = {
  init() {
    const savedTheme = localStorage.getItem(DB.THEME_KEY) || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    this.apply(savedTheme);
  },

  apply(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem(DB.THEME_KEY, theme);
    this.updateToggleIcons(theme);
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    this.apply(next);
  },

  updateToggleIcons(theme) {
    const toggles = document.querySelectorAll('.theme-toggle-btn');
    toggles.forEach(btn => {
      btn.innerHTML = theme === 'dark' 
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
      btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`);
    });
  }
};

// ==========================================================================
// Toast Notification Engine
// ==========================================================================
const Toast = {
  show(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--color-success); flex-shrink:0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--color-danger); flex-shrink:0;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--color-accent); flex-shrink:0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <div style="flex:1;">${this.escapeHTML(message)}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  },

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }
};

// ==========================================================================
// Global Navigation & Session Setup
// ==========================================================================
function updateNavigationAuthUI() {
  const session = DB.getSession();
  const authContainer = document.getElementById('nav-auth-container');
  if (!authContainer) return;

  if (session) {
    const isStudent = session.role !== 'System Administrator';
    const profileLink = isStudent ? 'dashboard.html' : 'admin.html';
    authContainer.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.75rem;">
        <a href="${profileLink}" class="btn btn-sm btn-secondary" style="display:flex; align-items:center; gap:0.375rem;">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:var(--color-accent);"></span>
          ${isStudent ? 'My Dashboard' : 'Admin Console'}
        </a>
        <button id="global-logout-btn" class="btn btn-sm btn-secondary" title="Sign Out">Sign Out</button>
      </div>
    `;

    document.getElementById('global-logout-btn')?.addEventListener('click', () => {
      DB.clearSession();
      Toast.show('You have been signed out.', 'info');
      setTimeout(() => window.location.href = 'index.html', 400);
    });
  } else {
    authContainer.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <a href="login.html" class="btn btn-sm btn-secondary">Sign In</a>
        <a href="register.html" class="btn btn-sm btn-primary">Enroll Free</a>
      </div>
    `;
  }
}

// Mobile drawer toggle
function setupMobileNav() {
  const toggle = document.querySelector('.mobile-nav-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      drawer.classList.toggle('open');
    });

    // Auto-close on link click
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => drawer.classList.remove('open'));
    });
  }
}

// Highlight current page in navbar
function setActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// Safe document ready handler
function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

// Global initialization
onReady(() => {
  ThemeManager.init();
  setupMobileNav();
  setActiveNavLink();
  updateNavigationAuthUI();

  // Attach theme toggles
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => ThemeManager.toggle());
  });
});

// Export globally for browser scripts
window.DB = DB;
window.Toast = Toast;
window.ThemeManager = ThemeManager;
window.onReady = onReady;
