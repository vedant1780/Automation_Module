
import { useEffect, useState } from "react";
import axios from "axios";

function AddEmployee({
  onEmployeeAdded,
  editingEmployee,
  onEditComplete
}) {

  const emptyEmployee = {
    employeeCode: "",
    name: "",
    email: "",
    department: "",
    designation: "",
    password: "",
    role: ""
  };

  const [employee, setEmployee] = useState(emptyEmployee);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  // =====================================================
  // LOAD EMPLOYEE DATA WHEN EDIT IS CLICKED
  // =====================================================

  useEffect(() => {

    if (editingEmployee) {

      setEmployee({
        employeeCode: editingEmployee.employeeCode || "",
        name: editingEmployee.name || "",
        email: editingEmployee.email || "",
        department: editingEmployee.department || "",
        designation: editingEmployee.designation || "",
        password: editingEmployee.password || "",
        role: editingEmployee.role || ""
      });

      setMessage("");
      setError("");
    }

  }, [editingEmployee]);


  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setEmployee({
      ...employee,
      [name]: value
    });

  };


  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");

    try {

      // =================================================
      // EDIT EMPLOYEE
      // =================================================

      if (editingEmployee) {

        const response = await axios.put(
          `http://localhost:8080/api/employees/${editingEmployee.id}`,
          employee
        );

        console.log(
          "Employee updated:",
          response.data
        );

        setMessage("Employee updated successfully!");


        // Refresh employee table

        if (onEmployeeAdded) {
          await onEmployeeAdded();
        }


        // Close edit mode

        if (onEditComplete) {
          onEditComplete();
        }

      }

      // =================================================
      // ADD EMPLOYEE
      // =================================================

      else {

        const response = await axios.post(
          "http://localhost:8080/api/employees",
          employee
        );

        console.log(
          "Employee created:",
          response.data
        );

        setMessage("Employee added successfully!");


        // Clear form

        setEmployee(emptyEmployee);


        // Refresh employee table

        if (onEmployeeAdded) {
          await onEmployeeAdded();
        }

      }

    } catch (err) {

      console.error(
        "Employee operation failed:",
        err
      );

      setError(
        editingEmployee
          ? "Failed to update employee"
          : "Failed to add employee"
      );

    }

  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="add-employee">

      <h3>

        {editingEmployee
          ? "Edit Employee"
          : "Add Employee"}

      </h3>


      {/* SUCCESS MESSAGE */}

      {message && (

        <div className="success">

          {message}

        </div>

      )}


      {/* ERROR MESSAGE */}

      {error && (

        <div className="error">

          {error}

        </div>

      )}


      <form onSubmit={handleSubmit}>


        {/* EMPLOYEE CODE */}

        <input
          type="text"
          name="employeeCode"
          placeholder="Employee Code"
          value={employee.employeeCode}
          onChange={handleChange}
          required
        />


        {/* NAME */}

        <input
          type="text"
          name="name"
          placeholder="Employee Name"
          value={employee.name}
          onChange={handleChange}
          required
        />


        {/* EMAIL */}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={employee.email}
          onChange={handleChange}
          required
        />


        {/* DEPARTMENT */}

        <input
          type="text"
          name="department"
          placeholder="Department"
          value={employee.department}
          onChange={handleChange}
        />


        {/* DESIGNATION */}

        <input
          type="text"
          name="designation"
          placeholder="Designation"
          value={employee.designation}
          onChange={handleChange}
        />


        {/* PASSWORD */}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={employee.password}
          onChange={handleChange}
        />


        {/* ROLE */}

        <input
          type="text"
          name="role"
          placeholder="Role"
          value={employee.role}
          onChange={handleChange}
        />


        {/* SUBMIT */}

        <button
          type="submit"
          className="add-button"
        >

          {editingEmployee
            ? "Update Employee"
            : "Add Employee"}

        </button>


        {/* CANCEL EDIT */}

        {editingEmployee && (

          <button
            type="button"
            className="delete-button"
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

      </form>

    </div>

  );
}


export default AddEmployee;

