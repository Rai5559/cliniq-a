import React, { useState } from "react";
import { useAuth } from "./auth/AuthProvider";
import BackendFunctionsUI from "./components/BackendFunctionsUI";

function App() {
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <div style={{ padding: 24 }}>
      <h1>CliniQ&A</h1>
      <div style={{ marginBottom: 24 }}>
        {isAuthenticated ? (
          <button onClick={logout}>Logout</button>
        ) : (
          <button onClick={login}>Login</button>
        )}
      </div>
      <BackendFunctionsUI />
    </div>
  );
}

export default App;
