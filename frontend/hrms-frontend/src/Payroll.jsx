import { useEffect, useState } from "react";
import api from "./axiosConfig";
import "./Payroll.css";

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

function getHttpErrorMessage(err, fallback) {
  if (err.response?.status === 401) {
    return "Session expired. Please login again.";
  }
  if (err.response?.status === 403) {
    return "You do not have permission to do that.";
  }
  return err.response?.data?.message || err.response?.data || fallback;
}

function formatAmount(amount) {
  if (amount === null || amount === undefined) {
    return "₹ 0.00";
  }

  return `₹ ${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Payroll() {
  const [employees, setEmployees] = useState([]);

  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [payroll, setPayroll] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [viewingPayslip, setViewingPayslip] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const actionsBusy = viewingPayslip || downloading || sendingEmail;

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const response = await api.get("/api/employees");
        setEmployees(response.data);
      } catch (err) {
        console.error("Employee loading error:", err);
        setError(getHttpErrorMessage(err, "Unable to load employees"));
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleGeneratePayroll = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setPayroll(null);

    if (!employeeId) {
      setError("Please select an employee");
      return;
    }

    if (!month) {
      setError("Please select a month");
      return;
    }

    if (!year) {
      setError("Please select a year");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(`/api/payroll/generate/${employeeId}`, null, {
        params: { month, year },
      });

      setPayroll(response.data);
      setMessage("Payroll generated successfully!");
    } catch (err) {
      console.error("Payroll generation error:", err);
      setError(getHttpErrorMessage(err, "Failed to generate payroll"));
    } finally {
      setLoading(false);
    }
  };

  const viewPayslip = async () => {
    if (!payroll?.id) {
      setError("Generate payroll first");
      return;
    }

    try {
      setViewingPayslip(true);
      setMessage("");
      setError("");

      const response = await api.get(`/api/payroll/${payroll.id}/payslip/view`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");

      // Give browser time to open the PDF
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);
    } catch (err) {
      console.error("View payslip error:", err);
      setError(getHttpErrorMessage(err, "Failed to view payslip"));
    } finally {
      setViewingPayslip(false);
    }
  };

  const downloadPayslip = async () => {
    if (!payroll?.id) {
      setError("Generate payroll first");
      return;
    }

    try {
      setDownloading(true);
      setMessage("");
      setError("");

      const response = await api.get(`/api/payroll/${payroll.id}/payslip/download`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Payslip_${payroll.employee?.employeeCode || payroll.employeeId || payroll.id}_${payroll.month}_${payroll.year}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setMessage("Payslip downloaded successfully!");
    } catch (err) {
      console.error("Download payslip error:", err);
      setError(getHttpErrorMessage(err, "Failed to download payslip"));
    } finally {
      setDownloading(false);
    }
  };

  const sendPayslipEmail = async () => {
    if (!payroll?.id) {
      setError("Generate payroll first");
      return;
    }

    try {
      setSendingEmail(true);
      setMessage("");
      setError("");

      await api.post(`/api/payslip-emails/send/${payroll.id}`);

      setMessage("Payslip email sent successfully!");
    } catch (err) {
      console.error("Email error:", err);
      setError(getHttpErrorMessage(err, "Failed to send payslip email"));
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="payroll-page">
      <div className="page-header">
        <div>
          <h2>Payroll</h2>
          <p>Generate and manage employee payroll</p>
        </div>
      </div>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div className="card">
        <h3>Generate Payroll</h3>

        <form onSubmit={handleGeneratePayroll} className="payroll-form">
          <div className="field">
            <label>Employee</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              disabled={loadingEmployees}
              required
            >
              <option value="">{loadingEmployees ? "Loading employees..." : "Select employee"}</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.employeeCode}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Month</label>
            <select value={month} onChange={(e) => setMonth(e.target.value)} required>
              <option value="">Select month</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2026"
              min="2020"
              max="2100"
              required
            />
          </div>

          <button type="submit" className="add-button" disabled={loading || loadingEmployees}>
            {loading ? "Generating..." : "Generate Payroll"}
          </button>
        </form>
      </div>

      {payroll && (
        <div className="card payroll-result">
          <h3>Payroll Details</h3>

          <div className="payroll-meta">
            <div>
              <span className="meta-label">Employee</span>
              <strong>{payroll.employee?.name || "Unknown"}</strong>
            </div>
            <div>
              <span className="meta-label">Employee Code</span>
              <strong>{payroll.employee?.employeeCode || payroll.employeeId || "-"}</strong>
            </div>
            <div>
              <span className="meta-label">Period</span>
              <strong>
                {MONTHS.find((m) => m.value === String(payroll.month))?.label || payroll.month}{" "}
                {payroll.year}
              </strong>
            </div>
            <div>
              <span className="meta-label">Payroll ID</span>
              <strong>{payroll.id}</strong>
            </div>
          </div>

          <div className="payroll-breakdown">
            <div className="breakdown-column">
              <h4>Earnings</h4>
              <div className="breakdown-row">
                <span>Basic Salary</span>
                <span>{formatAmount(payroll.basicSalary)}</span>
              </div>
              <div className="breakdown-row">
                <span>HRA</span>
                <span>{formatAmount(payroll.hra)}</span>
              </div>
              <div className="breakdown-row">
                <span>Special Allowance</span>
                <span>{formatAmount(payroll.specialAllowance)}</span>
              </div>
              <div className="breakdown-row breakdown-total">
                <span>Gross Salary</span>
                <span>{formatAmount(payroll.grossSalary)}</span>
              </div>
            </div>

            <div className="breakdown-column">
              <h4>Deductions</h4>
              <div className="breakdown-row">
                <span>LOP Deduction</span>
                <span>{formatAmount(payroll.deductions)}</span>
              </div>
              <div className="breakdown-row">
                <span>PF</span>
                <span>{formatAmount(payroll.pf)}</span>
              </div>
              <div className="breakdown-row">
                <span>ESI</span>
                <span>{formatAmount(payroll.esi)}</span>
              </div>
              <div className="breakdown-row">
                <span>Professional Tax</span>
                <span>{formatAmount(payroll.professionalTax)}</span>
              </div>
              <div className="breakdown-row breakdown-total">
                <span>Total Deductions</span>
                <span>{formatAmount(payroll.totalDeductions)}</span>
              </div>
            </div>
          </div>

          <div className="net-salary-banner">
            <span>Net Salary</span>
            <strong>{formatAmount(payroll.netSalary)}</strong>
          </div>

          <div className="payslip-actions">
            <button
              className="action-button action-view"
              onClick={viewPayslip}
              disabled={actionsBusy}
            >
              {viewingPayslip ? "Opening..." : "View Payslip"}
            </button>

            <button
              className="action-button action-download"
              onClick={downloadPayslip}
              disabled={actionsBusy}
            >
              {downloading ? "Downloading..." : "Download Payslip"}
            </button>

            <button
              className="action-button action-email"
              onClick={sendPayslipEmail}
              disabled={actionsBusy}
            >
              {sendingEmail ? "Sending..." : "Send Payslip Email"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payroll;
