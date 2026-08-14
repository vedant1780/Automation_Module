```sql
-- ============================================================
-- HRMS / PAYROLL MANAGEMENT SYSTEM
-- COMPLETE MYSQL DATABASE SCRIPT
-- ============================================================

-- ------------------------------------------------------------
-- 1. CREATE DATABASE
-- ------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS hrms_payroll;

USE hrms_payroll;


-- ============================================================
-- 2. EMPLOYEES
-- ============================================================

DROP TABLE IF EXISTS payslip_email;
DROP TABLE IF EXISTS payroll;
DROP TABLE IF EXISTS leave_applications;
DROP TABLE IF EXISTS leave_balances;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS employee_salary;
DROP TABLE IF EXISTS salary_structures;
DROP TABLE IF EXISTS employees;


CREATE TABLE employees (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    employee_code VARCHAR(50) NOT NULL UNIQUE,

    name VARCHAR(150) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    department VARCHAR(100),

    designation VARCHAR(100),

    password VARCHAR(255) NOT NULL,

    role VARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE'

);


-- ============================================================
-- 3. SALARY STRUCTURES
-- ============================================================

CREATE TABLE salary_structures (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    basic_salary DECIMAL(12,2) NOT NULL DEFAULT 0,

    hra DECIMAL(12,2) NOT NULL DEFAULT 0,

    special_allowance DECIMAL(12,2) NOT NULL DEFAULT 0,

    effective_from DATE,

    effective_to DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);


-- ============================================================
-- 4. EMPLOYEE SALARY
-- ============================================================

CREATE TABLE employee_salary (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    employee_id BIGINT NOT NULL,

    salary_structure_id BIGINT NOT NULL,

    effective_from DATE NOT NULL,

    effective_to DATE,

    CONSTRAINT fk_employee_salary_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_employee_salary_structure
        FOREIGN KEY (salary_structure_id)
        REFERENCES salary_structures(id)
        ON DELETE RESTRICT

);


-- ============================================================
-- 5. ATTENDANCE
-- ============================================================

CREATE TABLE attendance (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    employee_id BIGINT NOT NULL,

    attendance_date DATE NOT NULL,

    status VARCHAR(30) NOT NULL,

    check_in TIME,

    check_out TIME,

    working_hours DECIMAL(5,2),

    CONSTRAINT fk_attendance_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_employee_attendance_date
        UNIQUE (employee_id, attendance_date)

);


-- ============================================================
-- 6. LEAVE BALANCES
-- ============================================================

CREATE TABLE leave_balances (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    employee_id BIGINT NOT NULL,

    casual_leave INT NOT NULL DEFAULT 0,

    sick_leave INT NOT NULL DEFAULT 0,

    earned_leave INT NOT NULL DEFAULT 0,

    year INT NOT NULL,

    CONSTRAINT fk_leave_balance_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_employee_leave_year
        UNIQUE (employee_id, year)

);


-- ============================================================
-- 7. LEAVE APPLICATIONS
-- ============================================================

CREATE TABLE leave_applications (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    employee_id BIGINT NOT NULL,

    leave_type VARCHAR(10) NOT NULL,

    start_date DATE NOT NULL,

    end_date DATE NOT NULL,

    number_of_days INT NOT NULL,

    reason VARCHAR(500),

    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_leave_application_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE CASCADE

);


-- ============================================================
-- 8. PAYROLL
-- ============================================================

CREATE TABLE payroll (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    employee_id BIGINT NOT NULL,

    pay_period VARCHAR(50),

    month INT NOT NULL,

    year INT NOT NULL,

    basic_salary DECIMAL(12,2) NOT NULL DEFAULT 0,

    hra DECIMAL(12,2) NOT NULL DEFAULT 0,

    special_allowance DECIMAL(12,2) NOT NULL DEFAULT 0,

    gross_salary DECIMAL(12,2) NOT NULL DEFAULT 0,

    pf DECIMAL(12,2) NOT NULL DEFAULT 0,

    esi DECIMAL(12,2) NOT NULL DEFAULT 0,

    professional_tax DECIMAL(12,2) NOT NULL DEFAULT 0,

    total_deductions DECIMAL(12,2) NOT NULL DEFAULT 0,

    net_salary DECIMAL(12,2) NOT NULL DEFAULT 0,

    pdf_path VARCHAR(500),

    status VARCHAR(30) NOT NULL DEFAULT 'GENERATED',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payroll_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_employee_payroll_period
        UNIQUE (employee_id, month, year)

);


-- ============================================================
-- 9. PAYSLIP EMAIL LOG
-- ============================================================

CREATE TABLE payslip_email (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    payslip_id BIGINT NOT NULL,

    employee_id BIGINT NOT NULL,

    email VARCHAR(150) NOT NULL,

    status VARCHAR(30),

    sent_at TIMESTAMP NULL,

    error_message VARCHAR(1000),

    CONSTRAINT fk_payslip_email_payroll
        FOREIGN KEY (payslip_id)
        REFERENCES payroll(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_payslip_email_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE CASCADE

);


-- ============================================================
-- 10. INDEXES
-- ============================================================

CREATE INDEX idx_employee_email
ON employees(email);

CREATE INDEX idx_employee_code
ON employees(employee_code);

CREATE INDEX idx_employee_salary_employee
ON employee_salary(employee_id);

CREATE INDEX idx_employee_salary_structure
ON employee_salary(salary_structure_id);

CREATE INDEX idx_attendance_employee
ON attendance(employee_id);

CREATE INDEX idx_attendance_date
ON attendance(attendance_date);

CREATE INDEX idx_leave_employee
ON leave_applications(employee_id);

CREATE INDEX idx_leave_status
ON leave_applications(status);

CREATE INDEX idx_leave_balance_employee
ON leave_balances(employee_id);

CREATE INDEX idx_payroll_employee
ON payroll(employee_id);

CREATE INDEX idx_payroll_year_month
ON payroll(year, month);

CREATE INDEX idx_payslip_email_employee
ON payslip_email(employee_id);


-- ============================================================
-- 11. SAMPLE EMPLOYEES
-- ============================================================

INSERT INTO employees
(
    employee_code,
    name,
    email,
    department,
    designation,
    password,
    role
)
VALUES
(
    'EMP001',
    'Rahul Sharma',
    'rahul@example.com',
    'IT',
    'Software Developer',
    '123456',
    'EMPLOYEE'
),
(
    'EMP002',
    'Amit Kumar',
    'amit@example.com',
    'HR',
    'HR Executive',
    '123456',
    'EMPLOYEE'
),
(
    'ADMIN001',
    'Admin User',
    'admin@example.com',
    'Administration',
    'Administrator',
    'admin123',
    'ADMIN'
);


-- ============================================================
-- 12. SAMPLE SALARY STRUCTURES
-- ============================================================

INSERT INTO salary_structures
(
    name,
    basic_salary,
    hra,
    special_allowance,
    effective_from,
    effective_to
)
VALUES
(
    'Developer Salary Structure',
    30000.00,
    12000.00,
    8000.00,
    '2026-01-01',
    NULL
),
(
    'HR Salary Structure',
    25000.00,
    10000.00,
    5000.00,
    '2026-01-01',
    NULL
);


-- ============================================================
-- 13. ASSIGN SALARY TO EMPLOYEES
-- ============================================================

INSERT INTO employee_salary
(
    employee_id,
    salary_structure_id,
    effective_from,
    effective_to
)
VALUES
(
    1,
    1,
    '2026-01-01',
    NULL
),
(
    2,
    2,
    '2026-01-01',
    NULL
);


-- ============================================================
-- 14. INITIAL LEAVE BALANCES
-- ============================================================

INSERT INTO leave_balances
(
    employee_id,
    casual_leave,
    sick_leave,
    earned_leave,
    year
)
VALUES
(
    1,
    12,
    10,
    15,
    2026
),
(
    2,
    12,
    10,
    15,
    2026
);


-- ============================================================
-- 15. SAMPLE ATTENDANCE
-- ============================================================

INSERT INTO attendance
(
    employee_id,
    attendance_date,
    status,
    check_in,
    check_out,
    working_hours
)
VALUES
(
    1,
    '2026-08-01',
    'PRESENT',
    '09:30:00',
    '18:30:00',
    9.00
),
(
    1,
    '2026-08-02',
    'PRESENT',
    '09:35:00',
    '18:25:00',
    8.83
),
(
    2,
    '2026-08-01',
    'PRESENT',
    '09:20:00',
    '18:10:00',
    8.83
);


-- ============================================================
-- 16. SAMPLE LEAVE APPLICATION
-- ============================================================

INSERT INTO leave_applications
(
    employee_id,
    leave_type,
    start_date,
    end_date,
    number_of_days,
    reason,
    status
)
VALUES
(
    1,
    'CL',
    '2026-08-10',
    '2026-08-11',
    2,
    'Personal work',
    'PENDING'
);


-- ============================================================
-- 17. VERIFY DATABASE
-- ============================================================

SELECT * FROM employees;

SELECT * FROM salary_structures;

SELECT * FROM employee_salary;

SELECT * FROM attendance;

SELECT * FROM leave_balances;

SELECT * FROM leave_applications;

SELECT * FROM payroll;

SELECT * FROM payslip_email;


-- ============================================================
-- 18. USEFUL JOIN QUERIES
-- ============================================================

-- Employee + Salary

SELECT
    e.id AS employee_id,
    e.employee_code,
    e.name,
    e.email,
    ss.name AS salary_structure,
    ss.basic_salary,
    ss.hra,
    ss.special_allowance,
    es.effective_from,
    es.effective_to
FROM employee_salary es
JOIN employees e
    ON e.id = es.employee_id
JOIN salary_structures ss
    ON ss.id = es.salary_structure_id;


-- Employee + Leave Balance

SELECT
    e.id AS employee_id,
    e.employee_code,
    e.name,
    lb.casual_leave,
    lb.sick_leave,
    lb.earned_leave,
    lb.year
FROM leave_balances lb
JOIN employees e
    ON e.id = lb.employee_id;


-- Employee + Leave Applications

SELECT
    la.id,
    e.employee_code,
    e.name,
    e.email,
    la.leave_type,
    la.start_date,
    la.end_date,
    la.number_of_days,
    la.reason,
    la.status
FROM leave_applications la
JOIN employees e
    ON e.id = la.employee_id
ORDER BY la.id DESC;


-- Employee + Payroll

SELECT
    p.id,
    e.employee_code,
    e.name,
    e.email,
    p.month,
    p.year,
    p.basic_salary,
    p.hra,
    p.special_allowance,
    p.gross_salary,
    p.pf,
    p.esi,
    p.professional_tax,
    p.total_deductions,
    p.net_salary,
    p.status,
    p.pdf_path
FROM payroll p
JOIN employees e
    ON e.id = p.employee_id
ORDER BY p.year DESC, p.month DESC;


-- ============================================================
-- END OF SCRIPT
-- ============================================================
```
