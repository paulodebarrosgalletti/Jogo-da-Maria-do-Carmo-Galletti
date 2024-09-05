// src/components/AvailableGames.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

const AvailableGames = () => {
  const [games, setGames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Monitora a coleção 'games' para listar todas as partidas disponíveis
    const unsubscribe = onSnapshot(collection(db, "games"), (snapshot) => {
      const gamesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGames(gamesList);
    });

    // Cleanup ao desmontar o componente
    return () => unsubscribe();
  }, []);

  const createGame = async () => {
    // Cria um novo jogo
    const gameRef = await addDoc(collection(db, "games"), {
      creator: "player1", // Substitua pelo UID real do jogador
      status: "waiting", // Status inicial da partida
      createdAt: new Date(),
    });

    console.log("Jogo criado com ID:", gameRef.id);
  };

  const joinGame = async (gameId) => {
    // Redireciona para a tela de jogo
    await deleteDoc(doc(db, "games", gameId)); // Remove o jogo da lista de disponíveis
    navigate("/game");
  };

  return (
    <div>
      <h2>Jogadores Disponíveis</h2>
      <button onClick={() => navigate(-1)}>Voltar</button>{" "}
      {/* Botão para voltar */}
      <button onClick={createGame}>Criar Jogo</button>
      <ul>
        {games.map((game) => (
          <li key={game.id}>
            <span>Jogo criado por: {game.creator}</span>
            <button onClick={() => joinGame(game.id)}>Jogar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AvailableGames;
