import React, { useState } from "react";
import BulkActionsPopup from "../BulkActionsPopup";
import styled from "styled-components";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { GripVertical, Edit, Trash, Filter } from "lucide-react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  TransactionEditPopup,
  ConfirmDeletePopup,
} from "../TransactionPopups";
import { AccountDetailsPopup } from "../AccountDetailsPopup";
import SelectIconDropdown from "../SelectIconDropdown";
import {
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
} from "../Dashboard/styled";

// Functions

function CategoryForm() {
  const [icon, setIcon] = useState("wallet");

  const handleIconChange = (newIcon) => {
    setIcon(newIcon);
  };

  return (
    <form>
      {/* Altri campi: nome, colore, ecc. */}
      <SelectIconDropdown selectedIcon={icon} onChange={handleIconChange} />
    </form>
  );
}


function SortableWidget({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div {...listeners}>{children}</div>
    </div>
  );
}

const COLORS = ["#00C49F", "#FFBB28", "#FF8042"];

export default function Dashboard({
  filters,
  accounts,
  categories,
  transactions,
  filteredTransactions,
  setActiveSection,
}) {
    const defaultOrder = ["transactions", "pie", "bar"];
    const savedOrder = JSON.parse(localStorage.getItem("widgetOrder")) || defaultOrder;
    const [showAll, setShowAll] = useState(false);
    const [widgetOrder, setWidgetOrder] = useState(null);
    const [showBulkPopup, setShowBulkPopup] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const openAccountDetails = (account) => {
      setSelectedAccount(account);
    };
    const [hoveredId, setHoveredId] = useState(null);
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [transactionToEdit, setTransactionToEdit] = useState(null);
    const [showAccountPopup, setShowAccountPopup] = useState(false);
    const [localAccounts, setLocalAccounts] = useState(accounts || []);
    const [visibleCount, setVisibleCount] = useState(5);
    
    const handleLoadMore = () => {
      setVisibleCount((prev) => prev + 10);
    };
    
    const handleShowAll = () => {
      setActiveSection("transactions");
    };

    //

    function handleEdit(transaction) {
    setTransactionToEdit(transaction);
    }

    function handleDelete(t) {
    // logica reale di eliminazione
    setTransactionToDelete(null);
  }

    React.useEffect(() => {
      async function fetchWidgetOrder() {
        try {
          const res = await fetch("/api/profile");
          const data = await res.json();
          setWidgetOrder(data.widgetOrder || ["transactions", "pie", "bar"]);
        } catch (err) {
          console.error("Errore caricamento widgetOrder", err);
          setWidgetOrder(["transactions", "pie", "bar"]);
        }
      }

    fetchWidgetOrder();
    }, []);

    React.useEffect(() => {
      if (widgetOrder) {
        fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ widgetOrder }),
        }).catch((err) => console.error("Errore salvataggio widgetOrder", err));
      }
    }, [widgetOrder]);

    const pieData = ["entrata", "uscita", "trasferimento"].map((tipo) => ({
      name: tipo,
      value: transactions.filter((t) => t.tipo === tipo).length,
    }));

    const barData = localAccounts.map((account) => {
      const total = transactions
        .filter((t) => t.accountId === account.id)
        .reduce((sum, t) => sum + t.importo, 0);
      return {
        name: account.name,
        totale: total,
      };
    });

    const getSaldoByAccount = (accountId) => {
      return transactions
        .filter((t) => t.accountId === accountId)
        .reduce((sum, t) => sum + t.importo, 0);
    };

  // Widgets

    const widgets = {
      transactions: (
        <Section>
          <DraggableHeader>
            <GripVertical size={16} className="grip" />
            <Title>Ultime Transazioni</Title>
            <button
              title="Filtra e azioni in blocco"
              onClick={() => setShowBulkPopup(true)}
              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer" }}
              >
              <Filter size={16} />
            </button>
          </DraggableHeader>
          <SectionActions className="section-actions">
            <Filter
              size={18}
              style={{ cursor: "pointer" }}
              title="Filtra e azioni in blocco"
              onClick={() => setShowBulkPopup(true)}
            />
          </SectionActions>
          <List>
            {filteredTransactions?.length > 0 ? (
              filteredTransactions.slice(0, visibleCount).map((t) => (
                <Item key={t.id}>
                  <Col className="date">{t.date}</Col>
                  <Col className="category">
                    <Tag color={categories.find((c) => c.id === t.categoryId)?.color}>
                      {categories.find((c) => c.id === t.categoryId)?.name || "Categoria"}
                    </Tag>
                  </Col>
                  <Col className="note">
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Avatar>{t.note?.slice(0, 1).toUpperCase()}</Avatar>
                      {t.note}
                    </div>
                  </Col>
                  <Col className="amount">{t.importo.toFixed(2)}€</Col>
                  <ItemActions className="item-actions">
                    <Edit
                      onClick={() => {
                        setSelectedTransaction(t);
                        setShowEditPopup(true);
                      }}
                    />
                    <Trash
                      onClick={() => {
                        setSelectedTransaction(t);
                        setShowDeletePopup(true);
                      }}
                    />
                  </ItemActions>
                </Item>
              ))
            ) : (
              <p>Nessuna transazione trovata.</p>
            )}
          </List>

          <div className="flex gap-2 mt-4 justify-end">
            {visibleCount < filteredTransactions.length && (
              <button
                onClick={handleLoadMore}
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Mostra altre
              </button>
            )}
            <button
              onClick={handleShowAll}
              style={{
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "6px",
                background: "#2563eb",
                color: "white",
                cursor: "pointer",
              }}
            >
              Vai a tutte le transazioni
            </button>
          </div>
        </Section>
      ),

      pie: (
        <Section>
          <DraggableHeader>
            <GripVertical size={16} className="grip" />
            <Title>Ripartizione Tipologia</Title>
          </DraggableHeader>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                dataKey="value"
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Section>
      ),

      bar: (
        <Section>
          <DraggableHeader>
            <GripVertical size={16} className="grip" />
            <Title>Totale per Conto</Title>
          </DraggableHeader>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#8884d8" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totale" fill="#8884d8" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      )
    }

    {showBulkPopup && (
      <BulkActionsPopup
        onClose={() => setShowBulkPopup(false)}
        onApply={(filters) => {
          console.log("Filtri applicati:", filters);
          setShowBulkPopup(false);
        }}
      />
    )}

    {showEditPopup && (
      <TransactionEditPopup
      transaction={selectedTransaction}
      onClose={() => setShowEditPopup(false)}
      />
    )}

    {showDeletePopup && (
      <ConfirmDeletePopup
      transaction={selectedTransaction}
      onConfirm={() => handleDelete(selectedTransaction)}
      onClose={() => setShowDeletePopup(false)}
      />
    )}

    {selectedAccount && (
    <AccountDetailsPopup
      account={selectedAccount}
      transactions={transactions.filter((t) => t.accountId === selectedAccount.id)}
      onClose={() => setSelectedAccount(null)}
    />
    )}

    const handleSaveAccount = (updatedAccount) => {
      setLocalAccounts((prev) =>
        prev.map((acc) =>
          acc.id === updatedAccount.id ? updatedAccount : acc
        )
      );
    };


    if (!widgetOrder) return <div>Caricamento...</div>;
    return (
      <Container>
        <TilesRow>
          {localAccounts.map((account) => (
            <Tile
              key={account.id}
              onClick={() => {
                setSelectedAccount(account);
                setShowAccountPopup(true);
              }}
            >
              <ColorBar color={account.color} />
              <TileContent>
                <TileLabel>{account.name}</TileLabel>
                <TileValue>{getSaldoByAccount(account.id).toFixed(2)}€</TileValue>
              </TileContent>
            </Tile>   
          ))}
        </TilesRow>

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={({ active, over }) => {
            if (active.id !== over?.id) {
              setWidgetOrder((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);
                localStorage.setItem("widgetOrder", JSON.stringify(newOrder));
                return newOrder;
              });
            }
          }}

        >
          <SortableContext items={widgetOrder} strategy={verticalListSortingStrategy}>
            {widgetOrder.map((key) => (
              <SortableWidget key={key} id={key}>
                {widgets[key]}
              </SortableWidget>
            ))}
          </SortableContext>
        </DndContext>
        {showBulkPopup && (
          <BulkActionsPopup
            onClose={() => setShowBulkPopup(false)}
            onApply={(filters) => {
              console.log("Applica filtri/azioni con:", filters);
              setShowBulkPopup(false);
            }}
          />
        )}
        <TransactionEditPopup
          transaction={transactionToEdit}
          onClose={() => setTransactionToEdit(null)}
        />

        <ConfirmDeletePopup
          transaction={transactionToDelete}
          onClose={() => setTransactionToDelete(null)}
          onConfirm={() => handleDelete(transactionToDelete)}
        />

        {showAccountPopup && selectedAccount && (
          <AccountDetailsPopup
            account={selectedAccount}
            onClose={() => setShowAccountPopup(false)}
            onSave={handleSaveAccount}
          />
        )}

      </Container>
)}
