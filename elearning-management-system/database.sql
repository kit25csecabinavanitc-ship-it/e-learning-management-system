-- ============================================================================
-- LearnSphere - E-Learning Management System
-- College DBMS Academic Project Database Script
-- Target Database Engine: MySQL 8.0+ / MariaDB 10.5+
-- Schema Normalization Level: Third Normal Form (3NF)
--
-- Notice: The web application uses localStorage as a client-side prototype.
-- This SQL script provides the production-grade schema and relational
-- architecture for deployment to a real MySQL / PostgreSQL relational database.
-- ============================================================================

-- 1. Create and Select Database
DROP DATABASE IF EXISTS `learnsphere_db`;
CREATE DATABASE `learnsphere_db`
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `learnsphere_db`;

-- ============================================================================
-- Table 1: students
-- Represents registered student accounts.
-- ============================================================================
CREATE TABLE `students` (
    `student_id` VARCHAR(36) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(120) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL, -- bcrypt hashed password in production
    `avatar` VARCHAR(10) DEFAULT 'ST',
    `bio` TEXT NULL,
    `enrolled_date` DATE NOT NULL,
    `status` ENUM('active', 'suspended', 'graduated') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`student_id`),
    UNIQUE KEY `uq_students_email` (`email`),
    INDEX `idx_students_status` (`status`)
) ENGINE=InnoDB;

-- ============================================================================
-- Table 2: admins
-- Represents university faculty and system administrators.
-- ============================================================================
CREATE TABLE `admins` (
    `admin_id` VARCHAR(36) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(120) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NOT NULL DEFAULT 'System Administrator',
    `department` VARCHAR(80) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`admin_id`),
    UNIQUE KEY `uq_admins_email` (`email`)
) ENGINE=InnoDB;

-- ============================================================================
-- Table 3: courses
-- Academic course catalog offerings.
-- ============================================================================
CREATE TABLE `courses` (
    `course_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `instructor` VARCHAR(100) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `difficulty_level` ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,
    `duration_hours` VARCHAR(30) NOT NULL,
    `price` VARCHAR(20) NOT NULL DEFAULT 'Free',
    `is_free` BOOLEAN NOT NULL DEFAULT TRUE,
    `rating` DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
    `reviews_count` INT NOT NULL DEFAULT 0,
    `description` TEXT NOT NULL,
    `image_url` VARCHAR(255) NULL,
    `modules_count` INT NOT NULL DEFAULT 1,
    `total_lessons` INT NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`course_id`),
    INDEX `idx_courses_category` (`category`),
    INDEX `idx_courses_difficulty` (`difficulty_level`)
) ENGINE=InnoDB;

-- ============================================================================
-- Table 4: enrollments (M:N Associative Junction Table)
-- Connects students with courses (One student can enroll in many courses;
-- one course can have many students).
-- ============================================================================
CREATE TABLE `enrollments` (
    `enrollment_id` VARCHAR(36) NOT NULL,
    `student_id` VARCHAR(36) NOT NULL,
    `course_id` VARCHAR(36) NOT NULL,
    `enrolled_at` DATE NOT NULL,
    `status` ENUM('in-progress', 'completed', 'dropped') NOT NULL DEFAULT 'in-progress',
    `progress_percent` INT NOT NULL DEFAULT 0 CHECK (`progress_percent` BETWEEN 0 AND 100),
    PRIMARY KEY (`enrollment_id`),
    UNIQUE KEY `uq_student_course` (`student_id`, `course_id`),
    INDEX `idx_enrollment_student` (`student_id`),
    INDEX `idx_enrollment_course` (`course_id`),
    CONSTRAINT `fk_enrollments_student`
        FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_enrollments_course`
        FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- Table 5: lessons
-- Individual lectures/units belonging to a course (1:N with courses).
-- ============================================================================
CREATE TABLE `lessons` (
    `lesson_id` VARCHAR(36) NOT NULL,
    `course_id` VARCHAR(36) NOT NULL,
    `module_name` VARCHAR(100) NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `duration` VARCHAR(30) NOT NULL,
    `video_url` VARCHAR(255) NULL,
    `content_text` LONGTEXT NOT NULL,
    `sequence_order` INT NOT NULL DEFAULT 1,
    PRIMARY KEY (`lesson_id`),
    INDEX `idx_lessons_course` (`course_id`),
    CONSTRAINT `fk_lessons_course`
        FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- Table 6: lesson_progress
-- Tracks whether an individual student has completed a specific lesson
-- and stores personal study notes.
-- ============================================================================
CREATE TABLE `lesson_progress` (
    `progress_id` VARCHAR(36) NOT NULL,
    `student_id` VARCHAR(36) NOT NULL,
    `lesson_id` VARCHAR(36) NOT NULL,
    `is_completed` BOOLEAN NOT NULL DEFAULT FALSE,
    `personal_notes` TEXT NULL,
    `completed_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`progress_id`),
    UNIQUE KEY `uq_student_lesson` (`student_id`, `lesson_id`),
    CONSTRAINT `fk_progress_student`
        FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_progress_lesson`
        FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`lesson_id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- Table 7: quizzes
-- Assessment entities associated with courses (1:N with courses).
-- ============================================================================
CREATE TABLE `quizzes` (
    `quiz_id` VARCHAR(36) NOT NULL,
    `course_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `passing_score` INT NOT NULL DEFAULT 70 CHECK (`passing_score` BETWEEN 0 AND 100),
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`quiz_id`),
    INDEX `idx_quizzes_course` (`course_id`),
    CONSTRAINT `fk_quizzes_course`
        FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- Table 8: questions
-- Multiple choice questions belonging to a quiz (1:N with quizzes).
-- ============================================================================
CREATE TABLE `questions` (
    `question_id` VARCHAR(36) NOT NULL,
    `quiz_id` VARCHAR(36) NOT NULL,
    `question_text` TEXT NOT NULL,
    `options_json` JSON NOT NULL, -- JSON array of choices, e.g. ["1NF", "2NF", "3NF", "BCNF"]
    `correct_index` INT NOT NULL CHECK (`correct_index` >= 0),
    `explanation` TEXT NOT NULL,
    PRIMARY KEY (`question_id`),
    INDEX `idx_questions_quiz` (`quiz_id`),
    CONSTRAINT `fk_questions_quiz`
        FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`quiz_id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- Table 9: quiz_attempts
-- Records student attempts, scores, and pass/fail states (1:N with students).
-- ============================================================================
CREATE TABLE `quiz_attempts` (
    `attempt_id` VARCHAR(36) NOT NULL,
    `student_id` VARCHAR(36) NOT NULL,
    `quiz_id` VARCHAR(36) NOT NULL,
    `course_id` VARCHAR(36) NOT NULL,
    `score_percentage` INT NOT NULL CHECK (`score_percentage` BETWEEN 0 AND 100),
    `total_questions` INT NOT NULL DEFAULT 5,
    `passed` BOOLEAN NOT NULL DEFAULT FALSE,
    `completed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`attempt_id`),
    INDEX `idx_attempts_student` (`student_id`),
    INDEX `idx_attempts_quiz` (`quiz_id`),
    CONSTRAINT `fk_attempts_student`
        FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_attempts_quiz`
        FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`quiz_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_attempts_course`
        FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- Table 10: certificates
-- Verified graduation credentials issued upon successful course completion.
-- ============================================================================
CREATE TABLE `certificates` (
    `certificate_id` VARCHAR(36) NOT NULL,
    `student_id` VARCHAR(36) NOT NULL,
    `course_id` VARCHAR(36) NOT NULL,
    `issued_date` DATE NOT NULL,
    `grade` VARCHAR(50) NOT NULL,
    `verification_hash` VARCHAR(64) NULL,
    PRIMARY KEY (`certificate_id`),
    UNIQUE KEY `uq_cert_student_course` (`student_id`, `course_id`),
    CONSTRAINT `fk_certificates_student`
        FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_certificates_course`
        FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- SAMPLE DATA INSERTION (Realistic Collegiate Seeds)
--
-- DUMMY CREDENTIALS FOR TESTING & EVALUATION:
-- 1. Student Account:
--    Username: student (or student@learnsphere.edu)
--    Password: student123
-- 2. Admin Account:
--    Username: admin (or admin@learnsphere.edu)
--    Password: admin123
-- ============================================================================

-- Insert Students
INSERT INTO `students` (`student_id`, `full_name`, `email`, `password_hash`, `avatar`, `bio`, `enrolled_date`, `status`)
VALUES 
('std_101', 'Alex Johnson', 'student@learnsphere.edu', '$2b$12$e7QGjK37.u.zF076V1X8eO6gH0kQ.7/sYV9BvG5gP08eH0e6yU3yW', 'AJ', 'Computer Science undergraduate passionate about full-stack web development and database architecture.', '2026-01-15', 'active'),
('std_102', 'Priya Sharma', 'priya@learnsphere.edu', '$2b$12$e7QGjK37.u.zF076V1X8eO6gH0kQ.7/sYV9BvG5gP08eH0e6yU3yW', 'PS', 'Aspiring Data Engineer interested in relational databases and scalable analytics.', '2026-02-01', 'active');

-- Insert Admins
INSERT INTO `admins` (`admin_id`, `full_name`, `email`, `password_hash`, `role`, `department`)
VALUES
('adm_001', 'Dr. Evelyn Vance', 'admin@learnsphere.edu', '$2b$12$e7QGjK37.u.zF076V1X8eO6gH0kQ.7/sYV9BvG5gP08eH0e6yU3yW', 'System Administrator', 'Computer Science & Engineering');

-- Insert Courses (8 Core Courses)
INSERT INTO `courses` (`course_id`, `title`, `instructor`, `category`, `difficulty_level`, `duration_hours`, `price`, `is_free`, `rating`, `reviews_count`, `description`, `modules_count`, `total_lessons`)
VALUES
('crs_1', 'HTML and CSS Fundamentals', 'Prof. Michael Chang', 'Web Development', 'Beginner', '14 Hours', 'Free', TRUE, 4.80, 340, 'Master modern semantic HTML5, CSS3 Grid, Flexbox, responsive layouts, and cross-browser accessibility from scratch.', 5, 12),
('crs_2', 'JavaScript for Beginners', 'Sarah Jenkins, M.Sc.', 'Web Development', 'Beginner', '18 Hours', '₹499', FALSE, 4.90, 420, 'Comprehensive introduction to JavaScript ES6+, DOM manipulation, asynchronous programming, APIs, and modern toolchains.', 6, 15),
('crs_3', 'Python Programming', 'David Miller, Ph.D.', 'Programming', 'Beginner', '20 Hours', 'Free', TRUE, 4.90, 512, 'Learn Python fundamentals, data structures, object-oriented paradigms, and automated scripting with hands-on projects.', 6, 16),
('crs_4', 'Java Programming', 'Dr. Alan Mercer', 'Programming', 'Intermediate', '24 Hours', '₹499', FALSE, 4.70, 290, 'Master Java OOP concepts, inheritance, polymorphism, collections framework, exception handling, and multithreading.', 7, 18),
('crs_5', 'Database Management Systems', 'Dr. Evelyn Vance', 'Database', 'Intermediate', '22 Hours', 'Free', TRUE, 5.00, 680, 'In-depth study of relational algebra, 3NF normalization, E-R modeling, SQL joins, ACID transactions, and indexing strategies.', 8, 20),
('crs_6', 'Data Structures and Algorithms', 'Vikram Sen, M.Tech.', 'Computer Science', 'Intermediate', '28 Hours', '₹499', FALSE, 4.90, 460, 'Deep dive into Arrays, Linked Lists, Trees, Graphs, Sorting, Dynamic Programming, and Big-O computational complexity.', 8, 22),
('crs_7', 'Artificial Intelligence', 'Dr. Sophia Patel', 'Data & AI', 'Advanced', '30 Hours', '₹499', FALSE, 4.90, 385, 'Explore machine learning algorithms, deep neural networks, computer vision, natural language processing, and ethical AI systems.', 8, 24),
('crs_8', 'Cybersecurity Fundamentals', 'Marcus Reynolds, CISSP', 'Security', 'Beginner', '16 Hours', 'Free', TRUE, 4.80, 310, 'Understand network security architecture, ethical hacking principles, cryptography, defense against cyber threats, and security policies.', 5, 14);

-- Insert Enrollments (Associative M:N Table)
INSERT INTO `enrollments` (`enrollment_id`, `student_id`, `course_id`, `enrolled_at`, `status`, `progress_percent`)
VALUES
('enr_001', 'std_101', 'crs_5', '2026-02-10', 'in-progress', 65),
('enr_002', 'std_101', 'crs_1', '2026-01-20', 'completed', 100),
('enr_003', 'std_101', 'crs_7', '2026-03-01', 'in-progress', 25),
('enr_004', 'std_102', 'crs_5', '2026-02-15', 'in-progress', 40);

-- Insert Lessons for DBMS Course
INSERT INTO `lessons` (`lesson_id`, `course_id`, `module_name`, `title`, `duration`, `video_url`, `content_text`, `sequence_order`)
VALUES
('les_501', 'crs_5', 'Module 1: Relational Foundations', 'Introduction to Relational Database Concepts & Schema', '25 mins', 'https://www.w3schools.com/html/mov_bbb.mp4', 'A relational database organizes data into one or more tables of columns and rows, with a unique key identifying each row. Tables are related using Primary Keys and Foreign Keys.', 1),
('les_502', 'crs_5', 'Module 1: Relational Foundations', 'Entity-Relationship (E-R) Modeling and Cardinalities', '35 mins', NULL, 'Entity-Relationship Diagrams provide a conceptual blueprint of the database. Cardinalities define numerical relationships: One-to-One, One-to-Many, and Many-to-Many.', 2),
('les_503', 'crs_5', 'Module 2: Normalization & SQL Queries', 'Database Normalization: 1NF, 2NF, 3NF and BCNF', '40 mins', NULL, 'Normalization minimizes data redundancy and eliminates insertion, update, and deletion anomalies. 1NF ensures atomic attribute values. 2NF removes partial functional dependencies. 3NF removes transitive dependencies.', 3),
('les_504', 'crs_5', 'Module 2: Normalization & SQL Queries', 'SQL Joins, Aggregations and Indexing Optimization', '45 mins', NULL, 'SQL queries leverage INNER JOIN, LEFT OUTER JOIN, and GROUP BY clauses to synthesize disparate relations. B-Tree and Hash indexes expedite row lookup times.', 4);

-- Insert Quizzes
INSERT INTO `quizzes` (`quiz_id`, `course_id`, `title`, `passing_score`)
VALUES
('qz_dbms', 'crs_5', 'Database Management Systems Certification Quiz', 70);

-- Insert Questions for DBMS Quiz
INSERT INTO `questions` (`question_id`, `quiz_id`, `question_text`, `options_json`, `correct_index`, `explanation`)
VALUES
('q1', 'qz_dbms', 'Which normal form requires that all non-key attributes are fully functionally dependent on the entire primary key, eliminating partial dependencies?', '["First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "Boyce-Codd Normal Form (BCNF)"]', 1, 'Second Normal Form (2NF) mandates that the table is already in 1NF and no non-prime attribute is partially dependent on any candidate key of the table.'),
('q2', 'qz_dbms', 'How is a Many-to-Many (M:N) relationship between two entities implemented in a standard Relational Database?', '["By adding an array column in both parent tables", "By establishing a separate associative (junction) table containing foreign keys to both parents", "By merging both entities into a single flat unnormalized table", "Relational databases cannot represent Many-to-Many relationships"]', 1, 'In RDBMS, an M:N relationship is resolved using a junction table with composite foreign keys pointing to the primary keys of both participating tables.'),
('q3', 'qz_dbms', 'In ACID transaction properties, what does Atomicity guarantee?', '["Transactions execute at the speed of atoms", "All operations within the transaction succeed completely, or none are applied at all", "Data is guaranteed to be encrypted at the physical layer", "Transactions are kept isolated from concurrent queries"]', 1, 'Atomicity ensures that if any statement in a transaction fails, all previously executed steps in that transaction are rolled back.'),
('q4', 'qz_dbms', 'Which SQL clause is used to filter records resulting from an aggregate function like COUNT() or AVG()?', '["WHERE", "HAVING", "GROUP BY", "ORDER BY"]', 1, 'The HAVING clause was added to SQL because the WHERE keyword cannot be applied directly to aggregate functions.'),
('q5', 'qz_dbms', 'What is the primary trade-off when creating multiple B-Tree indexes on database tables?', '["Queries become slower while writes become faster", "SELECT query lookups become faster, but INSERT/UPDATE/DELETE writes incur additional overhead", "It permanently disables foreign key referential integrity constraints", "Indexes require server rebooting after every query execution"]', 1, 'Indexes speed up data retrieval by maintaining ordered search structures, but slow down data modification operations as index nodes must be rebalanced.');

-- Insert Quiz Attempts
INSERT INTO `quiz_attempts` (`attempt_id`, `student_id`, `quiz_id`, `course_id`, `score_percentage`, `total_questions`, `passed`, `completed_at`)
VALUES
('att_001', 'std_101', 'qz_dbms', 'crs_5', 80, 5, TRUE, '2026-03-05 14:30:00');

-- Insert Certificates
INSERT INTO `certificates` (`certificate_id`, `student_id`, `course_id`, `issued_date`, `grade`, `verification_hash`)
VALUES
('cert_9941', 'std_101', 'crs_1', '2026-02-01', 'A (95%)', 'a8f5c6b9e2d14876a911e3b5df901234');

-- ============================================================================
-- SAMPLE RELATIONAL QUERIES FOR DBMS PROJECT REPORT
-- ============================================================================

-- Query 1: Retrieve student profile with overall enrollment count and average progress
SELECT 
    s.student_id,
    s.full_name,
    s.email,
    COUNT(e.enrollment_id) AS total_enrolled_courses,
    COALESCE(ROUND(AVG(e.progress_percent), 1), 0) AS average_progress_percent
FROM students s
LEFT JOIN enrollments e ON s.student_id = e.student_id
WHERE s.student_id = 'std_101'
GROUP BY s.student_id, s.full_name, s.email;

-- Query 2: Many-to-Many (M:N) Join: List all courses and students currently enrolled
SELECT 
    c.course_id,
    c.title AS course_title,
    s.full_name AS student_name,
    e.enrolled_at,
    e.progress_percent,
    e.status
FROM enrollments e
INNER JOIN courses c ON e.course_id = c.course_id
INNER JOIN students s ON e.student_id = s.student_id
ORDER BY c.title ASC, e.progress_percent DESC;

-- Query 3: Course Popularity & Revenue Aggregate Report
SELECT 
    c.category,
    c.title,
    c.difficulty_level,
    c.price,
    COUNT(e.enrollment_id) AS total_enrolled_students,
    SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) AS total_graduates
FROM courses c
LEFT JOIN enrollments e ON c.course_id = e.course_id
GROUP BY c.course_id, c.category, c.title, c.difficulty_level, c.price
ORDER BY total_enrolled_students DESC;

-- Query 4: Assessment Performance & Quiz Pass Rate Analysis
SELECT 
    q.title AS quiz_title,
    COUNT(qa.attempt_id) AS total_attempts,
    ROUND(AVG(qa.score_percentage), 1) AS average_score,
    ROUND(SUM(CASE WHEN qa.passed = TRUE THEN 1 ELSE 0 END) * 100.0 / COUNT(qa.attempt_id), 1) AS pass_percentage
FROM quizzes q
LEFT JOIN quiz_attempts qa ON q.quiz_id = qa.quiz_id
GROUP BY q.quiz_id, q.title;
