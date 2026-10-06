import { useEffect, useState } from "react";
import { X } from "lucide-react";

const fields = [
  ["visitorName", "Visitor Name", "text", "e.g. Rahul Sharma"],
  ["mobileNumber", "Mobile Number", "tel", "10-digit mobile number"],
  ["email", "Email Address", "email", "e.g. rahul@email.com"],
  ["organization", "Organization / College", "text", "Company or college name"],
  ["personToMeet", "Person to Meet", "text", "Employee name"],
  ["purpose", "Purpose of Visit", "text", "e.g. Interview / Meeting"]
];

export default function VisitorForm({
  initialData,
  isEditing,
  onSubmit,
  onClose
}) {
  const [form, setForm] = useState(initialData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">VISITOR RECORD</p>
            <h2>{isEditing ? "Update Visitor" : "Add New Visitor"}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="form-grid">
            {fields.map(([key, label, type, placeholder]) => (
              <label className="field" key={key}>
                <span>{label}</span>
                <input
                  type={type}
                  value={form[key] || ""}
                  placeholder={placeholder}
                  onChange={(e) => update(key, e.target.value)}
                  required
                />
              </label>
            ))}

            <label className="field">
              <span>Date & Time of Visit</span>
              <input
                type="datetime-local"
                value={form.visitDateTime || ""}
                onChange={(e) => update("visitDateTime", e.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Status</span>
              <select
                value={form.status || "Checked In"}
                onChange={(e) => update("status", e.target.value)}
              >
                <option>Checked In</option>
                <option>Checked Out</option>
              </select>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Saving..." : isEditing ? "Update Visitor" : "Save Visitor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
