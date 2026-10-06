import { LogOut, ShieldCheck } from "lucide-react";

export default function Navbar({ user, onLogout }) {
  return (
    <header className="navbar">
      <div className="nav-inner">
        <div className="brand">
          <div className="brand-icon"><ShieldCheck size={23} /></div>
          <div>
            <strong>VisitorDesk</strong>
            <span>Employee Visitor Management</span>
          </div>
        </div>

        <div className="nav-user">
          <div className="user-avatar">
            {user.avatar ? <img src={user.avatar} alt="" /> : user.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="user-info">
            <strong>{user.name}</strong>
            <span>{user.role === "admin" ? "Administrator" : "Employee"}</span>
          </div>
          <button className="logout-btn" onClick={onLogout} title="Logout">
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
