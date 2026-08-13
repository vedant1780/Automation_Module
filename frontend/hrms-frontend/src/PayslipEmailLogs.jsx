import React, { useEffect, useState } from "react";
import api from "./axiosConfig";

const API_URL = "http://localhost:8080/api/payslip-emails";
const EMPLOYEE_API_URL = "http://localhost:8080/api/employees";

function PayslipEmailLogs() {

    const [logs, setLogs] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [employeeId, setEmployeeId] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // ==========================================
    // GET EMPLOYEES
    // ==========================================

    const getEmployees = async () => {

        try {

            const response = await api.get(
                EMPLOYEE_API_URL
            );

            setEmployees(response.data);

        } catch (error) {

            console.error("Employee error:", error);

            setMessage(
                "Unable to load employee list"
            );
        }
    };


    // ==========================================
    // GET ALL EMAIL LOGS
    // ==========================================

    const getAllLogs = async () => {

        try {

            setLoading(true);
            setMessage("");

            const response = await api.get(API_URL);

            setLogs(response.data);

        } catch (error) {

            console.error(error);

            setMessage(
                error.response?.data?.message ||
                "Unable to load payslip email logs"
            );

        } finally {

            setLoading(false);

        }
    };


    // ==========================================
    // GET EMPLOYEE EMAIL LOGS
    // ==========================================

    const getEmployeeLogs = async () => {

        if (!employeeId) {

            setMessage(
                "Please select an employee"
            );

            return;
        }

        try {

            setLoading(true);
            setMessage("");

            const response = await api.get(
                `${API_URL}/employee/${employeeId}`
            );

            setLogs(response.data);

        } catch (error) {

            console.error(error);

            setMessage(
                error.response?.data?.message ||
                "Unable to load employee email history"
            );

        } finally {

            setLoading(false);

        }
    };


    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString("en-IN", {

            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"

        });
    };


    // ==========================================
    // LOAD DATA
    // ==========================================

    useEffect(() => {

        getAllLogs();
        getEmployees();

    }, []);


    return (

        <div style={styles.container}>

            {/* =====================================
                HEADER
            ===================================== */}

            <div style={styles.header}>

                <div>

                    <h2 style={styles.title}>
                        Payslip Email Logs
                    </h2>

                    <p style={styles.subtitle}>
                        Track payslip email delivery history
                    </p>

                </div>


                <button
                    onClick={getAllLogs}
                    style={styles.refreshButton}
                >
                    Refresh
                </button>

            </div>


            {/* =====================================
                EMPLOYEE FILTER
            ===================================== */}

            <div style={styles.filterCard}>

                <div style={styles.filterGroup}>

                    <label style={styles.label}>
                        Employee
                    </label>

                    <select
                        value={employeeId}
                        onChange={(e) =>
                            setEmployeeId(e.target.value)
                        }
                        style={styles.input}
                    >

                        <option value="">
                            Select Employee
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


                <button
                    onClick={getEmployeeLogs}
                    style={styles.filterButton}
                >
                    Search Employee
                </button>


                <button
                    onClick={getAllLogs}
                    style={styles.allButton}
                >
                    Show All
                </button>

            </div>


            {/* =====================================
                MESSAGE
            ===================================== */}

            {message && (

                <div style={styles.message}>
                    {message}
                </div>

            )}


            {/* =====================================
                SUMMARY
            ===================================== */}

            <div style={styles.summary}>

                <div style={styles.summaryCard}>

                    <span style={styles.summaryLabel}>
                        Total Emails
                    </span>

                    <strong style={styles.summaryValue}>
                        {logs.length}
                    </strong>

                </div>


                <div style={styles.summaryCard}>

                    <span style={styles.summaryLabel}>
                        Sent
                    </span>

                    <strong style={styles.sentValue}>

                        {
                            logs.filter(
                                log =>
                                    log.status?.toUpperCase() ===
                                    "SENT"
                            ).length
                        }

                    </strong>

                </div>


                <div style={styles.summaryCard}>

                    <span style={styles.summaryLabel}>
                        Failed
                    </span>

                    <strong style={styles.failedValue}>

                        {
                            logs.filter(
                                log =>
                                    log.status?.toUpperCase() ===
                                    "FAILED"
                            ).length
                        }

                    </strong>

                </div>

            </div>


            {/* =====================================
                EMAIL LOG TABLE
            ===================================== */}

            <div style={styles.card}>

                {loading ? (

                    <div style={styles.loading}>
                        Loading email logs...
                    </div>

                ) : logs.length === 0 ? (

                    <div style={styles.empty}>
                        No payslip email logs found.
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
                                        Email
                                    </th>

                                    <th style={styles.th}>
                                        Status
                                    </th>

                                    <th style={styles.th}>
                                        Sent At
                                    </th>

                                    <th style={styles.th}>
                                        Error Message
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {logs.map((log) => (

                                    <tr key={log.id}>

                                        <td style={styles.td}>
                                            {log.id}
                                        </td>

                                        <td style={styles.td}>
                                            {log.email || "-"}
                                        </td>

                                        <td style={styles.td}>

                                            <span
                                                style={{
                                                    ...styles.status,

                                                    ...(log.status?.toUpperCase() === "SENT"
                                                        ? styles.sent
                                                        : log.status?.toUpperCase() === "FAILED"
                                                        ? styles.failed
                                                        : styles.pending)
                                                }}
                                            >
                                                {log.status || "UNKNOWN"}
                                            </span>

                                        </td>

                                        <td style={styles.td}>
                                            {formatDate(log.sentAt)}
                                        </td>

                                        <td
                                            style={{
                                                ...styles.td,
                                                ...styles.error
                                            }}
                                        >
                                            {log.errorMessage || "-"}
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


// ==========================================
// STYLES
// ==========================================

const styles = {

    container: {
        width: "100%",
        maxWidth: "1200px",
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
        color: "#1f2937"
    },

    subtitle: {
        margin: "0",
        color: "#6b7280",
        fontSize: "14px"
    },

    filterCard: {
        display: "flex",
        alignItems: "flex-end",
        gap: "15px",
        padding: "20px",
        marginBottom: "20px",
        background: "#ffffff",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.07)"
    },

    filterGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "7px"
    },

    label: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#374151"
    },

    input: {
        width: "250px",
        height: "40px",
        padding: "8px 10px",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        fontSize: "14px",
        boxSizing: "border-box",
        outline: "none",
        background: "#ffffff"
    },

    filterButton: {
        height: "40px",
        padding: "0 16px",
        border: "none",
        borderRadius: "6px",
        background: "#2563eb",
        color: "#ffffff",
        cursor: "pointer",
        fontSize: "13px"
    },

    allButton: {
        height: "40px",
        padding: "0 18px",
        border: "none",
        borderRadius: "6px",
        background: "#374151",
        color: "#ffffff",
        cursor: "pointer",
        fontSize: "13px"
    },

    refreshButton: {
        padding: "9px 16px",
        border: "none",
        borderRadius: "6px",
        background: "#374151",
        color: "#ffffff",
        cursor: "pointer"
    },

    message: {
        padding: "12px",
        marginBottom: "20px",
        background: "#fee2e2",
        color: "#991b1b",
        borderRadius: "7px"
    },

    summary: {
        display: "flex",
        gap: "20px",
        marginBottom: "20px"
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
        fontSize: "24px",
        color: "#1f2937"
    },

    sentValue: {
        fontSize: "24px",
        color: "#16a34a"
    },

    failedValue: {
        fontSize: "24px",
        color: "#dc2626"
    },

    card: {
        background: "#ffffff",
        borderRadius: "10px",
        padding: "20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.07)"
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
        color: "#4b5563"
    },

    status: {
        display: "inline-block",
        padding: "5px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600"
    },

    sent: {
        background: "#dcfce7",
        color: "#166534"
    },

    failed: {
        background: "#fee2e2",
        color: "#991b1b"
    },

    pending: {
        background: "#fef3c7",
        color: "#92400e"
    },

    error: {
        color: "#dc2626",
        maxWidth: "300px"
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

export default PayslipEmailLogs;