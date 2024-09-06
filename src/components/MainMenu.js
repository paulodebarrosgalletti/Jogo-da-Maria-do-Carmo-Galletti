import React from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import "./css/MainMenu.css";

const MainMenu = () => {
  const navigate = useNavigate();

  const modoRanqueadoDesativado = () => {
    window.alert("O Modo ranqueado ainda não está disponível");
  };

  // Função para criar um jogo contra o Computador (IA)
  const createGameWithAI = async () => {
    try {
      const aiId = "AI_PLAYER"; // Identificador único para a IA
      const userName = auth.currentUser.displayName || "Jogador";

      // Cria um jogo com a IA
      const gameRef = await addDoc(collection(db, "games"), {
        creator: userName,
        creatorId: auth.currentUser.uid,
        status: "playing",
        createdAt: new Date(),
        players: [auth.currentUser.uid, aiId], // Inclui a IA como adversária
        passwords: [null, generateRandomPassword()], // A IA gera uma senha aleatória
        turn: auth.currentUser.uid, // O usuário começa
      });

      console.log("Jogo criado com ID:", gameRef.id);
      navigate(`/game/${gameRef.id}`);
    } catch (error) {
      console.error("Erro ao criar jogo com IA:", error);
    }
  };

  // Função para gerar uma senha aleatória de 4 dígitos com números únicos
  const generateRandomPassword = () => {
    let digits = [];
    while (digits.length < 4) {
      const randomDigit = Math.floor(Math.random() * 10).toString();
      if (!digits.includes(randomDigit)) {
        digits.push(randomDigit);
      }
    }
    return digits.join("");
  };

  return (
    <div className="main-menu-container">
      <h2 className="main-menu-title">Menu Principal</h2>
      <button className="main-menu-button" onClick={() => navigate("/rules")}>
        Regras
      </button>
      <button className="main-menu-button" onClick={() => navigate("/profile")}>
        Perfil
      </button>
      <button className="main-menu-button" onClick={() => navigate("/rank")}>
        Rank
      </button>
      {/* <button className="main-menu-button" onClick={modoRanqueadoDesativado}>
        Rank
      </button> */}
      <button
        className="main-menu-button"
        onClick={() => navigate("/available-games")}
      >
        Jogadores Disponíveis
      </button>
      <button
        className="main-menu-button"
        onClick={createGameWithAI} // Botão para jogar contra o Computador
      >
        Jogar Contra o Computador
      </button>
    </div>
  );
};

export default MainMenu;
