// src/components/MainMenu.js
import React from "react";
import { useNavigate } from "react-router-dom";

const MainMenu = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Menu Principal</h2>
      <button onClick={() => navigate("/profile")}>Perfil</button>
      <button onClick={() => navigate("/rank")}>Rank</button>
      <button onClick={() => navigate("/available-games")}>
        Jogadores Disponíveis
      </button>{" "}
      {/* Novo botão */}
    </div>
  );
};

export default MainMenu;
