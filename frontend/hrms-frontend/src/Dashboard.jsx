import { useState } from "react";

import Employee from "./Employee";
import SalaryStructure from "./SalaryStructure";
import EmployeeSalary from "./EmployeeSalary";
import Attendance from "./Attendance";
import Payroll from "./Payroll";
import LeaveApplication from "./LeaveApplication";
import PayslipEmailLogs from "./PayslipEmailLogs";
import LeaveApproval from "./LeaveApproval";
import "./Dashboard.css";

function Dashboard({ onLogout }) {
  const [page, setPage] = useState("employees");

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role?.toUpperCase();

  const isAdmin = role === "ADMIN";
  const isHR = role === "HR";
  const isEmployee = role === "EMPLOYEE";

  const canManageEmployees = isAdmin || isHR;
  const canManageSalary = isAdmin || isHR;
  const canManagePayroll = isAdmin || isHR;
  const canAccessAttendance = isAdmin || isHR || isEmployee;
  const canAccessLeave = isAdmin || isHR || isEmployee;
  const canApproveLeave = isAdmin || isHR;

  const navItems = [
    { key: "employees", label: "Employees", show: canManageEmployees },
    { key: "salary", label: "Salary Structures", show: canManageSalary },
    { key: "employeeSalary", label: "Employee Salary", show: canManageSalary },
    { key: "payroll", label: "Payroll", show: canManagePayroll },
    { key: "attendance", label: "Attendance", show: canAccessAttendance },
    { key: "leaveApplication", label: "Leave Management", show: canAccessLeave },
    { key: "payslipEmails", label: "Payslip Emails", show: canManagePayroll },
    { key: "leaveApproval", label: "Leave Approval", show: canApproveLeave },
  ];

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">HR</div>
          <div>
            <h1>HRMS</h1>
            <span>Human Resource Management System</span>
          </div>
        </div>

        <div className="header-user">
          <div className="user-avatar">{initials || "?"}</div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{role}</span>
          </div>
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <nav className="navbar">
        {navItems
          .filter((item) => item.show)
          .map((item) => (
            <button
              key={item.key}
              className={page === item.key ? "nav-active" : ""}
              onClick={() => setPage(item.key)}
            >
              {item.label}
            </button>
          ))}
      </nav>

      <main className="container">
        {page === "employees" && canManageEmployees && <Employee />}
        {page === "salary" && canManageSalary && <SalaryStructure />}
        {page === "employeeSalary" && canManageSalary && <EmployeeSalary />}
        {page === "payroll" && canManagePayroll && <Payroll />}
        {page === "attendance" && canAccessAttendance && <Attendance />}
        {page === "leaveApplication" && canAccessLeave && <LeaveApplication />}
        {page === "payslipEmails" && canManagePayroll && <PayslipEmailLogs />}
        {page === "leaveApproval" && canApproveLeave && <LeaveApproval />}
      </main>
    </div>
  );
}

export default Dashboard;
