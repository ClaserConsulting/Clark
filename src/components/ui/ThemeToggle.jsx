// file: src/components/ui/ThemeToggle.jsx

import React from "react";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = ({ theme, toggleTheme }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Sun size={18} color={theme === "light" ? "#facc15" : "#aaa"} />
      <div
        onClick={toggleTheme}
        style={{
          width: 42,
          height: 22,
          borderRadius: 22,
          backgroundColor: theme === "dark" ? "#4b5563" : "#d1d5db",
          display: "flex",
          alignItems: "center",
          padding: "2px",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            height: 18,
            width: 18,
            borderRadius: "50%",
            backgroundColor: "#fff",
            transform: theme === "dark" ? "translateX(20px)" : "translateX(0)",
            transition: "transform 0.3s ease",
          }}
        />
      </div>
      <Moon size={18} color={theme === "dark" ? "#f9fafb" : "#aaa"} />
    </div>
  );
};

export default ThemeToggle;
