import React, { useEffect, useState } from "react";
import api from "./axiosConfig";

const API_URL = "http://localhost:8080/api/leaves";

function LeaveApproval() {

    const [leaves, setLeaves] = useState([]);

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ==========================================
    // GET ALL LEAVES
    // ==========================================

    const getAllLeaves = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(API_URL);

            setLeaves(response.data);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to load leave applications"
            );

        } finally {

            setLoading(false);

        }
    };


    // ==========================================
    // APPROVE LEAVE
    // ==========================================

    const approveLeave = async (leaveId) => {

        try {

            setActionLoading(leaveId);
            setMessage("");
            setError("");

            const response = await api.put(
                `${API_URL}/${leaveId}/approve`
            );

            // Update leave in frontend
            setLeaves((prevLeaves) =>
                prevLeaves.map((leave) =>
                    leave.id === leaveId
                        ? response.data
                        : leave
                )
            );

            setMessage(
                "Leave approved successfully!"
            );

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Failed to approve leave"
            );

        } finally {

            setActionLoading(null);

        }
    };


    // ==========================================
    // REJECT LEAVE
    // ==========================================

    const rejectLeave = async (leaveId) => {

        try {

            setActionLoading(leaveId);
            setMessage("");
            setError("");

            const response = await api.put(
                `${API_URL}/${leaveId}/reject`
            );

            // Update leave in frontend
            setLeaves((prevLeaves) =>
                prevLeaves.map((leave) =>
                    leave.id === leaveId
                        ? response.data
                        : leave
                )
            );

            setMessage(
                "Leave rejected successfully!"
            );

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Failed to reject leave"
            );

        } finally {

            setActionLoading(null);

        }
    };


    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };


    // ==========================================
    // LOAD DATA
    // ==========================================

    useEffect(() => {

        getAllLeaves();

    }, []);


    // ==========================================
    // COUNTS
    // ==========================================

    const pendingLeaves =
        leaves.filter(
            leave =>
                leave.status?.toUpperCase() === "PENDING"
        ).length;

    const approvedLeaves =
        leaves.filter(
            leave =>
                leave.status?.toUpperCase() === "APPROVED"
        ).length;

    const rejectedLeaves =
        leaves.filter(
            leave =>
                leave.status?.toUpperCase() === "REJECTED"
        ).length;


    // ==========================================
    // UI
    // ==========================================

    return (

        <div style={styles.container}>

            {/* ======================================
                HEADER
            ====================================== */}

            <div style={styles.header}>

                <div>

                    <h2 style={styles.title}>
                        Leave Approval
                    </h2>

                    <p style={styles.subtitle}>
                        Review and manage employee leave applications
                    </p>

                </div>


                <button
                    onClick={getAllLeaves}
                    style={styles.refreshButton}
                    disabled={loading}
                >

                    {loading
                        ? "Loading..."
                        : "Refresh"}

                </button>

            </div>


            {/* ======================================
                SUCCESS MESSAGE
            ====================================== */}

            {message && (

                <div style={styles.successMessage}>
                    {message}
                </div>

            )}


            {/* ======================================
                ERROR MESSAGE
            ====================================== */}

            {error && (

                <div style={styles.errorMessage}>
                    {error}
                </div>

            )}


            {/* ======================================
                SUMMARY
            ====================================== */}

            <div style={styles.summary}>

                {/* TOTAL */}

                <div style={styles.summaryCard}>

                    <span style={styles.summaryLabel}>
                        Total Applications
                    </span>

                    <strong style={styles.summaryValue}>
                        {leaves.length}
                    </strong>

                </div>


                {/* PENDING */}

                <div style={styles.summaryCard}>

                    <span style={styles.summaryLabel}>
                        Pending
                    </span>

                    <strong style={styles.pendingValue}>
                        {pendingLeaves}
                    </strong>

                </div>


                {/* APPROVED */}

                <div style={styles.summaryCard}>

                    <span style={styles.summaryLabel}>
                        Approved
                    </span>

                    <strong style={styles.approvedValue}>
                        {approvedLeaves}
                    </strong>

                </div>


                {/* REJECTED */}

                <div style={styles.summaryCard}>

                    <span style={styles.summaryLabel}>
                        Rejected
                    </span>

                    <strong style={styles.rejectedValue}>
                        {rejectedLeaves}
                    </strong>

                </div>

            </div>


            {/* ======================================
                LEAVE TABLE
            ====================================== */}

            <div style={styles.card}>

                <div style={styles.tableHeader}>

                    <div>

                        <h3 style={styles.tableTitle}>
                            Leave Applications
                        </h3>

                        <p style={styles.tableSubtitle}>
                            Review employee leave requests
                        </p>

                    </div>

                </div>


                {loading ? (

                    <div style={styles.loading}>
                        Loading leave applications...
                    </div>

                ) : leaves.length === 0 ? (

                    <div style={styles.empty}>
                        No leave applications found.
                    </div>

                ) : (

                    <div style={styles.tableContainer}>

                        <table style={styles.table}>

                            <thead>

                                <tr>

                                    <th style={styles.th}>
                                        ID
                                    </th>

                                    <th style={styles.th}>
                                        Employee
                                    </th>

                                    <th style={styles.th}>
                                        Leave Type
                                    </th>

                                    <th style={styles.th}>
                                        Start Date
                                    </th>

                                    <th style={styles.th}>
                                        End Date
                                    </th>

                                    <th style={styles.th}>
                                        Days
                                    </th>

                                    <th style={styles.th}>
                                        Reason
                                    </th>

                                    <th style={styles.th}>
                                        Status
                                    </th>

                                    <th style={styles.th}>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {leaves.map((leave) => {

                                    const status =
                                        leave.status?.toUpperCase();

                                    const isPending =
                                        status === "PENDING";

                                    const isProcessing =
                                        actionLoading === leave.id;


                                    return (

                                        <tr key={leave.id}>

                                            {/* ID */}

                                            <td style={styles.td}>
                                                {leave.id}
                                            </td>


                                            {/* EMPLOYEE */}

                                            <td style={styles.td}>

                                                {leave.employee
                                                    ? (
                                                        <>
                                                            <strong>
                                                                {leave.employee.name}
                                                            </strong>

                                                            <br />

                                                            <span
                                                                style={
                                                                    styles.employeeCode
                                                                }
                                                            >
                                                                {leave.employee.employeeCode}
                                                            </span>
                                                        </>
                                                    )
                                                    : leave.employeeId || "-"
                                                }

                                            </td>


                                            {/* LEAVE TYPE */}

                                            <td style={styles.td}>

                                                <span
                                                    style={
                                                        styles.leaveType
                                                    }
                                                >
                                                    {leave.leaveType}
                                                </span>

                                            </td>


                                            {/* START DATE */}

                                            <td style={styles.td}>
                                                {formatDate(
                                                    leave.startDate
                                                )}
                                            </td>


                                            {/* END DATE */}

                                            <td style={styles.td}>
                                                {formatDate(
                                                    leave.endDate
                                                )}
                                            </td>


                                            {/* DAYS */}

                                            <td style={styles.td}>
                                                {leave.numberOfDays}
                                            </td>


                                            {/* REASON */}

                                            <td
                                                style={{
                                                    ...styles.td,
                                                    ...styles.reason
                                                }}
                                            >
                                                {leave.reason || "-"}
                                            </td>


                                            {/* STATUS */}

                                            <td style={styles.td}>

                                                <span
                                                    style={{
                                                        ...styles.status,

                                                        ...(status === "APPROVED"
                                                            ? styles.approved
                                                            : status === "REJECTED"
                                                            ? styles.rejected
                                                            : styles.pending)
                                                    }}
                                                >
                                                    {leave.status}
                                                </span>

                                            </td>


                                            {/* ACTION */}

                                            <td style={styles.td}>

                                                {isPending ? (

                                                    <div
                                                        style={
                                                            styles.actionContainer
                                                        }
                                                    >

                                                        {/* APPROVE */}

                                                        <button
                                                            onClick={() =>
                                                                approveLeave(
                                                                    leave.id
                                                                )
                                                            }
                                                            disabled={
                                                                isProcessing
                                                            }
                                                            style={{
                                                                ...styles.approveButton,

                                                                ...(isProcessing
                                                                    ? styles.disabledButton
                                                                    : {})
                                                            }}
                                                        >

                                                            {isProcessing
                                                                ? "Processing..."
                                                                : "Approve"}

                                                        </button>


                                                        {/* REJECT */}

                                                        <button
                                                            onClick={() =>
                                                                rejectLeave(
                                                                    leave.id
                                                                )
                                                            }
                                                            disabled={
                                                                isProcessing
                                                            }
                                                            style={{
                                                                ...styles.rejectButton,

                                                                ...(isProcessing
                                                                    ? styles.disabledButton
                                                                    : {})
                                                            }}
                                                        >

                                                            Reject

                                                        </button>

                                                    </div>

                                                ) : (

                                                    <span
                                                        style={
                                                            styles.noAction
                                                        }
                                                    >
                                                        No Action
                                                    </span>

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


// ==========================================
// STYLES
// ==========================================

const styles = {

    container: {
        width: "100%",
        maxWidth: "1400px",
        margin: "30px auto",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box"
    },


    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "25px"
    },


    title: {
        margin: "0 0 5px",
        fontSize: "24px",
        fontWeight: "600",
        color: "#1f2937"
    },


    subtitle: {
        margin: "0",
        color: "#6b7280",
        fontSize: "14px"
    },


    refreshButton: {
        padding: "10px 18px",
        border: "none",
        borderRadius: "7px",
        background: "#374151",
        color: "#ffffff",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600"
    },


    successMessage: {
        padding: "12px 15px",
        marginBottom: "20px",
        background: "#dcfce7",
        color: "#166534",
        border: "1px solid #bbf7d0",
        borderRadius: "7px",
        fontSize: "14px"
    },


    errorMessage: {
        padding: "12px 15px",
        marginBottom: "20px",
        background: "#fee2e2",
        color: "#991b1b",
        border: "1px solid #fecaca",
        borderRadius: "7px",
        fontSize: "14px"
    },


    summary: {
        display: "flex",
        gap: "20px",
        marginBottom: "25px"
    },


    summaryCard: {
        flex: 1,
        padding: "20px",
        background: "#ffffff",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.07)"
    },


    summaryLabel: {
        display: "block",
        color: "#6b7280",
        fontSize: "13px",
        marginBottom: "8px"
    },


    summaryValue: {
        fontSize: "25px",
        color: "#1f2937"
    },


    pendingValue: {
        fontSize: "25px",
        color: "#d97706"
    },


    approvedValue: {
        fontSize: "25px",
        color: "#16a34a"
    },


    rejectedValue: {
        fontSize: "25px",
        color: "#dc2626"
    },


    card: {
        background: "#ffffff",
        borderRadius: "10px",
        padding: "20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.07)"
    },


    tableHeader: {
        marginBottom: "20px"
    },


    tableTitle: {
        margin: "0 0 5px",
        fontSize: "18px",
        color: "#1f2937"
    },


    tableSubtitle: {
        margin: "0",
        color: "#6b7280",
        fontSize: "13px"
    },


    tableContainer: {
        width: "100%",
        overflowX: "auto"
    },


    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "14px"
    },


    th: {
        padding: "13px",
        textAlign: "left",
        background: "#f3f4f6",
        color: "#374151",
        fontWeight: "600",
        borderBottom: "1px solid #e5e7eb",
        whiteSpace: "nowrap"
    },


    td: {
        padding: "13px",
        borderBottom: "1px solid #e5e7eb",
        color: "#4b5563",
        verticalAlign: "middle"
    },


    employeeCode: {
        color: "#9ca3af",
        fontSize: "12px"
    },


    leaveType: {
        display: "inline-block",
        padding: "5px 9px",
        borderRadius: "5px",
        background: "#eef2ff",
        color: "#4338ca",
        fontWeight: "600",
        fontSize: "12px"
    },


    reason: {
        maxWidth: "220px",
        wordBreak: "break-word"
    },


    status: {
        display: "inline-block",
        padding: "5px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600"
    },


    pending: {
        background: "#fef3c7",
        color: "#92400e"
    },


    approved: {
        background: "#dcfce7",
        color: "#166534"
    },


    rejected: {
        background: "#fee2e2",
        color: "#991b1b"
    },


    actionContainer: {
        display: "flex",
        gap: "8px"
    },


    approveButton: {
        padding: "7px 12px",
        border: "none",
        borderRadius: "6px",
        background: "#16a34a",
        color: "#ffffff",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "600"
    },


    rejectButton: {
        padding: "7px 12px",
        border: "none",
        borderRadius: "6px",
        background: "#dc2626",
        color: "#ffffff",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "600"
    },


    disabledButton: {
        background: "#9ca3af",
        cursor: "not-allowed"
    },


    noAction: {
        color: "#9ca3af",
        fontSize: "12px"
    },


    loading: {
        padding: "40px",
        textAlign: "center",
        color: "#6b7280"
    },


    empty: {
        padding: "40px",
        textAlign: "center",
        color: "#6b7280",
        background: "#f9fafb",
        borderRadius: "8px"
    }

};


export default LeaveApproval;