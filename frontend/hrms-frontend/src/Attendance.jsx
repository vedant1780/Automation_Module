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
    PRESENT: { label: "Present", className: "badge-present" },
    ABSENT: { label: "Absent", className: "badge-absent" },
    HALF_DAY: { label: "Half Day", className: "badge-half" },
  };

  const entry = map[status] || { label: status, className: "" };

  return <span className={`status-badge ${entry.className}`}>{entry.label}</span>;
}

function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [employeeId, setEmployeeId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchEmployees = async () => {
    try {
      const response = await api.get("http://localhost:8080/api/employees");
      setEmployees(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load employees");
    }
  };

  const fetchAttendance = async (id) => {
    if (!id) {
      setAttendance([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(`http://localhost:8080/api/attendance/${id}`);
      setAttendance(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load attendance");
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEmployeeChange = (e) => {
    const id = e.target.value;
    setEmployeeId(id);
    setMessage("");
    setError("");
    fetchAttendance(id);
  };

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
      await api.post(`http://localhost:8080/api/attendance/${employeeId}`, {
        attendanceDate,
        status,
      });

      setMessage("Attendance marked successfully!");
      setAttendanceDate("");
      setStatus("");

      fetchAttendance(employeeId);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Failed to mark attendance");
    }
  };

  return (
    <div className="attendance">
      <div className="page-header">
        <div>
          <h2>Attendance</h2>
          <p>Manage employee attendance</p>
        </div>
      </div>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div className="card">
        <h3>Mark Attendance</h3>

        <form onSubmit={handleSubmit} className="attendance-form">
          <div className="field">
            <label>Employee</label>
            <select value={employeeId} onChange={handleEmployeeChange} required>
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.employeeCode}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Attendance Date</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} required>
              <option value="">Select status</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="add-button">
            Mark Attendance
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Attendance Records</h3>

        {!employeeId ? (
          <div className="empty-state">Select an employee to view attendance</div>
        ) : loading ? (
          <div className="empty-state">Loading attendance...</div>
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
                    <td colSpan="3" className="empty">
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  attendance.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.attendanceDate}</td>
                      <td>
                        <StatusBadge status={item.status} />
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
