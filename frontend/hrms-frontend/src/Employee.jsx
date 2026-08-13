
import { useEffect, useState } from "react";
import api from "./axiosConfig";
import AddEmployee from "./AddEmployee";

function Employee() {

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);


  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const role = user.role?.toUpperCase();


  // =====================================================
  // ROLE PERMISSIONS
  // =====================================================

  const canAdd =
    role === "ADMIN" ||
    role === "HR";

  const canEdit =
    role === "ADMIN" ||
    role === "HR";

  const canDelete =
    role === "ADMIN";


  // =====================================================
  // GET ALL EMPLOYEES
  // =====================================================

  const fetchEmployees = async () => {

    try {

      setLoading(true);

      const response = await api.get(
        "/api/employees"
      );

      setEmployees(response.data);
      setError("");

    } catch (err) {

      console.error("Error loading employees:", err);

      if (err.response?.status === 401) {

        setError(
          "Your session has expired. Please login again."
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

      setLoading(false);

    }
  };


  // =====================================================
  // LOAD EMPLOYEES
  // =====================================================

  useEffect(() => {

    fetchEmployees();

  }, []);


  // =====================================================
  // DELETE EMPLOYEE
  // =====================================================

  const deleteEmployee = async (id) => {

    if (!canDelete) {

      alert(
        "You do not have permission to delete employees."
      );

      return;
    }


    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete) {
      return;
    }


    try {

      await api.delete(
        `/api/employees/${id}`
      );

      alert(
        "Employee deleted successfully"
      );

      fetchEmployees();

    } catch (err) {

      console.error(
        "Error deleting employee:",
        err
      );

      if (err.response?.status === 403) {

        alert(
          "You do not have permission to delete employees."
        );

      } else {

        alert(
          "Unable to delete employee. " +
          "The employee may have related records."
        );

      }

    }
  };


  // =====================================================
  // ADD EMPLOYEE
  // =====================================================

  const openAddForm = () => {

    if (!canAdd) {

      alert(
        "You do not have permission to add employees."
      );

      return;
    }

    setEditingEmployee(null);
    setShowForm(true);

  };


  // =====================================================
  // EDIT EMPLOYEE
  // =====================================================

  const openEditForm = (employee) => {

    if (!canEdit) {

      alert(
        "You do not have permission to edit employees."
      );

      return;
    }

    setEditingEmployee(employee);
    setShowForm(true);

  };


  // =====================================================
  // CLOSE FORM
  // =====================================================

  const closeForm = () => {

    setShowForm(false);
    setEditingEmployee(null);

  };


  // =====================================================
  // AFTER EMPLOYEE SAVED
  // =====================================================

  const handleEmployeeSaved = () => {

    fetchEmployees();
    closeForm();

  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div>

      {/* ================================================= */}
      {/* PAGE HEADER */}
      {/* ================================================= */}

      <div className="page-header">

        <div>

          <h2>
            Employees
          </h2>

          <p>
            Manage your employees
          </p>

        </div>


        {/* ================================================= */}
        {/* ADD BUTTON */}
        {/* ================================================= */}

        {canAdd && (

          <button
            className="add-button"
            onClick={() => {

              if (showForm) {

                closeForm();

              } else {

                openAddForm();

              }

            }}
          >

            {showForm
              ? "Close"
              : "+ Add Employee"}

          </button>

        )}

      </div>


      {/* ================================================= */}
      {/* ADD / EDIT FORM */}
      {/* ================================================= */}

      {showForm && canAdd && (

        <AddEmployee
          onEmployeeAdded={handleEmployeeSaved}
          editingEmployee={editingEmployee}
          onEditComplete={handleEmployeeSaved}
        />

      )}


      {/* ================================================= */}
      {/* CURRENT ROLE */}
      {/* ================================================= */}

      <div className="message">

        Logged in as:{" "}

        <strong>
          {role || "USER"}
        </strong>

      </div>


      {/* ================================================= */}
      {/* LOADING */}
      {/* ================================================= */}

      {loading && (

        <div className="message">

          Loading employees...

        </div>

      )}


      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (

        <div className="error">

          {error}

        </div>

      )}


      {/* ================================================= */}
      {/* EMPLOYEE TABLE */}
      {/* ================================================= */}

      {!loading && !error && (

        <div className="table-container">

          <table>

            <thead>

              <tr>

                <th>
                  ID
                </th>

                <th>
                  Employee Code
                </th>

                <th>
                  Name
                </th>

                <th>
                  Email
                </th>

                <th>
                  Department
                </th>

                <th>
                  Designation
                </th>

                <th>
                  Role
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {employees.length === 0 ? (

                <tr>

                  <td
                    colSpan="8"
                    className="empty"
                  >

                    No employees found

                  </td>

                </tr>

              ) : (

                employees.map((employee) => (

                  <tr
                    key={employee.id}
                  >

                    <td>
                      {employee.id}
                    </td>

                    <td>
                      {employee.employeeCode}
                    </td>

                    <td>
                      {employee.name}
                    </td>

                    <td>
                      {employee.email}
                    </td>

                    <td>
                      {employee.department}
                    </td>

                    <td>
                      {employee.designation}
                    </td>

                    <td>
                      {employee.role}
                    </td>


                    {/* ================================================= */}
                    {/* ACTIONS */}
                    {/* ================================================= */}

                    <td>

                      {/* EDIT */}

                      {canEdit && (

                        <button
                          className="edit-button"
                          onClick={() =>
                            openEditForm(employee)
                          }
                        >

                          Edit

                        </button>

                      )}


                      {/* DELETE */}

                      {canDelete && (

                        <button
                          className="delete-button"
                          onClick={() =>
                            deleteEmployee(
                              employee.id
                            )
                          }
                        >

                          Delete

                        </button>

                      )}


                      {/* VIEW ONLY */}

                      {!canEdit &&
                        !canDelete && (

                          <span>
                            View Only
                          </span>

                        )}

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

export default Employee;
