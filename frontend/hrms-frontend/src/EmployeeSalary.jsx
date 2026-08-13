
import { useEffect, useState } from "react";
import api from "./axiosConfig";

function EmployeeSalary() {

  const [employees, setEmployees] = useState([]);
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [employeeSalaries, setEmployeeSalaries] = useState([]);

  const [employeeId, setEmployeeId] = useState("");
  const [salaryStructureId, setSalaryStructureId] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  // =====================================================
  // LOAD EMPLOYEES
  // =====================================================

  const fetchEmployees = async () => {

    try {

      const response = await api.get(
        "/api/employees"
      );

      setEmployees(response.data);

    } catch (err) {

      console.error(
        "Employee loading error:",
        err
      );

      setError(
        "Unable to load employees"
      );

    }
  };


  // =====================================================
  // LOAD SALARY STRUCTURES
  // =====================================================

  const fetchSalaryStructures = async () => {

    try {

      const response = await api.get(
        "/api/salary-structures"
      );

      setSalaryStructures(response.data);

    } catch (err) {

      console.error(
        "Salary structure loading error:",
        err
      );

      setError(
        "Unable to load salary structures"
      );

    }
  };


  // =====================================================
  // LOAD EMPLOYEE SALARIES
  // =====================================================

  const fetchEmployeeSalaries = async () => {

    try {

      const response = await api.get(
        "/api/employee-salary"
      );

      console.log(
        "Employee salaries:",
        response.data
      );

      setEmployeeSalaries(
        response.data
      );

    } catch (err) {

      console.error(
        "Employee salary loading error:",
        err
      );

      if (err.response?.status === 403) {

        setError(
          "Access denied. Please login again."
        );

      } else if (err.response?.status === 401) {

        setError(
          "Session expired. Please login again."
        );

      } else {

        setError(
          "Unable to load employee salaries"
        );

      }

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // LOAD ALL DATA
  // =====================================================

  useEffect(() => {

    const loadData = async () => {

      setLoading(true);
      setError("");

      await Promise.all([
        fetchEmployees(),
        fetchSalaryStructures(),
        fetchEmployeeSalaries()
      ]);

    };

    loadData();

  }, []);


  // =====================================================
  // ASSIGN SALARY
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");


    if (!employeeId) {

      setError(
        "Please select an employee"
      );

      return;

    }


    if (!salaryStructureId) {

      setError(
        "Please select a salary structure"
      );

      return;

    }


    if (!effectiveFrom) {

      setError(
        "Please select effective date"
      );

      return;

    }


    try {

      await api.post(
        `/api/employee-salary/${employeeId}/${salaryStructureId}`,
        null,
        {
          params: {
            effectiveFrom: effectiveFrom
          }
        }
      );


      setMessage(
        "Salary assigned successfully!"
      );


      // Clear form

      setEmployeeId("");
      setSalaryStructureId("");
      setEffectiveFrom("");


      // Refresh assigned salaries

      await fetchEmployeeSalaries();


    } catch (err) {

      console.error(
        "Assign salary error:",
        err
      );

      if (err.response?.status === 403) {

        setError(
          "You do not have permission to assign salary."
        );

      } else if (err.response?.status === 401) {

        setError(
          "Session expired. Please login again."
        );

      } else {

        setError(
          err.response?.data?.message ||
          err.response?.data ||
          "Failed to assign salary"
        );

      }

    }

  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="employee-salary">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header">

        <div>

          <h2>
            Employee Salary
          </h2>

          <p>
            Assign salary structures to employees
          </p>

        </div>

      </div>


      {/* =================================================
          MESSAGE
      ================================================= */}

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


      {/* =================================================
          ASSIGN SALARY FORM
      ================================================= */}

      <div className="add-employee">

        <h3>
          Assign Salary
        </h3>


        <form onSubmit={handleSubmit}>


          {/* EMPLOYEE */}

          <label>
            Employee
          </label>

          <select
            value={employeeId}
            onChange={(e) =>
              setEmployeeId(e.target.value)
            }
            required
          >

            <option value="">
              Select Employee
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


          {/* SALARY STRUCTURE */}

          <label>
            Salary Structure
          </label>

          <select
            value={salaryStructureId}
            onChange={(e) =>
              setSalaryStructureId(
                e.target.value
              )
            }
            required
          >

            <option value="">
              Select Salary Structure
            </option>

            {salaryStructures.map((salary) => (

              <option
                key={salary.id}
                value={salary.id}
              >

                {salary.name}

              </option>

            ))}

          </select>


          {/* EFFECTIVE FROM */}

          <label>
            Effective From
          </label>

          <input
            type="date"
            value={effectiveFrom}
            onChange={(e) =>
              setEffectiveFrom(
                e.target.value
              )
            }
            required
          />


          {/* SUBMIT */}

          <button
            type="submit"
            className="add-button"
          >

            Assign Salary

          </button>

        </form>

      </div>


      {/* =================================================
          ASSIGNED SALARIES
      ================================================= */}

      <h3>
        Assigned Salaries
      </h3>


      {loading ? (

        <div className="message">
          Loading...
        </div>

      ) : (

        <div className="table-container">

          <table>

            <thead>

              <tr>

                <th>
                  ID
                </th>

                <th>
                  Employee
                </th>

                <th>
                  Salary Structure
                </th>

                <th>
                  Effective From
                </th>

                <th>
                  Effective To
                </th>

              </tr>

            </thead>


            <tbody>

              {employeeSalaries.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="empty"
                  >

                    No salary assignments found

                  </td>

                </tr>

              ) : (

                employeeSalaries.map((item) => (

                  <tr
                    key={item.id}
                  >

                    <td>
                      {item.id}
                    </td>

                    <td>
                      {item.employee?.name ||
                        "Unknown"}
                    </td>

                    <td>
                      {item.salaryStructure?.name ||
                        "Unknown"}
                    </td>

                    <td>
                      {item.effectiveFrom ||
                        "-"}
                    </td>

                    <td>
                      {item.effectiveTo ||
                        "-"}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

}

export default EmployeeSalary;
