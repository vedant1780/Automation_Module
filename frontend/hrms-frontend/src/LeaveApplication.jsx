
import React, { useEffect, useState } from "react";
import api from "./axiosConfig";
import "./LeaveApplication.css";

const API_URL = "http://localhost:8080/api/leaves";
const EMPLOYEE_API_URL = "http://localhost:8080/api/employees";

const LEAVE_TYPES = [
  { value: "CL", label: "Casual Leave (CL)" },
  { value: "SL", label: "Sick Leave (SL)" },
  { value: "EL", label: "Earned Leave (EL)" },
];

function LeaveApplication() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");

  const [userRole, setUserRole] = useState("");

  const [leaveType, setLeaveType] = useState("CL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);

  const [loading, setLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
  };

  const getUserRole = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        console.warn("No user information found");
        return "";
      }

      const user = JSON.parse(storedUser);

      const role = user?.role?.toUpperCase() || "";

      console.log("Logged-in role:", role);

      setUserRole(role);

      return role;
    } catch (error) {
      console.error("User data error:", error);
      return "";
    }
  };

  const getLoggedInEmployee = () => {
    try {
      const storedEmployee = localStorage.getItem("employee");

      if (!storedEmployee) {
        console.warn("No employee information found");
        return null;
      }

      const employee = JSON.parse(storedEmployee);

      if (!employee?.id) {
        console.warn("Employee information does not contain ID");
        return null;
      }

      console.log("Logged-in employee:", employee);

      return employee;
    } catch (error) {
      console.error("Employee data error:", error);

      localStorage.removeItem("employee");

      return null;
    }
  };

  const getEmployees = async () => {
    try {
      setEmployeeLoading(true);

      const response = await api.get(EMPLOYEE_API_URL);

      const employeeList = response.data || [];

      setEmployees(employeeList);

      const role = getUserRole();
      const loggedInEmployee = getLoggedInEmployee();

      if (role === "EMPLOYEE") {
        if (!loggedInEmployee?.id) {
          showMessage(
            "Employee information not found. Please login again.",
            "error"
          );
          return;
        }

        const employeeExists = employeeList.some(
          (employee) =>
            String(employee.id) === String(loggedInEmployee.id)
        );

        if (employeeExists) {
          setEmployeeId(String(loggedInEmployee.id));

          console.log(
            "Automatically selected employee:",
            loggedInEmployee.id
          );
        } else {
          showMessage(
            "Logged-in employee was not found.",
            "error"
          );
        }

        return;
      }

      if (role === "ADMIN" || role === "HR") {
        console.log("Admin/HR: employee selection enabled");

        // Do not automatically select an employee.
        setEmployeeId("");

        return;
      }

      showMessage(
        "Unable to determine user role. Please login again.",
        "error"
      );
    } catch (error) {
      console.error("Employee loading error:", error);

      showMessage(
        error.response?.data?.message ||
          error.response?.data ||
          "Unable to fetch employee list",
        "error"
      );
    } finally {
      setEmployeeLoading(false);
    }
  };

  const getLeaveBalance = async (id = employeeId) => {
    if (!id) {
      setLeaveBalance(null);
      return;
    }

    try {
      setBalanceLoading(true);

      const response = await api.get(
        `${API_URL}/employee/${id}/balance`
      );

      setLeaveBalance(response.data);
    } catch (error) {
      console.error("Leave balance error:", error);

      setLeaveBalance(null);

      showMessage(
        error.response?.data?.message ||
          error.response?.data ||
          "Unable to fetch leave balance",
        "error"
      );
    } finally {
      setBalanceLoading(false);
    }
  };

  const getEmployeeLeaves = async (id = employeeId) => {
    if (!id) {
      setLeaves([]);
      return;
    }

    try {
      setHistoryLoading(true);

      const response = await api.get(
        `${API_URL}/employee/${id}`
      );

      setLeaves(response.data || []);
    } catch (error) {
      console.error("Leave history error:", error);

      setLeaves([]);

      showMessage(
        error.response?.data?.message ||
          error.response?.data ||
          "Unable to fetch leave applications",
        "error"
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleEmployeeChange = (e) => {
    const id = e.target.value;

    setEmployeeId(id);

    setMessage("");
    setLeaveBalance(null);
    setLeaves([]);
  };

  const calculateDays = () => {
    if (!startDate || !endDate) {
      return 0;
    }

    const startParts = startDate.split("-").map(Number);
    const endParts = endDate.split("-").map(Number);

    if (
      startParts.length !== 3 ||
      endParts.length !== 3
    ) {
      return 0;
    }

    const start = Date.UTC(
      startParts[0],
      startParts[1] - 1,
      startParts[2]
    );

    const end = Date.UTC(
      endParts[0],
      endParts[1] - 1,
      endParts[2]
    );

    const difference =
      Math.floor(
        (end - start) / (1000 * 60 * 60 * 24)
      ) + 1;

    return difference > 0 ? difference : 0;
  };

  const getSelectedEmployee = () => {
    if (!employeeId) {
      return null;
    }

    return (
      employees.find(
        (employee) =>
          String(employee.id) === String(employeeId)
      ) || null
    );
  };

  const getSelectedLeaveBalance = () => {
    if (!leaveBalance) {
      return null;
    }

    switch (leaveType) {
      case "CL":
        return Number(
          leaveBalance.casualLeaveTotal || 0
        );

      case "SL":
        return Number(
          leaveBalance.sickLeaveTotal || 0
        );

      case "EL":
        return Number(
          leaveBalance.earnedLeaveTotal || 0
        );

      default:
        return 0;
    }
  };

  const applyLeave = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!employeeId) {
      showMessage(
        "Please select an employee",
        "error"
      );
      return;
    }

    if (!startDate || !endDate) {
      showMessage(
        "Please select start and end date",
        "error"
      );
      return;
    }

    if (endDate < startDate) {
      showMessage(
        "End date cannot be before start date",
        "error"
      );
      return;
    }

    const numberOfDays = calculateDays();

    if (numberOfDays <= 0) {
      showMessage(
        "Invalid number of leave days",
        "error"
      );
      return;
    }

    if (!leaveBalance) {
      showMessage(
        "Leave balance is not available",
        "error"
      );
      return;
    }

    const remainingBalance =
      getSelectedLeaveBalance();

    if (remainingBalance === null) {
      showMessage(
        "Unable to determine leave balance",
        "error"
      );
      return;
    }

    if (numberOfDays > remainingBalance) {
      showMessage(
        `Insufficient leave balance. Available: ${remainingBalance} day(s).`,
        "error"
      );
      return;
    }

    try {
      setLoading(true);

      const leaveData = {
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
      };

      await api.post(
        `${API_URL}/apply/${employeeId}`,
        leaveData
      );

      showMessage(
        "Leave applied successfully!",
        "success"
      );

      setLeaveType("CL");
      setStartDate("");
      setEndDate("");
      setReason("");

      await getEmployeeLeaves(employeeId);
      await getLeaveBalance(employeeId);
    } catch (error) {
      console.error("Apply leave error:", error);

      showMessage(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to apply leave",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEmployees();
  }, []);

  useEffect(() => {
    if (!employeeId) {
      setLeaves([]);
      setLeaveBalance(null);
      return;
    }

    getEmployeeLeaves(employeeId);
    getLeaveBalance(employeeId);
  }, [employeeId]);

  const selectedEmployee = getSelectedEmployee();

  const selectedBalance =
    getSelectedLeaveBalance();

  const numberOfDays = calculateDays();

  const balanceCards = leaveBalance
    ? [
        {
          key: "CL",
          label: "Casual Leave",
          remaining:
            leaveBalance.casualLeaveTotal,
          total:
            leaveBalance.casualLeaveTotal,
          used:
            leaveBalance.casualLeaveUsed,
        },
        {
          key: "SL",
          label: "Sick Leave",
          remaining:
            leaveBalance.sickLeaveTotal,
          total:
            leaveBalance.sickLeaveTotal,
          used:
            leaveBalance.sickLeaveUsed,
        },
        {
          key: "EL",
          label: "Earned Leave",
          remaining:
            leaveBalance.earnedLeaveTotal,
          total:
            leaveBalance.earnedLeaveTotal,
          used:
            leaveBalance.earnedLeaveUsed,
        },
      ]
    : [];

  const leaveTypeLabel =
    leaveType === "CL"
      ? "Casual Leave"
      : leaveType === "SL"
      ? "Sick Leave"
      : "Earned Leave";

  const isEmployee = userRole === "EMPLOYEE";

  const isAdminOrHR =
    userRole === "ADMIN" ||
    userRole === "HR";

  return (
    <div className="leave-page">

      <div className="card">

        <div className="title-section">

          <h2>
            Leave Application
          </h2>

          <p>
            Apply for employee leave
          </p>

        </div>

        {message && (
          <div
            className={`banner banner-${messageType}`}
          >
            {message}
          </div>
        )}

        <form onSubmit={applyLeave}>

          <div className="field">

            <label>
              Employee
            </label>

            <select
              value={employeeId}
              onChange={handleEmployeeChange}
              disabled={
                employeeLoading ||
                isEmployee
              }
              required
            >

              <option value="">
                {employeeLoading
                  ? "Loading employees..."
                  : isAdminOrHR
                  ? "Select employee"
                  : "Employee not found"}
              </option>

              {employees.map((employee) => (

                <option
                  key={employee.id}
                  value={employee.id}
                >
                  {employee.employeeCode
                    ? `${employee.employeeCode} - ${employee.name}`
                    : `${employee.id} - ${employee.name}`}
                </option>

              ))}

            </select>

          </div>

          {selectedEmployee && (

            <div className="employee-info">

              <div>

                <span className="info-label">
                  Employee
                </span>

                <strong>
                  {selectedEmployee.name}
                </strong>

              </div>

              <div>

                <span className="info-label">
                  Department
                </span>

                <strong>
                  {selectedEmployee.department || "-"}
                </strong>

              </div>

              <div>

                <span className="info-label">
                  Designation
                </span>

                <strong>
                  {selectedEmployee.designation || "-"}
                </strong>

              </div>

              <div>

                <span className="info-label">
                  Email
                </span>

                <strong>
                  {selectedEmployee.email || "-"}
                </strong>

              </div>

            </div>

          )}

          {employeeId && (

            <div className="balance-section">

              <div className="balance-header">

                <div>

                  <h3>
                    Leave Balance
                  </h3>

                  <p>
                    Available leave for selected employee
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    getLeaveBalance(employeeId)
                  }
                  className="ghost-button"
                >
                  Refresh
                </button>

              </div>

              {balanceLoading ? (

                <div className="muted-text">
                  Loading leave balance...
                </div>

              ) : leaveBalance ? (

                <div className="balance-grid">

                  {balanceCards.map((card) => (

                    <div
                      key={card.key}
                      className="balance-card"
                    >

                      <span className="balance-type">
                        {card.label}
                      </span>

                      <strong className="balance-remaining">
                        {card.remaining}
                      </strong>

                      <span className="balance-label">
                        days remaining
                      </span>

                      <div className="balance-details">

                        Total: {card.total}

                        <br />

                        Used: {card.used}

                      </div>

                    </div>

                  ))}

                </div>

              ) : (

                <div className="muted-text">
                  Leave balance not available.
                </div>

              )}

            </div>

          )}

          <div className="row">

            <div className="field">

              <label>
                Leave Type
              </label>

              <select
                value={leaveType}
                onChange={(e) =>
                  setLeaveType(e.target.value)
                }
              >

                {LEAVE_TYPES.map((type) => (

                  <option
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </option>

                ))}

              </select>

            </div>

            <div className="field">

              <label>
                Number of Days
              </label>

              <input
                type="text"
                value={numberOfDays}
                readOnly
                className="readonly-input"
              />

            </div>

          </div>

          {employeeId && leaveBalance && (

            <div className="selected-balance">

              <span>
                Available {leaveTypeLabel}:
              </span>

              <strong>
                {selectedBalance} day(s)
              </strong>

            </div>

          )}

          <div className="row">

            <div className="field">

              <label>
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => {

                  setStartDate(
                    e.target.value
                  );

                  if (
                    endDate &&
                    e.target.value > endDate
                  ) {
                    setEndDate("");
                  }

                }}
                required
              />

            </div>

            <div className="field">

              <label>
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                min={
                  startDate || undefined
                }
                onChange={(e) =>
                  setEndDate(
                    e.target.value
                  )
                }
                required
              />

            </div>

          </div>

          <div className="field">

            <label>
              Reason
            </label>

            <textarea
              value={reason}
              onChange={(e) =>
                setReason(
                  e.target.value
                )
              }
              placeholder="Enter reason for leave"
              rows="4"
            />

          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={
              loading ||
              !employeeId ||
              !leaveBalance
            }
          >
            {loading
              ? "Applying..."
              : "Apply Leave"}
          </button>

        </form>

      </div>

      <div className="card">

        <div className="history-header">

          <div>

            <h2>
              Leave History
            </h2>

            <p>
              Previous leave applications
            </p>

          </div>

          <button
            type="button"
            onClick={() => {
              getEmployeeLeaves(employeeId);
              getLeaveBalance(employeeId);
            }}
            className="ghost-button"
            disabled={!employeeId}
          >
            Refresh
          </button>

        </div>

        {!employeeId ? (

          <div className="empty-state">

            {isAdminOrHR
              ? "Select an employee to view leave history"
              : "Loading logged-in employee..."}

          </div>

        ) : historyLoading ? (

          <div className="empty-state">
            Loading leave history...
          </div>

        ) : leaves.length === 0 ? (

          <div className="empty-state">
            No leave applications found for this employee.
          </div>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                {leaves.map((leave) => (

                  <tr key={leave.id}>

                    <td>
                      {leave.id}
                    </td>

                    <td>
                      {leave.leaveType}
                    </td>

                    <td>
                      {leave.startDate}
                    </td>

                    <td>
                      {leave.endDate}
                    </td>

                    <td>
                      {leave.numberOfDays}
                    </td>

                    <td>
                      {leave.reason || "-"}
                    </td>

                    <td>

                      <span
                        className={`status-badge status-${leave.status?.toLowerCase()}`}
                      >
                        {leave.status}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default LeaveApplication;
