import { useState } from "react";
import "./App.css";

import Login from "./Login ";
import Dashboard from "./Dashboard";

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("user")
  );

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setIsLoggedIn(false);
  };

  return (

    <>

      {!isLoggedIn ? (

        <Login
          onLoginSuccess={handleLogin}
        />

      ) : (

        <Dashboard
          onLogout={handleLogout}
        />

      )}

    </>

  );
}

export default App;