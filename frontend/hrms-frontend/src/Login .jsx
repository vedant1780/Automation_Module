
import { useState } from "react";
import axios from "axios";
import "./Login.css";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email,
          password,
        }
      );

      console.log("LOGIN RESPONSE:", response.data);

      // Check JWT token
      if (!response.data?.token) {
        setError("Login successful but JWT token was not received.");
        return;
      }

      // =====================================================
      // SAVE LOGIN RESPONSE
      // =====================================================

      localStorage.setItem(
        "user",
        JSON.stringify(response.data)
      );

      // =====================================================
      // SAVE JWT TOKEN
      // =====================================================

      localStorage.setItem(
        "token",
        response.data.token
      );

      // =====================================================
      // CREATE LOGGED-IN EMPLOYEE OBJECT
      // Backend returns employee details directly
      // =====================================================

      const employee = {
        id: response.data.id,
        employeeCode: response.data.employeeCode,
        name: response.data.name,
        email: response.data.email,
        department: response.data.department,
        designation: response.data.designation,
        role: response.data.role,
      };

      // Make sure employee ID exists
      if (!employee.id) {
        console.error(
          "Employee ID not found in login response:",
          response.data
        );

        setError(
          "Login successful, but employee information was not received."
        );

        return;
      }

      // =====================================================
      // SAVE LOGGED-IN EMPLOYEE
      // =====================================================

      localStorage.setItem(
        "employee",
        JSON.stringify(employee)
      );

      console.log(
        "LOGGED-IN EMPLOYEE:",
        employee
      );

      console.log(
        "EMPLOYEE ID:",
        employee.id
      );

      // =====================================================
      // LOGIN SUCCESS
      // =====================================================

      onLoginSuccess();

    } catch (err) {
      console.error("Login error:", err);

      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else {
        setError(
          typeof err.response?.data === "string"
            ? err.response.data
            : err.response?.data?.message ||
              "Unable to login. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-badge">
          HR
        </div>

        <h1 className="login-title">
          Welcome back
        </h1>

        <p className="login-subtitle">
          Sign in to your HRMS account
        </p>

        {error && (
          <div
            className="login-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          noValidate
        >

          {/* EMAIL */}

          <div className="login-field">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
          </div>


          {/* PASSWORD */}

          <div className="login-field">
            <label htmlFor="password">
              Password
            </label>

            <div className="login-password-wrap">

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="login-toggle-visibility"
                onClick={() =>
                  setShowPassword(
                    (v) => !v
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >

                {showPassword ? (

                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.5 5.2A9.8 9.8 0 0112 5c5 0 9 4.5 10 7-.4 1-1.1 2.2-2.1 3.3M6.6 6.6C4.6 8 3.2 10 2 12c1 2.5 5 7 10 7 1.5 0 2.9-.4 4.1-1"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                ) : (

                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                  </svg>

                )}

              </button>
            </div>
          </div>


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>

        </form>

        <p className="login-footer">
          HRMS Payroll Management System
        </p>

      </div>
    </div>
  );
}

export default Login;
