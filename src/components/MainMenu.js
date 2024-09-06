// src/components/MainMenu.js
import React from "react";
import { useNavigate } from "react-router-dom";

import "./css/MainMenu.css";

const MainMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="main-menu-container">
      <h2 className="main-menu-title">Menu Principal</h2>
      <button className="main-menu-button" onClick={() => navigate("/profile")}>
        Perfil
      </button>
      <button className="main-menu-button" onClick={() => navigate("/rank")}>
        Rank
      </button>
      <button
        className="main-menu-button"
        onClick={() => navigate("/available-games")}
      >
        Jogadores Disponíveis
      </button>
    </div>
  );
};

export default MainMenu;
