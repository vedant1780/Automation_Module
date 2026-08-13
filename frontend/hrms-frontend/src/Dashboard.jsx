
import { useState } from "react";

import Employee from "./Employee";
import SalaryStructure from "./SalaryStructure";
import EmployeeSalary from "./EmployeeSalary";
import Attendance from "./Attendance";
import Payroll from "./Payroll";
import LeaveApplication from "./LeaveApplication";
import PayslipEmailLogs from "./PayslipEmailLogs";
import LeaveApproval from "./LeaveApproval";

function Dashboard({ onLogout }) {

  const [page, setPage] = useState("employees");

  // Get logged-in user
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const role = user?.role?.toUpperCase();


  // =====================================================
  // ROLE CHECKS
  // =====================================================

  const isAdmin = role === "ADMIN";
  const isHR = role === "HR";
  const isEmployee = role === "EMPLOYEE";

  const canManageEmployees =
    isAdmin || isHR;

  const canManageSalary =
    isAdmin || isHR;

  const canManagePayroll =
    isAdmin || isHR;

  const canAccessAttendance =
    isAdmin || isHR || isEmployee;

  const canAccessLeave =
    isAdmin || isHR || isEmployee;


  return (

    <div className="app">

      {/* ================= HEADER ================= */}

      <header className="header">

        <div>

          <h1>
            HRMS
          </h1>

          <span>
            Human Resource Management System
          </span>

        </div>


        {/* LOGGED-IN USER */}

        <div>

          <span>
            {user?.name} ({role})
          </span>

          <button
            onClick={onLogout}
            className="logout-button"
          >
            Logout
          </button>

        </div>

      </header>


      {/* ================= NAVIGATION ================= */}

      <nav className="navbar">


        {/* EMPLOYEES */}

        {canManageEmployees && (

          <button
            className={
              page === "employees"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setPage("employees")
            }
          >
            Employees
          </button>

        )}


        {/* SALARY STRUCTURES */}

        {canManageSalary && (

          <button
            className={
              page === "salary"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setPage("salary")
            }
          >
            Salary Structures
          </button>

        )}


        {/* EMPLOYEE SALARY */}

        {canManageSalary && (

          <button
            className={
              page === "employeeSalary"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setPage("employeeSalary")
            }
          >
            Employee Salary
          </button>

        )}


        {/* PAYROLL */}

        {canManagePayroll && (

          <button
            className={
              page === "payroll"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setPage("payroll")
            }
          >
            Payroll
          </button>

        )}


        {/* ATTENDANCE */}

        {canAccessAttendance && (

          <button
            className={
              page === "attendance"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setPage("attendance")
            }
          >
            Attendance
          </button>

        )}


        {/* LEAVE */}

        {canAccessLeave && (

          <button
            className={
              page === "leaveApplication"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setPage("leaveApplication")
            }
          >
            Leave Management
          </button>

        )}


        {/* PAYSLIP EMAILS */}

        {canManagePayroll && (

          <button
            className={
              page === "payslipEmails"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setPage("payslipEmails")
            }
          >
            Payslip Emails
          </button>

        )}


        {/* LEAVE APPROVAL */}

        {(isAdmin || isHR) && (

          <button
            className={
              page === "leaveApproval"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setPage("leaveApproval")
            }
          >
            Leave Approval
          </button>

        )}

      </nav>


      {/* ================= CONTENT ================= */}

      <main className="container">


        {page === "employees" &&
          canManageEmployees && (
            <Employee />
          )}


        {page === "salary" &&
          canManageSalary && (
            <SalaryStructure />
          )}


        {page === "employeeSalary" &&
          canManageSalary && (
            <EmployeeSalary />
          )}


        {page === "payroll" &&
          canManagePayroll && (
            <Payroll />
          )}


        {page === "attendance" &&
          canAccessAttendance && (
            <Attendance />
          )}


        {page === "leaveApplication" &&
          canAccessLeave && (
            <LeaveApplication />
          )}


        {page === "payslipEmails" &&
          canManagePayroll && (
            <PayslipEmailLogs />
          )}


        {page === "leaveApproval" &&
          (isAdmin || isHR) && (
            <LeaveApproval />
          )}

      </main>

    </div>

  );
}

export default Dashboard;
