import React from "react";
import { useAuth } from "../../context/AuthContext.jsx";

function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="card">
      <div className="card-header">
        <div className="badge">Profile</div>
        <h2 className="card-title">Doctor Profile</h2>
        <p className="card-subtitle">Basic account details.</p>
      </div>

      <div className="form-grid">
        <div>
          <div className="label">Name</div>
          <div>{user.name}</div>
        </div>
        <div>
          <div className="label">Email</div>
          <div>{user.email}</div>
        </div>
        {user.hospital && (
          <div>
            <div className="label">Hospital</div>
            <div>{user.hospital}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
