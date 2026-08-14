# HRMS Payroll & Leave Management System

A full-stack **Human Resource Management System (HRMS)** for managing employees, salary structures, employee salary assignments, attendance, leave applications, leave balances, payroll generation, payslip PDFs, and payslip email delivery.

The project is built with **Spring Boot + Spring Data JPA + MySQL** for the backend and **React + Vite + Axios** for the frontend.

---

## 🚀 Features

### 👨‍💼 Employee Management

* Create and manage employees
* Employee code, name, email, department and designation
* Employee role management
* Employee authentication
* JWT-based authentication and authorization

### 🔐 Authentication & Security

* Login using email and password
* JWT authentication
* Protected backend APIs
* Role-based access control
* Spring Security integration

### 💰 Salary Structure Management

* Create salary structures
* Configure:

  * Basic Salary
  * HRA
  * Special Allowance
* Effective-from and effective-to dates
* View salary structures

### 👨‍💻 Employee Salary Assignment

* Assign salary structures to employees
* Maintain salary effective dates
* View all salary assignments
* View individual salary assignments
* View salary assignment by employee

### 🏖️ Leave Management

* Apply for leave
* Leave types:

  * CL — Casual Leave
  * SL — Sick Leave
  * EL — Earned Leave
* Automatic calculation of leave days
* Leave status:

  * PENDING
  * APPROVED
  * REJECTED
* Approve leave applications
* Reject leave applications
* Automatic leave balance deduction after approval
* Employee leave history
* Leave balance calculation
* Email notification when leave is approved or rejected

### 📅 Attendance Management

* Employee attendance tracking
* Attendance data used during payroll processing
* Attendance-based payroll calculations

### 💵 Payroll Management

* Generate monthly payroll
* Calculate salary components
* Calculate deductions
* Calculate net salary
* Generate payroll for a specific employee and month
* View all payroll records
* View employee payroll history
* View payroll by employee and period
* Delete payroll records
* Scheduled payroll generation

### 📄 Payslip Management

* Generate payslip PDF
* Save generated PDF
* View payslip directly in browser
* Regenerate payslip
* Email payslip to employee
* Maintain payslip email logs

### 📧 Email Notifications

Employees receive email notifications for:

* Approved leave
* Rejected leave
* Payslip delivery

### ⏰ Scheduled Payroll

* Automated scheduled payroll processing
* Generate payroll for eligible employees
* Generate payslips
* Deliver payslips through email

---

# 🛠️ Tech Stack

## Backend

* Java
* Spring Boot
* Spring Web
* Spring Data JPA
* Hibernate
* Spring Security
* JWT
* MySQL
* Lombok
* Maven
* JavaMail / SMTP
* PDF generation

## Frontend

* React.js
* Vite
* JavaScript
* Axios
* HTML5
* CSS3

## Development Tools

* IntelliJ IDEA / Eclipse / VS Code
* MySQL Workbench
* Postman
* Git
* GitHub
* Node.js
* npm

---

# 🏗️ Project Architecture

```text
HRMS
│
├── backend
│   └── Spring Boot Application
│       │
│       ├── Controller
│       ├── Service
│       ├── Repository
│       ├── Entity
│       ├── Security
│       └── Configuration
│
├── frontend
│   └── React + Vite
│       │
│       ├── Components
│       ├── Pages
│       ├── Services
│       ├── Axios
│       └── CSS
│
└── MySQL Database
```

---

# 📂 Backend Structure

A typical backend structure is:

```text
src/
└── main/
    ├── java/
    │   └── com/example/hrm/payroll/
    │       │
    │       ├── controller/
    │       │   ├── EmployeeController.java
    │       │   ├── LeaveApplicationController.java
    │       │   ├── LeaveBalanceController.java
    │       │   ├── EmployeeSalaryController.java
    │       │   ├── PayrollController.java
    │       │   └── ...
    │       │
    │       ├── entity/
    │       │   ├── Employee.java
    │       │   ├── EmployeeSalary.java
    │       │   ├── SalaryStructure.java
    │       │   ├── LeaveApplication.java
    │       │   ├── LeaveBalance.java
    │       │   ├── Attendance.java
    │       │   ├── Payroll.java
    │       │   ├── PayslipEmail.java
    │       │   └── ...
    │       │
    │       ├── repository/
    │       │   ├── EmployeeRepository.java
    │       │   ├── EmployeeSalaryRepository.java
    │       │   ├── SalaryStructureRepository.java
    │       │   ├── LeaveApplicationRepository.java
    │       │   ├── LeaveBalanceRepository.java
    │       │   ├── PayrollRepository.java
    │       │   └── ...
    │       │
    │       ├── service/
    │       │   ├── PayrollService.java
    │       │   ├── PayrollGenerationService.java
    │       │   ├── PayslipPdfService.java
    │       │   ├── PayslipEmailService.java
    │       │   ├── ScheduledPayrollService.java
    │       │   └── ...
    │       │
    │       └── security/
    │           ├── JwtAuthFilter.java
    │           ├── JwtService.java
    │           └── ...
    │
    └── resources/
        └── application.properties
```

---

# 📂 Frontend Structure

```text
frontend/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
│
├── package.json
├── vite.config.js
└── index.html
```

---

# 🗄️ Database

The application uses **MySQL**.

Main tables include:

```text
employees
salary_structures
employee_salary
attendance
leave_applications
leave_balances
payroll
payslip_email
```

---

# 🔑 Database Setup

## 1. Install MySQL

Install MySQL Server and MySQL Workbench.

Verify:

```bash
mysql --version
```

---

## 2. Create Database

Open MySQL:

```bash
mysql -u root -p
```

Create the database:

```sql
CREATE DATABASE hrms;
```

Select it:

```sql
USE hrms;
```

---

# ⚙️ Backend Setup

## 1. Clone the Repository

```bash
git clone https://github.com/vedant1780/hrms-payroll.git
```

Move into the backend directory:

```bash
cd hrms-payroll/backend
```

---

## 2. Configure MySQL

Open:

```text
src/main/resources/application.properties
```

Configure your database:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hrms
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

spring.jpa.properties.hibernate.format_sql=true
```

Replace:

```text
YOUR_MYSQL_PASSWORD
```

with your MySQL password.

---

# 📧 Email Configuration

The application sends:

* Leave approval emails
* Leave rejection emails
* Payslip emails

Configure SMTP in:

```text
application.properties
```

Example:

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=YOUR_EMAIL@gmail.com
spring.mail.password=YOUR_APP_PASSWORD

spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### Gmail

For Gmail SMTP, use a **Google App Password** rather than your normal Gmail password.

Do not commit your email password or app password to GitHub.

For production, use environment variables:

```properties
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
```

---

# 🔐 JWT Configuration

If JWT configuration is used in the project, configure the secret securely.

Example:

```properties
jwt.secret=${JWT_SECRET}
```

Set the environment variable:

### Windows

```cmd
set JWT_SECRET=your-secret-key
```

### Linux/macOS

```bash
export JWT_SECRET=your-secret-key
```

---

# ▶️ Run Backend

Using Maven:

```bash
mvn spring-boot:run
```

Or on Windows:

```cmd
mvnw.cmd spring-boot:run
```

The backend will normally start at:

```text
http://localhost:8080
```

---

# 🎨 Frontend Setup

Open another terminal.

Move to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

---

# 🔗 Backend API Base URL

The frontend communicates with:

```text
http://localhost:8080
```

Example Axios configuration:

```javascript
const API_URL = "http://localhost:8080/api";
```

---

# 🔐 Login API

Example login request:

```http
POST /api/auth/login
```

Request body:

```json
{
  "email": "rahul@example.com",
  "password": "123456"
}
```

> Make sure the property is `password`, not `pasword`.

The login response should contain the authentication information required by the frontend, such as a JWT token.

---

# 👨‍💼 Employee APIs

Base URL:

```text
/api/employees
```

### Get all employees

```http
GET /api/employees
```

### Get employee

```http
GET /api/employees/{employeeId}
```

### Create employee

```http
POST /api/employees
```

### Update employee

```http
PUT /api/employees/{employeeId}
```

### Delete employee

```http
DELETE /api/employees/{employeeId}
```

---

# 💰 Salary Structure APIs

Base URL:

```text
/api/salary-structures
```

Typical operations:

```http
GET    /api/salary-structures
GET    /api/salary-structures/{id}
POST   /api/salary-structures
PUT    /api/salary-structures/{id}
DELETE /api/salary-structures/{id}
```

Salary structure contains:

```text
name
basicSalary
hra
specialAllowance
effectiveFrom
effectiveTo
```

---

# 👨‍💻 Employee Salary APIs

Base URL:

```text
/api/employee-salary
```

### Get all salary assignments

```http
GET /api/employee-salary
```

### Get salary assignment by ID

```http
GET /api/employee-salary/{id}
```

### Assign salary structure to employee

```http
POST /api/employee-salary/{employeeId}/{salaryStructureId}?effectiveFrom=2026-08-14
```

Example:

```http
POST /api/employee-salary/3/2?effectiveFrom=2026-08-14
```

---

# 🏖️ Leave APIs

Base URL:

```text
/api/leaves
```

## Apply for Leave

```http
POST /api/leaves/apply/{employeeId}
```

Example:

```http
POST /api/leaves/apply/4
```

Request:

```json
{
  "leaveType": "CL",
  "startDate": "2026-08-15",
  "endDate": "2026-08-16",
  "reason": "Personal work"
}
```

The backend automatically:

* Validates dates
* Validates leave type
* Calculates number of days
* Assigns the employee
* Sets status to `PENDING`

---

## Get All Leaves

```http
GET /api/leaves
```

---

## Get Employee Leaves

```http
GET /api/leaves/employee/{employeeId}
```

Example:

```http
GET /api/leaves/employee/4
```

---

## Approve Leave

```http
PUT /api/leaves/{leaveId}/approve
```

Example:

```http
PUT /api/leaves/12/approve
```

When approved:

1. Leave balance is checked.
2. Required leave days are deducted.
3. Status changes to `APPROVED`.
4. Employee receives an email notification.

---

## Reject Leave

```http
PUT /api/leaves/{leaveId}/reject
```

Example:

```http
PUT /api/leaves/12/reject
```

When rejected:

1. Leave status changes to `REJECTED`.
2. Leave balance is not deducted.
3. Employee receives a rejection email.

---

# 🏖️ Leave Balance API

Base URL:

```text
/api/leaves
```

### Get employee leave balance

```http
GET /api/leaves/employee/{employeeId}/balance
```

Example:

```http
GET /api/leaves/employee/4/balance
```

Example response:

```json
{
  "employeeId": 4,
  "employeeName": "Rahul",
  "year": 2026,

  "casualLeaveTotal": 12,
  "casualLeaveUsed": 2,
  "casualLeaveRemaining": 10,

  "sickLeaveTotal": 10,
  "sickLeaveUsed": 1,
  "sickLeaveRemaining": 9,

  "earnedLeaveTotal": 15,
  "earnedLeaveUsed": 3,
  "earnedLeaveRemaining": 12
}
```

---

# 📅 Attendance APIs

Base URL:

```text
/api/attendance
```

Typical operations include:

```http
GET    /api/attendance
GET    /api/attendance/{id}
POST   /api/attendance
PUT    /api/attendance/{id}
DELETE /api/attendance/{id}
```

Attendance information can be used during payroll calculation.

---

# 💵 Payroll APIs

Base URL:

```text
/api/payroll
```

## Generate Payroll

```http
POST /api/payroll/generate/{employeeId}?month=8&year=2026
```

Example:

```http
POST /api/payroll/generate/4?month=8&year=2026
```

This process:

```text
Employee
   ↓
Salary Assignment
   ↓
Attendance
   ↓
Approved Leaves
   ↓
Payroll Calculation
   ↓
Payroll Record
   ↓
Payslip PDF
```

---

## Get All Payrolls

```http
GET /api/payroll
```

---

## Get Payroll by ID

```http
GET /api/payroll/{payrollId}
```

---

## Get Employee Payrolls

```http
GET /api/payroll/employee/{employeeId}
```

Example:

```http
GET /api/payroll/employee/4
```

---

## Get Payroll by Employee and Period

```http
GET /api/payroll/employee/{employeeId}/period?month=8&year=2026
```

Example:

```http
GET /api/payroll/employee/4/period?month=8&year=2026
```

---

# 📄 Payslip APIs

## View Payslip

```http
GET /api/payroll/{payrollId}/payslip/view
```

Example:

```text
http://localhost:8080/api/payroll/5/payslip/view
```

The API returns the generated PDF.

---

## Regenerate Payslip

```http
POST /api/payroll/{payrollId}/payslip/regenerate
```

Example:

```http
POST /api/payroll/5/payslip/regenerate
```

---

# 📧 Send Payslip Email

```http
POST /api/payroll/{payrollId}/payslip/email
```

Example:

```http
POST /api/payroll/5/payslip/email
```

The system generates/sends the payslip to the employee email and stores the email delivery information.

---

# 🗑️ Delete Payroll

```http
DELETE /api/payroll/{payrollId}
```

Example:

```http
DELETE /api/payroll/5
```

The payroll deletion process also handles associated payslip email records through the payroll service.

---

# ⏰ Scheduled Payroll

The application supports scheduled payroll processing.

Manual trigger:

```http
POST /api/payroll/schedule/run
```

Example:

```http
POST /api/payroll/schedule/run
```

Response:

```text
Scheduled payroll process started successfully
```

---

# 📊 Payroll Calculation Flow

The payroll generation process follows this general flow:

```text
Employee
    │
    ▼
Employee Salary Assignment
    │
    ▼
Salary Structure
    │
    ├── Basic Salary
    ├── HRA
    └── Special Allowance
    │
    ▼
Attendance / Leave Information
    │
    ▼
Gross Salary
    │
    ▼
Deductions
    │
    ├── PF
    ├── ESI
    └── Professional Tax
    │
    ▼
Total Deductions
    │
    ▼
Net Salary
    │
    ▼
Payroll
    │
    ├── Payslip PDF
    └── Email
```

---

# 🏖️ Leave Approval Flow

```text
Employee
   │
   ▼
Apply Leave
   │
   ▼
PENDING
   │
   ├───────────────┐
   ▼               ▼
APPROVE          REJECT
   │               │
   ▼               ▼
Check Balance    Status = REJECTED
   │               │
   ▼               ▼
Deduct Balance   Send Email
   │
   ▼
Status = APPROVED
   │
   ▼
Send Email
```

---

# 📧 Leave Email Flow

When a leave is approved:

```text
Admin approves leave
        ↓
Validate leave
        ↓
Check leave balance
        ↓
Deduct balance
        ↓
Set APPROVED
        ↓
Send email
        ↓
Employee receives notification
```

When a leave is rejected:

```text
Admin rejects leave
        ↓
Set REJECTED
        ↓
Send email
        ↓
Employee receives notification
```

---

# 📁 Payslip Storage

Generated payslips are stored in:

```text
payslips/
```

Example:

```text
payslips/
├── Payslip_EMP001_8_2026.pdf
├── Payslip_EMP002_8_2026.pdf
└── Payslip_EMP003_8_2026.pdf
```

The generated file path is stored in the payroll record.

---

# 🧪 Testing With Postman

Start the backend:

```bash
mvn spring-boot:run
```

Start the frontend:

```bash
npm run dev
```

Use:

```text
http://localhost:8080
```

as the backend base URL.

Recommended testing order:

### 1. Login

```http
POST /api/auth/login
```

### 2. Create employee

```http
POST /api/employees
```

### 3. Create salary structure

```http
POST /api/salary-structures
```

### 4. Assign salary

```http
POST /api/employee-salary/{employeeId}/{salaryStructureId}?effectiveFrom=2026-08-14
```

### 5. Configure leave balance

Create the employee's yearly leave balance.

### 6. Create attendance

```http
POST /api/attendance
```

### 7. Apply leave

```http
POST /api/leaves/apply/{employeeId}
```

### 8. Approve/reject leave

```http
PUT /api/leaves/{leaveId}/approve
```

or:

```http
PUT /api/leaves/{leaveId}/reject
```

### 9. Generate payroll

```http
POST /api/payroll/generate/{employeeId}?month=8&year=2026
```

### 10. View payslip

```http
GET /api/payroll/{payrollId}/payslip/view
```

### 11. Send payslip

```http
POST /api/payroll/{payrollId}/payslip/email
```

---

# ⚠️ Common Issues

## 1. Login not working

Make sure the request uses:

```json
{
  "email": "rahul@example.com",
  "password": "123456"
}
```

The property must be:

```text
password
```

not:

```text
pasword
```

Also verify that the employee exists in the database and that the stored password format matches the authentication implementation.

---

## 2. Leave balance returns HTTP 500

Check whether the employee has a `leave_balances` record for the current year.

Example:

```sql
SELECT *
FROM leave_balances
WHERE employee_id = 4
AND year = 2026;
```

If no record exists, configure the employee's leave balance.

---

## 3. Employee salary assignment not found

Check:

```sql
SELECT *
FROM employee_salary;
```

Then use an existing `id`.

For example, if the table contains:

```text
id | employee_id | salary_structure_id
2  | 1           | 1
3  | 1           | 1
4  | 3           | 1
5  | 1           | 1
6  | 3           | 2
```

then:

```http
GET /api/employee-salary/6
```

will request assignment ID `6`.

Do not use an employee ID where an employee-salary assignment ID is expected.

---

## 4. MySQL connection error

Check:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hrms
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

Make sure MySQL is running.

---

## 5. CORS error

The frontend runs on:

```text
http://localhost:5173
```

The backend should allow this origin.

Example:

```java
@CrossOrigin(origins = "http://localhost:5173")
```

---

## 6. Port already in use

If port `8080` is already occupied, change:

```properties
server.port=8080
```

to another port, for example:

```properties
server.port=8081
```

Then update the frontend API URL accordingly.

---

# 🔒 Environment Variables

For production, sensitive values should not be committed to GitHub.

Example:

```properties
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}

jwt.secret=${JWT_SECRET}
```

### Windows

```cmd
set DB_USERNAME=root
set DB_PASSWORD=your_password
set MAIL_USERNAME=your_email@gmail.com
set MAIL_PASSWORD=your_app_password
set JWT_SECRET=your_jwt_secret
```

### Linux/macOS

```bash
export DB_USERNAME=root
export DB_PASSWORD=your_password
export MAIL_USERNAME=your_email@gmail.com
export MAIL_PASSWORD=your_app_password
export JWT_SECRET=your_jwt_secret
```

---

# 🔐 Security Recommendations

Before deploying to production:

* Do not commit database passwords.
* Do not commit SMTP passwords.
* Do not commit JWT secrets.
* Use environment variables.
* Use HTTPS.
* Hash passwords using BCrypt.
* Validate all API input.
* Add proper exception handling.
* Configure production CORS.
* Restrict admin-only endpoints.
* Add database indexes where required.
* Implement audit logging for sensitive operations.

---

# 🚀 Production Deployment

Recommended production architecture:

```text
                 ┌─────────────────┐
                 │   React Frontend│
                 └────────┬────────┘
                          │
                          │ HTTPS
                          ▼
                 ┌─────────────────┐
                 │ Spring Boot API │
                 └────────┬────────┘
                          │
             ┌────────────┴────────────┐
             │                         │
             ▼                         ▼
      ┌──────────────┐         ┌──────────────┐
      │    MySQL     │         │ SMTP Server  │
      └──────────────┘         └──────────────┘
```

The application can be deployed using:

* Docker
* AWS
* Azure
* Railway
* Render
* VPS
* Other cloud platforms

---

# 🐳 Docker

A Docker-based deployment can contain:

```text
Frontend Container
       │
       ▼
Backend Container
       │
       ▼
MySQL Container
```

Environment variables should be supplied through Docker rather than hard-coded in the application.

Example:

```bash
docker compose up --build
```

---

# 🧾 Example Employee

```json
{
  "employeeCode": "EMP001",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "department": "IT",
  "designation": "Software Developer",
  "password": "123456",
  "role": "EMPLOYEE"
}
```

For production, passwords should never be stored as plain text.

---

# 🧾 Example Salary Structure

```json
{
  "name": "Software Developer Grade A",
  "basicSalary": 30000,
  "hra": 12000,
  "specialAllowance": 8000,
  "effectiveFrom": "2026-01-01",
  "effectiveTo": null
}
```

---

# 🧾 Example Leave Application

```json
{
  "leaveType": "CL",
  "startDate": "2026-08-15",
  "endDate": "2026-08-16",
  "reason": "Personal work"
}
```

The backend automatically calculates:

```text
Number of days = 2
Status = PENDING
```

---

# 📌 API Summary

| Module            | Method | Endpoint                                                |
| ----------------- | ------ | ------------------------------------------------------- |
| Employee          | GET    | `/api/employees`                                        |
| Employee          | GET    | `/api/employees/{id}`                                   |
| Employee          | POST   | `/api/employees`                                        |
| Employee          | PUT    | `/api/employees/{id}`                                   |
| Employee          | DELETE | `/api/employees/{id}`                                   |
| Salary            | GET    | `/api/salary-structures`                                |
| Salary            | POST   | `/api/salary-structures`                                |
| Employee Salary   | GET    | `/api/employee-salary`                                  |
| Employee Salary   | GET    | `/api/employee-salary/{id}`                             |
| Employee Salary   | POST   | `/api/employee-salary/{employeeId}/{salaryStructureId}` |
| Leave             | GET    | `/api/leaves`                                           |
| Leave             | POST   | `/api/leaves/apply/{employeeId}`                        |
| Leave             | GET    | `/api/leaves/employee/{employeeId}`                     |
| Leave             | PUT    | `/api/leaves/{leaveId}/approve`                         |
| Leave             | PUT    | `/api/leaves/{leaveId}/reject`                          |
| Leave Balance     | GET    | `/api/leaves/employee/{employeeId}/balance`             |
| Payroll           | GET    | `/api/payroll`                                          |
| Payroll           | GET    | `/api/payroll/{payrollId}`                              |
| Payroll           | POST   | `/api/payroll/generate/{employeeId}`                    |
| Payroll           | GET    | `/api/payroll/employee/{employeeId}`                    |
| Payroll           | GET    | `/api/payroll/employee/{employeeId}/period`             |
| Payslip           | GET    | `/api/payroll/{payrollId}/payslip/view`                 |
| Payslip           | POST   | `/api/payroll/{payrollId}/payslip/regenerate`           |
| Payslip Email     | POST   | `/api/payroll/{payrollId}/payslip/email`                |
| Payroll           | DELETE | `/api/payroll/{payrollId}`                              |
| Scheduled Payroll | POST   | `/api/payroll/schedule/run`                              |

---

# 🧑‍💻 Development Workflow

```text
1. Start MySQL
       ↓
2. Create hrms database
       ↓
3. Configure application.properties
       ↓
4. Start Spring Boot backend
       ↓
5. Start React frontend
       ↓
6. Login
       ↓
7. Create employees
       ↓
8. Configure salary structures
       ↓
9. Assign salary
       ↓
10. Configure leave balances
       ↓
11. Manage attendance
       ↓
12. Apply / approve / reject leaves
       ↓
13. Generate payroll
       ↓
14. Generate payslip
       ↓
15. Email payslip
```

---

# 📈 Future Improvements

Possible future enhancements:

* Employee dashboard
* Admin dashboard
* HR dashboard
* Attendance check-in/check-out
* Monthly attendance reports
* Payroll reports
* Excel export
* PDF reports
* Department-wise payroll
* Employee self-service portal
* Leave calendar
* Holiday management
* Payroll approval workflow
* Audit logs
* Password reset
* Refresh tokens
* Two-factor authentication
* Docker Compose deployment
* Cloud deployment
* Automated database backups

---

# 🤝 Contributing

Contributions are welcome.

### 1. Fork the repository

```bash
git clone https://github.com/YOUR_USERNAME/hrms-payroll.git
```

### 2. Create a branch

```bash
git checkout -b feature/new-feature
```

### 3. Make your changes

### 4. Commit

```bash
git add .
git commit -m "Add new feature"
```

### 5. Push

```bash
git push origin feature/new-feature
```

### 6. Create a Pull Request

---

# 📄 License

This project is intended for educational and development purposes.

Add an appropriate open-source license such as **MIT License** if you want others to freely use and modify the project.

---

# 👨‍💻 Author

**Vedant Verma**

Java / Spring Boot / Full-Stack Developer

### Technologies

```text
Java
Spring Boot
Spring Security
JWT
Hibernate
JPA
MySQL
React
JavaScript
REST APIs
Git
Docker
```

---

# ⭐ If You Like This Project

If this project helped you or you found it useful, consider giving the repository a ⭐ on GitHub.

---

## Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/hrms-payroll.git

# Backend
cd backend
mvn spring-boot:run

# Frontend
cd ../frontend
npm install
npm run dev
```

Then open:

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:8080
```

**HRMS Payroll & Leave Management System — Employee Management • Leave Management • Attendance • Payroll • Payslips • Email Notifications • JWT Security**
