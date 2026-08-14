import React, { useEffect, useState } from "react";
import api from "./axiosConfig";
import "./LeaveApproval.css";

const API_URL = "http://localhost:8080/api/leaves";

function formatDate(date) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const normalized = status?.toUpperCase();
  const map = {
    APPROVED: "badge-approved",
    REJECTED: "badge-rejected",
  };

  return <span className={`status-badge ${map[normalized] || "badge-pending"}`}>{status}</span>;
}

function LeaveApproval() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getAllLeaves = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(API_URL);
      setLeaves(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data || "Unable to load leave applications");
    } finally {
      setLoading(false);
    }
  };

  const updateLeaveStatus = async (leaveId, action, successMessage, failureMessage) => {
    try {
      setActionLoading(leaveId);
      setMessage("");
      setError("");

      const response = await api.put(`${API_URL}/${leaveId}/${action}`);

      setLeaves((prevLeaves) =>
        prevLeaves.map((leave) => (leave.id === leaveId ? response.data : leave))
      );

      setMessage(successMessage);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data || failureMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const approveLeave = (leaveId) =>
    updateLeaveStatus(leaveId, "approve", "Leave approved successfully!", "Failed to approve leave");

  const rejectLeave = (leaveId) =>
    updateLeaveStatus(leaveId, "reject", "Leave rejected successfully!", "Failed to reject leave");

  useEffect(() => {
    getAllLeaves();
  }, []);

  const pendingLeaves = leaves.filter((leave) => leave.status?.toUpperCase() === "PENDING").length;
  const approvedLeaves = leaves.filter((leave) => leave.status?.toUpperCase() === "APPROVED").length;
  const rejectedLeaves = leaves.filter((leave) => leave.status?.toUpperCase() === "REJECTED").length;

  return (
    <div className="leave-approval">
      <div className="page-header">
        <div>
          <h2>Leave Approval</h2>
          <p>Review and manage employee leave applications</p>
        </div>

        <button onClick={getAllLeaves} className="ghost-button" disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div className="summary">
        <div className="summary-card">
          <span className="summary-label">Total Applications</span>
          <strong className="summary-value">{leaves.length}</strong>
        </div>

        <div className="summary-card">
          <span className="summary-label">Pending</span>
          <strong className="summary-value value-pending">{pendingLeaves}</strong>
        </div>

        <div className="summary-card">
          <span className="summary-label">Approved</span>
          <strong className="summary-value value-approved">{approvedLeaves}</strong>
        </div>

        <div className="summary-card">
          <span className="summary-label">Rejected</span>
          <strong className="summary-value value-rejected">{rejectedLeaves}</strong>
        </div>
      </div>

      <div className="card">
        <div className="table-header">
          <h3>Leave Applications</h3>
          <p>Review employee leave requests</p>
        </div>

        {loading ? (
          <div className="empty-state">Loading leave applications...</div>
        ) : leaves.length === 0 ? (
          <div className="empty-state">No leave applications found.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {leaves.map((leave) => {
                  const isPending = leave.status?.toUpperCase() === "PENDING";
                  const isProcessing = actionLoading === leave.id;

                  return (
                    <tr key={leave.id}>
                      <td>{leave.id}</td>

                      <td>
                        {leave.employee ? (
                          <>
                            <strong>{leave.employee.name}</strong>
                            <br />
                            <span className="employee-code">{leave.employee.employeeCode}</span>
                          </>
                        ) : (
                          leave.employeeId || "-"
                        )}
                      </td>

                      <td>
                        <span className="leave-type">{leave.leaveType}</span>
                      </td>

                      <td>{formatDate(leave.startDate)}</td>
                      <td>{formatDate(leave.endDate)}</td>
                      <td>{leave.numberOfDays}</td>
                      <td className="reason-cell">{leave.reason || "-"}</td>

                      <td>
                        <StatusBadge status={leave.status} />
                      </td>

                      <td>
                        {isPending ? (
                          <div className="action-buttons">
                            <button
                              onClick={() => approveLeave(leave.id)}
                              disabled={isProcessing}
                              className="approve-button"
                            >
                              {isProcessing ? "Processing..." : "Approve"}
                            </button>

                            <button
                              onClick={() => rejectLeave(leave.id)}
                              disabled={isProcessing}
                              className="reject-button"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="no-action">No action</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaveApproval;
