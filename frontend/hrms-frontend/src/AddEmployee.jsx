import { useEffect, useState } from "react";
import axios from "axios";
import "./AddEmployee.css";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "HR", label: "HR" },
  { value: "EMPLOYEE", label: "Employee" },
];

const emptyEmployee = {
  employeeCode: "",
  name: "",
  email: "",
  department: "",
  designation: "",
  password: "",
  role: "",
};

function AddEmployee({ onEmployeeAdded, editingEmployee, onEditComplete }) {
  const [employee, setEmployee] = useState(emptyEmployee);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load employee data when edit is clicked.
  // Password is intentionally left blank — we never show or resend
  // the existing password. It's only updated if the admin types a new one.
  useEffect(() => {
    if (editingEmployee) {
      setEmployee({
        employeeCode: editingEmployee.employeeCode || "",
        name: editingEmployee.name || "",
        email: editingEmployee.email || "",
        department: editingEmployee.department || "",
        designation: editingEmployee.designation || "",
        password: "",
        role: editingEmployee.role || "",
      });

      setMessage("");
      setError("");
    }
  }, [editingEmployee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee({ ...employee, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      if (editingEmployee) {
        // Only send the password if the admin actually typed a new one.
        const payload = { ...employee };
        if (!payload.password) {
          delete payload.password;
        }

        const response = await axios.put(
          `http://localhost:8080/api/employees/${editingEmployee.id}`,
          payload
        );

        console.log("Employee updated:", response.data);
        setMessage("Employee updated successfully!");

        if (onEmployeeAdded) {
          await onEmployeeAdded();
        }

        if (onEditComplete) {
          onEditComplete();
        }
      } else {
        const response = await axios.post("http://localhost:8080/api/employees", employee);

        console.log("Employee created:", response.data);
        setMessage("Employee added successfully!");

        setEmployee(emptyEmployee);

        if (onEmployeeAdded) {
          await onEmployeeAdded();
        }
      }
    } catch (err) {
      console.error("Employee operation failed:", err);
      setError(editingEmployee ? "Failed to update employee" : "Failed to add employee");
    }
  };

  return (
    <div className="card">
      <h3>{editingEmployee ? "Edit Employee" : "Add Employee"}</h3>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="employee-form">
        <div className="field">
          <label>Employee Code</label>
          <input
            type="text"
            name="employeeCode"
            placeholder="e.g. EMP001"
            value={employee.employeeCode}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label>Name</label>
          <input
            type="text"
            name="name"
            placeholder="Employee name"
            value={employee.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="name@company.com"
            value={employee.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label>Department</label>
          <input
            type="text"
            name="department"
            placeholder="e.g. Engineering"
            value={employee.department}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Designation</label>
          <input
            type="text"
            name="designation"
            placeholder="e.g. Software Engineer"
            value={employee.designation}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Role</label>
          <select name="role" value={employee.role} onChange={handleChange} required>
            <option value="">Select role</option>
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder={editingEmployee ? "Leave blank to keep current password" : "Set a password"}
            value={employee.password}
            onChange={handleChange}
            required={!editingEmployee}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="add-button">
            {editingEmployee ? "Update Employee" : "Add Employee"}
          </button>

          {editingEmployee && (
            <button
              type="button"
              className="cancel-button"
              onClick={() => {
                setEmployee(emptyEmployee);
                if (onEditComplete) {
                  onEditComplete();
                }
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default AddEmployee;
