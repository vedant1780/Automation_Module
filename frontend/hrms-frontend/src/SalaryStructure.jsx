import { useEffect, useState } from "react";
import api from "./api";
import "./SalaryStructure.css";

const emptyForm = {
  name: "",
  basicSalary: "",
  hra: "",
  specialAllowance: "",
  effectiveFrom: "",
  effectiveTo: "",
};

function formatAmount(amount) {
  if (amount === null || amount === undefined || amount === "") {
    return "₹ 0.00";
  }

  return `₹ ${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function SalaryStructure() {
  const [structures, setStructures] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isEditing = editingId !== null;

  const fetchStructures = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/salary-structures");
      setStructures(response.data || []);
    } catch (err) {
      console.error("Salary structure loading error:", err);
      setError(err.response?.data?.message || "Unable to load salary structures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const startEdit = (structure) => {
    setEditingId(structure.id);
    setForm({
      name: structure.name || "",
      basicSalary: structure.basicSalary ?? "",
      hra: structure.hra ?? "",
      specialAllowance: structure.specialAllowance ?? "",
      effectiveFrom: structure.effectiveFrom || "",
      effectiveTo: structure.effectiveTo || "",
    });
    setMessage("");
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!form.name.trim()) {
      setError("Please enter a structure name");
      return;
    }

    if (form.basicSalary === "") {
      setError("Please enter a basic salary");
      return;
    }

    if (!form.effectiveFrom) {
      setError("Please select an effective from date");
      return;
    }

    const payload = {
      name: form.name.trim(),
      basicSalary: Number(form.basicSalary),
      hra: form.hra === "" ? 0 : Number(form.hra),
      specialAllowance: form.specialAllowance === "" ? 0 : Number(form.specialAllowance),
      effectiveFrom: form.effectiveFrom,
      effectiveTo: form.effectiveTo || null,
    };

    try {
      setSaving(true);

      if (isEditing) {
        await api.put(`/salary-structures/${editingId}`, payload);
        setMessage("Salary structure updated successfully!");
      } else {
        await api.post("/salary-structures", payload);
        setMessage("Salary structure created successfully!");
      }

      setForm(emptyForm);
      setEditingId(null);

      await fetchStructures();
    } catch (err) {
      console.error("Save salary structure error:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          (isEditing ? "Failed to update salary structure" : "Failed to create salary structure")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (structure) => {
    const confirmed = window.confirm(`Delete salary structure "${structure.name}"? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(structure.id);
      setMessage("");
      setError("");

      await api.delete(`/salary-structures/${structure.id}`);

      setMessage("Salary structure deleted successfully!");

      if (editingId === structure.id) {
        cancelEdit();
      }

      await fetchStructures();
    } catch (err) {
      console.error("Delete salary structure error:", err);
      setError(err.response?.data?.message || err.response?.data || "Failed to delete salary structure");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="salary-structure">
      <div className="page-header">
        <div>
          <h2>Salary Structures</h2>
          <p>Define and manage salary structures</p>
        </div>
      </div>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div className="card">
        <h3>{isEditing ? "Edit Salary Structure" : "Add Salary Structure"}</h3>

        <form onSubmit={handleSubmit} className="structure-form">
          <div className="field">
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Software Engineer - L2"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>Basic Salary</label>
            <input
              type="number"
              name="basicSalary"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={form.basicSalary}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>HRA</label>
            <input
              type="number"
              name="hra"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={form.hra}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label>Special Allowance</label>
            <input
              type="number"
              name="specialAllowance"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={form.specialAllowance}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label>Effective From</label>
            <input
              type="date"
              name="effectiveFrom"
              value={form.effectiveFrom}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>Effective To (optional)</label>
            <input
              type="date"
              name="effectiveTo"
              value={form.effectiveTo}
              min={form.effectiveFrom || undefined}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="add-button" disabled={saving}>
              {saving
                ? isEditing
                  ? "Updating..."
                  : "Adding..."
                : isEditing
                ? "Update Structure"
                : "Add Structure"}
            </button>

            {isEditing && (
              <button type="button" className="cancel-button" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h3>All Salary Structures</h3>

        {loading ? (
          <div className="empty-state">Loading salary structures...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Basic</th>
                  <th>HRA</th>
                  <th>Special Allowance</th>
                  <th>Gross</th>
                  <th>Effective From</th>
                  <th>Effective To</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {structures.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="empty">
                      No salary structures found
                    </td>
                  </tr>
                ) : (
                  structures.map((structure) => {
                    const gross =
                      Number(structure.basicSalary || 0) +
                      Number(structure.hra || 0) +
                      Number(structure.specialAllowance || 0);

                    return (
                      <tr key={structure.id}>
                        <td>{structure.id}</td>
                        <td>
                          <strong>{structure.name}</strong>
                        </td>
                        <td>{formatAmount(structure.basicSalary)}</td>
                        <td>{formatAmount(structure.hra)}</td>
                        <td>{formatAmount(structure.specialAllowance)}</td>
                        <td>
                          <strong>{formatAmount(gross)}</strong>
                        </td>
                        <td>{structure.effectiveFrom || "-"}</td>
                        <td>{structure.effectiveTo || "-"}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              structure.effectiveTo ? "badge-inactive" : "badge-active"
                            }`}
                          >
                            {structure.effectiveTo ? "Inactive" : "Active"}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button className="edit-button" onClick={() => startEdit(structure)}>
                              Edit
                            </button>
                            <button
                              className="delete-button"
                              onClick={() => handleDelete(structure)}
                              disabled={deletingId === structure.id}
                            >
                              {deletingId === structure.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SalaryStructure;
