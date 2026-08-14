import { useEffect, useState } from "react";
import api from "./api";
import "./EmployeeSalary.css";

function getErrorMessage(err) {
  if (!err) {
    return "Something went wrong";
  }

  if (typeof err === "string") {
    return err;
  }

  if (err.message) {
    return err.message;
  }

  return "Unknown error";
}

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

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/employees");
      setEmployees(response.data || []);
    } catch (err) {
      console.error("Employee loading error:", err);
      setError(err.response?.data?.message || "Unable to load employees");
    }
  };

  const fetchSalaryStructures = async () => {
    try {
      const response = await api.get("/salary-structures");
      setSalaryStructures(response.data || []);
    } catch (err) {
      console.error("Salary structure loading error:", err);
      setError(err.response?.data?.message || "Unable to load salary structures");
    }
  };

  const fetchEmployeeSalaries = async () => {
    try {
      const response = await api.get("/employee-salary");
      setEmployeeSalaries(response.data || []);
    } catch (err) {
      console.error("Employee salary loading error:", err);
      setError(err.response?.data?.message || "Unable to load employee salaries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      await Promise.all([fetchEmployees(), fetchSalaryStructures(), fetchEmployeeSalaries()]);

      setLoading(false);
    };

    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!employeeId) {
      setError("Please select an employee");
      return;
    }

    if (!salaryStructureId) {
      setError("Please select a salary structure");
      return;
    }

    if (!effectiveFrom) {
      setError("Please select effective date");
      return;
    }

    try {
      await api.post(`/employee-salary/${employeeId}/${salaryStructureId}`, null, {
        params: { effectiveFrom },
      });

      setMessage("Salary assigned successfully!");

      setEmployeeId("");
      setSalaryStructureId("");
      setEffectiveFrom("");

      await fetchEmployeeSalaries();
    } catch (err) {
      console.error("Assign salary error:", err);
      setError(err.response?.data?.message || err.response?.data || "Failed to assign salary");
    }
  };

  return (
    <div className="employee-salary">
      <div className="page-header">
        <div>
          <h2>Employee Salary</h2>
          <p>Assign salary structures to employees</p>
        </div>
      </div>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{getErrorMessage(error)}</div>}

      <div className="card">
        <h3>Assign Salary</h3>

        <form onSubmit={handleSubmit} className="salary-form">
          <div className="field">
            <label>Employee</label>
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required>
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.employeeCode}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Salary Structure</label>
            <select
              value={salaryStructureId}
              onChange={(e) => setSalaryStructureId(e.target.value)}
              required
            >
              <option value="">Select salary structure</option>
              {salaryStructures.map((salary) => (
                <option key={salary.id} value={salary.id}>
                  {salary.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Effective From</label>
            <input
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="add-button">
            Assign Salary
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Assigned Salaries</h3>

        {loading ? (
          <div className="empty-state">Loading employee salaries...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee</th>
                  <th>Salary Structure</th>
                  <th>Effective From</th>
                  <th>Effective To</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {employeeSalaries.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty">
                      No salary assignments found
                    </td>
                  </tr>
                ) : (
                  employeeSalaries.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.employee?.name || item.employee?.employeeCode || "Unknown"}</td>
                      <td>{item.salaryStructure?.name || "Unknown"}</td>
                      <td>{item.effectiveFrom || "-"}</td>
                      <td>{item.effectiveTo || "-"}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            item.effectiveTo ? "badge-inactive" : "badge-active"
                          }`}
                        >
                          {item.effectiveTo ? "Inactive" : "Active"}
                        </span>
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

export default EmployeeSalary;
