import { createGlobalStyle } from "styled-components";

export const lightTheme = {
  background: "#eaf3f4",
  sidebarBg: "rgba(0, 75, 79, 0.95)",
  sidebarColor: "#ffffff",
  mainBg: "#f1f9f9",
  text: "#ffffff",
  accent: "#18b6b9",
  hoverBg: "rgba(0, 75, 79, 0.1)",
  pinActive: "#18b6b9",
  pinInactive: "rgba(255, 255, 255, 0.5)",
  card: "rgba(255, 255, 255, 0.15)",
  primary: "#008489",
  tileShadow: "rgba(0, 0, 0, 0.05)",
  widgetShadow: "rgba(0, 0, 0, 0.08)",
};

export const darkTheme = {
  background: "#0c1c1d",
  sidebarBg: "#002829",
  sidebarColor: "#e5f6f6",
  mainBg: "#0c1c1d",
  text: "#c8dede",
  accent: "#22d3ee",
  hoverBg: "#014e51",
  pinActive: "#22d3ee",
  pinInactive: "#6b8e8f",
  card: "rgba(255, 255, 255, 0.05)",
  primary: "#00c2cb",
  tileShadow: "rgba(0, 0, 0, 0.4)",
  widgetShadow: "rgba(0, 0, 0, 0.2)"
};

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: \${({ theme }) => theme.background};
    color: \${({ theme }) => theme.text};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  * {
    box-sizing: border-box;
  }
`;