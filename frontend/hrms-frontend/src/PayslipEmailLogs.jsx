import React, { useEffect, useState } from "react";
import api from "./axiosConfig";
import "./PayslipEmailLogs.css";

const API_URL = "http://localhost:8080/api/payslip-emails";
const EMPLOYEE_API_URL = "http://localhost:8080/api/employees";

function formatDate(date) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }) {
  const normalized = status?.toUpperCase();
  const map = {
    SENT: "badge-sent",
    FAILED: "badge-failed",
  };

  return <span className={`status-badge ${map[normalized] || "badge-pending"}`}>{status || "UNKNOWN"}</span>;
}

function PayslipEmailLogs() {
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const getEmployees = async () => {
    try {
      const response = await api.get(EMPLOYEE_API_URL);
      setEmployees(response.data);
    } catch (error) {
      console.error("Employee error:", error);
      setMessage("Unable to load employee list");
    }
  };

  const getAllLogs = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get(API_URL);
      setLogs(response.data);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Unable to load payslip email logs");
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeLogs = async () => {
    if (!employeeId) {
      setMessage("Please select an employee");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await api.get(`${API_URL}/employee/${employeeId}`);
      setLogs(response.data);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Unable to load employee email history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllLogs();
    getEmployees();
  }, []);

  const sentCount = logs.filter((log) => log.status?.toUpperCase() === "SENT").length;
  const failedCount = logs.filter((log) => log.status?.toUpperCase() === "FAILED").length;

  return (
    <div className="payslip-logs">
      <div className="page-header">
        <div>
          <h2>Payslip Email Logs</h2>
          <p>Track payslip email delivery history</p>
        </div>

        <button onClick={getAllLogs} className="ghost-button">
          Refresh
        </button>
      </div>

      <div className="filter-card">
        <div className="field">
          <label>Employee</label>
          <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
            <option value="">Select employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.employeeCode
                  ? `${employee.employeeCode} - ${employee.name}`
                  : `${employee.id} - ${employee.name}`}
              </option>
            ))}
          </select>
        </div>

        <button onClick={getEmployeeLogs} className="filter-button">
          Search Employee
        </button>

        <button onClick={getAllLogs} className="all-button">
          Show All
        </button>
      </div>

      {message && <div className="banner">{message}</div>}

      <div className="summary">
        <div className="summary-card">
          <span className="summary-label">Total Emails</span>
          <strong className="summary-value">{logs.length}</strong>
        </div>

        <div className="summary-card">
          <span className="summary-label">Sent</span>
          <strong className="summary-value value-sent">{sentCount}</strong>
        </div>

        <div className="summary-card">
          <span className="summary-label">Failed</span>
          <strong className="summary-value value-failed">{failedCount}</strong>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">Loading email logs...</div>
        ) : logs.length === 0 ? (
          <div className="empty-state">No payslip email logs found.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Sent At</th>
                  <th>Error Message</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{log.email || "-"}</td>
                    <td>
                      <StatusBadge status={log.status} />
                    </td>
                    <td>{formatDate(log.sentAt)}</td>
                    <td className="error-cell">{log.errorMessage || "-"}</td>
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

export default PayslipEmailLogs;
