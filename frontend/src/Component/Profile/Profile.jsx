import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import BASE_URL from "../../api";
import { useToast } from "../Toast/Toast";
import "./Profile.css";

const Profile = () => {
  const { show } = useToast();

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // ================= FETCH PROFILE =================
  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data.data;

      setUser(data);
      setForm({
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || "",
      });
    } catch (err) {
      show(err?.response?.data?.message || "Failed to load profile", "error");
    }
  };

  useEffect(() => {
    if (token) fetchProfile();
  }, []);

  // ================= UPDATE PROFILE =================
  const handleSave = async () => {
    if (!form.name.trim()) {
      show("Name is required", "error");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.put(
        `${BASE_URL}/user/profile`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(res.data.data);

      show("Profile updated!", "success");
      setEditing(false);
    } catch (err) {
      show(err?.response?.data?.message || "Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const initials = (user?.name || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="profile-page">

      {/* Avatar */}
      <div className="profile-avatar">{initials}</div>

      <h1 className="profile-name">{user?.name}</h1>
      <p className="profile-email">{user?.email}</p>
      <span className="profile-role-badge">{user?.role}</span>

      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-card-header">
          <h2>Personal info</h2>

          {!editing && (
            <button
              className="profile-edit-btn"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
          )}
        </div>

        <div className="profile-fields">

          <div className="pf-row">
            <label>Name</label>
            {editing ? (
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            ) : (
              <span>{user?.name || "—"}</span>
            )}
          </div>

          <div className="pf-row">
            <label>Phone</label>
            {editing ? (
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />
            ) : (
              <span>{user?.phone || "—"}</span>
            )}
          </div>

          <div className="pf-row">
            <label>Address</label>
            {editing ? (
              <input
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
              />
            ) : (
              <span>{user?.address || "—"}</span>
            )}
          </div>

        </div>

        {editing && (
          <div className="profile-form-actions">
            <button
              className="pf-save-btn"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save changes"}
            </button>

            <button
              className="pf-cancel-btn"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Links */}
      {user?.role === "user" && (
        <div className="profile-links">
          <Link to="/orders" className="pl-link">📦 My Orders</Link>
          <Link to="/cart" className="pl-link">🛒 My Cart</Link>
          <Link to="/notifications" className="pl-link">🔔 Notifications</Link>
        </div>
      )}

    </div>
  );
};

export default Profile;