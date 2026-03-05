import React from 'react';
import { C } from './adminConstants';

export const Overlay = ({ children }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,.35)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
  }}>{children}</div>
);

export const Modal = ({ title, children, onClose }) => (
  <Overlay>
    <div style={{
      background: "#fff", borderRadius: 16, padding: "32px 36px",
      minWidth: 380, maxWidth: 480, width: "90%", position: "relative",
      boxShadow: "0 8px 32px rgba(0,0,0,.18)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <span style={{ fontWeight: 700, fontSize: 20 }}>{title}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <span className="material-icons">close</span>
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
    </div>
  </Overlay>
);

export const ModalField = ({ label, value, onChange }) => (
  <div>
    <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>{label}</label>
    <input value={value} onChange={e => onChange(e.target.value)} style={{
      width: "100%", padding: "12px 16px", border: "1.5px solid #e0e0e0",
      borderRadius: 10, fontSize: 15, boxSizing: "border-box", background: "#f5f5f5",
    }} />
  </div>
);

export const ModalSelect = ({ label, value, options, onChange }) => (
  <div style={{ flex: 1 }}>
    <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      width: "100%", padding: "12px 14px", border: "1.5px solid #e0e0e0",
      borderRadius: 10, fontSize: 14, background: "#f5f5f5", cursor: "pointer",
    }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  </div>
);

export const ModalActions = ({ onCancel, onSave, saveLabel = "Save" }) => (
  <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
    <button onClick={onCancel} style={{
      flex: 1, padding: "12px", borderRadius: 10, border: "none",
      background: C.textDark, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
    }}>Cancel</button>
    <button onClick={onSave} style={{
      flex: 1, padding: "12px", borderRadius: 10, border: "none",
      background: "#D8EDD8", color: C.textDark, fontWeight: 700, fontSize: 15, cursor: "pointer",
    }}>{saveLabel}</button>
  </div>
);

export const ConfirmModal = ({ message, onCancel, onConfirm }) => (
  <Overlay>
    <div style={{
      background: "#D8EDD8", borderRadius: 16, padding: "40px 40px 32px",
      maxWidth: 420, width: "90%", textAlign: "center",
      boxShadow: "0 8px 32px rgba(0,0,0,.18)",
    }}>
      <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 32, lineHeight: 1.4 }}>{message}</p>
      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
        <button onClick={onCancel} style={{
          padding: "12px 32px", borderRadius: 12, border: "none",
          background: "#e0e0e0", fontWeight: 700, fontSize: 16, cursor: "pointer",
        }}>Cancel</button>
        <button onClick={onConfirm} style={{
          padding: "12px 32px", borderRadius: 12, border: "none",
          background: C.red, color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer",
        }}>Yes Delete</button>
      </div>
    </div>
  </Overlay>
);