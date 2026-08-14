
import { useEffect, useState } from "react";
import api from "./axiosConfig";
import "./Attendance.css";

const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "HALF_DAY", label: "Half Day" },
];

function StatusBadge({ status }) {
  const map = {
    PRESENT: {
      label: "Present",
      className: "badge-present",
    },
    ABSENT: {
      label: "Absent",
      className: "badge-absent",
    },
    HALF_DAY: {
      label: "Half Day",
      className: "badge-half",
    },
  };

  const entry = map[status] || {
    label: status,
    className: "",
  };

  return (
    <span className={`status-badge ${entry.className}`}>
      {entry.label}
    </span>
  );
}

function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);

  const [employeeId, setEmployeeId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [status, setStatus] = useState("");

  const [role, setRole] = useState("");

  const [loading, setLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // INITIALIZE LOGGED-IN USER
  // =========================================================

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      setError("");

      // -----------------------------------------------------
      // Get logged-in user
      // -----------------------------------------------------

      const storedUser = localStorage.getItem("user");
      const storedEmployee = localStorage.getItem("employee");

      if (!storedUser) {
        setError("User information not found. Please login again.");
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      /*
       * Your login API currently returns data like:
       *
       * {
       *   id: 10,
       *   name: "Souvik Mukherjee",
       *   email: "...",
       *   role: "EMPLOYEE",
       *   employeeCode: "EMP006",
       *   token: "..."
       * }
       *
       * Therefore employee information may be directly
       * inside response.data.
       */

      let loggedInEmployee = null;

      // First try employee stored separately
      if (storedEmployee) {
        try {
          const parsedEmployee = JSON.parse(storedEmployee);

          if (parsedEmployee?.id) {
            loggedInEmployee = parsedEmployee;
          }
        } catch (err) {
          console.warn("Invalid employee data in localStorage");
        }
      }

      // If employee was not stored separately,
      // use the login response itself.
      if (!loggedInEmployee && parsedUser?.id) {
        loggedInEmployee = {
          id: parsedUser.id,
          employeeCode: parsedUser.employeeCode,
          name: parsedUser.name,
          email: parsedUser.email,
          department: parsedUser.department,
          designation: parsedUser.designation,
          role: parsedUser.role,
        };
      }

      const loggedInRole = (
        parsedUser?.role ||
        loggedInEmployee?.role ||
        ""
      ).toUpperCase();

      setRole(loggedInRole);

      // =====================================================
      // ADMIN / HR
      // =====================================================

      if (
        loggedInRole === "ADMIN" ||
        loggedInRole === "HR"
      ) {
        await fetchEmployees();
        return;
      }

      // =====================================================
      // EMPLOYEE
      // =====================================================

      if (loggedInRole === "EMPLOYEE") {
        if (!loggedInEmployee?.id) {
          setError(
            "Employee information not found. Please login again."
          );
          return;
        }

        setEmployee(loggedInEmployee);
        setEmployeeId(String(loggedInEmployee.id));

        await fetchAttendance(loggedInEmployee.id);

        return;
      }

      setError("Invalid user role.");

    } catch (err) {
      console.error("User initialization error:", err);

      setError(
        "Unable to load user information. Please login again."
      );
    }
  };

  // =========================================================
  // GET ALL EMPLOYEES
  // ADMIN / HR ONLY
  // =========================================================

  const fetchEmployees = async () => {
    try {
      setEmployeeLoading(true);
      setError("");

      const response = await api.get(
        "http://localhost:8080/api/employees"
      );

      setEmployees(response.data || []);

    } catch (err) {
      console.error("Employee loading error:", err);

      setError(
        err.response?.data ||
        "Unable to load employees"
      );

      setEmployees([]);

    } finally {
      setEmployeeLoading(false);
    }
  };

  // =========================================================
  // GET ATTENDANCE
  // =========================================================

  const fetchAttendance = async (id) => {
    if (!id) {
      setAttendance([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `http://localhost:8080/api/attendance/${id}`
      );

      setAttendance(response.data || []);

    } catch (err) {
      console.error("Attendance loading error:", err);

      setError(
        err.response?.data ||
        "Unable to load attendance"
      );

      setAttendance([]);

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // ADMIN / HR EMPLOYEE CHANGE
  // =========================================================

  const handleEmployeeChange = async (e) => {
    const id = e.target.value;

    setEmployeeId(id);
    setMessage("");
    setError("");
    setAttendance([]);

    if (!id) {
      setEmployee(null);
      return;
    }

    const selectedEmployee = employees.find(
      (emp) => String(emp.id) === String(id)
    );

    if (!selectedEmployee) {
      setError("Employee not found");
      return;
    }

    setEmployee(selectedEmployee);

    await fetchAttendance(id);
  };

  // =========================================================
  // MARK ATTENDANCE
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!employeeId) {
      setError("Please select an employee");
      return;
    }

    if (!attendanceDate) {
      setError("Please select attendance date");
      return;
    }

    if (!status) {
      setError("Please select attendance status");
      return;
    }

    try {
      setLoading(true);

      await api.post(
        `http://localhost:8080/api/attendance/${employeeId}`,
        {
          attendanceDate,
          status,
        }
      );

      setMessage(
        `Attendance marked successfully for ${employee?.name || "employee"}!`
      );

      setAttendanceDate("");
      setStatus("");

      await fetchAttendance(employeeId);

    } catch (err) {
      console.error("Mark attendance error:", err);

      setError(
        err.response?.data ||
        "Failed to mark attendance"
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="attendance">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="page-header">
        <div>
          <h2>Attendance</h2>

          <p>
            {role === "ADMIN" || role === "HR"
              ? "Manage employee attendance"
              : "Manage your attendance"}
          </p>
        </div>
      </div>

      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {message && (
        <div className="success">
          {message}
        </div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {/* =====================================================
          ADMIN / HR EMPLOYEE SELECTION
      ===================================================== */}

      {(role === "ADMIN" || role === "HR") && (
        <div className="card">

          <h3>Select Employee</h3>

          <div className="field">

            <label>
              Employee
            </label>

            <select
              value={employeeId}
              onChange={handleEmployeeChange}
              disabled={employeeLoading}
            >

              <option value="">
                {employeeLoading
                  ? "Loading employees..."
                  : "Select employee"}
              </option>

              {employees.map((emp) => (
                <option
                  key={emp.id}
                  value={emp.id}
                >
                  {emp.name} - {emp.employeeCode}
                </option>
              ))}

            </select>

          </div>

        </div>
      )}

      {/* =====================================================
          EMPLOYEE INFORMATION
      ===================================================== */}

      {employee && (
        <div className="card">

          <h3>Employee Information</h3>

          <div className="employee-info">

            <div>
              <span className="info-label">
                Employee
              </span>

              <strong>
                {employee.name}
              </strong>
            </div>

            <div>
              <span className="info-label">
                Employee Code
              </span>

              <strong>
                {employee.employeeCode}
              </strong>
            </div>

            <div>
              <span className="info-label">
                Department
              </span>

              <strong>
                {employee.department || "-"}
              </strong>
            </div>

            <div>
              <span className="info-label">
                Designation
              </span>

              <strong>
                {employee.designation || "-"}
              </strong>
            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          MARK ATTENDANCE
      ===================================================== */}

      <div className="card">

        <h3>Mark Attendance</h3>

        <form
          onSubmit={handleSubmit}
          className="attendance-form"
        >

          {/* =================================================
              EMPLOYEE FIELD
          ================================================= */}

          {role === "EMPLOYEE" ? (

            <div className="field">

              <label>
                Employee
              </label>

              <input
                type="text"
                value={
                  employee
                    ? `${employee.name} - ${employee.employeeCode}`
                    : "Loading employee..."
                }
                readOnly
                className="readonly-input"
              />

            </div>

          ) : (

            <div className="field">

              <label>
                Selected Employee
              </label>

              <input
                type="text"
                value={
                  employee
                    ? `${employee.name} - ${employee.employeeCode}`
                    : "Select an employee above"
                }
                readOnly
                className="readonly-input"
              />

            </div>

          )}

          {/* =================================================
              DATE
          ================================================= */}

          <div className="field">

            <label>
              Attendance Date
            </label>

            <input
              type="date"
              value={attendanceDate}
              onChange={(e) =>
                setAttendanceDate(e.target.value)
              }
              required
            />

          </div>

          {/* =================================================
              STATUS
          ================================================= */}

          <div className="field">

            <label>
              Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              required
            >

              <option value="">
                Select status
              </option>

              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}

            </select>

          </div>

          {/* =================================================
              SUBMIT
          ================================================= */}

          <button
            type="submit"
            className="add-button"
            disabled={
              !employee ||
              !employeeId ||
              loading
            }
          >
            {loading
              ? "Saving..."
              : "Mark Attendance"}
          </button>

        </form>

      </div>

      {/* =====================================================
          ATTENDANCE RECORDS
      ===================================================== */}

      <div className="card">

        <h3>
          {role === "ADMIN" || role === "HR"
            ? "Employee Attendance Records"
            : "My Attendance Records"}
        </h3>

        {!employee ? (

          <div className="empty-state">

            {role === "ADMIN" || role === "HR"
              ? "Select an employee to view attendance"
              : "Loading employee information..."}

          </div>

        ) : loading ? (

          <div className="empty-state">
            Loading attendance...
          </div>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                {attendance.length === 0 ? (

                  <tr>

                    <td
                      colSpan="3"
                      className="empty"
                    >
                      No attendance records found
                    </td>

                  </tr>

                ) : (

                  attendance.map((item) => (

                    <tr key={item.id}>

                      <td>
                        {item.id}
                      </td>

                      <td>
                        {item.attendanceDate}
                      </td>

                      <td>

                        <StatusBadge
                          status={item.status}
                        />

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Attendance;
