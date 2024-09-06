// src/components/AvailableGames.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

import "./css/AvailableGames.css";

const AvailableGames = () => {
  const [games, setGames] = useState([]);
  const [userName, setUserName] = useState("");
  const [currentGameId, setCurrentGameId] = useState(null); // Controlar o estado do jogo atual
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().firstName); // Ajuste conforme o campo que está salvando o nome
        }
      } catch (error) {
        console.error("Erro ao buscar nome do usuário:", error);
      }
    };

    fetchUserName();

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
    try {
      // Cria um novo jogo
      const gameRef = await addDoc(collection(db, "games"), {
        creator: userName,
        creatorId: auth.currentUser.uid,
        status: "waiting", // Status inicial da partida
        createdAt: new Date(),
        players: [auth.currentUser.uid], // Lista de jogadores com o criador inicialmente
        passwords: [null, null], // Inicializa com senhas nulas para ambos
      });

      console.log("Jogo criado com ID:", gameRef.id);
      setCurrentGameId(gameRef.id); // Armazena o ID do jogo criado
    } catch (error) {
      console.error("Erro ao criar jogo:", error);
    }
  };

  const joinGame = async (gameId) => {
    try {
      // Atualiza o jogo para incluir o jogador atual
      const gameRef = doc(db, "games", gameId);
      const gameSnapshot = await getDoc(gameRef);
      const gameData = gameSnapshot.data();

      if (gameData && gameData.players.length < 2) {
        await updateDoc(gameRef, {
          players: [...gameData.players, auth.currentUser.uid], // Adiciona o jogador atual
          status: "ready", // Muda o status para 'ready' quando dois jogadores entram
        });
        setCurrentGameId(gameId); // Armazena o ID do jogo em que entrou
        navigate(`/game/${gameId}`); // Redireciona para o jogo
      }
    } catch (error) {
      console.error("Erro ao entrar no jogo:", error);
    }
  };

  useEffect(() => {
    // Monitorar o estado do jogo atual para redirecionar corretamente
    if (currentGameId) {
      const gameRef = doc(db, "games", currentGameId);
      const unsubscribe = onSnapshot(gameRef, (doc) => {
        const gameData = doc.data();
        if (
          gameData &&
          gameData.status === "ready" &&
          gameData.players.includes(auth.currentUser.uid)
        ) {
          navigate(`/game/${currentGameId}`); // Redireciona para a tela de jogo se o status for 'ready'
        }
      });

      return () => unsubscribe();
    }
  }, [currentGameId, navigate]);

  return (
    <div className="available-games-container">
      <h2 className="available-games-title">Jogadores Disponíveis</h2>
      <button
        className="available-games-button"
        onClick={() => navigate("/main")}
      >
        Voltar
      </button>

      <button className="available-games-button" onClick={createGame}>
        Criar Jogo
      </button>
      <ul className="available-games-list">
        {games
          .filter(
            (game) => game.status !== "completed" && game.status !== "forfeited"
          ) // Filtra jogos encerrados
          .map((game) => (
            <li key={game.id} className="available-games-item">
              <span>Jogo criado por: {game.creator}</span>
              {game.players.length < 2 &&
                game.creatorId !== auth.currentUser.uid && (
                  <button
                    className="available-games-button"
                    onClick={() => joinGame(game.id)}
                  >
                    Jogar
                  </button>
                )}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default AvailableGames;
