// src/components/Profile.js
import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

import "./css/Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(auth.currentUser);
  }, []);

  if (!user) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="profile-container">
      <h2 className="profile-title">Perfil</h2>
      <p className="profile-email">Email: {user.email}</p>
      <button className="profile-button" onClick={() => auth.signOut()}>
        Sair
      </button>
      <button className="profile-button" onClick={() => navigate(-1)}>
        Voltar
      </button>
    </div>
  );
};

export default Profile;
