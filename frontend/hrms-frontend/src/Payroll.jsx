import { useEffect, useRef, useState } from "react";
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


// ======================================================
// GET BACKEND ERROR MESSAGE
// ======================================================

async function getHttpErrorMessage(err, fallback = "Something went wrong") {
  if (!err) {
    return fallback;
  }

  // ------------------------------------------------------
  // NO RESPONSE AT ALL
  //
  // Axios sets err.response only when the server actually
  // replied. If it's missing, this is a network failure,
  // a CORS block, a timeout, or the request was cancelled -
  // there is no backend message to read.
  // ------------------------------------------------------

  if (!err.response) {
    if (err.code === "ECONNABORTED") {
      return "The request timed out. Please try again.";
    }

    if (
      typeof err.message === "string" &&
      /network error/i.test(err.message)
    ) {
      return "Network error. Please check your internet connection and try again.";
    }

    if (typeof err.message === "string" && err.message.trim()) {
      return err.message;
    }

    return fallback;
  }

  // ------------------------------------------------------
  // HTTP STATUS
  // ------------------------------------------------------

  if (err.response.status === 401) {
    return "Session expired. Please login again.";
  }

  if (err.response.status === 403) {
    return "You do not have permission to do that.";
  }

  // ------------------------------------------------------
  // RESPONSE DATA
  // ------------------------------------------------------

  let data = err.response?.data;

  // ------------------------------------------------------
  // BLOB RESPONSE
  //
  // Endpoints called with responseType: "blob" still send
  // their error body as a Blob, so it has to be read as
  // text before it can be inspected.
  // ------------------------------------------------------

  if (data instanceof Blob) {
    try {
      const text = await data.text();

      if (!text || !text.trim()) {
        return fallback;
      }

      const trimmed = text.trim();

      // A proxy/gateway failure (e.g. 502/504) often returns
      // an HTML error page instead of JSON - never show that
      // markup to the user.
      if (trimmed.startsWith("<")) {
        return fallback;
      }

      try {
        const json = JSON.parse(trimmed);
        return extractMessageFromJson(json) || fallback;
      } catch {
        return trimmed;
      }
    } catch {
      return fallback;
    }
  }

  // ------------------------------------------------------
  // STRING RESPONSE
  // ------------------------------------------------------

  if (typeof data === "string") {
    const trimmed = data.trim();

    if (!trimmed) {
      return fallback;
    }

    if (trimmed.startsWith("<")) {
      return fallback;
    }

    return trimmed;
  }

  // ------------------------------------------------------
  // JSON RESPONSE
  //
  // Spring Boot can return:
  //
  // {
  //   "timestamp": "...",
  //   "status": 500,
  //   "error": "Internal Server Error",
  //   "message": "Salary structure not assigned for 2027-09 for employee ID: 6",
  //   "path": "..."
  // }
  //
  // or, for bean validation failures:
  //
  // {
  //   "errors": [
  //     { "field": "year", "defaultMessage": "must be >= 2020" }
  //   ]
  // }
  // ------------------------------------------------------

  if (data && typeof data === "object") {
    const extracted = extractMessageFromJson(data);

    if (extracted) {
      return extracted;
    }
  }

  // ------------------------------------------------------
  // AXIOS ERROR MESSAGE
  // ------------------------------------------------------

  if (typeof err.message === "string" && err.message.trim()) {
    return err.message;
  }

  return fallback;
}


// ======================================================
// EXTRACT MESSAGE FROM A JSON ERROR BODY
// ======================================================

function extractMessageFromJson(json) {
  if (!json || typeof json !== "object") {
    return null;
  }

  if (typeof json.message === "string" && json.message.trim()) {
    return json.message;
  }

  if (typeof json.error === "string" && json.error.trim()) {
    return json.error;
  }

  if (typeof json.detail === "string" && json.detail.trim()) {
    return json.detail;
  }

  // Bean-validation style: { errors: [{ field, defaultMessage }] }
  if (Array.isArray(json.errors) && json.errors.length > 0) {
    const parts = json.errors
      .map((e) => {
        if (typeof e === "string") {
          return e;
        }

        if (e && typeof e === "object") {
          const msg = e.defaultMessage || e.message;

          if (typeof msg === "string" && msg.trim()) {
            return e.field ? `${e.field}: ${msg}` : msg;
          }
        }

        return null;
      })
      .filter(Boolean);

    if (parts.length > 0) {
      return parts.join(", ");
    }
  }

  return null;
}


// ======================================================
// FORMAT AMOUNT
// ======================================================

function formatAmount(amount) {
  if (
    amount === null ||
    amount === undefined ||
    amount === ""
  ) {
    return "₹ 0.00";
  }

  const number = Number(amount);

  if (Number.isNaN(number)) {
    return "₹ 0.00";
  }

  return `₹ ${number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}


// ======================================================
// GET MONTH NAME
// ======================================================

function getMonthName(month) {
  const found = MONTHS.find(
    (m) => m.value === String(month)
  );

  return found ? found.label : month;
}


// ======================================================
// PAYROLL COMPONENT
// ======================================================

function Payroll() {
  // ------------------------------------------------------
  // EMPLOYEES
  // ------------------------------------------------------

  const [employees, setEmployees] = useState([]);

  // ------------------------------------------------------
  // FORM
  // ------------------------------------------------------

  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // ------------------------------------------------------
  // PAYROLL
  // ------------------------------------------------------

  const [payroll, setPayroll] = useState(null);

  // ------------------------------------------------------
  // LOADING
  // ------------------------------------------------------

  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] =
    useState(true);

  const [viewingPayslip, setViewingPayslip] =
    useState(false);

  const [downloading, setDownloading] =
    useState(false);

  const [sendingEmail, setSendingEmail] =
    useState(false);

  // ------------------------------------------------------
  // MESSAGES
  // ------------------------------------------------------

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ------------------------------------------------------
  // ACTION STATUS
  // ------------------------------------------------------

  const actionsBusy =
    viewingPayslip ||
    downloading ||
    sendingEmail;

  // ------------------------------------------------------
  // MOUNTED REF
  //
  // Guards every async handler below, not just the initial
  // employee fetch, so a component unmount mid-request (e.g.
  // the user navigates away while a payslip is downloading)
  // never triggers a "setState on an unmounted component"
  // warning or a stale UI update.
  // ------------------------------------------------------

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);


  // ======================================================
  // LOAD EMPLOYEES
  // ======================================================

  useEffect(() => {
    const controller = new AbortController();

    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        setError("");

        const response = await api.get("/api/employees", {
          signal: controller.signal,
        });

        if (!isMountedRef.current) {
          return;
        }

        if (Array.isArray(response.data)) {
          setEmployees(response.data);
        } else {
          setEmployees([]);
          setError("Invalid employee data received.");
        }
      } catch (err) {
        // Ignore the error raised when the request is
        // cancelled on unmount - it isn't a real failure.
        if (
          err?.code === "ERR_CANCELED" ||
          err?.name === "CanceledError"
        ) {
          return;
        }

        console.error(
          "Employee loading error:",
          err
        );

        if (isMountedRef.current) {
          const errorMessage =
            await getHttpErrorMessage(
              err,
              "Unable to load employees"
            );

          setEmployees([]);
          setError(errorMessage);
        }
      } finally {
        if (isMountedRef.current) {
          setLoadingEmployees(false);
        }
      }
    };

    fetchEmployees();

    return () => {
      controller.abort();
    };
  }, []);


  // ======================================================
  // GENERATE PAYROLL
  // ======================================================

  const handleGeneratePayroll = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setMessage("");
    setError("");

    // Clear previous payroll
    setPayroll(null);

    // ------------------------------------------------------
    // VALIDATION
    // ------------------------------------------------------

    if (!employeeId) {
      setError("Please select an employee.");
      return;
    }

    if (!month) {
      setError("Please select a month.");
      return;
    }

    if (!year) {
      setError("Please select a year.");
      return;
    }

    const numericMonth = Number(month);
    const numericYear = Number(year);
    const numericEmployeeId = Number(employeeId);

    if (
      !Number.isInteger(numericEmployeeId) ||
      numericEmployeeId <= 0
    ) {
      setError("Invalid employee selected.");
      return;
    }

    if (
      !Number.isInteger(numericMonth) ||
      numericMonth < 1 ||
      numericMonth > 12
    ) {
      setError("Invalid month selected.");
      return;
    }

    if (
      !Number.isInteger(numericYear) ||
      numericYear < 2020 ||
      numericYear > 2100
    ) {
      setError("Please enter a valid year.");
      return;
    }

    // ------------------------------------------------------
    // API CALL
    //
    // Matches: POST /api/payrolls/generate
    //          ?employeeId=..&month=..&year=..
    // on PayrollController (@RequestMapping("/api/payrolls")).
    // ------------------------------------------------------

    try {
      setLoading(true);

      const response = await api.post(
  `/api/payrolls/generate/${numericEmployeeId}`,
  null,
  {
    params: {
      month: numericMonth,
      year: numericYear,
    },
  }
);

      if (!isMountedRef.current) {
        return;
      }

      // ----------------------------------------------------
      // SUCCESS
      // ----------------------------------------------------

      if (response.data) {
        setPayroll(response.data);

        setMessage(
          "Payroll generated successfully!"
        );
      } else {
        setError(
          "Payroll was generated but no data was returned."
        );
      }
    } catch (err) {
      console.error(
        "Payroll generation error:",
        err
      );

      // ----------------------------------------------------
      // IMPORTANT:
      // Display backend message and stay on Payroll page.
      // ----------------------------------------------------

      const errorMessage =
        await getHttpErrorMessage(
          err,
          "Failed to generate payroll."
        );

      if (!isMountedRef.current) {
        return;
      }

      setPayroll(null);
      setMessage("");
      setError(errorMessage);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };


  // ======================================================
  // VIEW PAYSLIP
  // ======================================================

  const viewPayslip = async () => {
    if (!payroll?.id) {
      setError("Generate payroll first.");
      return;
    }

    let url;

    try {
      setViewingPayslip(true);

      setMessage("");
      setError("");

      const response = await api.get(
        `/api/payrolls/${payroll.id}/payslip/view`,
        {
          responseType: "blob",
        }
      );

      if (!isMountedRef.current) {
        return;
      }

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      url = window.URL.createObjectURL(blob);

      const newWindow = window.open(url, "_blank");

      if (!newWindow) {
        setError(
          "Please allow pop-ups to view the payslip."
        );
      }
    } catch (err) {
      console.error(
        "View payslip error:",
        err
      );

      const errorMessage =
        await getHttpErrorMessage(
          err,
          "Failed to view payslip."
        );

      if (isMountedRef.current) {
        setError(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setViewingPayslip(false);
      }

      if (url) {
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 10000);
      }
    }
  };


  // ======================================================
  // DOWNLOAD PAYSLIP
  // ======================================================

  const downloadPayslip = async () => {
    if (!payroll?.id) {
      setError("Generate payroll first.");
      return;
    }

    let url;

    try {
      setDownloading(true);

      setMessage("");
      setError("");

      const response = await api.get(
        `/api/payrolls/${payroll.id}/payslip/download`,
        {
          responseType: "blob",
        }
      );

      if (!isMountedRef.current) {
        return;
      }

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      const employeeCode =
        payroll.employeeId ||
        payroll.id;

      link.download =
        `Payslip_${employeeCode}_${payroll.month}_${payroll.year}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      setMessage(
        "Payslip downloaded successfully!"
      );
    } catch (err) {
      console.error(
        "Download payslip error:",
        err
      );

      const errorMessage =
        await getHttpErrorMessage(
          err,
          "Failed to download payslip."
        );

      if (isMountedRef.current) {
        setError(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setDownloading(false);
      }

      if (url) {
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      }
    }
  };


  // ======================================================
  // SEND PAYSLIP EMAIL
  // ======================================================

  const sendPayslipEmail = async () => {
    if (!payroll?.id) {
      setError("Generate payroll first.");
      return;
    }

    try {
      setSendingEmail(true);

      setMessage("");
      setError("");

      await api.post(
        `/api/payslip-emails/send/${payroll.id}`
      );

      if (isMountedRef.current) {
        setMessage(
          "Payslip email sent successfully!"
        );
      }
    } catch (err) {
      console.error(
        "Email error:",
        err
      );

      const errorMessage =
        await getHttpErrorMessage(
          err,
          "Failed to send payslip email."
        );

      if (isMountedRef.current) {
        setError(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setSendingEmail(false);
      }
    }
  };


  // ======================================================
  // CLEAR ERROR
  // ======================================================

  const clearError = () => {
    setError("");
  };


  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="payroll-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="page-header">
        <div>
          <h2>Payroll</h2>

          <p>
            Generate and manage employee payroll
          </p>
        </div>
      </div>


      {/* ==================================================
          SUCCESS MESSAGE
      ================================================== */}

      {message && (
        <div className="success">
          <span>{message}</span>
        </div>
      )}


      {/* ==================================================
          ERROR MESSAGE
      ================================================== */}

      {error && (
        <div className="error">
          <span>{error}</span>

          <button
            type="button"
            onClick={clearError}
            className="error-close"
          >
            ×
          </button>
        </div>
      )}


      {/* ==================================================
          GENERATE PAYROLL CARD
      ================================================== */}

      <div className="card">

        <h3>
          Generate Payroll
        </h3>

        <form
          onSubmit={handleGeneratePayroll}
          className="payroll-form"
        >

          {/* EMPLOYEE */}

          <div className="field">

            <label>
              Employee
            </label>

            <select
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setError("");
                setMessage("");
              }}
              disabled={
                loadingEmployees ||
                loading
              }
              required
            >

              <option value="">
                {loadingEmployees
                  ? "Loading employees..."
                  : "Select employee"}
              </option>

              {employees.map((employee) => (
                <option
                  key={employee.id}
                  value={employee.id}
                >
                  {employee.name}
                  {" - "}
                  {employee.employeeCode}
                </option>
              ))}

            </select>

          </div>


          {/* MONTH */}

          <div className="field">

            <label>
              Month
            </label>

            <select
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                setError("");
                setMessage("");
              }}
              disabled={loading}
              required
            >

              <option value="">
                Select month
              </option>

              {MONTHS.map((m) => (
                <option
                  key={m.value}
                  value={m.value}
                >
                  {m.label}
                </option>
              ))}

            </select>

          </div>


          {/* YEAR */}

          <div className="field">

            <label>
              Year
            </label>

            <input
              type="number"
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setError("");
                setMessage("");
              }}
              placeholder="2026"
              min="2020"
              max="2100"
              disabled={loading}
              required
            />

          </div>


          {/* GENERATE */}

          <button
            type="submit"
            className="add-button"
            disabled={
              loading ||
              loadingEmployees
            }
          >
            {loading
              ? "Generating..."
              : "Generate Payroll"}
          </button>

        </form>

      </div>


      {/* ==================================================
          PAYROLL RESULT
      ================================================== */}

      {payroll && (
        <div className="card payroll-result">

          <h3>
            Payroll Details
          </h3>


          {/* META */}

          <div className="payroll-meta">

            <div>
              <span className="meta-label">
                Employee
              </span>

              <strong>
                {payroll.employeeName ||
                  "Unknown"}
              </strong>
            </div>


            <div>
              <span className="meta-label">
                Employee ID
              </span>

              <strong>
                {payroll.employeeId ||
                  "-"}
              </strong>
            </div>


            <div>
              <span className="meta-label">
                Period
              </span>

              <strong>
                {getMonthName(payroll.month)}
                {" "}
                {payroll.year}
              </strong>
            </div>


            <div>
              <span className="meta-label">
                Payroll ID
              </span>

              <strong>
                {payroll.id}
              </strong>
            </div>

          </div>


          {/* ==================================================
              BREAKDOWN
          ================================================== */}

          <div className="payroll-breakdown">

            {/* EARNINGS */}

            <div className="breakdown-column">

              <h4>
                Earnings
              </h4>


              <div className="breakdown-row">
                <span>
                  Basic Salary
                </span>

                <span>
                  {formatAmount(
                    payroll.basicSalary
                  )}
                </span>
              </div>


              <div className="breakdown-row">
                <span>
                  HRA
                </span>

                <span>
                  {formatAmount(
                    payroll.hra
                  )}
                </span>
              </div>


              <div className="breakdown-row">
                <span>
                  Special Allowance
                </span>

                <span>
                  {formatAmount(
                    payroll.specialAllowance
                  )}
                </span>
              </div>


              <div className="breakdown-row breakdown-total">

                <span>
                  Gross Salary
                </span>

                <span>
                  {formatAmount(
                    payroll.grossSalary
                  )}
                </span>

              </div>

            </div>


            {/* DEDUCTIONS */}

            <div className="breakdown-column">

              <h4>
                Deductions
              </h4>


              <div className="breakdown-row">

                <span>
                  LOP Deduction
                </span>

                <span>
                  {formatAmount(
                    payroll.deductions
                  )}
                </span>

              </div>


              <div className="breakdown-row">

                <span>
                  PF
                </span>

                <span>
                  {formatAmount(
                    payroll.pf
                  )}
                </span>

              </div>


              <div className="breakdown-row">

                <span>
                  ESI
                </span>

                <span>
                  {formatAmount(
                    payroll.esi
                  )}
                </span>

              </div>


              <div className="breakdown-row">

                <span>
                  Professional Tax
                </span>

                <span>
                  {formatAmount(
                    payroll.professionalTax
                  )}
                </span>

              </div>


              <div className="breakdown-row breakdown-total">

                <span>
                  Total Deductions
                </span>

                <span>
                  {formatAmount(
                    payroll.totalDeductions
                  )}
                </span>

              </div>

            </div>

          </div>


          {/* ==================================================
              NET SALARY
          ================================================== */}

          <div className="net-salary-banner">

            <span>
              Net Salary
            </span>

            <strong>
              {formatAmount(
                payroll.netSalary
              )}
            </strong>

          </div>


          {/* ==================================================
              PAYSLIP ACTIONS
          ================================================== */}

          <div className="payslip-actions">

            {/* VIEW */}

            <button
              type="button"
              className="action-button action-view"
              onClick={viewPayslip}
              disabled={actionsBusy}
            >
              {viewingPayslip
                ? "Opening..."
                : "View Payslip"}
            </button>


            {/* DOWNLOAD */}

            <button
              type="button"
              className="action-button action-download"
              onClick={downloadPayslip}
              disabled={actionsBusy}
            >
              {downloading
                ? "Downloading..."
                : "Download Payslip"}
            </button>


            {/* EMAIL */}

            <button
              type="button"
              className="action-button action-email"
              onClick={sendPayslipEmail}
              disabled={actionsBusy}
            >
              {sendingEmail
                ? "Sending..."
                : "Send Payslip Email"}
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default Payroll;
