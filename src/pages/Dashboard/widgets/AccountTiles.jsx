import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { FiEye, FiEyeOff, FiChevronDown, FiChevronUp, FiPlus } from "react-icons/fi";
import { PinIcon } from "../../../assets/icons/icons"; // stesso pin della sidebar

const Section = styled.section`
  grid-area: accounts;
  position: relative;
  z-index: 1;
`;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

/* Riga: colonna comandi a sx + griglia tile a dx (stessa colonna del contenuto) */
const RowGrid = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr;
  align-items: start;
  gap: 12px;
  min-width: 0;
`;

const ControlsCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-top: 2px;
`;

const EyeBtn = styled.button`
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  box-shadow: 0 1px 4px ${({ theme }) => theme.tileShadow};
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform .15s ease, background .2s ease;
  &:hover { transform: translateY(-1px); background: ${({ theme }) => theme.cardHover || "rgba(255,255,255,0.08)"}; }
`;

const AddBtn = styled.button`
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 50%;
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.primary};
  box-shadow: 0 1px 4px ${({ theme }) => theme.tileShadow};
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform .15s ease, background .2s ease;
  &:hover { transform: translateY(-1px); background: ${({ theme }) => theme.cardHover || "rgba(255,255,255,0.08)"}; }
`;

/* Viewport che collassa a UNA SOLA RIGA finché non espandi */
const TilesClipper = styled.div`
  --tile-h: 72px;
  max-height: ${({ $expanded, $pinned }) => ($expanded || $pinned ? "none" : "var(--tile-h)")};
  overflow: hidden;

  @media (max-width: 1024px) {
    --tile-h: 64px;
  }
`;

/* Griglia: 4 per riga su desktop */
const TilesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr));
  grid-auto-rows: var(--tile-h);
  gap: 12px;
  min-width: 0;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
  }
`;

const Tile = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  background: ${({ theme }) => theme.card};
  box-shadow: 1px 0px 5px 0px ${({ theme }) => theme.tileShadow};
  backdrop-filter: blur(6px);
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.2s ease;
  &:hover {
    transform: translateY(-1px);
    background: ${({ theme }) => theme.cardHover || "rgba(255, 255, 255, 0.05)"};
  }
  &:hover .eye-action { opacity: 1; } /* occhietto per-tile solo in hover */
`;

const ColorBar = styled.div`
  width: 4px;
  height: 100%;
  border-radius: 6px;
  background-color: ${(props) => props.color || "#ccc"};
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
`;

const Name = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Value = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  opacity: ${(p) => (p.$visible ? 1 : 0.35)};
  white-space: nowrap;
`;

const EyeAction = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  border: 0;
  background: transparent;
  cursor: pointer;
  opacity: 0; /* nascosto */
  transition: opacity .2s ease;
  color: ${({ theme }) => theme.text};
`;

/* Tendina minimal: metà altezza, freccetta al centro, pin a destra (come sidebar) */
const ExpandBar = styled.div`
  display: ${({ $show }) => ($show ? "block" : "none")};
  position: relative;
  height: 18px; /* metà di prima */
  border-radius: 10px;
  background: ${({ theme }) => theme.cardHover ? theme.cardHover : "rgba(255, 255, 255, 0)"};
  border: 1px dashed ${({ theme }) => theme.separator || "rgba(0,0,0,0)"};
  backdrop-filter: blur(0px);
`;

/* Freccia centrata, solo icona */
const ChevronBtn = styled.button`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: transparent;
  border: 0;
  padding: 0;
  line-height: 0;
  cursor: pointer;
  color: #fff;                /* icona bianca */
  opacity: 0.6;
  transition: opacity .2s ease, transform .12s ease;
  &:hover { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
  svg { width: 16px; height: 16px; }
`;

/* Pin a destra: stessi colori/comportamento della sidebar */
const PinBtn = styled.button`
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
  background: transparent;    /* niente tondino */
  border: 0;
  padding: 2px;
  line-height: 0;
  cursor: pointer;
  opacity: 0.85;
  transition: opacity .2s ease;
  &:hover { opacity: 1; }

  svg {
    width: 16px;
    height: 16px;
    stroke: #fff;                           /* bordo bianco */
    stroke-width: 1;
    fill: ${({ $active }) => ($active ? "#fff" : "transparent")};  /* pieno se attivo */
  }

  @media (max-width: 768px) { display: none; }
`;

const AccountTiles = ({ accounts = [], onClickAccount, onAdd }) => {
  const [hiddenAccounts, setHiddenAccounts] = useState({});
  const [allHidden, setAllHidden] = useState(false);

  const [expanded, setExpanded] = useState(false);
  const [pinned, setPinned] = useState(false);

  // compare appena superi 4
  const showExpandBar = useMemo(() => (accounts?.length || 0) > 4, [accounts]);

  const toggleAllBalances = () => {
    const next = {};
    accounts.forEach((a) => { next[a.id] = !allHidden; });
    setHiddenAccounts(next);
    setAllHidden((v) => !v);
  };

  const toggleOne = (id, e) => {
    e.stopPropagation();
    setHiddenAccounts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const saldo = (a) => (hiddenAccounts[a.id] ? "***€" : `${(a.balance ?? 0).toFixed(2)}€`);

  return (
    <Section>
      <Wrap>
        <RowGrid>
          {/* Colonna comandi */}
          <ControlsCol>
            <EyeBtn
              onClick={toggleAllBalances}
              title={allHidden ? "Mostra tutti i saldi" : "Nascondi tutti i saldi"}
              aria-label={allHidden ? "Mostra tutti i saldi" : "Nascondi tutti i saldi"}
            >
              {allHidden ? <FiEye /> : <FiEyeOff />}
            </EyeBtn>

            <AddBtn
              onClick={onAdd}
              title="Aggiungi account"
              aria-label="Aggiungi account"
            >
              <FiPlus />
            </AddBtn>
          </ControlsCol>

          {/* Viewport collassato a UNA riga finché non espandi */}
          <TilesClipper $expanded={expanded} $pinned={pinned}>
            <TilesGrid>
              {accounts.map((acc) => (
                <Tile key={acc.id} onClick={() => onClickAccount?.(acc)}>
                  <ColorBar color={acc.color} />
                  <Body>
                    <Name>{acc.name}</Name>
                    <Value $visible={!hiddenAccounts[acc.id]}>{saldo(acc)}</Value>
                  </Body>

                  {/* occhietto per-tile (hidden finché non hover) */}
                  <EyeAction
                    className="eye-action"
                    onClick={(e) => toggleOne(acc.id, e)}
                    title={hiddenAccounts[acc.id] ? "Mostra saldo" : "Nascondi saldo"}
                    aria-label={hiddenAccounts[acc.id] ? "Mostra saldo" : "Nascondi saldo"}
                  >
                    {hiddenAccounts[acc.id] ? <FiEye /> : <FiEyeOff />}
                  </EyeAction>
                </Tile>
              ))}
            </TilesGrid>
          </TilesClipper>
        </RowGrid>

        {/* Tendina ultra-minimal: solo chevron al centro + pin a dx */}
        <ExpandBar $show={showExpandBar}>
          <ChevronBtn
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Riduci elenco" : "Mostra tutti gli account"}
            title={expanded ? "Riduci" : "Mostra tutti"}
          >
            {expanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </ChevronBtn>

        </ExpandBar>
      </Wrap>
    </Section>
  );
};

export default AccountTiles;
