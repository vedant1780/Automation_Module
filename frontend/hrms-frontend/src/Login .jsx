
import { useState } from "react";
import axios from "axios";

function Login({ onLoginSuccess }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    // =====================================================
    // LOGIN
    // =====================================================

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");


        // Validate fields
        if (!email || !password) {

            setError(
                "Please enter email and password"
            );

            return;
        }


        try {

            setLoading(true);


            // =================================================
            // CALL LOGIN API
            // =================================================

            const response = await axios.post(
                "http://localhost:8080/api/auth/login",
                {
                    email: email,
                    password: password
                }
            );


            console.log(
                "Login response:",
                response.data
            );


            // =================================================
            // CHECK TOKEN
            // =================================================

            if (!response.data.token) {

                setError(
                    "Login successful but JWT token was not received."
                );

                return;
            }


            // =================================================
            // STORE LOGGED-IN USER
            // =================================================

            localStorage.setItem(
                "user",
                JSON.stringify(response.data)
            );


            // =================================================
            // STORE JWT TOKEN
            // =================================================

            localStorage.setItem(
                "token",
                response.data.token
            );


            // =================================================
            // LOGIN SUCCESS
            // =================================================

            onLoginSuccess();


        } catch (err) {

            console.error(
                "Login error:",
                err
            );


            if (err.response?.status === 401) {

                setError(
                    "Invalid email or password"
                );

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


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="login-page">

            <div className="login-card">


                {/* LOGO */}

                <div className="login-logo">
                    HRMS
                </div>


                {/* TITLE */}

                <h2>
                    Welcome Back
                </h2>


                <p className="login-subtitle">
                    Human Resource Management System
                </p>


                {/* ERROR */}

                {error && (

                    <div className="login-error">
                        {error}
                    </div>

                )}


                {/* LOGIN FORM */}

                <form onSubmit={handleLogin}>


                    {/* EMAIL */}

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        placeholder="Enter email"
                        required
                    />


                    {/* PASSWORD */}

                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        placeholder="Enter password"
                        required
                    />


                    {/* LOGIN BUTTON */}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Logging in..."
                            : "Login"
                        }

                    </button>

                </form>


                {/* FOOTER */}

                <p className="login-footer">
                    HRMS Payroll Management System
                </p>

            </div>

        </div>

    );

}

export default Login;