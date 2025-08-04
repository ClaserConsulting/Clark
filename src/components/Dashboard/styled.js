const Container = styled.div`
  padding: 1rem;
`;

const TilesRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

// Single tile of accounts widget
const Tile = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.card};
  box-shadow: 0 4px 12px ${({ theme }) => theme.tileShadow};
  border-radius: 12px;
  padding: 1rem;
  position: relative;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.cardHover || "#f0f0f0"};
  }
`;

const ColorBar = styled.div`
  width: 6px;
  height: 100%;
  border-radius: 6px 0 0 6px;
  margin-right: 1rem;
  background-color: ${(props) => props.color || "#ccc"};
`;

const TileContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const TileLabel = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
`;

const TileValue = styled.span`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
  background: ${({ theme }) => theme.card};
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 12px ${({ theme }) => theme.widgetShadow};
  position: relative;
  transition: box-shadow 0.3s ease;

  &:hover .section-actions {
    opacity: 1;
    pointer-events: auto;
  }
`;

const DraggableHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .grip {
    visibility: hidden;
    cursor: grab;
    color: ${({ theme }) => theme.text};
  }

  &:hover .grip {
    visibility: visible;
  }
`;

const Title = styled.h2`
  font-size: 1.2rem;
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

// Single row in transactions widget 
const Item = styled.li`
  padding: 0.75rem 1rem;
  background-color: ${({ theme }) => theme.card};
  border-radius: 10px;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.text};
  box-shadow: 0 2px 8px ${({ theme }) => theme.tileShadow};
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  position: relative;

  &:hover {
    background-color: ${({ theme }) => theme.hover};
    transform: scale(1.01);
  }

  &:hover .item-actions {
    opacity: 1;
    pointer-events: auto;
  }
`;

const ItemActions = styled.div`
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;

  svg {
    cursor: pointer;
    color: ${({ theme }) => theme.text};
    transition: color 0.2s;

    &:hover {
      color: ${({ theme }) => theme.primary};
    }
  }
`;

// Columns in transaction rows
const Col = styled.div`
  flex: ${({ flex }) => flex || 1};
  padding: 0 0.5rem;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &.date {
    min-width: 80px;
    color: ${({ theme }) => theme.textSoft};
  }

  &.category {
    font-weight: 600;
  }

  &.note {
    flex: 2;
    color: ${({ theme }) => theme.text};
  }

  &.amount {
    font-weight: bold;
    text-align: right;
    color: ${({ theme }) => theme.primary};
    min-width: 80px;
  }
`;

const Avatar = styled.div`
  background: ${({ color }) => color || "#888"};
  color: white;
  font-weight: bold;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  margin-right: 0.5rem;
`;

const Tag = styled.span`
  background-color: ${({ color }) => color || "#ddd"};
  color: #fff;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  margin-right: 0.5rem;
  white-space: nowrap;
`;

const SectionActions = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
  border: none;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.primary};
  color: white;
  cursor: pointer;
`;

export {
  Container,
  TilesRow,
  Tile,
  ColorBar,
  TileContent,
  TileLabel,
  TileValue,
  Section,
  DraggableHeader,
  Title,
  List,
  Item,
  Col,
  Tag,
  Avatar,
  ItemActions,
  SectionActions,
  Button,
};
