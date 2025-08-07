// file: src/components/ui/LogoutButton.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        background: "#ef4444",
        color: "#fff",
        border: "none",
        borderRadius: 4,
        padding: "6px 12px",
        cursor: "pointer",
        fontSize: "0.9rem",
      }}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
