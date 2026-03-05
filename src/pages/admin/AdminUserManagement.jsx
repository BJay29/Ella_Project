import React, { useState } from 'react';
import { C, initialUsers } from './adminConstants';
import { Modal, ModalField, ModalSelect, ModalActions, ConfirmModal } from './adminModals';

const AdminUserManagement = () => {
  const [users, setUsers]           = useState(initialUsers);
  const [search, setSearch]         = useState("");
  const [editUser, setEditUser]     = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [addModal, setAddModal]     = useState(false);
  const [newUser, setNewUser]       = useState({ name: "", role: "Student", email: "", status: "Active" });

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveEdit = () => {
    setUsers(us => us.map(u => u.id === editUser.id ? editUser : u));
    setEditUser(null);
  };
  const handleDelete = () => {
    setUsers(us => us.filter(u => u.id !== deleteUser.id));
    setDeleteUser(null);
  };
  const handleAdd = () => {
    setUsers(us => [...us, { ...newUser, id: Date.now() }]);
    setAddModal(false);
    setNewUser({ name: "", role: "Student", email: "", status: "Active" });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 4 }}>User Management</h2>
          <p style={{ color: C.textMid }}>Manage system users, roles, and access levels.</p>
        </div>
        <button onClick={() => setAddModal(true)} style={{
          background: C.textDark, color: "#fff", border: "none",
          borderRadius: 10, padding: "10px 20px", fontWeight: 700,
          fontSize: 14, cursor: "pointer",
        }}>Add New User</button>
      </div>

      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", background: C.card,
        borderRadius: 40, padding: "10px 20px", marginBottom: 20,
        boxShadow: "0 1px 4px rgba(0,0,0,.08)", gap: 10,
      }}>
        <span className="material-icons" style={{ color: C.textLight, fontSize: 22 }}>search</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search Users..."
          style={{ border: "none", outline: "none", fontSize: 15, flex: 1, background: "transparent" }}
        />
      </div>

      {/* Table */}
      <div style={{ background: C.card, borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #eee" }}>
              {["Name","Role","Email","Status","Actions"].map(h => (
                <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 14, color: C.textMid, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "14px 20px", fontSize: 15 }}>{u.name}</td>
                <td style={{ padding: "14px 20px", fontSize: 14, color: C.textMid }}>{u.role}</td>
                <td style={{ padding: "14px 20px", fontSize: 14, color: C.textMid }}>{u.email}</td>
                <td style={{ padding: "14px 20px" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: u.status === "Active" ? C.green : C.red }}>
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <button onClick={() => setEditUser({ ...u })} style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <span className="material-icons" style={{ fontSize: 20, color: C.textMid }}>edit</span>
                  </button>
                  <button onClick={() => setDeleteUser(u)} style={{ background: "none", border: "none", cursor: "pointer", marginLeft: 6 }}>
                    <span className="material-icons" style={{ fontSize: 20, color: C.red }}>delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editUser && (
        <Modal title="Edit User" onClose={() => setEditUser(null)}>
          <ModalField label="Name"  value={editUser.name}  onChange={v => setEditUser(u => ({ ...u, name: v }))} />
          <ModalField label="Email" value={editUser.email} onChange={v => setEditUser(u => ({ ...u, email: v }))} />
          <div style={{ display: "flex", gap: 16 }}>
            <ModalSelect label="Role"   value={editUser.role}   options={["Student","Instructor","Admin"]} onChange={v => setEditUser(u => ({ ...u, role: v }))} />
            <ModalSelect label="Status" value={editUser.status} options={["Active","Inactive"]}            onChange={v => setEditUser(u => ({ ...u, status: v }))} />
          </div>
          <ModalActions onCancel={() => setEditUser(null)} onSave={handleSaveEdit} />
        </Modal>
      )}

      {deleteUser && (
        <ConfirmModal
          message="Are you sure you want to delete this Account?"
          onCancel={() => setDeleteUser(null)}
          onConfirm={handleDelete}
        />
      )}

      {addModal && (
        <Modal title="Add New User" onClose={() => setAddModal(false)}>
          <ModalField label="Name"  value={newUser.name}  onChange={v => setNewUser(u => ({ ...u, name: v }))} />
          <ModalField label="Email" value={newUser.email} onChange={v => setNewUser(u => ({ ...u, email: v }))} />
          <div style={{ display: "flex", gap: 16 }}>
            <ModalSelect label="Role"   value={newUser.role}   options={["Student","Instructor","Admin"]} onChange={v => setNewUser(u => ({ ...u, role: v }))} />
            <ModalSelect label="Status" value={newUser.status} options={["Active","Inactive"]}            onChange={v => setNewUser(u => ({ ...u, status: v }))} />
          </div>
          <ModalActions onCancel={() => setAddModal(false)} onSave={handleAdd} saveLabel="Add User" />
        </Modal>
      )}
    </div>
  );
};

export default AdminUserManagement;