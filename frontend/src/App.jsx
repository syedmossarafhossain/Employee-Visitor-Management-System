import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Plus, RefreshCw, Users } from "lucide-react";
import AuthPage from "./components/AuthPage";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import VisitorForm from "./components/VisitorForm";
import VisitorTable from "./components/VisitorTable";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("visitor_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const emptyForm = {
  visitorName: "",
  mobileNumber: "",
  email: "",
  organization: "",
  personToMeet: "",
  purpose: "",
  visitDateTime: "",
  status: "Checked In"
};

const toInputDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
};

function AppContent() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [visitors, setVisitors] = useState([]);
  const [search, setSearch] = useState("");
  const [editingVisitor, setEditingVisitor] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const token = localStorage.getItem("visitor_token");
    if (!token) {
      setAuthChecking(false);
      return;
    }

    api.get("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("visitor_token");
        localStorage.removeItem("visitor_user");
      })
      .finally(() => setAuthChecking(false));
  }, []);

  const authenticate = async (mode, data) => {
    const endpoint =
      mode === "register" ? "/auth/register" :
      mode === "google" ? "/auth/google" :
      "/auth/login";

    const { data: result } = await api.post(endpoint, data);
    localStorage.setItem("visitor_token", result.token);
    localStorage.setItem("visitor_user", JSON.stringify(result.user));
    setUser(result.user);
  };

  const logout = () => {
    localStorage.removeItem("visitor_token");
    localStorage.removeItem("visitor_user");
    setUser(null);
    setVisitors([]);
    setShowForm(false);
    setEditingVisitor(null);
  };

  const fetchVisitors = useCallback(async (query = "") => {
    if (!user) return;

    try {
      setLoading(true);
      const { data } = await api.get("/visitors", {
        params: query ? { search: query } : {}
      });
      setVisitors(data);
    } catch (error) {
      if (error.response?.status === 401) logout();
      else {
        const apiMessage = error.response?.data?.message || error.response?.data?.error;
        setMessage({
          type: "error",
          text: apiMessage || "Unable to load visitors."
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => fetchVisitors(search), 300);
    return () => clearTimeout(timer);
  }, [search, user, fetchVisitors]);

  useEffect(() => {
    if (!message.text) return;
    const timer = setTimeout(() => setMessage({ type: "", text: "" }), 3500);
    return () => clearTimeout(timer);
  }, [message]);

  const stats = useMemo(() => ({
    total: visitors.length,
    checkedIn: visitors.filter((v) => v.status === "Checked In").length,
    checkedOut: visitors.filter((v) => v.status === "Checked Out").length
  }), [visitors]);

  const openAdd = () => {
    setEditingVisitor(null);
    setShowForm(true);
  };

  const openEdit = (visitor) => {
    setEditingVisitor({
      ...visitor,
      visitDateTime: toInputDateTime(visitor.visitDateTime)
    });
    setShowForm(true);
  };

  const handleSubmit = async (form) => {
    try {
      if (editingVisitor) {
        await api.put(`/visitors/${editingVisitor._id}`, form);
        setMessage({ type: "success", text: "Visitor updated successfully." });
      } else {
        await api.post("/visitors", form);
        setMessage({ type: "success", text: "Visitor added successfully." });
      }

      setShowForm(false);
      setEditingVisitor(null);
      await fetchVisitors(search);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || error.response?.data?.error || "Operation failed."
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this visitor record?")) return;

    try {
      await api.delete(`/visitors/${id}`);
      setMessage({ type: "success", text: "Visitor deleted successfully." });
      await fetchVisitors(search);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Delete failed."
      });
    }
  };

  const handleStatus = async (visitor) => {
    try {
      await api.put(`/visitors/${visitor._id}`, {
        visitorName: visitor.visitorName,
        mobileNumber: visitor.mobileNumber,
        email: visitor.email,
        organization: visitor.organization,
        personToMeet: visitor.personToMeet,
        purpose: visitor.purpose,
        visitDateTime: visitor.visitDateTime,
        status: visitor.status === "Checked In" ? "Checked Out" : "Checked In"
      });
      setMessage({ type: "success", text: "Visitor status updated." });
      await fetchVisitors(search);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Status update failed."
      });
    }
  };

  if (authChecking) {
    return <div className="loading-screen">Checking secure session...</div>;
  }

  if (!user) {
    return (
      <AuthPage
        onAuth={authenticate}
      />
    );
  }

  const isAdmin = user.role === "admin";

  return (
    <div className="app">
      <Navbar user={user} onLogout={logout} />

      <main className="container">
        <section className="hero">
          <div>
            <p className="eyebrow">{isAdmin ? "ADMINISTRATION PORTAL" : "EMPLOYEE PORTAL"}</p>
            <h1>Employee Visitor Management</h1>
            <p className="hero-text">
              {isAdmin
                ? "Register, track, search and manage visitors from one secure dashboard."
                : "View and search visitor records. Only administrators can add or modify records."}
            </p>
          </div>

          {isAdmin && (
            <button className="primary-btn" onClick={openAdd}>
              <Plus size={18} />
              Add Visitor
            </button>
          )}
        </section>

        {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

        {!isAdmin && (
          <div className="permission-note">
            <strong>View-only access</strong>
            <span>You are signed in as an employee. Add, edit, status changes and delete actions are restricted to admins.</span>
          </div>
        )}

        <Dashboard stats={stats} />

        <section className="records-card">
          <div className="section-heading">
            <div>
              <h2>Visitor Records</h2>
              <p>Manage all current and previous visitor entries.</p>
            </div>

            <button className="secondary-btn" onClick={() => fetchVisitors(search)} title="Refresh">
              <RefreshCw size={17} />
              Refresh
            </button>
          </div>

          <VisitorTable
            visitors={visitors}
            search={search}
            setSearch={setSearch}
            loading={loading}
            onEdit={openEdit}
            onDelete={handleDelete}
            onStatus={handleStatus}
            canManage={isAdmin}
          />
        </section>
      </main>

      {showForm && isAdmin && (
        <VisitorForm
          initialData={editingVisitor || emptyForm}
          isEditing={Boolean(editingVisitor)}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingVisitor(null);
          }}
        />
      )}

      <footer>
        <Users size={15} /> Employee Visitor Management System • MERN Stack
      </footer>
    </div>
  );
}

export default function App() {
  if (!GOOGLE_CLIENT_ID) {
    // The rest of the app still renders, but Google login needs the Vite env variable.
    console.warn("VITE_GOOGLE_CLIENT_ID is not configured. Google login will not be available.");
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || "missing-client-id"}>
      <AppContent />
    </GoogleOAuthProvider>
  );
}
