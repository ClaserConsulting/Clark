import React, { useState } from "react";
import { iconGroups } from "../../data/icons";
import * as LucideIcons from "lucide-react";
import styled from "styled-components";

const Wrapper = styled.div`
  margin: 1rem 0;
`;

const Dropdown = styled.select`
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 100%;
`;

const IconPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

export default function SelectIconDropdown({ selectedIcon, onChange }) {
  const [currentIcon, setCurrentIcon] = useState(selectedIcon || "tag");

  const handleChange = (e) => {
    const value = e.target.value;
    setCurrentIcon(value);
    onChange(value);
  };

  const IconComponent = LucideIcons[currentIcon] || LucideIcons["Tag"];

  return (
    <Wrapper>
      <label>Seleziona icona:</label>
      <Dropdown value={currentIcon} onChange={handleChange}>
        {Object.entries(iconGroups).map(([group, icons]) => (
          <optgroup key={group} label={group}>
            {icons.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </optgroup>
        ))}
      </Dropdown>

      <IconPreview>
        <IconComponent size={24} />
        <span>{currentIcon}</span>
      </IconPreview>
    </Wrapper>
  );
}
