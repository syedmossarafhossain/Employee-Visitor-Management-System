import { Edit3, Search, Trash2, UserCheck } from "lucide-react";

const formatDate = (value) =>
  new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });

export default function VisitorTable({
  visitors,
  search,
  setSearch,
  loading,
  onEdit,
  onDelete,
  onStatus,
  canManage
}) {
  return (
    <>
      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by visitor name or mobile number..."
          />
        </div>
        <span className="result-count">{visitors.length} record(s)</span>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Visitor</th>
              <th>Contact</th>
              <th>Organization / College</th>
              <th>Person to Meet</th>
              <th>Purpose</th>
              <th>Visit Date & Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="empty-cell">Loading visitors...</td>
              </tr>
            ) : visitors.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-cell">
                  No visitor records found.
                </td>
              </tr>
            ) : (
              visitors.map((visitor) => (
                <tr key={visitor._id}>
                  <td>
                    <div className="visitor-name">{visitor.visitorName}</div>
                    <div className="subtext">{visitor.email}</div>
                  </td>
                  <td>{visitor.mobileNumber}</td>
                  <td>{visitor.organization}</td>
                  <td>{visitor.personToMeet}</td>
                  <td>{visitor.purpose}</td>
                  <td>{formatDate(visitor.visitDateTime)}</td>
                  <td>
                    <button
                      className={`status-badge ${visitor.status === "Checked In" ? "in" : "out"}`}
                      onClick={() => canManage && onStatus(visitor)}
                      title={canManage ? "Click to change status" : "Admin only"}
                      disabled={!canManage}
                    >
                      <UserCheck size={13} />
                      {visitor.status}
                    </button>
                  </td>
                  <td>
                    {canManage ? (
                      <div className="actions">
                        <button className="table-btn edit" onClick={() => onEdit(visitor)} title="Edit">
                          <Edit3 size={16} />
                        </button>
                        <button className="table-btn delete" onClick={() => onDelete(visitor._id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="admin-only-text">View only</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
