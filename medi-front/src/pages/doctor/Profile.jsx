import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { updateProfile } from "../../api/auth.js";
import {
  User,
  Mail,
  Building,
  Phone,
  ShieldCheck,
  LogOut,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
} from "lucide-react";
import "./Profile.css";

function Profile() {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  /* ================= GLOBALS ================= */
  // Fix "Dr. Dr." issue
  const displayName = user.name?.startsWith("Dr.")
    ? user.name
    : `Dr. ${user.name || ""}`;

  /* ================= HANDLERS ================= */
  const startEdit = () => {
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      hospital: user.hospital || "",
      address: user.address || "",
    });
    setError("");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError("");
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const updatedUser = await updateProfile(formData);
      updateUser({ ...user, ...updatedUser });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  return (
    <main className="doctor-profile-page">
      {/* HEADER CARD */}
      <section className="profile-header-card">
        <div className="profile-cover"></div>
        <div className="profile-main-info">
          <div className="profile-avatar-large">
            <div className="avatar-placeholder">
              {user.name ? user.name.charAt(0).toUpperCase() : "D"}
            </div>
          </div>
          <div className="profile-names">
            <h1 className="profile-name">
              {displayName}
            </h1>
            <div className="profile-role-badge">
              <ShieldCheck size={16} />
              Verified Partner
            </div>
          </div>
        </div>
      </section>

      {/* ERROR MSG */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md border border-red-100 text-sm">
          {error}
        </div>
      )}

      {/* GRID LAYOUT */}
      <div className="profile-grid-layout">
        {/* LEFT: PERSONAL DETAILS */}
        <section className="profile-section-card">
          <div className="section-header">
            <User className="text-blue-500" size={24} />
            <h3 className="section-title">Personal Information</h3>
          </div>

          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Full Name</span>
              <div className="info-value">
                {isEditing ? (
                  <input
                    className="input w-full"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                ) : (
                  user.name
                )}
              </div>
            </div>

            <div className="info-item">
              <span className="info-label">Email Address</span>
              <div className="info-value">
                <Mail size={16} className="text-gray-400" />
                {user.email} <span className="text-xs text-muted">(Read-only)</span>
              </div>
            </div>

            <div className="info-item">
              <span className="info-label">Mobile Number</span>
              <div className="info-value">
                <Phone size={16} className="text-gray-400" />
                {isEditing ? (
                  <input
                    className="input w-full"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                  />
                ) : (
                  user.phone || "Not provided"
                )}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: PROFESSIONAL & ACTIONS */}
        <div className="profile-actions-column space-y-6">
          <section className="profile-section-card">
            <div className="section-header">
              <Building className="text-orange-500" size={24} />
              <h3 className="section-title">Professional Details</h3>
            </div>

            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Hospital / Clinic</span>
                <div className="info-value">
                  {isEditing ? (
                    <input
                      className="input w-full"
                      value={formData.hospital}
                      onChange={(e) =>
                        setFormData({ ...formData, hospital: e.target.value })
                      }
                      placeholder="Clinic or Hospital Name"
                    />
                  ) : (
                    user.hospital || "Independent Practitioner"
                  )}
                </div>
              </div>

              <div className="info-item">
                <span className="info-label">Location</span>
                <div className="info-value">
                  <MapPin size={16} className="text-gray-400" />
                  {isEditing ? (
                    <input
                      className="input w-full"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="City, State"
                    />
                  ) : (
                    user.address || "Mumbai, India"
                  )}
                </div>
              </div>

              <div className="info-item">
                <span className="info-label">Member Since</span>
                <div className="info-value">
                  <Calendar size={16} className="text-gray-400" />
                  {new Date().getFullYear()}
                </div>
              </div>
            </div>
          </section>

          <section className="profile-section-card">
            <h3 className="section-title mb-4">Account Actions</h3>
            <div className="profile-actions">
              {isEditing ? (
                <>
                  <button
                    className="profile-action-btn button-primary bg-blue-600 text-white hover:bg-blue-700"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    <Save size={18} />
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    className="profile-action-btn btn-secondary"
                    onClick={cancelEdit}
                    disabled={loading}
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="profile-action-btn btn-secondary"
                  onClick={startEdit}
                >
                  <Edit2 size={18} />
                  Edit Profile
                </button>
              )}

              {!isEditing && (
                <button
                  className="profile-action-btn btn-logout"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  Log Out
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Profile;
