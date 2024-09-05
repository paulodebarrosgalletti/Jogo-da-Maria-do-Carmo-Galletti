// src/components/Game.js
import React from "react";
import { useNavigate } from "react-router-dom";

const Game = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Partida Iniciada</h2>
      <p>O jogo está acontecendo aqui!</p>
      <button onClick={() => navigate("/main")}>
        Voltar ao Menu Principal
      </button>
    </div>
  );
};

export default Game;
