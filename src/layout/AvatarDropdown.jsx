// 📍 src/layout/AvatarDropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { UserIcon, UpgradeIcon, LogoutIcon } from "../assets/icons/icons";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";

const fadeGrow = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  background-color: #006666;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 0 0 2px rgba(255,255,255,0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 110%;
  right: 0;
  background: ${({ theme }) => theme.card};
  border-radius: 10px;
  padding: 0.75rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  animation: ${fadeGrow} 0.3s ease;
  min-width: 160px;
  z-index: 1002;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.hoverBg};
  }
`;

const AvatarDropdown = ({ user = { name: "Claudio Serra" } }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div ref={ref}>
      <AvatarWrapper onClick={() => setOpen(!open)}>{initials}</AvatarWrapper>
      {open && (
        <Dropdown>
          <Item onClick={() => navigate("/profile")}><UserIcon /> Profilo</Item>
          <Item><UpgradeIcon /> Upgrade del piano</Item>
          <Item onClick={handleLogout}><LogoutIcon /> Logout</Item>
        </Dropdown>
      )}
    </div>
  );
};

export default AvatarDropdown;
