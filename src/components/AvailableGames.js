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

const AvailableGames = () => {
  const [games, setGames] = useState([]);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserName = async () => {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        setUserName(userDoc.data().firstName); // Ajuste conforme o campo que está salvando o nome
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
    // Cria um novo jogo
    const gameRef = await addDoc(collection(db, "games"), {
      creator: userName,
      creatorId: auth.currentUser.uid,
      status: "waiting", // Status inicial da partida
      createdAt: new Date(),
      players: [auth.currentUser.uid], // Lista de jogadores com o criador inicialmente
    });

    console.log("Jogo criado com ID:", gameRef.id);
  };

  const joinGame = async (gameId) => {
    // Atualiza o jogo para incluir o jogador atual
    const gameDocRef = doc(db, "games", gameId);
    const gameDoc = await getDoc(gameDocRef);

    if (gameDoc.exists()) {
      const gameData = gameDoc.data();
      if (gameData.players.length < 2) {
        await updateDoc(gameDocRef, {
          players: [...gameData.players, auth.currentUser.uid], // Adiciona o jogador atual
          status: "ready", // Muda o status para pronto quando dois jogadores entram
        });
      }
    }
  };

  useEffect(() => {
    // Monitora a coleção 'games' para redirecionar para o jogo quando o status mudar para 'ready'
    const unsubscribe = onSnapshot(collection(db, "games"), (snapshot) => {
      snapshot.docs.forEach((doc) => {
        const gameData = doc.data();
        if (
          gameData.status === "ready" &&
          gameData.players.includes(auth.currentUser.uid)
        ) {
          navigate("/game"); // Redireciona para a tela de jogo
        }
      });
    });

    return () => unsubscribe();
  }, [navigate]);

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
            {game.players.length < 2 && (
              <button onClick={() => joinGame(game.id)}>Jogar</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AvailableGames;
