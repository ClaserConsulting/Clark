// 📁 src/components/Logo.jsx
import React from "react";
import logoDark from "../assets/icons/octopus-logo-dark.png";
import logoLight from "../assets/icons/octopus-logo-light.png"; // se vuoi anche questa

const Logo = ({ size = 36, darkMode = true }) => {
  const src = darkMode ? logoDark : logoLight;

  return (
    <img
      src={src}
      alt="Clark Logo"
      style={{ height: size, width: "auto", display: "block" }}
    />
  );
};

export default Logo;
