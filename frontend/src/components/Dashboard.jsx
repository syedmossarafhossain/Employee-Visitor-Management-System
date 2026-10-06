import { LogIn, LogOut, UsersRound } from "lucide-react";

export default function Dashboard({ stats }) {
  const cards = [
    { title: "Total Visitors", value: stats.total, icon: UsersRound },
    { title: "Currently Checked In", value: stats.checkedIn, icon: LogIn },
    { title: "Checked Out", value: stats.checkedOut, icon: LogOut }
  ];

  return (
    <section className="stats-grid">
      {cards.map(({ title, value, icon: Icon }) => (
        <div className="stat-card" key={title}>
          <div>
            <span>{title}</span>
            <strong>{value}</strong>
          </div>
          <div className="stat-icon"><Icon size={22} /></div>
        </div>
      ))}
    </section>
  );
}
