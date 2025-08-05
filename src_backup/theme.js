import { createGlobalStyle } from "styled-components";

export const lightTheme = {
  background: "#f5f7fa",
  sidebarBg: "#fff",
  sidebarColor: "#333",
  mainBg: "#f5f7fa",
  text: "#222",
  accent: "#4caf50",
  hoverBg: "#e0e0e0",
  pinActive: "#4caf50",
  pinInactive: "rgba(255, 255, 255, 0.6)",

  // Nuovi campi:
  card: "#ffffff",
  primary: "#007bff",
  tileShadow: "rgba(0, 0, 0, 0.1)",
  widgetShadow: "rgba(0, 0, 0, 0.05)",
};

export const darkTheme = {
  background: "#121212",
  sidebarBg: "#1e1e1e",
  sidebarColor: "#ddd",
  mainBg: "#121212",
  text: "#eee",
  accent: "#81c784",
  hoverBg: "#333",
  pinActive: "#81c784",
  pinInactive: "rgba(255,255,255,0.3)",

  // Nuovi campi:
  card: "#1e1e1e",
  primary: "#1e90ff",
  tileShadow: "rgba(255, 255, 255, 0.05)",
  widgetShadow: "rgba(255, 255, 255, 0.1)",
};


export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0; padding: 0; 
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  * {
    box-sizing: border-box;
  }
`;
