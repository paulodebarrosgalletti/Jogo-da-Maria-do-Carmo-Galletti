// src/components/Profile.js
import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

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
    <div>
      <h2>Perfil</h2>
      <p>Email: {user.email}</p>
      <button onClick={() => auth.signOut()}>Sair</button>
      <button onClick={() => navigate(-1)}>Voltar</button>{" "}
      {/* Botão de Voltar */}
    </div>
  );
};

export default Profile;
