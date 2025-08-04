import React from "react";

export const HomeIcon = ({ color = "currentColor" }) => (
  <svg fill="none" stroke={color} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9L12 2l9 7v11a2 2 0 0 1-2 2h-5v-7H8v7H5a2 2 0 0 1-2-2z" />
  </svg>
);

export const ConfigIcon = ({ color = "currentColor" }) => (
  <svg fill="none" stroke={color} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const UserIcon = ({ color = "currentColor" }) => (
  <svg fill="none" stroke={color} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M4 21v-2a4 4 0 0 1 3-3.87" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export function HamburgerIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export function PinIcon({ size = 24, color = "currentColor", filled = false }) {
  if (filled) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C10 2 6 7 6 11c0 3.313 2.687 6 6 6s6-2.687 6-6c0-4-4-9-6-9z" />
        <circle cx="12" cy="11" r="2" fill="white" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C10 2 6 7 6 11c0 3.313 2.687 6 6 6s6-2.687 6-6c0-4-4-9-6-9z" />
      <circle cx="12" cy="11" r="2" />
    </svg>
  );
}