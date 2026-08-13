
import { useEffect, useState } from "react";
import api from "./axiosConfig";

function Payroll() {

  // =====================================================
  // STATE
  // =====================================================

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


  // =====================================================
  // LOAD EMPLOYEES
  // =====================================================

  useEffect(() => {

    const fetchEmployees = async () => {

      try {

        setLoadingEmployees(true);

        const response = await api.get(
          "/api/employees"
        );

        setEmployees(response.data);

      } catch (err) {

        console.error(
          "Employee loading error:",
          err
        );

        if (err.response?.status === 401) {

          setError(
            "Session expired. Please login again."
          );

        } else if (err.response?.status === 403) {

          setError(
            "You do not have permission to view employees."
          );

        } else {

          setError(
            "Unable to load employees"
          );

        }

      } finally {

        setLoadingEmployees(false);

      }

    };

    fetchEmployees();

  }, []);


  // =====================================================
  // GENERATE PAYROLL
  // =====================================================

  const handleGeneratePayroll = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");
    setPayroll(null);


    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!employeeId) {

      setError(
        "Please select an employee"
      );

      return;

    }


    if (!month) {

      setError(
        "Please select a month"
      );

      return;

    }


    if (!year) {

      setError(
        "Please select a year"
      );

      return;

    }


    // -----------------------------------------------------
    // API CALL
    // -----------------------------------------------------

    try {

      setLoading(true);

      const response = await api.post(
        `/api/payroll/generate/${employeeId}`,
        null,
        {
          params: {
            month: month,
            year: year
          }
        }
      );


      console.log(
        "Payroll response:",
        response.data
      );


      setPayroll(
        response.data
      );


      setMessage(
        "Payroll generated successfully!"
      );


    } catch (err) {

      console.error(
        "Payroll generation error:",
        err
      );


      if (err.response?.status === 401) {

        setError(
          "Session expired. Please login again."
        );

      } else if (err.response?.status === 403) {

        setError(
          "You do not have permission to generate payroll."
        );

      } else {

        setError(
          err.response?.data?.message ||
          err.response?.data ||
          "Failed to generate payroll"
        );

      }

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // VIEW PAYSLIP
  // =====================================================

  const viewPayslip = async () => {

    if (!payroll?.id) {

      setError(
        "Generate payroll first"
      );

      return;

    }


    try {

      setViewingPayslip(true);

      setMessage("");
      setError("");


      const response = await api.get(
        `/api/payroll/${payroll.id}/payslip/view`,
        {
          responseType: "blob"
        }
      );


      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf"
        }
      );


      const url =
        window.URL.createObjectURL(blob);


      window.open(
        url,
        "_blank"
      );


      // Give browser time to open the PDF
      setTimeout(() => {

        window.URL.revokeObjectURL(url);

      }, 10000);


    } catch (err) {

      console.error(
        "View payslip error:",
        err
      );


      if (err.response?.status === 401) {

        setError(
          "Session expired. Please login again."
        );

      } else if (err.response?.status === 403) {

        setError(
          "You do not have permission to view this payslip."
        );

      } else {

        setError(
          "Failed to view payslip"
        );

      }

    } finally {

      setViewingPayslip(false);

    }

  };


  // =====================================================
  // DOWNLOAD PAYSLIP
  // =====================================================

  const downloadPayslip = async () => {

    if (!payroll?.id) {

      setError(
        "Generate payroll first"
      );

      return;

    }


    try {

      setDownloading(true);

      setMessage("");
      setError("");


      const response = await api.get(
        `/api/payroll/${payroll.id}/payslip/download`,
        {
          responseType: "blob"
        }
      );


      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf"
        }
      );


      const url =
        window.URL.createObjectURL(blob);


      const link =
        document.createElement("a");


      link.href = url;


      link.download =
        `Payslip_${payroll.employee?.employeeCode || payroll.employeeId || payroll.id}_${payroll.month}_${payroll.year}.pdf`;


      document.body.appendChild(link);

      link.click();

      link.remove();


      window.URL.revokeObjectURL(url);


      setMessage(
        "Payslip downloaded successfully!"
      );


    } catch (err) {

      console.error(
        "Download payslip error:",
        err
      );


      if (err.response?.status === 401) {

        setError(
          "Session expired. Please login again."
        );

      } else if (err.response?.status === 403) {

        setError(
          "You do not have permission to download this payslip."
        );

      } else {

        setError(
          "Failed to download payslip"
        );

      }

    } finally {

      setDownloading(false);

    }

  };


  // =====================================================
  // SEND PAYSLIP EMAIL
  // =====================================================

  const sendPayslipEmail = async () => {

    if (!payroll?.id) {

      setError(
        "Generate payroll first"
      );

      return;

    }


    try {

      setSendingEmail(true);

      setMessage("");
      setError("");


      const response = await api.post(
        `/api/payslip-emails/send/${payroll.id}`
      );


      console.log(
        "Email response:",
        response.data
      );


      setMessage(
        "Payslip email sent successfully!"
      );


    } catch (err) {

      console.error(
        "Email error:",
        err
      );


      if (err.response?.status === 401) {

        setError(
          "Session expired. Please login again."
        );

      } else if (err.response?.status === 403) {

        setError(
          "You do not have permission to send payslip emails."
        );

      } else {

        setError(
          err.response?.data?.message ||
          err.response?.data ||
          "Failed to send payslip email"
        );

      }

    } finally {

      setSendingEmail(false);

    }

  };


  // =====================================================
  // FORMAT AMOUNT
  // =====================================================

  const formatAmount = (amount) => {

    if (
      amount === null ||
      amount === undefined
    ) {

      return "₹ 0.00";

    }


    return `₹ ${Number(amount).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )}`;

  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="payroll-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header">

        <div>

          <h2>
            Payroll
          </h2>

          <p>
            Generate and manage employee payroll
          </p>

        </div>

      </div>


      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {message && (

        <div className="success">
          {message}
        </div>

      )}


      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (

        <div className="error">
          {error}
        </div>

      )}


      {/* =================================================
          GENERATE PAYROLL FORM
      ================================================= */}

      <div className="add-employee">

        <h3>
          Generate Payroll
        </h3>


        <form
          onSubmit={handleGeneratePayroll}
        >


          {/* EMPLOYEE */}

          <label>
            Employee
          </label>


          <select
            value={employeeId}
            onChange={(e) =>
              setEmployeeId(
                e.target.value
              )
            }
            disabled={loadingEmployees}
            required
          >

            <option value="">

              {loadingEmployees
                ? "Loading employees..."
                : "Select Employee"}

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


          {/* MONTH */}

          <label>
            Month
          </label>


          <select
            value={month}
            onChange={(e) =>
              setMonth(
                e.target.value
              )
            }
            required
          >

            <option value="">
              Select Month
            </option>

            <option value="1">
              January
            </option>

            <option value="2">
              February
            </option>

            <option value="3">
              March
            </option>

            <option value="4">
              April
            </option>

            <option value="5">
              May
            </option>

            <option value="6">
              June
            </option>

            <option value="7">
              July
            </option>

            <option value="8">
              August
            </option>

            <option value="9">
              September
            </option>

            <option value="10">
              October
            </option>

            <option value="11">
              November
            </option>

            <option value="12">
              December
            </option>

          </select>


          {/* YEAR */}

          <label>
            Year
          </label>


          <input
            type="number"
            value={year}
            onChange={(e) =>
              setYear(
                e.target.value
              )
            }
            placeholder="2026"
            min="2020"
            max="2100"
            required
          />


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


      {/* =================================================
          PAYROLL RESULT
      ================================================= */}

      {payroll && (

        <div className="payroll-result">

          <h3>
            Payroll Details
          </h3>


          <div className="table-container">

            <table>

              <tbody>

                <tr>

                  <th>
                    Payroll ID
                  </th>

                  <td>
                    {payroll.id}
                  </td>

                </tr>


                <tr>

                  <th>
                    Employee
                  </th>

                  <td>
                    {payroll.employee?.name ||
                      "Unknown"}
                  </td>

                </tr>


                <tr>

                  <th>
                    Employee Code
                  </th>

                  <td>
                    {payroll.employee?.employeeCode ||
                      payroll.employeeId ||
                      "-"}
                  </td>

                </tr>


                <tr>

                  <th>
                    Month
                  </th>

                  <td>
                    {payroll.month}
                  </td>

                </tr>


                <tr>

                  <th>
                    Year
                  </th>

                  <td>
                    {payroll.year}
                  </td>

                </tr>


                <tr>

                  <th>
                    Basic Salary
                  </th>

                  <td>
                    {formatAmount(
                      payroll.basicSalary
                    )}
                  </td>

                </tr>


                <tr>

                  <th>
                    HRA
                  </th>

                  <td>
                    {formatAmount(
                      payroll.hra
                    )}
                  </td>

                </tr>


                <tr>

                  <th>
                    Special Allowance
                  </th>

                  <td>
                    {formatAmount(
                      payroll.specialAllowance
                    )}
                  </td>

                </tr>


                <tr>

                  <th>
                    Gross Salary
                  </th>

                  <td>
                    {formatAmount(
                      payroll.grossSalary
                    )}
                  </td>

                </tr>


                <tr>

                  <th>
                    LOP Deduction
                  </th>

                  <td>
                    {formatAmount(
                      payroll.deductions
                    )}
                  </td>

                </tr>


                <tr>

                  <th>
                    PF
                  </th>

                  <td>
                    {formatAmount(
                      payroll.pf
                    )}
                  </td>

                </tr>


                <tr>

                  <th>
                    ESI
                  </th>

                  <td>
                    {formatAmount(
                      payroll.esi
                    )}
                  </td>

                </tr>


                <tr>

                  <th>
                    Professional Tax
                  </th>

                  <td>
                    {formatAmount(
                      payroll.professionalTax
                    )}
                  </td>

                </tr>


                <tr>

                  <th>
                    Total Deductions
                  </th>

                  <td>
                    {formatAmount(
                      payroll.totalDeductions
                    )}
                  </td>

                </tr>


                <tr>

                  <th>
                    Net Salary
                  </th>

                  <td>

                    <strong>
                      {formatAmount(
                        payroll.netSalary
                      )}
                    </strong>

                  </td>

                </tr>

              </tbody>

            </table>

          </div>


          {/* =================================================
              PAYSLIP ACTIONS
          ================================================= */}

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "20px",
              flexWrap: "wrap"
            }}
          >


            {/* VIEW */}

            <button
              className="add-button"
              onClick={viewPayslip}
              disabled={
                viewingPayslip ||
                downloading ||
                sendingEmail
              }
            >

              {viewingPayslip
                ? "Opening..."
                : "👁️ View Payslip"}

            </button>


            {/* DOWNLOAD */}

            <button
              className="add-button"
              onClick={downloadPayslip}
              disabled={
                downloading ||
                viewingPayslip ||
                sendingEmail
              }
              style={{
                backgroundColor:
                  downloading
                    ? "#9ca3af"
                    : "#2563eb"
              }}
            >

              {downloading
                ? "Downloading..."
                : "📥 Download Payslip"}

            </button>


            {/* EMAIL */}

            <button
              className="add-button"
              onClick={sendPayslipEmail}
              disabled={
                sendingEmail ||
                downloading ||
                viewingPayslip
              }
              style={{
                backgroundColor:
                  sendingEmail
                    ? "#9ca3af"
                    : "#16a34a"
              }}
            >

              {sendingEmail
                ? "Sending..."
                : "📧 Send Payslip Email"}

            </button>

          </div>

        </div>

      )}

    </div>

  );

}

export default Payroll;
