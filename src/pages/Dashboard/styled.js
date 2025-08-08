import styled, { keyframes } from "styled-components";
import BackgroundPattern from "../../assets/icons/test-background.png";


// RecentTransactions, Transactions
export const Page = styled.div`
  min-height: 100%;
  width: 100%;
  background-color: #004b4f;
  background-image: url(${BackgroundPattern});
  background-repeat: no-repeat;
  background-opacity: 0.9;
  background-size: cover; /* o 'auto' se vuoi mantenere proporzioni reali */
  background-position: center;
  background-attachment: fixed; /* lo sfondo resta fisso mentre scrolli */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  color: #fff;
`;

export const Section = styled.div`
  margin-bottom: 2rem;
  background: ${({ theme }) => theme.card};
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 6px 18px ${({ theme }) => theme.widgetShadow};
  backdrop-filter: blur(6px);
  box-shadow: 0 4px 20px ${({ theme }) => theme.tileShadow};
`;

export const Column = styled.div`
  flex: 1;
  padding: 0 0.5rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Amount = styled(Column)`
  text-align: right;
  font-weight: bold;
  color: ${({ isIncome, isTransfer }) => {
    if (isTransfer) return "#ffffff";
    return isIncome ? "#4caf93" : "#e57373";
  }};
`;

export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Container = styled.div`  
  max-width: 1200px;
  margin: 0 auto;
  width: 75%;
  animation: ${fadeIn} 0.5s ease
`;

export const Item = styled.div`
  display: flex;
  cursor: pointer;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-radius: 14px;
  margin-bottom: 0.75rem;
  background: ${({ isIncome, isTransfer }) => 
    {if (isTransfer)
      return "rgba(255, 255, 255, 0.2)"; 
      return isIncome 
      ? "rgba(101, 204, 163, 0.1)" : "rgba(207, 96, 96, 0.25)"}};
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-left: 5px solid ${({ isIncome, isTransfer}) => 
    {if (isTransfer) 
      return "#ffffff";
      return isIncome ? "#4caf93" : "#e57373"}};
  box-shadow: 0 3px 10px rgba(0,0,0,0.05);
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.01);
  }
`;

// Transactions
export const Title = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #ffffff;
`;

// RecentTransactions
export const WidgetBox = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
`;

export const WidgetTitle = styled.h2`
  font-size: 1.25rem;
  color: white;
  margin-bottom: 1rem;
`;