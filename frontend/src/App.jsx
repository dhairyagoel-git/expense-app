import { useState, useEffect, createContext, useContext } from "react";
const API = "https://expense-app-backend-5fh9.onrender.com";
console.log(API);

// ─── Auth Context ────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  const login = (userData, tok) => {
    setUser(userData);
    setToken(tok);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tok);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);

// ─── API Helper ──────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ─── Category Config ─────────────────────────────────────────────────────────
const CATEGORIES = ["Food", "Travel", "Bills", "Shopping", "Health", "Entertainment", "Education", "Other"];
const CAT_COLORS = {
  Food: "#f97316", Travel: "#8b5cf6", Bills: "#ef4444",
  Shopping: "#ec4899", Health: "#10b981", Entertainment: "#3b82f6",
  Education: "#f59e0b", Other: "#6b7280",
};
const CAT_ICONS = {
  Food: "🍔", Travel: "✈️", Bills: "📄", Shopping: "🛍️",
  Health: "❤️", Entertainment: "🎬", Education: "📚", Other: "📦",
};

// ─── Components ──────────────────────────────────────────────────────────────

function Input({ label, error, ...props }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      {label && <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#94a3b8", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>}
      <input
        {...props}
        style={{
          width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)",
          border: `1px solid ${error ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
          borderRadius: "10px", color: "#f1f5f9", fontSize: "15px",
          outline: "none", transition: "border-color 0.2s", boxSizing: "border-box",
          fontFamily: "inherit",
        }}
        onFocus={e => e.target.style.borderColor = "#6366f1"}
        onBlur={e => e.target.style.borderColor = error ? "#ef4444" : "rgba(255,255,255,0.1)"}
      />
      {error && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{error}</p>}
    </div>
  );
}

function Select({ label, options, value, onChange }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      {label && <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#94a3b8", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>}
      <select
        value={value}
        onChange={onChange}
        style={{
          width: "100%", padding: "12px 16px", background: "#1e293b",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
          color: "#f1f5f9", fontSize: "15px", outline: "none", boxSizing: "border-box",
          fontFamily: "inherit", cursor: "pointer",
        }}
      >
        {options.map(o => (
          <option key={o} value={o} style={{ background: "#1e293b" }}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function Button({ children, loading, variant = "primary", ...props }) {
  const styles = {
    primary: { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff" },
    secondary: { background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" },
    danger: { background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" },
  };
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      style={{
        padding: "12px 24px", borderRadius: "10px", fontWeight: 600,
        fontSize: "15px", cursor: loading ? "wait" : "pointer", border: "none",
        transition: "all 0.2s", fontFamily: "inherit", width: "100%",
        ...styles[variant],
        opacity: loading ? 0.7 : 1,
        ...props.style,
      }}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}

// ─── Register Page ────────────────────────────────────────────────────────────
function RegisterPage({ onSwitch }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Min 6 characters";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    setLoading(true); setMsg("");
    try {
      const data = await apiFetch("/register", { method: "POST", body: JSON.stringify(form) });
      login(data.user, data.token);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authContainerStyle}>
      <div style={authCardStyle}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>💸</div>
          <h1 style={{ color: "#f1f5f9", fontSize: "26px", fontWeight: 700, margin: 0 }}>Create Account</h1>
          <p style={{ color: "#64748b", marginTop: "8px", fontSize: "14px" }}>Start tracking your expenses today</p>
        </div>
        {msg && <div style={errorBannerStyle}>{msg}</div>}
        <Input label="Full Name" type="text" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={errors.name} />
        <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} error={errors.email} />
        <Input label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} error={errors.password} />
        <Button loading={loading} onClick={handleSubmit}>Create Account</Button>
        <p style={{ textAlign: "center", color: "#64748b", marginTop: "20px", fontSize: "14px" }}>
          Already have an account?{" "}
          <span onClick={onSwitch} style={{ color: "#6366f1", cursor: "pointer", fontWeight: 600 }}>Sign In</span>
        </p>
      </div>
    </div>
  );
}

// ─── Login Page ────────────────────────────────────────────────────────────
function LoginPage({ onSwitch }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async () => {
    if (!form.email || !form.password) return setMsg("Please fill all fields");
    setLoading(true); setMsg("");
    try {
      const data = await apiFetch("/login", { method: "POST", body: JSON.stringify(form) });
      login(data.user, data.token);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authContainerStyle}>
      <div style={authCardStyle}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>💸</div>
          <h1 style={{ color: "#f1f5f9", fontSize: "26px", fontWeight: 700, margin: 0 }}>Welcome Back</h1>
          <p style={{ color: "#64748b", marginTop: "8px", fontSize: "14px" }}>Sign in to your expense manager</p>
        </div>
        {msg && <div style={errorBannerStyle}>{msg}</div>}
        <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <Input label="Password" type="password" placeholder="Your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <Button loading={loading} onClick={handleSubmit}>Sign In</Button>
        <p style={{ textAlign: "center", color: "#64748b", marginTop: "20px", fontSize: "14px" }}>
          Don't have an account?{" "}
          <span onClick={onSwitch} style={{ color: "#6366f1", cursor: "pointer", fontWeight: 600 }}>Register</span>
        </p>
      </div>
    </div>
  );
}

// ─── Add Expense Modal ─────────────────────────────────────────────────────────
function AddExpenseModal({ onClose, onAdded, token }) {
  const [form, setForm] = useState({ title: "", amount: "", category: "Food", date: new Date().toISOString().split("T")[0], notes: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async () => {
    if (!form.title || !form.amount) return setMsg("Title and amount are required");
    setLoading(true); setMsg("");
    try {
      await apiFetch("/expense", { method: "POST", body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }) }, token);
      onAdded();
      onClose();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "20px" }}>
      <div style={{ background: "#1e293b", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "460px", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ color: "#f1f5f9", margin: 0, fontSize: "20px", fontWeight: 700 }}>Add Expense</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "20px" }}>✕</button>
        </div>
        {msg && <div style={errorBannerStyle}>{msg}</div>}
        <Input label="Title" type="text" placeholder="e.g. Lunch at cafe" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <Input label="Amount (₹)" type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
        <Select label="Category" options={CATEGORIES} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
        <Input label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        <Input label="Notes (optional)" type="text" placeholder="Any notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="secondary" onClick={onClose} style={{ width: "auto", flex: 1 }}>Cancel</Button>
          <Button loading={loading} onClick={handleSubmit} style={{ flex: 2 }}>Add Expense</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard() {
  const { user, token, logout } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterCat, setFilterCat] = useState("All");
  const [deleting, setDeleting] = useState(null);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const query = filterCat !== "All" ? `?category=${filterCat}` : "";
      const data = await apiFetch(`/expenses${query}`, {}, token);
      setExpenses(data.expenses);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, [filterCat]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await apiFetch(`/expense/${id}`, { method: "DELETE" }, token);
      setExpenses(prev => prev.filter(e => e._id !== id));
      setTotal(prev => parseFloat((prev - expenses.find(e => e._id === id)?.amount || 0).toFixed(2)));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  };

  // Category breakdown for bonus
  const catBreakdown = CATEGORIES.map(cat => ({
    cat,
    amount: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <header style={{ background: "rgba(30,41,59,0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "24px" }}>💸</span>
            <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "18px" }}>ExpenseTracker</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ color: "#94a3b8", fontSize: "14px" }}>👋 {user?.name}</span>
            <button onClick={logout} style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          <StatCard icon="💰" label="Total Spent" value={`₹${total.toLocaleString()}`} color="#6366f1" />
          <StatCard icon="📊" label="Transactions" value={expenses.length} color="#10b981" />
          <StatCard icon="📅" label="This Month" value={`₹${expenses.filter(e => new Date(e.date).getMonth() === new Date().getMonth()).reduce((s, e) => s + e.amount, 0).toLocaleString()}`} color="#f97316" />
          <StatCard icon="🏷️" label="Categories" value={catBreakdown.length} color="#8b5cf6" />
        </div>

        {/* Category Breakdown */}
        {catBreakdown.length > 0 && (
          <div style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
            <h3 style={{ color: "#f1f5f9", margin: "0 0 16px", fontSize: "15px", fontWeight: 600 }}>Spending by Category</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {catBreakdown.map(({ cat, amount }) => (
                <div key={cat} style={{ background: `${CAT_COLORS[cat]}20`, border: `1px solid ${CAT_COLORS[cat]}40`, borderRadius: "10px", padding: "8px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>{CAT_ICONS[cat]}</span>
                  <span style={{ color: CAT_COLORS[cat], fontSize: "13px", fontWeight: 600 }}>{cat}</span>
                  <span style={{ color: "#94a3b8", fontSize: "13px" }}>₹{amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["All", ...CATEGORIES].map(cat => (
              <button key={cat} onClick={() => setFilterCat(cat)} style={{
                padding: "8px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                background: filterCat === cat ? "#6366f1" : "rgba(255,255,255,0.05)",
                color: filterCat === cat ? "#fff" : "#94a3b8",
                border: filterCat === cat ? "none" : "1px solid rgba(255,255,255,0.08)",
                transition: "all 0.2s",
              }}>
                {cat !== "All" && CAT_ICONS[cat]} {cat}
              </button>
            ))}
          </div>
          <button onClick={() => setShowModal(true)} style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff",
            border: "none", padding: "10px 20px", borderRadius: "10px",
            fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
          }}>
            + Add Expense
          </button>
        </div>

        {/* Expense List */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#64748b", padding: "60px" }}>Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#475569" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🧾</div>
            <p style={{ fontSize: "16px" }}>No expenses found. Add your first one!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {expenses.map(exp => (
              <div key={exp._id} style={{
                background: "rgba(30,41,59,0.5)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "12px", padding: "16px 20px", display: "flex",
                justifyContent: "space-between", alignItems: "center", transition: "border-color 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: `${CAT_COLORS[exp.category]}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                    {CAT_ICONS[exp.category]}
                  </div>
                  <div>
                    <p style={{ color: "#f1f5f9", fontWeight: 600, margin: "0 0 4px", fontSize: "15px" }}>{exp.title}</p>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span style={{ background: `${CAT_COLORS[exp.category]}20`, color: CAT_COLORS[exp.category], fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "20px" }}>{exp.category}</span>
                      <span style={{ color: "#64748b", fontSize: "12px" }}>{new Date(exp.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                      {exp.notes && <span style={{ color: "#64748b", fontSize: "12px" }}>• {exp.notes}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "17px" }}>₹{exp.amount.toLocaleString()}</span>
                  <button onClick={() => handleDelete(exp._id)} disabled={deleting === exp._id} style={{
                    background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)",
                    padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "13px",
                    opacity: deleting === exp._id ? 0.5 : 1,
                  }}>
                    {deleting === exp._id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && <AddExpenseModal token={token} onClose={() => setShowModal(false)} onAdded={fetchExpenses} />}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <span style={{ fontSize: "20px" }}>{icon}</span>
        <span style={{ color: "#64748b", fontSize: "13px", fontWeight: 500 }}>{label}</span>
      </div>
      <p style={{ color, fontSize: "24px", fontWeight: 700, margin: 0 }}>{value}</p>
    </div>
  );
}

// ─── Shared Styles ─────────────────────────────────────────────────────────────
const authContainerStyle = {
  minHeight: "100vh", background: "radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 60%)",
  display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
  fontFamily: "'Segoe UI', sans-serif",
};

const authCardStyle = {
  background: "rgba(30,41,59,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "20px", padding: "40px", width: "100%", maxWidth: "420px",
};

const errorBannerStyle = {
  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px",
  color: "#ef4444", padding: "12px 16px", marginBottom: "16px", fontSize: "14px",
};

// ─── App Root ─────────────────────────────────────────────────────────────────
function AppInner() {
  const { user } = useAuth();
  const [page, setPage] = useState("login");

  if (user) return <Dashboard />;
  if (page === "register") return <RegisterPage onSwitch={() => setPage("login")} />;
  return <LoginPage onSwitch={() => setPage("register")} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
