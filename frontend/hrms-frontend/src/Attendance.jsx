
import { useEffect, useState } from "react";
import api from "./axiosConfig";

function Attendance() {

  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [employeeId, setEmployeeId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  // ==========================================
  // LOAD EMPLOYEES
  // ==========================================

  const fetchEmployees = async () => {

    try {

      const response = await api.get(
        "http://localhost:8080/api/employees"
      );

      setEmployees(response.data);

    } catch (err) {

      console.error(err);
      setError("Unable to load employees");

    }
  };


  // ==========================================
  // LOAD ATTENDANCE FOR SELECTED EMPLOYEE
  // ==========================================

  const fetchAttendance = async (id) => {

    if (!id) {
      setAttendance([]);
      return;
    }

    try {

      setLoading(true);
      setError("");

      const response = await api.get(
        `http://localhost:8080/api/attendance/${id}`
      );

      setAttendance(response.data);

    } catch (err) {

      console.error(err);

      setError("Unable to load attendance");

      setAttendance([]);

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // LOAD EMPLOYEES WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {

    fetchEmployees();

  }, []);


  // ==========================================
  // EMPLOYEE CHANGE
  // ==========================================

  const handleEmployeeChange = (e) => {

    const id = e.target.value;

    setEmployeeId(id);

    setMessage("");
    setError("");

    fetchAttendance(id);

  };


  // ==========================================
  // MARK ATTENDANCE
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");


    if (!employeeId) {

      setError("Please select an employee");
      return;

    }


    if (!attendanceDate) {

      setError("Please select attendance date");
      return;

    }


    if (!status) {

      setError("Please select attendance status");
      return;

    }


    try {

      await api.post(
        `http://localhost:8080/api/attendance/${employeeId}`,
        {
          attendanceDate: attendanceDate,
          status: status
        }
      );


      setMessage(
        "Attendance marked successfully!"
      );


      // Clear date and status

      setAttendanceDate("");
      setStatus("");


      // Refresh selected employee attendance

      fetchAttendance(employeeId);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data ||
        "Failed to mark attendance"
      );

    }

  };


  return (

    <div className="attendance">


      {/* ======================================
          HEADER
      ====================================== */}

      <div className="page-header">

        <div>

          <h2>
            Attendance
          </h2>

          <p>
            Manage employee attendance
          </p>

        </div>

      </div>


      {/* ======================================
          MESSAGE
      ====================================== */}

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


      {/* ======================================
          MARK ATTENDANCE FORM
      ====================================== */}

      <div className="add-employee">

        <h3>
          Mark Attendance
        </h3>


        <form onSubmit={handleSubmit}>


          {/* EMPLOYEE */}

          <label>
            Employee
          </label>

          <select
            value={employeeId}
            onChange={handleEmployeeChange}
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


          {/* DATE */}

          <label>
            Attendance Date
          </label>

          <input
            type="date"
            value={attendanceDate}
            onChange={(e) =>
              setAttendanceDate(e.target.value)
            }
            required
          />


          {/* STATUS */}

          <label>
            Status
          </label>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            required
          >

            <option value="">
              Select Status
            </option>

            <option value="PRESENT">
              Present
            </option>

            <option value="ABSENT">
              Absent
            </option>

            <option value="HALF_DAY">
              Half Day
            </option>

          </select>


          {/* SUBMIT */}

          <button
            type="submit"
            className="add-button"
          >

            Mark Attendance

          </button>

        </form>

      </div>


      {/* ======================================
          ATTENDANCE RECORDS
      ====================================== */}

      <h3>
        Attendance Records
      </h3>


      {!employeeId ? (

        <div className="message">
          Select an employee to view attendance
        </div>

      ) : loading ? (

        <div className="message">
          Loading attendance...
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
                  Date
                </th>

                <th>
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {attendance.length === 0 ? (

                <tr>

                  <td
                    colSpan="3"
                    className="empty"
                  >

                    No attendance records found

                  </td>

                </tr>

              ) : (

                attendance.map((item) => (

                  <tr key={item.id}>

                    <td>
                      {item.id}
                    </td>

                    <td>
                      {item.attendanceDate}
                    </td>

                    <td>
                      {item.status}
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

export default Attendance;

