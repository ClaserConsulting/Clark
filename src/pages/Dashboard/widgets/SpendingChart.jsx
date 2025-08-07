// 📁 src/pages/Dashboard/widgets/SpendingChart.jsx
import React from "react";
import styled from "styled-components";

const Bar = styled.div`
  height: 12px;
  background: rgba(255,255,255,0.2);
  border-radius: 6px;
  margin-bottom: 0.5rem;
  width: ${(props) => props.width || "100%"};
`;

const SpendingChart = () => {
  return (
    <div>
      <Bar width="80%" />
      <Bar width="65%" />
      <Bar width="40%" />
    </div>
  );
};

export default SpendingChart;
