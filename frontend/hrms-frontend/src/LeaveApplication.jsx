import React, { useEffect, useState } from "react";
import api from "./axiosConfig";

const API_URL = "http://localhost:8080/api/leaves";
const EMPLOYEE_API_URL = "http://localhost:8080/api/employees";

function LeaveApplication() {

    const [employees, setEmployees] = useState([]);

    const [employeeId, setEmployeeId] = useState("");
    const [leaveType, setLeaveType] = useState("CL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");

    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [employeeLoading, setEmployeeLoading] = useState(false);
    const [message, setMessage] = useState("");

    // ==========================================
    // GET EMPLOYEE LIST
    // ==========================================

    const getEmployees = async () => {

        try {

            setEmployeeLoading(true);

            const response = await api.get(
                EMPLOYEE_API_URL
            );

            setEmployees(response.data);

        } catch (error) {

            console.error(error);

            setMessage(
                "Unable to fetch employee list"
            );

        } finally {

            setEmployeeLoading(false);

        }
    };


    // ==========================================
    // CALCULATE DAYS
    // ==========================================

    const calculateDays = () => {

        if (!startDate || !endDate) {
            return 0;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const difference =
            Math.ceil(
                (end - start) /
                (1000 * 60 * 60 * 24)
            ) + 1;

        return difference > 0
            ? difference
            : 0;
    };


    // ==========================================
    // APPLY LEAVE
    // ==========================================

    const applyLeave = async (e) => {

        e.preventDefault();

        if (!employeeId) {
            setMessage("Please select an employee");
            return;
        }

        if (!startDate || !endDate) {
            setMessage(
                "Please select start and end date"
            );
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {

            setMessage(
                "End date cannot be before start date"
            );

            return;
        }

        try {

            setLoading(true);
            setMessage("");

            const leaveData = {

                leaveType: leaveType,

                startDate: startDate,

                endDate: endDate,

                reason: reason

            };

            await api.post(
                `${API_URL}/apply/${employeeId}`,
                leaveData
            );

            setMessage(
                "Leave applied successfully!"
            );

            setLeaveType("CL");
            setStartDate("");
            setEndDate("");
            setReason("");

            getEmployeeLeaves();

        } catch (error) {

            console.error(error);

            setMessage(
                error.response?.data?.message ||
                error.response?.data ||
                "Failed to apply leave"
            );

        } finally {

            setLoading(false);

        }
    };


    // ==========================================
    // GET EMPLOYEE LEAVE HISTORY
    // ==========================================

    const getEmployeeLeaves = async () => {

        if (!employeeId) {

            setLeaves([]);

            return;
        }

        try {

            const response = await api.get(
                `${API_URL}/employee/${employeeId}`
            );

            setLeaves(response.data);

        } catch (error) {

            console.error(error);

            setMessage(
                "Unable to fetch leave applications"
            );

        }
    };


    // ==========================================
    // LOAD EMPLOYEES WHEN PAGE OPENS
    // ==========================================

    useEffect(() => {

        getEmployees();

    }, []);


    // ==========================================
    // LOAD LEAVES WHEN EMPLOYEE CHANGES
    // ==========================================

    useEffect(() => {

        if (employeeId) {

            getEmployeeLeaves();

        } else {

            setLeaves([]);

        }

    }, [employeeId]);


    return (

        <div style={styles.container}>

            {/* =====================================
                LEAVE APPLICATION
            ===================================== */}

            <div style={styles.card}>

                <div style={styles.titleSection}>

                    <h2 style={styles.title}>
                        Leave Application
                    </h2>

                    <p style={styles.subtitle}>
                        Apply for employee leave
                    </p>

                </div>


                {message && (

                    <div style={styles.message}>
                        {message}
                    </div>

                )}


                <form onSubmit={applyLeave}>

                    {/* =================================
                        EMPLOYEE DROPDOWN
                    ================================= */}

                    <div style={styles.formGroup}>

                        <label style={styles.label}>
                            Employee
                        </label>

                        <select
                            value={employeeId}
                            onChange={(e) =>
                                setEmployeeId(e.target.value)
                            }
                            style={styles.input}
                            required
                        >

                            <option value="">
                                {employeeLoading
                                    ? "Loading employees..."
                                    : "Select Employee"}
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


                    {/* =================================
                        SELECTED EMPLOYEE DETAILS
                    ================================= */}

                    {employeeId && (

                        <div style={styles.employeeInfo}>

                            {(() => {

                                const employee =
                                    employees.find(
                                        emp =>
                                            String(emp.id) ===
                                            String(employeeId)
                                    );

                                if (!employee) {
                                    return null;
                                }

                                return (

                                    <>

                                        <div>

                                            <span style={styles.infoLabel}>
                                                Employee
                                            </span>

                                            <strong>
                                                {employee.name}
                                            </strong>

                                        </div>


                                        <div>

                                            <span style={styles.infoLabel}>
                                                Department
                                            </span>

                                            <strong>
                                                {employee.department || "-"}
                                            </strong>

                                        </div>


                                        <div>

                                            <span style={styles.infoLabel}>
                                                Designation
                                            </span>

                                            <strong>
                                                {employee.designation || "-"}
                                            </strong>

                                        </div>


                                        <div>

                                            <span style={styles.infoLabel}>
                                                Email
                                            </span>

                                            <strong>
                                                {employee.email || "-"}
                                            </strong>

                                        </div>

                                    </>

                                );

                            })()}

                        </div>

                    )}


                    {/* =================================
                        LEAVE TYPE + DAYS
                    ================================= */}

                    <div style={styles.row}>

                        <div style={styles.halfGroup}>

                            <label style={styles.label}>
                                Leave Type
                            </label>

                            <select
                                value={leaveType}
                                onChange={(e) =>
                                    setLeaveType(e.target.value)
                                }
                                style={styles.input}
                            >

                                <option value="CL">
                                    Casual Leave (CL)
                                </option>

                                <option value="SL">
                                    Sick Leave (SL)
                                </option>

                                <option value="EL">
                                    Earned Leave (EL)
                                </option>

                            </select>

                        </div>


                        <div style={styles.halfGroup}>

                            <label style={styles.label}>
                                Number of Days
                            </label>

                            <input
                                type="text"
                                value={calculateDays()}
                                readOnly
                                style={{
                                    ...styles.input,
                                    ...styles.readOnlyInput
                                }}
                            />

                        </div>

                    </div>


                    {/* =================================
                        DATES
                    ================================= */}

                    <div style={styles.row}>

                        <div style={styles.halfGroup}>

                            <label style={styles.label}>
                                Start Date
                            </label>

                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) =>
                                    setStartDate(e.target.value)
                                }
                                style={styles.input}
                                required
                            />

                        </div>


                        <div style={styles.halfGroup}>

                            <label style={styles.label}>
                                End Date
                            </label>

                            <input
                                type="date"
                                value={endDate}
                                min={startDate}
                                onChange={(e) =>
                                    setEndDate(e.target.value)
                                }
                                style={styles.input}
                                required
                            />

                        </div>

                    </div>


                    {/* =================================
                        REASON
                    ================================= */}

                    <div style={styles.formGroup}>

                        <label style={styles.label}>
                            Reason
                        </label>

                        <textarea
                            value={reason}
                            onChange={(e) =>
                                setReason(e.target.value)
                            }
                            placeholder="Enter reason for leave"
                            rows="4"
                            style={styles.textarea}
                        />

                    </div>


                    {/* =================================
                        SUBMIT
                    ================================= */}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            ...(loading
                                ? styles.buttonDisabled
                                : {})
                        }}
                    >

                        {loading
                            ? "Applying..."
                            : "Apply Leave"}

                    </button>

                </form>

            </div>


            {/* =====================================
                LEAVE HISTORY
            ===================================== */}

            <div style={styles.card}>

                <div style={styles.historyHeader}>

                    <div>

                        <h2 style={styles.title}>
                            Leave History
                        </h2>

                        <p style={styles.subtitle}>
                            Previous leave applications
                        </p>

                    </div>


                    <button
                        onClick={getEmployeeLeaves}
                        style={styles.refreshButton}
                    >
                        Refresh
                    </button>

                </div>


                {!employeeId ? (

                    <div style={styles.empty}>
                        Select an employee to view leave history.
                    </div>

                ) : leaves.length === 0 ? (

                    <div style={styles.empty}>
                        No leave applications found for this employee.
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
                                        Type
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

                                </tr>

                            </thead>


                            <tbody>

                                {leaves.map((leave) => (

                                    <tr key={leave.id}>

                                        <td style={styles.td}>
                                            {leave.id}
                                        </td>

                                        <td style={styles.td}>
                                            {leave.leaveType}
                                        </td>

                                        <td style={styles.td}>
                                            {leave.startDate}
                                        </td>

                                        <td style={styles.td}>
                                            {leave.endDate}
                                        </td>

                                        <td style={styles.td}>
                                            {leave.numberOfDays}
                                        </td>

                                        <td style={styles.td}>
                                            {leave.reason || "-"}
                                        </td>

                                        <td style={styles.td}>

                                            <span
                                                style={{
                                                    ...styles.status,

                                                    ...(leave.status === "APPROVED"
                                                        ? styles.approved
                                                        : leave.status === "REJECTED"
                                                        ? styles.rejected
                                                        : styles.pending)
                                                }}
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

    card: {
        background: "#ffffff",
        padding: "28px",
        marginBottom: "25px",
        borderRadius: "12px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        boxSizing: "border-box"
    },

    titleSection: {
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

    message: {
        padding: "12px 15px",
        marginBottom: "20px",
        background: "#eef2ff",
        color: "#3730a3",
        border: "1px solid #c7d2fe",
        borderRadius: "7px",
        fontSize: "14px"
    },

    formGroup: {
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        width: "100%"
    },

    row: {
        display: "flex",
        gap: "20px",
        width: "100%",
        marginBottom: "20px"
    },

    halfGroup: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "8px"
    },

    label: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#374151"
    },

    input: {
        width: "100%",
        height: "44px",
        padding: "10px 12px",
        border: "1px solid #d1d5db",
        borderRadius: "7px",
        fontSize: "14px",
        color: "#111827",
        background: "#ffffff",
        outline: "none",
        boxSizing: "border-box"
    },

    readOnlyInput: {
        background: "#f3f4f6",
        color: "#6b7280",
        cursor: "not-allowed"
    },

    textarea: {
        width: "100%",
        padding: "12px",
        border: "1px solid #d1d5db",
        borderRadius: "7px",
        fontSize: "14px",
        fontFamily: "Arial, sans-serif",
        resize: "vertical",
        boxSizing: "border-box",
        outline: "none"
    },

    employeeInfo: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "15px",
        padding: "15px",
        marginBottom: "20px",
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        fontSize: "13px"
    },

    infoLabel: {
        display: "block",
        marginBottom: "5px",
        color: "#6b7280",
        fontSize: "12px"
    },

    button: {
        width: "100%",
        height: "45px",
        border: "none",
        borderRadius: "7px",
        cursor: "pointer",
        background: "#2563eb",
        color: "#ffffff",
        fontSize: "15px",
        fontWeight: "600"
    },

    buttonDisabled: {
        background: "#9ca3af",
        cursor: "not-allowed"
    },

    refreshButton: {
        padding: "9px 16px",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        background: "#374151",
        color: "#ffffff",
        fontSize: "14px"
    },

    historyHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
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
        textAlign: "left",
        padding: "12px",
        background: "#f3f4f6",
        color: "#374151",
        fontWeight: "600",
        borderBottom: "1px solid #e5e7eb"
    },

    td: {
        padding: "12px",
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

    approved: {
        background: "#dcfce7",
        color: "#166534"
    },

    rejected: {
        background: "#fee2e2",
        color: "#991b1b"
    },

    pending: {
        background: "#fef3c7",
        color: "#92400e"
    },

    empty: {
        padding: "30px",
        textAlign: "center",
        color: "#6b7280",
        background: "#f9fafb",
        borderRadius: "8px"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "14px"
    }
};

export default LeaveApplication;