import styled from "styled-components";
import BackgroundPattern from "../../assets/icons/test-background.png";

export const Page = styled.div`
  min-height: 100%;
  width: 100%;
  background-color: #004b4f;
  background-image: url(${BackgroundPattern});
  background-repeat: no-repeat;
  background-opacity: 0.9;
  background-size: auto; /* o 'auto' se vuoi mantenere proporzioni reali */
  background-position: center;
  background-attachment: fixed; /* lo sfondo resta fisso mentre scrolli */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  color: #fff;
`;

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

export const Container = styled.div`  
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

export const TilesRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

export const Tile = styled.div`
  flex: 1;
  min-width: 200px;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  align-items: center;
`;

export const ColorBar = styled.div`
  width: 6px;
  height: 100%;
  background-color: ${(props) => props.color || "#ccc"};
  border-radius: 6px;
  margin-right: 1rem;
`;

export const TileContent = styled.div`
  display: flex;
  flex-direction: column;
`;

export const TileLabel = styled.span`
  font-size: 0.9rem;
  color: #e2f1f2;
`;

export const TileValue = styled.span`
  font-size: 1.3rem;
  font-weight: bold;
  color: #fff;
`;

export const Section = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
`;

export const Title = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #ffffff;
`;

export const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const Item = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  margin-bottom: 0.75rem;
  color: #fff;
  font-size: 0.85rem;
`;

export const Col = styled.div`
  flex: 1;
  &.amount {
    text-align: right;
    font-weight: bold;
  }
`;

export const Avatar = styled.div`
  background-color: #888;
  color: #fffff;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;