"use client";

import { useDeferredValue, useEffect, useState } from "react";

const STORAGE_KEY = "ledger-lens-dashboard";

const seedTransactions = [
  {
    id: "tx-001",
    date: "2026-01-03",
    merchant: "January Salary",
    amount: 6200,
    category: "Salary",
    type: "income",
    note: "Monthly payroll deposit",
  },
  {
    id: "tx-002",
    date: "2026-01-06",
    merchant: "Harbor Apartments",
    amount: 1650,
    category: "Housing",
    type: "expense",
    note: "Monthly rent",
  },
  {
    id: "tx-003",
    date: "2026-01-12",
    merchant: "FreshCart",
    amount: 218,
    category: "Groceries",
    type: "expense",
    note: "Weekly grocery run",
  },
  {
    id: "tx-004",
    date: "2026-01-21",
    merchant: "Northwind Consulting",
    amount: 900,
    category: "Freelance",
    type: "income",
    note: "Website redesign milestone",
  },
  {
    id: "tx-005",
    date: "2026-02-01",
    merchant: "February Salary",
    amount: 6200,
    category: "Salary",
    type: "income",
    note: "Monthly payroll deposit",
  },
  {
    id: "tx-006",
    date: "2026-02-05",
    merchant: "Harbor Apartments",
    amount: 1650,
    category: "Housing",
    type: "expense",
    note: "Monthly rent",
  },
  {
    id: "tx-007",
    date: "2026-02-10",
    merchant: "Metro Energy",
    amount: 174,
    category: "Utilities",
    type: "expense",
    note: "Electricity and water",
  },
  {
    id: "tx-008",
    date: "2026-02-18",
    merchant: "CloudPeak Airlines",
    amount: 480,
    category: "Travel",
    type: "expense",
    note: "Conference flight",
  },
  {
    id: "tx-009",
    date: "2026-03-01",
    merchant: "March Salary",
    amount: 6200,
    category: "Salary",
    type: "income",
    note: "Monthly payroll deposit",
  },
  {
    id: "tx-010",
    date: "2026-03-05",
    merchant: "Harbor Apartments",
    amount: 1650,
    category: "Housing",
    type: "expense",
    note: "Monthly rent",
  },
  {
    id: "tx-011",
    date: "2026-03-11",
    merchant: "Pulse Fitness",
    amount: 89,
    category: "Health",
    type: "expense",
    note: "Gym membership",
  },
  {
    id: "tx-012",
    date: "2026-03-17",
    merchant: "Brightline Bonus",
    amount: 1200,
    category: "Bonus",
    type: "income",
    note: "Quarterly performance bonus",
  },
  {
    id: "tx-013",
    date: "2026-03-24",
    merchant: "Luma Bistro",
    amount: 126,
    category: "Dining",
    type: "expense",
    note: "Team dinner",
  },
  {
    id: "tx-014",
    date: "2026-04-01",
    merchant: "April Salary",
    amount: 6200,
    category: "Salary",
    type: "income",
    note: "Monthly payroll deposit",
  },
  {
    id: "tx-015",
    date: "2026-04-05",
    merchant: "Harbor Apartments",
    amount: 1650,
    category: "Housing",
    type: "expense",
    note: "Monthly rent",
  },
  {
    id: "tx-016",
    date: "2026-04-07",
    merchant: "FreshCart",
    amount: 245,
    category: "Groceries",
    type: "expense",
    note: "Weekly grocery run",
  },
  {
    id: "tx-017",
    date: "2026-04-09",
    merchant: "StreamBox",
    amount: 34,
    category: "Subscriptions",
    type: "expense",
    note: "Annual plan installment",
  },
  {
    id: "tx-018",
    date: "2026-04-10",
    merchant: "TransitCard Reload",
    amount: 76,
    category: "Transport",
    type: "expense",
    note: "Monthly commute budget",
  },
];

const defaultFilters = {
  search: "",
  type: "all",
  category: "all",
  sort: "date-desc",
};

const emptyDraft = {
  date: "2026-04-12",
  merchant: "",
  amount: "",
  category: "Groceries",
  type: "expense",
  note: "",
};

const categoryColors = {
  Salary: "#0f9d7a",
  Freelance: "#1f8ef1",
  Bonus: "#ff9b54",
  Housing: "#ff6b57",
  Groceries: "#f3b63a",
  Utilities: "#8c7cf0",
  Travel: "#29b6b6",
  Health: "#ee6c9a",
  Dining: "#d97706",
  Subscriptions: "#5d7ef0",
  Transport: "#14b8a6",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatTransactionDate(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateString}T12:00:00`));
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(new Date(year, month - 1, 1));
}

function getTodayInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createGradient(items) {
  if (!items.length) {
    return "conic-gradient(#d7deeb 0 100%)";
  }

  const total = items.reduce((sum, item) => sum + item.amount, 0);
  let cursor = 0;

  const segments = items.map((item) => {
    const start = cursor;
    cursor += (item.amount / total) * 100;
    return `${item.color} ${start}% ${cursor}%`;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

function createMonthlySeries(transactions) {
  const totalsByMonth = new Map();

  [...transactions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((transaction) => {
      const month = transaction.date.slice(0, 7);
      const delta =
        transaction.type === "income"
          ? transaction.amount
          : -transaction.amount;

      totalsByMonth.set(month, (totalsByMonth.get(month) || 0) + delta);
    });

  let runningBalance = 0;

  return [...totalsByMonth.entries()].map(([month, net]) => {
    runningBalance += net;
    return {
      month,
      label: formatMonthLabel(month),
      net,
      balance: runningBalance,
    };
  });
}

function createExpenseBreakdown(transactions) {
  const totals = new Map();

  transactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      totals.set(
        transaction.category,
        (totals.get(transaction.category) || 0) + transaction.amount,
      );
    });

  const totalExpenses = [...totals.values()].reduce((sum, value) => sum + value, 0);

  return [...totals.entries()]
    .map(([category, amount]) => ({
      category,
      amount,
      color: categoryColors[category] || "#7c8aa5",
      share: totalExpenses ? (amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

function createExpenseByMonth(transactions) {
  const totalsByMonth = new Map();

  transactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      const month = transaction.date.slice(0, 7);
      totalsByMonth.set(
        month,
        (totalsByMonth.get(month) || 0) + transaction.amount,
      );
    });

  return [...totalsByMonth.entries()]
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function createDraftFromTransaction(transaction) {
  return {
    date: transaction.date,
    merchant: transaction.merchant,
    amount: String(transaction.amount),
    category: transaction.category,
    type: transaction.type,
    note: transaction.note,
  };
}

function getSortLabel(value) {
  const labels = {
    "date-desc": "Newest first",
    "date-asc": "Oldest first",
    "amount-desc": "Largest amount",
    "amount-asc": "Smallest amount",
  };

  return labels[value] || value;
}

function SummaryCard({ label, value, detail, tone }) {
  return (
    <article className={`summary-card ${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

function TrendChart({ series }) {
  if (!series.length) {
    return <EmptyVisualization message="No timeline available yet." />;
  }

  const width = 520;
  const height = 220;
  const padding = 24;
  const balances = series.map((point) => point.balance);
  const minBalance = Math.min(...balances);
  const maxBalance = Math.max(...balances);
  const range = maxBalance - minBalance || 1;

  const points = series
    .map((point, index) => {
      const x =
        padding +
        (index * (width - padding * 2)) / Math.max(series.length - 1, 1);
      const y =
        height -
        padding -
        ((point.balance - minBalance) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const latest = series[series.length - 1];

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="trend-chart" aria-hidden="true">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />
        <polyline points={points} fill="none" />
        {series.map((point, index) => {
          const x =
            padding +
            (index * (width - padding * 2)) / Math.max(series.length - 1, 1);
          const y =
            height -
            padding -
            ((point.balance - minBalance) / range) * (height - padding * 2);

          return (
            <circle
              key={point.month}
              cx={x}
              cy={y}
              r="4"
              className={index === series.length - 1 ? "active-point" : ""}
            />
          );
        })}
      </svg>
      <div className="chart-footer">
        <div>
          <span>Latest balance</span>
          <strong>{formatCurrency(latest.balance)}</strong>
        </div>
        <div className="chart-axis">
          {series.map((point) => (
            <span key={point.month}>{point.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function BreakdownChart({ breakdown, totalExpenses }) {
  if (!breakdown.length) {
    return <EmptyVisualization message="Add expense activity to see category patterns." />;
  }

  return (
    <div className="breakdown-layout">
      <div
        className="donut-chart"
        style={{ background: createGradient(breakdown) }}
        aria-hidden="true"
      >
        <div>
          <span>Spent</span>
          <strong>{formatCompactCurrency(totalExpenses)}</strong>
        </div>
      </div>
      <div className="breakdown-list">
        {breakdown.map((item) => (
          <div key={item.category} className="breakdown-row">
            <div className="breakdown-copy">
              <span className="legend" style={{ backgroundColor: item.color }} />
              <div>
                <strong>{item.category}</strong>
                <small>{item.share.toFixed(0)}% of expenses</small>
              </div>
            </div>
            <span>{formatCurrency(item.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyVisualization({ message }) {
  return (
    <div className="empty-visualization">
      <p>{message}</p>
    </div>
  );
}

function InsightCard({ title, value, detail }) {
  return (
    <article className="insight-card">
      <p>{title}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

function TransactionRow({ transaction, canManage, onEdit }) {
  return (
    <div className="transaction-row">
      <div>
        <small>Date</small>
        <strong>{formatTransactionDate(transaction.date)}</strong>
      </div>
      <div>
        <small>Transaction</small>
        <strong>{transaction.merchant}</strong>
        <span>{transaction.note || "No note added"}</span>
      </div>
      <div>
        <small>Category</small>
        <strong>{transaction.category}</strong>
      </div>
      <div>
        <small>Type</small>
        <span className={`pill ${transaction.type}`}>{transaction.type}</span>
      </div>
      <div className={`amount ${transaction.type}`}>
        <small>Amount</small>
        <strong>
          {transaction.type === "expense" ? "-" : "+"}
          {formatCurrency(transaction.amount)}
        </strong>
      </div>
      <div className="row-action">
        {canManage ? (
          <button type="button" className="ghost-button" onClick={() => onEdit(transaction)}>
            Edit
          </button>
        ) : (
          <span className="read-only-note">Read only</span>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [role, setRole] = useState("viewer");
  const [transactions, setTransactions] = useState(seedTransactions);
  const [filters, setFilters] = useState(defaultFilters);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [storageReady, setStorageReady] = useState(false);

  const deferredSearch = useDeferredValue(filters.search.trim().toLowerCase());

  useEffect(() => {
    try {
      const rawValue = window.localStorage.getItem(STORAGE_KEY);

      if (rawValue) {
        const parsedValue = JSON.parse(rawValue);

        if (Array.isArray(parsedValue.transactions)) {
          setTransactions(parsedValue.transactions);
        }

        if (parsedValue.role === "viewer" || parsedValue.role === "admin") {
          setRole(parsedValue.role);
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        role,
        transactions,
      }),
    );
  }, [role, storageReady, transactions]);

  useEffect(() => {
    if (role === "viewer") {
      setEditingId(null);
      setFormVisible(false);
      setDraft(emptyDraft);
    }
  }, [role]);

  const categories = [...new Set(transactions.map((transaction) => transaction.category))].sort();

  const filteredTransactions = [...transactions]
    .filter((transaction) => {
      const matchesSearch =
        !deferredSearch ||
        String(transaction.merchant || "").toLowerCase().includes(deferredSearch) ||
        String(transaction.category || "").toLowerCase().includes(deferredSearch) ||
        String(transaction.note || "").toLowerCase().includes(deferredSearch);

      const matchesType =
        filters.type === "all" || transaction.type === filters.type;

      const matchesCategory =
        filters.category === "all" || transaction.category === filters.category;

      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((left, right) => {
      switch (filters.sort) {
        case "date-asc":
          return left.date.localeCompare(right.date);
        case "amount-desc":
          return right.amount - left.amount;
        case "amount-asc":
          return left.amount - right.amount;
        case "date-desc":
        default:
          return right.date.localeCompare(left.date);
      }
    });

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const balance = totalIncome - totalExpenses;
  const monthlySeries = createMonthlySeries(transactions);
  const expenseBreakdown = createExpenseBreakdown(transactions);
  const monthlyExpenses = createExpenseByMonth(transactions);
  const topCategory = expenseBreakdown[0];
  const latestMonth = monthlyExpenses[monthlyExpenses.length - 1];
  const previousMonth = monthlyExpenses[monthlyExpenses.length - 2];
  const monthlyDelta =
    latestMonth && previousMonth
      ? latestMonth.amount - previousMonth.amount
      : 0;
  const monthlyDeltaPercent =
    latestMonth && previousMonth && previousMonth.amount
      ? (monthlyDelta / previousMonth.amount) * 100
      : 0;

  const largestExpense = [...transactions]
    .filter((transaction) => transaction.type === "expense")
    .sort((left, right) => right.amount - left.amount)[0];

  const savingsRate = totalIncome ? ((balance / totalIncome) * 100).toFixed(0) : 0;

  function updateFilter(field, value) {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetFilters() {
    setFilters(defaultFilters);
  }

  function openCreateForm() {
    setEditingId(null);
    setDraft({
      ...emptyDraft,
      date: getTodayInputValue(),
    });
    setFormVisible(true);
  }

  function openEditForm(transaction) {
    setEditingId(transaction.id);
    setDraft(createDraftFromTransaction(transaction));
    setFormVisible(true);
  }

  function closeForm() {
    setEditingId(null);
    setDraft(emptyDraft);
    setFormVisible(false);
  }

  function restoreSampleData() {
    setTransactions(seedTransactions);
    setFilters(defaultFilters);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const amount = Number(draft.amount);

    if (!draft.date || !draft.merchant.trim() || !draft.category.trim() || !amount) {
      return;
    }

    const normalizedTransaction = {
      id: editingId || `tx-${Date.now()}`,
      date: draft.date,
      merchant: draft.merchant.trim(),
      amount,
      category: draft.category.trim(),
      type: draft.type,
      note: draft.note.trim(),
    };

    setTransactions((current) => {
      if (editingId) {
        return current.map((transaction) =>
          transaction.id === editingId ? normalizedTransaction : transaction,
        );
      }

      return [normalizedTransaction, ...current];
    });

    closeForm();
  }

  return (
    <main className="dashboard-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <span className="eyebrow">Ledger Lens</span>
          <h1>Financial activity dashboard that feels at home in a real product.</h1>
          <p>
            Track the overall picture, inspect transactions, and switch roles to
            preview how read-only and admin states behave in the same interface.
          </p>
        </div>

        <div className="hero-controls">
          <div className="control-card">
            <label htmlFor="role">Demo role</label>
            <select
              id="role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
            <p>
              {role === "admin"
                ? "Admin can add and edit transactions directly from the dashboard."
                : "Viewer mode keeps financial data visible but all transaction actions read only."}
            </p>
          </div>

          <div className="status-card">
            <small>Working set</small>
            <strong>{transactions.length} transactions</strong>
            <span>
              Filtered by {filters.type === "all" ? "all types" : filters.type} and{" "}
              {getSortLabel(filters.sort).toLowerCase()}.
            </span>
          </div>
        </div>
      </section>

      <section className="summary-grid">
        <SummaryCard
          label="Total balance"
          value={formatCurrency(balance)}
          detail={`${savingsRate}% of income retained after expenses`}
          tone="neutral"
        />
        <SummaryCard
          label="Income"
          value={formatCurrency(totalIncome)}
          detail="Combined salary, freelance, and bonus inflows"
          tone="positive"
        />
        <SummaryCard
          label="Expenses"
          value={formatCurrency(totalExpenses)}
          detail="Housing, lifestyle, and operational spending"
          tone="warning"
        />
        <SummaryCard
          label="Visible transactions"
          value={String(filteredTransactions.length)}
          detail="Updates instantly with search, filters, and sorting"
          tone="accent"
        />
      </section>

      <section className="visual-grid">
        <article className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-kicker">Time-based view</span>
              <h2>Balance trend</h2>
            </div>
            <span className="badge">Running monthly balance</span>
          </div>
          <TrendChart series={monthlySeries} />
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-kicker">Category view</span>
              <h2>Spending breakdown</h2>
            </div>
            <span className="badge">Expenses only</span>
          </div>
          <BreakdownChart breakdown={expenseBreakdown} totalExpenses={totalExpenses} />
        </article>
      </section>

      <section className="panel transactions-panel">
        <div className="panel-head panel-head-spread">
          <div>
            <span className="panel-kicker">Transactions</span>
            <h2>Explore activity</h2>
          </div>
          <div className="toolbar-actions">
            <button type="button" className="ghost-button" onClick={resetFilters}>
              Clear filters
            </button>
            {role === "admin" && (
              <button type="button" className="primary-button" onClick={openCreateForm}>
                Add transaction
              </button>
            )}
          </div>
        </div>

        <div className="filters-grid">
          <label>
            Search
            <input
              type="search"
              placeholder="Search merchant, note, or category"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
            />
          </label>
          <label>
            Type
            <select
              value={filters.type}
              onChange={(event) => updateFilter("type", event.target.value)}
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </label>
          <label>
            Category
            <select
              value={filters.category}
              onChange={(event) => updateFilter("category", event.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sort
            <select
              value={filters.sort}
              onChange={(event) => updateFilter("sort", event.target.value)}
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="amount-desc">Largest amount</option>
              <option value="amount-asc">Smallest amount</option>
            </select>
          </label>
        </div>

        {role === "admin" && formVisible && (
          <form className="editor-card" onSubmit={handleSubmit}>
            <div className="editor-head">
              <div>
                <span className="panel-kicker">Admin tools</span>
                <h3>{editingId ? "Edit transaction" : "Add transaction"}</h3>
              </div>
              <button type="button" className="ghost-button" onClick={closeForm}>
                Cancel
              </button>
            </div>

            <div className="editor-grid">
              <label>
                Date
                <input
                  type="date"
                  value={draft.date}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, date: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Merchant
                <input
                  type="text"
                  placeholder="Enter merchant or source"
                  value={draft.merchant}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, merchant: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Amount
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  value={draft.amount}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, amount: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Category
                <input
                  type="text"
                  list="category-options"
                  value={draft.category}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, category: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Type
                <select
                  value={draft.type}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, type: event.target.value }))
                  }
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>
              <label className="wide-field">
                Note
                <input
                  type="text"
                  placeholder="Optional context for this transaction"
                  value={draft.note}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, note: event.target.value }))
                  }
                />
              </label>
            </div>

            <datalist id="category-options">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>

            <div className="editor-actions">
              <button type="submit" className="primary-button">
                {editingId ? "Save changes" : "Create transaction"}
              </button>
            </div>
          </form>
        )}

        <div className="transactions-list">
          {transactions.length === 0 ? (
            <div className="empty-state">
              <h3>No transactions yet</h3>
              <p>
                Start with a clean slate or restore the sample data to preview
                the dashboard in action.
              </p>
              <button type="button" className="primary-button" onClick={restoreSampleData}>
                Restore sample data
              </button>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="empty-state">
              <h3>No matches for these filters</h3>
              <p>Try clearing the search or switching the category and type filters.</p>
              <button type="button" className="ghost-button" onClick={resetFilters}>
                Reset filters
              </button>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                canManage={role === "admin"}
                onEdit={openEditForm}
              />
            ))
          )}
        </div>
      </section>

      <section className="insights-grid">
        <InsightCard
          title="Highest spending category"
          value={
            topCategory
              ? `${topCategory.category} | ${formatCurrency(topCategory.amount)}`
              : "No expense data yet"
          }
          detail={
            topCategory
              ? `${topCategory.share.toFixed(0)}% of all expense volume is concentrated here.`
              : "Once expenses appear, this card will highlight the biggest category."
          }
        />
        <InsightCard
          title="Monthly comparison"
          value={
            latestMonth && previousMonth
              ? `${monthlyDelta >= 0 ? "+" : ""}${formatCurrency(monthlyDelta)}`
              : "Not enough data yet"
          }
          detail={
            latestMonth && previousMonth
              ? `${formatMonthLabel(latestMonth.month)} spending is ${
                  monthlyDelta >= 0 ? "up" : "down"
                } ${Math.abs(monthlyDeltaPercent).toFixed(0)}% from ${formatMonthLabel(
                  previousMonth.month,
                )}.`
              : "Add at least two months of expense data to compare trends."
          }
        />
        <InsightCard
          title="Useful observation"
          value={
            largestExpense
              ? `${largestExpense.category} anchor spend`
              : "No observation available"
          }
          detail={
            largestExpense
              ? `${largestExpense.merchant} is the single largest outgoing transaction at ${formatCurrency(
                  largestExpense.amount,
                )}, so fixed costs are doing most of the work in your expense profile.`
              : "Add more transactions to unlock a stronger financial signal."
          }
        />
      </section>
    </main>
  );
}
