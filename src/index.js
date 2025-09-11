// src/main.jsx (o src/index.jsx)
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ThemeProvider as SCThemeProvider, useTheme } from "styled-components";
import { ThemeSettingsProvider, useThemeSettings } from "./context/ThemeContext";
import { pickTheme } from "../src/utils/theme";

function ThemeBridge({ children }) {
  const { themeFamily, themeMode } = useThemeSettings();
  const activeTheme = pickTheme(themeFamily, themeMode);
  return <SCThemeProvider theme={activeTheme}>{children}</SCThemeProvider>;
}

function Root() {
  return (
    <ThemeSettingsProvider>
      <ThemeBridge>
        <App />
      </ThemeBridge>
    </ThemeSettingsProvider>
  );
}

createRoot(document.getElementById("root")).render(<Root />);
